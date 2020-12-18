const admin = require('firebase-admin');
const express = require('express');
const cors = require('cors');

const validateFirebaseIdToken = (req, res, next) => {
  if (!req.headers.authorization || !req.headers.authorization.startsWith('Bearer ')) {
    res.status(403).send('Unauthorized');
    return;
  }

  let idToken;
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    [_, idToken] = req.headers.authorization.split('Bearer ');
  } else {
    res.status(403).send('Unauthorized');
    return;
  }

  admin.auth().verifyIdToken(idToken).then(() => next())
    .catch((error) => {
      res.status(403).send('Unauthorized');
    });
};

const app = express();
app.use(cors());
if (process.env.USER !== 'whg') { // running locally
  app.use(validateFirebaseIdToken);
}

async function getSurveyQuestions(db, surveyID) {
  const docRef = await db.doc(`/surveys/${surveyID}/public/survey`).get();
  if (docRef.exists) {
    const survey = docRef.data();
    return [].concat(...Object.values(survey.pages))
      .filter(e => e.type === 'question')
      .sort((a, b) => a.index - b.index);
  }
  return null;
}

function formatForCsv(v) {
  if (v === undefined || v === null) {
    return '';
  }
  if (Array.isArray(v)) {
    return `${v.map(formatForCsv).join(',')}\r\n`;
  }
  if (typeof v === 'number') {
    return `${v}`;
  }
  if (typeof v === 'boolean') {
    return `${v ? 1 : 0}`;
  }
  if (v instanceof Date) {
    // convert to string, so then we can handle commas and quotes
    v = v.toLocaleString('en-gb');
  }
  return `"${v.replace(/"/g, '""')}"`;
}

function getValue(answer, options) {
  if (answer.skipped || answer.passed) {
    return null;
  }

  try {
    switch (answer.type) {
      case 'radio':
      case 'likert':
      case 'dropdown':
        return options.useIndex ? answer.index : answer.text;
      case 'checkbox':
        return (options.useIndex ? answer.index : answer.text).join(', ');
      case 'slider':
        return answer.value;
      case 'free-text':
      default:
        return answer.text;
    }
  } catch (e) {
    console.log(e);
    console.log(answer);
    return '';
  }
}

const columnName = q => `${q.number}`;
const otherColumnName = q => `${columnName(q)} (specified)`;
const skippedColumnName = q => `${columnName(q)} (skipped)`;
const passedColumnName = q => `${columnName(q)} (passed)`;
const formatColumnName = q => `${columnName(q)} (format)`;
const transcribedColumnName = q => `${columnName(q)} (transcribed)`;
const choiceColumnName = (q, choice, i, options) => {
  const name = options.useIndex ? i + 1 : choice;
  return `${columnName(q)} (${name})`;
};

const getTimestamp = (field, userData, surveyID) => {
  if (field !== 'completed') {
    field = field.replace('ed', 's');
  }
  const values = userData[field];
  if (values) {
    values.reverse();
    for ({ survey, timestamp } of values) {
      if (survey === surveyID) {
        return timestamp.toDate();
      }
    }
  }
  return null;
};

async function surveyAnswers(db, surveyID, options) {
  const questions = await getSurveyQuestions(db, surveyID);
  if (!questions) {
    return null;
  }

  const columns = ['user', 'loaded', 'started', 'completed', 'first_answer_time', 'duration'];
  const columnIndex = {};

  questions.forEach((question) => {
    if (options.individualColumns && question.choiceType === 'checkbox') {
      columns.push(...question.answerChoices.map((choice, i) => {
        return choiceColumnName(question, choice, i, options);
      }));
    } else {
      columns.push(columnName(question));
    }
    if (question.hasOther) {
      columns.push(otherColumnName(question));
    } if (question.allowSkip) {
      columns.push(skippedColumnName(question));
    } if (question.allowPass) {
      columns.push(passedColumnName(question));
    } if (question.answerType === 'free-text') {
      columns.push(formatColumnName(question));
    }
    columns.push(transcribedColumnName(question));
  });

  columns.forEach((colName, i) => {
    columnIndex[colName] = i;
  });

  const answersSnapshot = await db.collection('answers')
        .where('survey.id', '==', surveyID)
        .orderBy('user.anonID')
        .get();

  console.log(`${answersSnapshot.size} answers in ${surveyID}`);

  let currentUser = null;
  let row = null;
  let output = formatForCsv(columns);
  let answerTimes = [];

  const writeRow = async () => {
    if (row) {
      // get timestamps for user
      const userDoc = await db.collection('users').doc(currentUser.id).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        for (const field of ['loaded', 'started', 'completed']) {
          row[columnIndex[field]] = getTimestamp(field, userData, surveyID);
        }
      }

      if (answerTimes.length >= 2) {
        const first = Math.min(...answerTimes);
        const last = Math.max(...answerTimes);
        row[columnIndex.first_answer_time] = new Date(first * 1000);
        row[columnIndex.duration] = last - first;
      }

      output += formatForCsv(row);
    }
  };

  for (const answerDoc of answersSnapshot.docs) {
    const answer = answerDoc.data();
    const { question } = answer;
    const { anonID } = answer.user;

    // save row
    if (!currentUser || anonID !== currentUser.anonID) {
      await writeRow();
      currentUser = answer.user;
      row = Array(columns.length);
      row[0] = anonID;
      answerTimes = [];
    }

    if (answer.type === 'checkbox' && options.individualColumns) {
      for (let i = 0; i < question.answerChoices.length; i++) {
        const choice = question.answerChoices[i];
        const colName = choiceColumnName(question, choice, i, options);
        let value;
        if (Array.isArray(answer.text)) {
          value = answer.text.indexOf(choice) !== -1;
        } else {
          value = choice === answer.text;
        }
        row[columnIndex[colName]] = value;
      }
    } else {
      const index = columnIndex[columnName(question)];
      row[index] = getValue(answer, options);
    }

    if (question.allowSkip) {
      row[columnIndex[skippedColumnName(question)]] = answer.skipped;
    }
    if (question.allowPass) {
      row[columnIndex[passedColumnName(question)]] = answer.passed;
    }
    if (answer.other) {
      row[columnIndex[otherColumnName(question)]] = answer.other;
    }
    if (answer.type === 'free-text') {
      let type = (answer.media && answer.media.type) || 'text';
      if (answer.passed || answer.skipped) {
        type = 'ps';
      }
      row[columnIndex[formatColumnName(question)]] = type;
    }

    row[columnIndex[transcribedColumnName(question)]] = answer.transcribed ? 1 : 0;

    answerTimes.push(answer.timestamp.seconds);
  }

  await writeRow();

  return output;
}

exports.app = (db) => {
  app.get('/survey/answers/:surveyID', async (req, res) => {
    const { surveyID } = req.params;
    const options = {
      useIndex: req.query.numbers === 'true',
      individualColumns: req.query.columns === 'true',
    };

    let table;
    try {
      table = await surveyAnswers(db, surveyID, options, res);
    } catch (e) {
      console.error(e);
      return res.send(e.toString());
    }

    if (table) {
      return res.type('text/csv').send(table);
    }
    return res.status(404).send('no such survey');
  });

  app.get('/survey/description/:surveyID', (req, res) => {
    const { surveyID } = req.params;
    const columns = [
      { col: 'Question', extract: q => q.number },
      { col: 'Sentence', extract: q => q.questionSentence },
      { col: 'Answer type', extract: q => q.answerType },
      { col: 'Answer subtype', extract: q => q.choiceType },
      { col: 'Options', extract: q => undefined },
      { col: 'Options index', extract: q => undefined },
      { col: 'Allows skip', extract: q => q.allowSkip },
      { col: 'Allows pass', extract: q => q.allowPass },
    ];
    const emptyRow = Array(columns.length);
    return getSurveyQuestions(db, surveyID)
      .catch(e => res.status(404).send('no such survey'))
      .then((questions) => {
        let output = formatForCsv(columns.map(c => c.col));

        questions.forEach((question) => {
          let row = columns.map(c => c.extract(question));

          if (question.answerChoices.length > 0) {
            question.answerChoices.forEach((choice, i) => {
              if (i > 0) {
                row = [...emptyRow];
              }
              row[4] = choice;
              row[5] = i + 1;
              output += formatForCsv(row);
            });
          } else {
            output += formatForCsv(row);
          }
          output += formatForCsv(emptyRow);
        });
        return res.type('text/csv').send(output);
      });
  });

  app.get('/signups', (req, res) => {
    return db.doc('/misc/signups')
      .get()
      .then((docRef) => {
        const signups = docRef.data();
        const columns = Object.keys(signups);
        let csv = formatForCsv(columns);
        const nLines = Math.max(...Object.values(signups).map(a => a.length));
        for (let i = 0; i < nLines; i++) {
          const row = columns.map(c => signups[c][i]);
          csv += formatForCsv(row);
        }
        return res.type('text/csv').send(csv);
      })
      .catch((e) => {
        console.log(e);
      });
  });

  return app;
};
