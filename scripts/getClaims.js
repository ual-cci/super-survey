const admin = require('firebase-admin');
const serviceAccount = require('./firebase-admin-keys.json');

if (process.argv.length < 3) {
  console.log('need user ID');
  process.exit(1);
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: 'https://test-thing-307817.firebaseio.com',
});

const uid = process.argv[2];

admin.auth().getUser(uid).then((userRecord) => {
  const { customClaims, displayName } = userRecord;
  console.log(displayName, customClaims);
});
