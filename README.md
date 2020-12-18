# SuperSurvey

SuperSurvey is a survey authoring platform written in Vue.js backed by Firebase. It was originally developmed for Heart n Soul while they were The Hub residents at Wellcome Collection. 

## Installation

Start with:

`yarn install`

Then you will want to install `firebase-tools`, which might make sense to install globally: `yarn global add firebase-tools`

## Configuration

Create a Firebase project, and enable authentication, Firestore, storage, hosting and functions.

Create a file in `src/` called `firebaseConfig.js` with the details of your firebase project, (One way you can grab these details is by creating an app in the Console, of web app type.). The file should contain something like:

```
export default {
  apiKey: 'API-KEY',
  authDomain: 'domain.firebaseapp.com',
  databaseURL: 'https://database-url.firebaseio.com',
  projectId: 'project-id',
  storageBucket: 'project-id.appspot.com',
  messagingSenderId: '1234',
};
```

Inside firebase hosting, create two sites, one for production and one for development. Once this is done assign the resouces to the `prod` and `dev` targets, e.g:

```
firebase target:apply hosting prod <the-production-resource>
firebase target:apply hosting dev <the-deveopment-resource>
```


## Survey authors and admin

Using the Firebase console, add users to your project. Then survey authors can login with these datails (at `/admin`) and start creating surveys.

Different parts of the platform require some access tokens. Some users are granted permission to see "senstive" content, such as media from respondents. You can add tokens to users with `addPriviledges.js` in the scripts directory. For example:

```
node scripts/addPriviledges.js q7K0KMlh9VVcappQc3KGqxcj67G2 sensitive
```

Will allow the user with the ID `q7K0KMlh9VVcappQc3KGqxcj67G2` to see senstive content.

Another token is the `onlyTranscription` one which limits a user to only see the transciption page.

## Assets

Assets are kept in the `public` directory.

Replace the `favicon.ico`, `img/logo.png` and `img/logo-large.png` files with the appropriate assets.

Any files in `docs` directory will be hosted and have a `Content-Disposition: attachment` automatically added, so browers will most likely download the files.

## Development

Run:
```
yarn run serve
```

### Content to change

There are two components that you will want to change for your own project:

* `src/views/Enter.vue`
* `src/components/Public/EndPage.vue`

Both of these components include HTML that are project specific. The first page is displayed to log in a respondent, the second is displayed when a respondent completes a survey.

## Deploy

Once the Firebase hosting and functions are enabled:

```
yarn run build
firebase deploy
```

This will deploy everything (all hosting & functions). Normally, you will want to only deploy some things, e.g:

```
firebase deploy --only hosting:dev
firebase deploy --only functions:deletePreviousAnswers
```

Will only deploy the development hosting, followed by the `deletePreviousAnswers` function.

## Accessing surveys

The normal route to a respondent answering a survey is by getting them to signup with a email or phone number. A redirect will happen if a cookie isn't found when visiting `/survey/some-survey-id`.

However there are two other mechanisms for a user to start answering a survey. Visiting `/a/survey/some-survey-id` will create a random ID for the user and sign them in. ID for these users are prefixed with a `#`.

Users can also be given links with their ID included, visiting `/u/survey/some-survey-id?u=a-user-id` will create a user with id `!a-user-id` and sign them in.
