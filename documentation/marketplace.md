# Marketplace

## Repos

Marketplace repos are designed to be fully static.
An example of the directory structure can be seen here.

```
|-- apps
|   |-- anura.example
|   |   |-- app.zip
|   |   |-- manifest.json
|-- libs
|   |-- anura.examplelib
|   |   |-- lib.zip
|   |   |-- manifest.json
list.json
manifest.json
```

### Manifest

Each app is supposed to have its own manifest that lists details about the app.
An example is put below.

```json
{
    "name": "Example app",
    "icon": "example.png",
    "summary": "(tiny app description)",
    "desc": "(longer app description)",
    "package": "anura.example",
    "data": "app.zip",
    "installHook": "install.js",
    "screenshots": [
        {
            "path": "screenshots/something.png",
            "desc": "(screenshot desc)"
        },
        {
            "path": "screenshots/something2.png",
            "desc": "(screenshot desc)"
        }
    ],
    "version": "1.0.0",
    "dependencies": ["(package identifier)"],
    "category": "game"
}
```

This is mostly the same for libraries, minus the `dependencies` and `installHook` sections.

### Publishing

To make a repo accessible via the Store Library you should use the utility [create-anura-repo](https://github.com/MercuryWorkshop/create-anura-repo). It is as simple as running a command in your terminal.

```bash
$ npx create-anura-repo
```
