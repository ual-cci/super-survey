# Routing

public:
/landing (landing)
/admin/:nextPage (admin-login)
/enter/:surveyID/:stage? (enter)
/s/:surveySlug ((survey redirect))

admin:
/projects (projects)
/survey/stats/:surveyID (survey-stats)
/answers/edit/:surveyID?/:answerID? (answer-editor)
/answers/user/:anonID (user-answers)
/survey/edit/:surveyID (survey-designer)
/email-signups (email-signups)

signed in:
/survey/:surveyID (survey)
/a/survey/:surveyID (anonymous-survey)
/u/survey/:surveyID (assign-id-survey)





public:
`/landing (landing)`
nothing in view

/admin/:nextPage (admin-login)
logs in. sends to nextPage or projects

/enter/:surveyID/:stage? (enter)
- landing
  - button to sign up
  - button to log in
- login
  - redirect to /survey/:surveyID

/s/:surveySlug ((survey redirect))
- just does redirect
  - to survey with surveySlug if exists
  = root otherwise

admin:
/projects (projects)
- add new project
- show projects

/survey/stats/:surveyID (survey-stats)
- basic survey stats
  - questions stats
- exporter

/answers/edit/:surveyID?/:answerID? (answer-editor)
- edit answer media?
  - for transcription

/answers/user/:anonID (user-answers)
- (for admins to see anonymous survey results)

/survey/edit/:surveyID (survey-designer)
BIG CODE BIT

/email-signups (email-signups)
- download data about participant signups

signed in:
/survey/:surveyID (survey)
- the main survey participation page

/a/survey/:surveyID (anonymous-survey)
- auto signs in 
- runs main Survey code

/u/survey/:surveyID (assign-id-survey)
- signs in anonymous user
- runs main Survey code






