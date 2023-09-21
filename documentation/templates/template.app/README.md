# Template Anure app for an easy HTML iFrame

## Instructions for use:

1.  Start by copying and renaming the template.app folder to your desired app.
2.  Add your desired html, js, and css files to their respective folders. The html file you want to be visible in the app should be named index.html.
3.  Go to the manifest.json file and modify it to the correct values. You should modify the following fields:

```json
"name": "Your Desired app name"

"package": "anura.APPNAME",

"icon": "appicon.svg",

"title":"Your App Window Name",
```

4.  Go to launchapp.js and modify the following line, replacing "template" with "yourappsname"

```js
let glxgears = AliceWM.create("template");
```

## Congrats

You have successfully completed building your basic iFrame app, you can either zip it and add it to a repository for the WorkStore or add it directly into your Anura instance under the apps folder.
