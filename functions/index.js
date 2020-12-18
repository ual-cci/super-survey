const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { savePublic } = require('./surveys');
const { app } = require('./httpApp');

admin.initializeApp({
  credential: admin.credential.applicationDefault()
});
const db = admin.firestore();
const europeFunctions = functions.region('europe-west1');

exports.createSurvey = europeFunctions.firestore
  .document('/surveys/{surveyID}')
  .onCreate((snapshot, context) => {
    const data = snapshot.data();

    // add the survey to its project
    return db.collection('projects').doc(data.project.id)
      .update({
        surveys: admin.firestore.FieldValue.arrayUnion(context.params.surveyID),
      })
      .then(() => {
        return db.doc(`/surveys/${context.params.surveyID}/public/stats`)
          .set({
            loads: 0,
            starts: 0,
            completed: 0,
            answered: 0,
          }, { merge: true });
      });
  });

exports.updateSurvey = europeFunctions.firestore
  .document('/surveys/{surveyID}')
  .onUpdate((change, context) => {
    const survey = change.after.data();
    if (survey.target === 'survey') {
      return db.collection('misc').doc('slugs')
        .set({
          [survey.slug]: change.after.id,
        }, { merge: true });
    } else if (survey.target === 'demographics' && survey.completed) {
      const timeDiff = new Date() - survey.completed.toDate();
      // update in the last 10s
      if (survey.status === 'complete' && timeDiff < 10000) {
        return savePublic(db, survey);
      }
    }
    return true;
  });

exports.deleteSurvey = europeFunctions.firestore
  .document('/surveys/{surveyID}')
  .onDelete((snapshot, context) => {
    const data = snapshot.data();
    const { surveyID } = context.params;
    const publicDoc = db.doc(`/surveys/${surveyID}/public/survey`);
    const statsDoc = db.doc(`/surveys/${surveyID}/public/stats`);

    return publicDoc.delete()
      .then(statsDoc.delete)
      .then(() => {
        return db.collection('projects').doc(data.project.id)
          .update({
            surveys: admin.firestore.FieldValue.arrayRemove(surveyID),
          });
        });
  });

exports.updateProject = europeFunctions.firestore
  .document('/projects/{projectID}')
  .onUpdate((change, context) => {
    const data = change.after.data();

    // set the preamble for all surveys
    return new Promise((resolve, reject) => {
      if (data.surveys) {
        data.surveys.forEach((surveyID) => {
          db.collection('surveys').doc(surveyID).collection('public').doc('survey')
            .set({
              participation: data.participation,
              consent: data.consent,
              live: data.preambleStatus === 'complete',
            }, { merge: true });
        });
      }
      resolve();
    });
  });

exports.deleteProject = europeFunctions.firestore
  .document('/projects/{projectID}')
  .onDelete((snapshot, context) => {
    const data = snapshot.data();
    return new Promise((resolve, reject) => {
      if (data.surveys) {
        data.surveys.forEach((surveyID) => {
          db.collection('surveys').doc(surveyID)
            .delete();
        });
      }
      resolve();
    });
  });

function changeAnsweredCount(surveyID, amount) {
  const statsDocRef = db.doc(`/surveys/${surveyID}/public/stats`)
  return db.runTransaction(transaction => transaction.get(statsDocRef).then((doc) => {
    const changed = doc.data().answered + amount;
    return transaction.update(statsDocRef, {
      answered: changed,
    });
  }));
}

function createAnswerDeleter(collection) {
  return (snapshot, context) => {
    const newAnswer = snapshot.data();
    const { user, question } = newAnswer;
    let hasOld = false;
    return db.collection(collection)
      .where('user.id', '==', user.id)
      .where('question.id', '==', question.id)
      .get()
      .then((oldAnswers) => {
        const batch = db.batch();
        oldAnswers.forEach((oldAnswer) => {
          if (oldAnswer.id !== snapshot.id
              && oldAnswer.data().timestamp.toMillis() < newAnswer.timestamp.toMillis()) {
            const ref = db.collection(collection).doc(oldAnswer.id);
            batch.delete(ref);
            hasOld = true;
          }
        });
        return batch.commit();
      })
      .then(() => {
        if (!hasOld) {
          return changeAnsweredCount(newAnswer.survey.id, 1);
        }
        return true;
      });
  };
}

exports.deletePreviousAnswers = europeFunctions.firestore
  .document('/answers/{answerID}')
  .onCreate(createAnswerDeleter('answers'));

// for debugging
exports.deletePreviousAnswersTest = europeFunctions.firestore
  .document('/answers-test/{answerID}')
  .onCreate(createAnswerDeleter('answers-test'));


exports.deleteAnswer = europeFunctions.firestore
  .document('/answers/{answerID}')
  .onDelete((snapshot, context) => {
    const data = snapshot.data();
    return changeAnswerCount(data.survey.id, -1)
  });

exports.app = europeFunctions.runWith({
  memory: '1GB',
  timeoutSeconds: 300,
}).https.onRequest(app(db));
