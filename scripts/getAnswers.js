const admin = require('firebase-admin');
const fs = require('fs');
const serviceAccount = require('./firebase-admin-keys.json');


admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://heartnsoul-asks.firebaseio.com',
});

const db = admin.firestore();


db.collection('answers')
  .get()
  .then((snapshot) => {
    const docs = [];
    let counter = 0
    snapshot.forEach((d) => {
      const data = d.data();
      docs.push(data);
      process.stdout.write(`\radded ${++counter}`)
    });
    console.log('')
    fs.writeFileSync('all-answers.json', JSON.stringify(docs, null, 2));
  });
