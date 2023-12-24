# Application development

See [This Document](./templates/template.app/README.md) for instructions on how to set up a basic iFrame app.

Every application is a .app folder with a manifest file called manifest.json. In this file, the basic properties of the app are defined.

## `name`

-   **Type:** String
-   **Description:** Defines the name of the application.

## `type`

-   **Types:** auto, manual
-   **Description:** Specifies if Anura should handle functions of this application or whether it will be done manually.

## `package`

-   **Type:** String
-   **Description:** Represents the package name for the application.

## `index`

-   **Type:** String
-   **Description:** Specifies the main entry point or the primary HTML file for the application.

## `icon`

-   **Type:** String
-   **Description:** Indicates the icon file used to represent the application.

## `handler`

-   **Type:** String
-   **Description:** Points to a javascript file contained in the app that handles the apps launch.

## `wininfo`

-   **Type:** Object
-   **Description:** Contains information specific to the application's window settings.

    ### `title`

    -   **Type:** String
    -   **Description:** Specifies the title or name of the application's window.

    ### `width`

    -   **Type:** String
    -   **Description:** Determines the width of the application's window.

    ### `height`

    -   **Type:** String
    -   **Description:** Determines the height of the application's window.
