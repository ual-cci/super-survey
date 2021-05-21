const fs = require('fs')
const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://super-survey-307711.firebaseio.com',
});

const db = admin.firestore();
db.collection('surveys').get().then((snapshot) => {
  snapshot.forEach((docRef) => {
    const survey = docRef.data();
    fs.writeFileSync(`surveys/${docRef.id}.json`, JSON.stringify(survey, null, 2));
    console.log(`downloaded ${docRef.id}`)
  });
});
