const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://heartnsoul-asks.firebaseio.com',
});

const db = admin.firestore();

const key = 'demographicsFirst';

db.collection('surveys')
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const survey = doc.data();
      if (survey[key] === undefined) {
        db.collection('surveys').doc(doc.id).update({
          [key]: false,
        });
        console.log(`updating for ${doc.id}`);
      }
    });
  });
