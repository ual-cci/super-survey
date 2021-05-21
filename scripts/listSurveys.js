const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://super-survey-307711.firebaseio.com',
});

const db = admin.firestore();

db.collection('surveys')
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const survey = doc.data();
      console.log(`${doc.id} is ${survey.title}`);
    })
  });
