# Operations and usage

(Also some important terminology and theory-of-operation information)

Assuming you have a firebase project started.

Starting from an empty datastore and no users

Please note that even running the server on localhost will modify the central data store. So surveys that are created on your machine will also be available on the 'live' site.

## Creating an admin

On firebase service site click 'Authentication' and 'Add User'. Fill in email and password. Copy the `User UID` value and run `node bin/addPrivileges.js $UID`. This will grant this user admin rights.

## Admin creates survey

Start the local development server with `yarn run serve` and visit the site on `http://localhost:8080`. Click 'Admin Log in', fill in details and press log in.

Click 'Add project' and enter a name (i.e. Sample Project).

## Projects

Projects are groups of surveys. They also have demographics, information and consent pages that are shared by all surveys within the project.

In the 'Sample project' project area click the 'Add new survey' button and give the new survey a name (i.e. Sample Survey).

Click on the name of the new survey (Sample Survey) and you will be taken to the admin survey editing page.


## Building a survey

The editor presents options on the left hand side of the page. Elements are parts of the survey the system can manipulate: Question, Description, Heading, Styling, Page, Section and Branch. Below this are the basic options for the entire survey and below that is a question 'importer' where you can pull in questions from other surveys.

The rest of the page is the survey editor: elements can be added by clicking on the element palette just described. Elements appear immediately and can be dragged and re-ordered within the survey. Clicking on an elements 'trash can' icon will delete the element.


### Elements

`Page` Is a container for any content elements. Questionnaires are just a series of pages. They can contain introductory material and questions. Multiple questions can be on one page.
`Heading` A title in a larger bold font.
`Description` Some free-form text that has some formatting.

`Question` The text of a question

`Answer` An area for the participant to provide their response. A number of answer types exist. Free text: a text area (with formatting) to allow unstructured input. Multiple Choice: pick an answer from a number of options. Likert: A slider choice allowing users to pick the 'strength' of their answer like strongly agree, agree, strongly disagree. Slider: Like the previous option but with a continuous value input (like from 1 to 99). Image upload: User can provide image as answer.

`Styling` Change all the question/answer elements after this element to have a different background color.

`Section` A marker in the questionnaire. (I think)

`Branch` A user configurable jump point allowing the survey to take different paths depending on a previous answer. (e.g. if you have answered 'no' to 'do you drink alcohol then the survey can skip the question asking 'how much alcohol do you drink' part). This can only skip over questions (there is no notion of a label).

### Settings

`Reissue demographics` TBD
`Show logo` Shows the sites logo on every questionnaire page.
`Display title` Shows title on every questionnaire page.
`Show signups` TBD
`Demographics first` TBD

### Demographics

Allow a pre-survey section to ask participants about their social/economic situation (for example). Are shared amongst projects.

### Status (publishing)

To publish a survey open the survey editor and in the top right hand side of the page is a 'publish' button. Once made live a survey cannot be un-published.

# Participant answers survey

Survey URLs can be emailed to users for participation. The user will be asked to identify themselves (by email or phone number). [It is unclear how a user can answer many questionnaires or answer the same questionnaire multiple times or not].
The user will be asked to give consent for the site to store and process their answers. Whilst the surveys are anonymous in the most part, users can upload images, videos and audio recordings. As this is 'identifiable' data their consent is needed under current legislation.
The rest of the survey is typical of a Q&A process: introduction, questions, answers and a final thank you page. The user is then expected to close the window.

# Processing survey results

## Transcriptions

TBD

## Downloading results

TBD
