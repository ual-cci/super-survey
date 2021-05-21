const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

if (process.argv.length < 4) {
  console.log('need user ID and priveledge');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://super-survey-307711.firebaseio.com',
});

const email = process.argv[2];
const password = process.argv[3];

admin.auth().signInWithEmailAndPassword(email, password).then(() => {
    console.log('you are correct');
  }).catch(() => {
    console.log('bad login');
});

