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

const uid = process.argv[2];
const priv = process.argv[3];

admin.auth().getUser(uid).then((userRecord) => {
  const { customClaims, displayName } = userRecord;
  console.log('before', userRecord);
  const claims = { [priv]: true, ...customClaims };

  admin.auth().setCustomUserClaims(uid, claims).then(() => {
    console.log(`added ${priv} to ${displayName}`);
    // console.log('after:', customClaims);

    admin.auth().getUser(uid).then((userRecord) => {
      console.log('after', userRecord);
      process.exit(0);

    });

  });
});
