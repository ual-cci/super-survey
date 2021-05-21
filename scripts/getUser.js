const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://super-survey-307711.firebaseio.com',
});

const db = admin.firestore();
let anonID = process.argv[2];
console.log(`searching for ${anonID}`);

db.collection('users')
  .where('anonID', '==', anonID)
  .get()
  .then((snapshot) => {
    snapshot.forEach((doc) => {
      const data = doc.data();
      console.log(doc.id);
      console.log(data.signedUp.toDate());
    });
  });
