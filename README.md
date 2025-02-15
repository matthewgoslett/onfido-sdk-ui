# Onfido SDK UI Layer

[![Build Status](https://travis-ci.org/onfido/onfido-sdk-ui.svg?branch=master)](https://travis-ci.org/onfido/onfido-sdk-ui)
[![npm version](https://img.shields.io/npm/v/onfido-sdk-ui)](https://www.npmjs.com/package/onfido-sdk-ui)

## Table of contents

- [Overview](#overview)
- [Getting started](#getting-started)
- [Handling callbacks](#handling-callbacks)
- [Removing the SDK](#removing-the-sdk)
- [Customising the SDK](#customising-the-sdk)
- [Creating checks](#creating-checks)
- [User Analytics](#user-analytics)
- [Premium Enterprise Features](#premium-enterprise-features)
- [Going live](#going-live)
- [Accessibility](#accessibility)
- [TypeScript](#typescript)
- [More information](#more-information)

## Overview

This SDK provides a set of components for JavaScript applications to allow capturing of identity documents and face photos/videos for the purpose of identity verification. The SDK offers a number of benefits to help you create the best onboarding / identity verification experience for your customers:

- Carefully designed UI to guide your customers through the entire photo/video-capturing process
- Modular design to help you seamlessly integrate the photo/video-capturing process into your application flow
- Advanced image quality detection technology to ensure the quality of the captured images meets the requirement of the Onfido identity verification process, guaranteeing the best success rate
- Direct image upload to the Onfido service, to simplify integration\*

Note: the SDK is only responsible for capturing photos/videos. You still need to access the [Onfido API](https://documentation.onfido.com/) to manage applicants and checks.

Users will be prompted to upload a file containing an image of their document. On handheld devices they can also use the native camera to take a photo of their document.

Face step allows users to use their device cameras to capture their face using photos or videos.

![Various views from the SDK](demo/screenshots.jpg)

## Getting started

### 1. Obtaining an API token

In order to start integration, you will need the **API token**. You can use our [sandbox](https://documentation.onfido.com/#sandbox-testing) environment to test your integration, and you will find the sandbox token inside your [Onfido Dashboard](https://onfido.com/dashboard/api/tokens).

#### 1.1 Regions

Onfido offers region-specific environments. Refer to the [Regions](https://documentation.onfido.com/#regions) section in the API documentation for token format and API base URL information.

### 2. Creating an applicant

With your API token, you should create an applicant by making a request to the [create applicant endpoint](https://documentation.onfido.com/#create-applicant) from your server:

```shell
$ curl https://api.onfido.com/v3/applicants \
  -H 'Authorization: Token token=YOUR_API_TOKEN' \
  -d 'first_name=John' \
  -d 'last_name=Smith'
```

Note: If you are currently using API `v2` please refer to [this migration guide](https://developers.onfido.com/guide/api-v2-to-v3-migration-guide) for more information.

You will receive a response containing the applicant id which will be used to create a JSON Web Token.

### 3. Generating an SDK token

For security reasons, instead of using the API token directly in you client-side code, you will need to generate and include a short-lived JSON Web Token ([JWT](https://jwt.io/)) every time you initialize the SDK. To generate an SDK Token you should perform a request to the [SDK Token endpoint](https://documentation.onfido.com/#generate-web-sdk-token) in the Onfido API:

```shell
$ curl https://api.onfido.com/v3/sdk_token \
  -H 'Authorization: Token token=YOUR_API_TOKEN' \
  -F 'applicant_id=YOUR_APPLICANT_ID' \
  -F 'referrer=REFERRER_PATTERN'
```

Note: If you are currently using API `v2` please refer to [this migration guide](https://developers.onfido.com/guide/api-v2-to-v3-migration-guide) for more information.

Make a note of the `token` value in the response, as you will need it later on when initialising the SDK.

\* Tokens expire 90 minutes after creation.

### 4. Including/Importing the library

#### 4.1 HTML Script Tag Include

Include it as a regular script tag on your page:

```html
<script src="dist/onfido.min.js"></script>
```

And the CSS styles:

```html
<link rel="stylesheet" href="dist/style.css" />
```

#### Example app

[JSFiddle example here.](https://jsfiddle.net/gh/get/library/pure/onfido/onfido-sdk-ui/tree/master/demo/fiddle/)
Simple example using script tags.

#### 4.2 NPM style import

You can also import it as a module into your own JS build system (tested with Webpack).

```sh
$ npm install --save onfido-sdk-ui
```

```js
// ES6 module import
import { init } from 'onfido-sdk-ui'

// commonjs style require
var Onfido = require('onfido-sdk-ui')
```

The **CSS style** will be included **inline with the JS code** when the library is imported.

#### Note

The library is **Browser only**, it does not support the **Node Context**.

#### Example App

**[Webpack Sample App repository here](https://github.com/onfido/onfido-sdk-web-sample-app/).**
Example app which uses the npm style of import.

### 5. Adding basic HTML markup

There is only one element required in your HTML, an empty element for the modal interface to mount itself on:

```html
<!-- At the bottom of your page, you need an empty element where the
verification component will be mounted. -->
<div id="onfido-mount"></div>
```

### 6. Initialising the SDK

You are now ready to initialize the SDK:

```js
Onfido.init({
  // the JWT token that you generated earlier on
  token: 'YOUR_JWT_TOKEN',
  // ID of the element you want to mount the component on
  containerId: 'onfido-mount',
  // ALTERNATIVE: if your integration requires it, you can pass in the container element instead
  // (Note that if `containerEl` is provided, then `containerId` will be ignored)
  containerEl: <div id="root" />,
  onComplete: function (data) {
    console.log('everything is complete')
    // `data` will be an object that looks something like this:
    //
    // {
    //   "document_front": {
    //     "id": "5c7b8461-0e31-4161-9b21-34b1d35dde61",
    //     "type": "passport",
    //     "side": "front"
    //   },
    //   "face": {
    //     "id": "0af77131-fd71-4221-a7c1-781f22aacd01",
    //     "variant": "standard"
    //   }
    // }
    //
    // For two-sided documents like `driving_licence` and `national_identity_card`, the object will also
    // contain a `document_back` property representing the reverse side:
    //
    // {
    //   ...
    //   "document_back": {
    //     "id": "6f63bfff-066e-4152-8024-3427c5fbf45d",
    //     "type": "driving_licence",
    //     "side": "back"
    // }
    //
    // You can now trigger your backend to start a new check
    // `data.face.variant` will return the variant used for the face step
    // this can be used to perform a facial similarity check on the applicant
  },
})
```

Congratulations! You have successfully started the flow. Carry on reading the next sections to learn how to:

- Handle callbacks
- Remove the SDK from the page
- Customize the SDK
- Create checks

## Handling callbacks

- **`onComplete {Function} optional`**

  Callback that fires when both the document and face have successfully been captured and uploaded.
  At this point you can trigger your backend to create a check by making a request to the Onfido API [create check endpoint](https://documentation.onfido.com/#create-check).
  The callback returns an object with the `variant` used for the face capture. The variant can be used to initiate a `facial_similarity_photo` or a `facial_similarity_video` check. The data will be formatted as follows: `{face: {variant: 'standard' | 'video'}}`.

  Here is an `onComplete` callback example:

  ```js
  Onfido.init({
    token: 'your-jwt-token',
    containerId: 'onfido-mount',
    onComplete: function (data) {
      console.log('everything is complete')
      // tell your backend service that it can create the check
      // when creating a facial similarity check, you can specify
      // whether you want to start a `facial_similarity_photo` check
      // or a `facial_similarity_video` check based on the value within `data.face.variant`
    },
  })
  ```

  Based on the applicant id, you can then create a check for the user via your backend.

- **`onError {Function} optional`**

  Callback that fires when one an error occurs. The callback returns the following errors types:

  - `exception`
    This type will be returned for the following errors:

    - Timeout and server errors
    - Authorization
    - Invalid token

    The data returned by this type of error should be used for debugging purpose.

  - `expired_token`
    This error will be returned when a token is expired. This error type can be used to provide a new token at runtime.

  Here is an example of the data returned by the `onError` callback:

  ```js
  // Example of data returned for an `exception` error type
  {
    type: "exception",
    message: "The request could not be understood by the server, please check your request is correctly formatted"
  }

  // Example of data returned for an `expired_token` error type
  {
    type: "expired_token",
    message: "The token has expired, please request a new one"
  }
  ```

- **`onUserExit {Function} optional`**

  Callback that fires when the user abandons the flow without completing it. The callback returns a string with the reason for leaving. When the user exits the flow by declining the consent prompt the value returned will be `'USER_CONSENT_DENIED'`.

  ```js
  Onfido.init({
    token: 'your-jwt-token',
    containerId: 'onfido-mount',
    onUserExit: function (userExitCode) {
      console.log(userExitCode)
    },
  })
  ```

- **`onModalRequestClose {Function} optional`**

  Callback that fires when the user attempts to close the modal.
  It is your responsibility to decide then to close the modal or not
  by changing the property `isModalOpen`.

## Removing the SDK

If you are embedding the SDK inside a single page app, you can call the `tearDown` function to remove the SDK completely from the current webpage. It will reset state and you can safely re-initialize the SDK inside the same webpage later on.

```javascript
onfidoOut = Onfido.init({...})
...
onfidoOut.tearDown()
```

## Customising the SDK

A number of options are available to allow you to customize the SDK:

- **`token {String} required`**

  A JWT is required in order to authorise with our WebSocket endpoint. If one isn’t present, an exception will be thrown.

- **`useModal {Boolean} optional`**

  Turns the SDK into a modal, which fades the background and puts the SDK into a contained box.

  Example:

  ```javascript
  <script>
      var onfido = {}

      function triggerOnfido() {
        onfido = Onfido.init({
          useModal: true,
          isModalOpen: true,
          onModalRequestClose: function() {
            // Update options with the state of the modal
            onfido.setOptions({isModalOpen: false})
          },
          token: 'token',
          onComplete: function(data) {
            // callback for when everything is complete
            console.log("everything is complete")
          }
        });
      };
  </script>

  <body>
    <!-- Use a button to trigger the Onfido SDK  -->
    <button onClick="triggerOnfido()">Verify identity</button>
    <div id='onfido-mount'></div>
  </body>
  ```

- **`isModalOpen {Boolean} optional`**

  In case `useModal` is set to `true`, this defines whether the modal is open or closed.
  To change the state of the modal after calling `init()` you need to later use `setOptions()` to modify it.
  The default value is `false`.

- **`shouldCloseOnOverlayClick {Boolean} optional`**

  In case `useModal` is set to `true`, the user by default can close the SDK by clicking on the close button or on the background overlay. You can disable the user from closing the SDK on background overlay click by setting the `shouldCloseOnOverlayClick` to false.

- **`containerId {String} optional`**

  A string of the ID of the container element that the UI will mount to. This needs to be an empty element. The default ID is `onfido-mount`. If your integration needs to pass the container element itself, use `containerEl` as described next.

- **`containerEl {Element} optional`**

  The container element that the UI will mount to. This needs to be an empty element. This can be used as an alternative to passing in the container ID string previously described for `containerId`. Note that if `containerEl` is provided, then `containerId` will be ignored.

- **`language {String || Object} optional`**

  The SDK language can be customized by passing a String or an Object. At the moment, we support and maintain translations for English (default), Spanish, German and French using respectively the following locale tags: `en_US`, `es_ES`, `de_DE`, `fr_FR`.
  To leverage one of these languages, the `language` option should be passed as a string containing a supported language tag.

  Example:

  ```javascript
  language: 'es_ES' | 'es'
  ```

  The SDK can also be displayed in a custom language by passing an object containing the locale tag and the custom phrases.
  The object should include the following keys:

  - `locale`: A locale tag. This is **required** when providing phrases for an unsupported language.
    You can also use this to partially customize the strings of a supported language (e.g. Spanish), by passing a supported language locale tag (e.g. `es_ES`). For missing keys, the values will be displayed in the language specified within the locale tag if supported, otherwise they will be displayed in English.
    The locale tag is also used to override the language of the SMS body for the cross device feature. This feature is owned by Onfido and is currently only supporting English, Spanish, French and German.

  - `phrases` (required) : An object containing the keys you want to override and the new values. The keys can be found in [`src/locales/en_US/en_US.json`](src/locales/en_US/en_US.json). They can be passed as a nested object or as a string using the dot notation for nested values. See the examples below.
  - `mobilePhrases` (optional) : An object containing the keys you want to override and the new values. The values specified within this object are only visible on mobile devices. Please refer to the `mobilePhrases` property in [`src/locales/en_US/en_US.json`](src/locales/en_US/en_US.json). **Note**: support for standalone `mobilePhrases` key will be deprecated soon. Consider nesting it inside `phrases` if applicable.

  ```javascript
  language: {
    locale: 'en_US',
    phrases: { welcome: { title: 'My custom title' } },
    mobilePhrases: {
      'capture.driving_licence.instructions': 'This string will only appear on mobile'
    }
  }
  ```

  If `language` is not present the default copy will be in English.

- **`smsNumberCountryCode {String} optional`**

  The default country for the SMS number input can be customized by passing the `smsNumberCountryCode` option when the SDK is initialized. The value should be a 2-characters long ISO Country code string. If empty, the SMS number country code will default to `GB`.

  Example:

  ```javascript
  smsNumberCountryCode: 'US'
  ```

- **`userDetails {Object} optional`**

  Some user details can be specified ahead of time, so that the user doesn't need to fill them in themselves.

  The following details can be used by the SDK:

  - `smsNumber` (optional) : The user's mobile number, which can be used for sending any SMS messages to the user. An example SMS message sent by the SDK is when a user requests to use their mobile devices to take photos. This should be formatted as a string, with a country code (e.g. `"+447500123456"`)

  ```javascript
  userDetails: {
    smsNumber: '+447500123456'
  }
  ```

- **`customUI {Object} optional`**

  If you would like to customize the SDK, this can be done by providing the `customUI` option with an object with the corresponding CSS values (e.g. RGBA color values, border radius values) for the following options:

  | Typography options     | Description                                                                        |
  | ---------------------- | ---------------------------------------------------------------------------------- |
  | `fontFamilyTitle`      | Change font family of the SDK screen titles                                        |
  | `fontFamilySubtitle`   | Change font family of the SDK screen subtitles                                     |
  | `fontFamilyBody`       | Change font family of the SDK screen content                                       |
  | `fontSizeTitle`        | Change font size of the SDK screen titles                                          |
  | `fontSizeSubtitle`     | Change font size of the SDK screen subtitles                                       |
  | `fontSizeBody`         | Change font size of the SDK screen content                                         |
  | `fontWeightTitle`      | Change font weight of the SDK screen titles (number format only, e.g. 400, 600)    |
  | `fontWeightSubtitle`   | Change font weight of the SDK screen subtitles (number format only, e.g. 400, 600) |
  | `fontWeightBody`       | Change font weight of the SDK screen content (number format only, e.g. 400, 600)   |
  | `colorContentTitle`    | Change text color of the SDK screen titles                                         |
  | `colorContentSubtitle` | Change text color of the SDK screen subtitles                                      |
  | `colorContentBody`     | Change text color of the SDK screen content                                        |

  Example configuration with the different CSS font related values that can be used:

  ```javascript
  customUI: {
    "fontFamilyTitle": "Impact, fantasy",
    "fontSizeTitle": "26px",
    "fontWeightSubtitle": 600,
    "fontSizeSubtitle": "1.25rem",
  }
  ```

  **Note:** If using a scalable font size unit like em/rem, the SDK's base font size is 16px. This is currently not customizable.

  | Modal (SDK main container)    | Description                          |
  | ----------------------------- | ------------------------------------ |
  | `colorBackgroundSurfaceModal` | Change background color of SDK modal |
  | `colorBorderSurfaceModal`     | Change color of SDK modal border     |
  | `borderWidthSurfaceModal`     | Change border width of SDK modal     |
  | `borderStyleSurfaceModal`     | Change border style of SDK modal     |
  | `borderRadiusSurfaceModal`    | Change border radius of SDK modal    |

  Example configuration with the different CSS colour value variations, border style that can be used:

  ```javascript
  customUI: {
      "colorBackgroundSurfaceModal": "#fafafa",
      "colorBorderSurfaceModal": "rgb(132 59 98)",
      "borderWidthSurfaceModal": "6px",
      "borderStyleSurfaceModal": "groove",
    }
  ```

  | Primary Buttons                      | Description                                            |
  | ------------------------------------ | ------------------------------------------------------ |
  | `colorContentButtonPrimaryText`      | Change color of Primary Button text                    |
  | `colorBackgroundButtonPrimary`       | Change background color of Primary Button              |
  | `colorBackgroundButtonPrimaryHover`  | Change background color of Primary Button on hover     |
  | `colorBackgroundButtonPrimaryActive` | Change background color of Primary Button on click/tap |
  | `colorBorderButtonPrimary`           | Change color of Primary Button border                  |

  | Secondary Buttons                      | Description                                              |
  | -------------------------------------- | -------------------------------------------------------- |
  | `colorContentButtonSecondaryText`      | Change color of Secondary Button text                    |
  | `colorBackgroundButtonSecondary`       | Change background color of Secondary Button              |
  | `colorBackgroundButtonSecondaryHover`  | Change background color of Secondary Button on hover     |
  | `colorBackgroundButtonSecondaryActive` | Change background color of Secondary Button on click/tap |
  | `colorBorderButtonSecondary`           | Change color of Secondary Button border                  |

  | Document Type Buttons            | Description                                              |
  | -------------------------------- | -------------------------------------------------------- |
  | `colorContentDocTypeButton`      | Change Document Type Button text color                   |
  | `colorBackgroundDocTypeButton`   | Change background color of Document Type Button          |
  | `colorBorderDocTypeButton`       | Change color of Document Type Button border              |
  | `colorBorderDocTypeButtonHover`  | Change color of Document Type Button border on hover     |
  | `colorBorderDocTypeButtonActive` | Change color of Document Type Button border on click/tap |

  | Icon Background option | Description                                                         |
  | ---------------------- | ------------------------------------------------------------------- |
  | `colorBackgroundIcon`  | Change color of the background circle of pictogram icons in the SDK |

  Example configuration with the different CSS colour value variations that can be used:

  ```javascript
  customUI: {
      "colorContentButtonPrimaryText": "#333",
      "colorBackgroundButtonPrimary": "#ffb997",
      "colorBorderButtonPrimary": "#B23A48",
      "colorBackgroundButtonPrimaryHover": "#F67E7D",
      "colorBackgroundButtonPrimaryActive": "#843b62",

      "colorContentButtonSecondaryText": "hsla(90deg 1% 31%)",
      "colorBackgroundButtonSecondary": "rgba(255 238 170 / 92%)",
      "colorBorderButtonSecondary": "coral",
      "colorBackgroundButtonSecondaryHover": "#ce6a85",
      "colorBackgroundButtonSecondaryActive": "#985277",
    }
  ```

  The following options are applied to multiple Button elements:

  | Shared Button options                   | Value Type | Description                                                                                                                                 |
  | --------------------------------------- | ---------- | ------------------------------------------------------------------------------------------------------------------------------------------- |
  | `borderRadiusButton`                    | `string`   | Change border radius value of Primary, Secondary and Document Type Option buttons                                                           |
  | `buttonGroupStacked` (default: `false`) | `boolean`  | Display Primary, Secondary button group in Document and Face capture confirmation screens are in separate rows instead of inline by default |

  Example configuration:

  ```javascript
  customUI: {
      borderRadiusButton: "50px",
      buttonGroupStacked: true
    }
  ```

  | Links                       | Description                               |
  | --------------------------- | ----------------------------------------- |
  | `colorContentLinkTextHover` | Change Link text color                    |
  | `colorBorderLinkUnderline`  | Change Link underline color               |
  | `colorBackgroundLinkHover`  | Change Link background color on hover     |
  | `colorBackgroundLinkActive` | Change Link background color on click/tap |

  | Warning Popups                    | Description                                                |
  | --------------------------------- | ---------------------------------------------------------- |
  | `colorContentAlertInfo`           | Change warning popup text color                            |
  | `colorBackgroundAlertInfo`        | Change warning popup background color                      |
  | `colorContentAlertInfoLinkHover`  | Change warning popup fallback Link background on hover     |
  | `colorContentAlertInfoLinkActive` | Change warning popup fallback Link background on click/tap |

  | Error Popups                       | Description                                              |
  | ---------------------------------- | -------------------------------------------------------- |
  | `colorContentAlertError`           | Change error popup text color                            |
  | `colorBackgroundAlertError`        | Change error popup background color                      |
  | `colorContentAlertErrorLinkHover`  | Change error popup fallback Link background on hover     |
  | `colorContentAlertErrorLinkActive` | Change error popup fallback Link background on click/tap |

  | Info Header/Highlight Pills | Description                                                                                      |
  | --------------------------- | ------------------------------------------------------------------------------------------------ |
  | `colorBackgroundInfoPill`   | Change background color of Cross Device, Camera/Mic Permissions screens' information header pill |
  | `colorContentInfoPill`      | Change text color of Cross Device, Camera/Mic Permissions screens' information header pill       |

  | Icon Buttons                      | Description                                                            |
  | --------------------------------- | ---------------------------------------------------------------------- |
  | `colorBackgroundButtonIconHover`  | Change background color of Back, Close Modal icon buttons on hover     |
  | `colorBackgroundButtonIconActive` | Change background color of Back, Close Modal icon buttons on click/tap |

  | Camera Shutter Button               | Description                                                                                 |
  | ----------------------------------- | ------------------------------------------------------------------------------------------- |
  | `colorBackgroundButtonCameraHover`  | Change background color of Live Selfie/Document Capture screens's Camera button on hover    |
  | `colorBackgroundButtonCameraActive` | Change background color of Live Selfie/Document Capture screen's Camera button on click/tap |

- **`steps {List} optional`**

  List of the different steps and their custom options. Each step can either be specified as a string (when no customization is required) or an object (when customization is required):

  ```javascript
  steps: [
    {
      type: 'welcome',
      options: {
        title: 'Open your new bank account',
      },
    },
    'document',
    'face',
  ]
  ```

  In the example above, the SDK flow is consisted of three steps: `welcome`, `document` and `face`. Note that the `title` option of the `welcome` step is being overridden, while the other steps are not being customized.

  The SDK can also be used to capture Proof of Address documents. This can be achieved by using the `poa` step.

  Below are descriptions of the steps and the custom options that you can specify inside the `options` property. Unless overridden, the default option values will be used:

  ### welcome

  This is the introduction screen of the SDK. Use this to explain to your users that they need to supply identity documents (and face photos/videos) to have their identities verified.

  The custom options are:

  - `title` (string)
  - `descriptions` ([string])
  - `nextButton` (string)

  ### userConsent

  This step contains a screen to collect the US user's privacy consent for Onfido and is an optional step in the SDK flow. It contains the consent language required when you offer your service to US users as well as links to Onfido's policies and terms of use. The user must click "Accept" to get past this step and continue with the flow. The content is available in English only, and is not translatable.

  Note that this step does not automatically inform Onfido that the user has given their consent. At the end of the SDK flow, you still need to set the API parameter `privacy_notices_read_consent_given` outside of the SDK flow when [creating a check](#creating-checks).

  If you choose to disable this step, you must incorporate the required consent language and links to Onfido's policies and terms of use into your own application's flow before your user starts interacting with the Onfido SDK.

  For more information about this step, and how to collect user consent, please visit the [Onfido Privacy Notices and Consent](http://developers.onfido.com/guide/onfido-privacy-notices-and-consent) page.

  **Note**: The `userConsent` step must be used in conjunction with the `onUserExit` callback. See the [Handling Callbacks](#handling-callbacks) section for more information.

  ### document

  This is the identity document capture step. Users will be asked to select the document type and to provide images of their selected document. For driving licence and national ID card types, the user will be able to see and select the document's issuing country from a list of supported countries. They will also have a chance to check the quality of the image(s) before confirming.

  The custom options are:

  - `documentTypes` (object)

    The list of document types visible to the user can be filtered by using the `documentTypes` option. The default value for each document type is `true`. If `documentTypes` only includes one document type, users will not see either the document selection screen or the country selection screen and instead will be taken to the capture screen directly.

    #### Configuring Country

    The `country` configuration for a document type allows you to specify the issuing country of the document with a 3-letter ISO 3166-1 alpha-3 country code. Users will not see the country selection screen if this is set for a document type.

    **Note**: You can set the country for all document types except **Passport**.

    For example, if you would like to set the country as Spain (ESP) and skip the country selection screen for the driving licence document type only:

    ```json
    {
      "steps": [
        "welcome",
        {
          "type": "document",
          "options": {
            "documentTypes": {
              "driving_licence": {
                "country": "ESP"
              },
              "national_identity_card": true,
              "residence_permit": true
            }
          }
        },
        "complete"
      ]
    }
    ```

    If you would like to suppress the country selection screen for driving licence but do not want to set a country:

    ```json
    {
      "steps": [
        "welcome",
        {
          "type": "document",
          "options": {
            "documentTypes": {
              "driving_licence": {
                "country": null
              },
              "passport": true,
              "national_identity_card": true
            }
          }
        },
        "complete"
      ]
    }
    ```

  - `showCountrySelection` (boolean - default: `false`)

    **Note**: Support for the `showCountrySelection` option will be deprecated soon in favour of the per document country configuration detailed above which offers integrators better control.

    The `showCountrySelection` option controls what happens when **only a single document** is preselected in `documentTypes` It has no effect when the SDK has been set up with multiple documents preselected.

    The country selection screen is never displayed for a passport document.

    By default, if only one document type is preselected, and the document type is not `passport`, the country selection screen will not be displayed. If you would like to have this screen displayed still, set `showCountrySelection` to `true`.

    ```javascript
    options: {
      documentTypes: {
        passport: boolean,
        driving_licence: boolean,
        national_identity_card: boolean,
        residence_permit: boolean
      },
      showCountrySelection: boolean (note that this will only apply for certain scenarios, see example configurations below)
    }
    ```

    #### Example of Document step without Country Selection screen for a preselected non-passport document (default behaviour)

    ```json
    {
      "steps": [
        "welcome",
        {
          "type": "document",
          "options": {
            "documentTypes": {
              // Note that only 1 document type is selected here
              "passport": false,
              "driving_licence": false,
              "national_identity_card": true
            },
            "showCountrySelection": false
          }
        },
        "complete"
      ]
    }
    ```

    #### Examples of Document step configuration with more than one preselected documents where Country Selection will still be displayed

    **Example 1**
    All document type options enabled, `"showCountrySelection": false` has no effect

    ```json
    {
      "steps": [
        "welcome",
        {
          "type": "document",
          "options": {
            "documentTypes": {
              "passport": true,
              "driving_licence": true,
              "national_identity_card": true
            },
            "showCountrySelection": false (NOTE: has no effect)
          }
        },
        "complete"
      ]
    }
    ```

    **Example 2**
    2 document type options enabled, `"showCountrySelection": false` has no effect

    ```json
    {
      "steps": [
        "welcome",
        {
          "type": "document",
          "options": {
            "documentTypes": {
              "passport": true,
              "national_identity_card": true,
              "driving_licence": false
            },
            "showCountrySelection": false (NOTE: has no effect)
          }
        },
        "complete"
      ]
    }
    ```

  - `forceCrossDevice` (boolean - default: `false`)

    When set to `true`, desktop users will be forced to use their mobile devices to capture the document image. They will be able to do so via the built-in SMS feature. Use this option if you want to prevent file upload from desktops.

    ```javascript
    options: {
      forceCrossDevice: true
    }
    ```

  - `useLiveDocumentCapture` (boolean - default: `false`)
    **This BETA feature is only available on mobile devices.**

    When set to `true`, users on mobile browsers with camera support will be able to capture document images using an optimised camera UI, where the SDK directly controls the camera feed to ensure live capture. For unsupported scenarios, see the `uploadFallback` section below.
    Tested on: Android Chrome `78.0.3904.108`, iOS Safari `13`

  - `uploadFallback` (boolean - default: `true`)
    Only available when `useLiveDocumentCapture` is enabled.

    When `useLiveDocumentCapture` is set to `true`, the SDK will attempt to open an optimised camera UI for the user to take a live photo of the selected document. When this is not possible (because of an unsupported browser or mobile devices with no camera), by default the user will be presented with an HTML5 File Input upload because of `uploadFallback`. In this scenario, they will be able to use their mobile device's default camera application to take a photo, but will not be presented with an optimised camera UI.

    This method does not guarantee live capture, because certain mobile device browsers and camera applications may also allow uploads from the user's gallery of photos.

    **Warning**: If the mobile device does not have a camera or there is no camera browser support, and `uploadFallback` is set to `false`, the user will not be able to complete the flow.

    ```javascript
    options: {
      useLiveDocumentCapture: true,
      uploadFallback: false
    }
    ```

  ### poa

  This is the Proof of Address capture step. Users will be asked to select the document type and to provide images of their selected document. They will also have a chance to check the quality of the images before confirming.
  The custom options are:

  - `country` (default: `GBR`)
  - `documentTypes`

  ```javascript
  options: {
    country: string,
    documentTypes: {
      bank_building_society_statement: boolean,
      utility_bill: boolean,
      council_tax: boolean, // GBR only
      benefit_letters: boolean, // GBR only
      government_letter: boolean // non-GBR only
    }
  }
  ```

  **The Proof of Address document capture is currently a BETA feature, and it cannot be used in conjunction with the document and face steps as part of a single SDK flow.**

  ### face

  This is the face capture step. Users will be asked to capture their face in the form of a photo or a video. They will also have a chance to check the quality of the photos or video before confirming.

  The custom options are:

  - `requestedVariant` (string)

    A preferred variant can be requested for this step, by passing the option `requestedVariant: 'standard' | 'video'`. If empty, it will default to `standard` and a photo will be captured. If the `requestedVariant` is `video`, we will try to fulfil this request depending on camera availability and device/browser support. In case a video cannot be taken the face step will fallback to the `standard` option. At the end of the flow, the `onComplete` callback will return the `variant` used to capture face and this can be used to initiate a `facial_similarity_photo` or a `facial_similarity_video` check.

  - `uploadFallback` (boolean - default: `true`)

    By default, the SDK will attempt to open an optimised camera UI for the user to take a live photo/video. When this is not possible (because of an unsupported browser or mobile devices with no camera), by default the user will be presented with an HTML5 File Input upload because of `uploadFallback`. In this scenario, they will be able to use their mobile device's default camera application to take a photo, but will not be presented with an optimised camera UI.

    This method does not guarantee live capture, because certain mobile device browsers and camera applications may also allow uploads from the user's gallery of photos.

    **Warning**: If the mobile device does not have a camera or there is no camera browser support, and `uploadFallback` is set to `false`, the user will not be able to complete the flow.

    ```javascript
    options: {
      requestedVariant: 'standard' | 'video',
      uploadFallback: false
    }
    ```

  - `useMultipleSelfieCapture` (boolean - default: `true`)

    When enabled, this feature allows the SDK to take additional selfie snapshots to help improve face similarity check accuracy. When disabled, only one selfie photo will be taken.

  ### complete

  This is the final completion step. You can use this to inform your users what is happening next. The custom options are:

  - `message` (string)
  - `submessage` (string)

### Changing options in runtime

It's possible to change the options initialized at runtime:

```javascript
onfidoOut = Onfido.init({...})
...
//Change the title of the welcome screen
onfidoOut.setOptions({
  steps: [
    {
      type:'welcome',
      options:{title:"New title!"}
    },
    'document',
    'face',
    'complete'
  ]
});
...
//replace the jwt token
onfidoOut.setOptions({ token:"new token" });
...
//Open the modal
onfidoOut.setOptions({ isModalOpen:true });
```

The new options will be shallowly merged with the previous one. So one can pass only the differences to a get a new flow.

## Creating checks

This SDK’s aim is to help with the document capture process. It does not actually perform the full document/face checks against our [API](https://documentation.onfido.com/).

In order to perform a full document/face check, you need to call our [API](https://documentation.onfido.com/) to create a check for the applicant on your backend.

### 1. Creating a check

With your API token and applicant id (see [Getting started](#getting-started)), you will need to create a check by making a request to the [create check endpoint](https://documentation.onfido.com/#create-check). If you are just verifying a document, you only have to include a [document report](https://documentation.onfido.com/#document-report) as part of the check. On the other hand, if you are verifying a document and a face photo/video, you will also have to include a [facial similarity report](https://documentation.onfido.com/#facial-similarity-reports).
The facial similarity check can be performed in two different variants: `facial_similarity_photo` and `facial_similarity_video`. If the SDK is initialized with the `requestedVariant` option for the face step, make sure you use the data returned in the `onComplete` callback to request the right report.
The value of `variant` indicates whether a photo or video was captured and it needs to be used to determine the report name you should include in your request.
Example of data returned by the `onComplete` callback:
`{face: {variant: 'standard' | 'video'}}`

When the `variant` returned is `standard`, you should include `facial_similarity_photo` in the `report_names` array.
If the `variant` returned is `video`, you should include `facial_similarity_video` in the `report_names` array.

```shell
$ curl https://api.onfido.com/v3/checks \
    -H 'Authorization: Token token=YOUR_API_TOKEN' \
    -d '{
      "applicant_id": "<APPLICANT_ID>",
      "report_names": ["document", "facial_similarity_photo" | "facial_similarity_video"]
    }'
```

Note: If you are currently using API `v2` please refer to [this migration guide](https://developers.onfido.com/guide/api-v2-to-v3-migration-guide) for more information.

You will receive a response containing the check id instantly. As document and facial similarity reports do not always return actual [results](https://documentation.onfido.com/#results) straightaway, you need to set up a webhook to get notified when the results are ready.

Finally, as you are testing with the sandbox token, please be aware that the results are pre-determined. You can learn more about sandbox responses [here](https://documentation.onfido.com/#pre-determined-responses).

### 2. Setting up webhooks

Refer to the [Webhooks](https://documentation.onfido.com/#webhooks) section in the API documentation for details.

## User Analytics

The SDK allows you to track the user's journey through the verification process via a dispatched event. This is meant to give some insight into how your user's make use of the SDK screens.

### Overriding the hook

In order to expose the user's progress through the SDK an `EventListener` must be added that listens for `UserAnalyticsEvent` events. This can be done anywhere within your application and might look something like the following:

```javascript
addEventListener('userAnalyticsEvent', (event) => /*Your code here*/);
```

The code inside of the `EventListener` will now be called when a particular event is triggered, usually when the user reaches a new screen. For a full list of events see the bottom of this section.

The parameter being passed in is an `Event` object, the details related to the user analytics event can be found at the path `event.detail` and are as follows:

- `eventName`: A `String` indicating the type of event. Currently will always this return as `"Screen"` as each tracked event is a user visiting a screen. In the future more event types may become available for tracking.
- `properties`: A `Map` object containing the specific details of an event. This will contain things such as the `name` of the screen visited.

### Using the data

Currently we recommend using the above hook to keep track of how many user's reach each screen in your flow. This can be done by storing the count of users that reach each screen and comparing them to the amount of user's who've made it to the `Welcome` screen.

### Tracked events

Below is the list of potential events currently being tracked by the hook:

```
WELCOME - User reached the "Welcome" screen
USER_CONSENT - User reached the "User Consent" screen
DOCUMENT_TYPE_SELECT - User reached the "Choose document" screen where the type of document to upload can be selected
ID_DOCUMENT_COUNTRY_SELECT - User reached the "Select issuing country" screen where the the appropriate issuing country can be searched for and selected if supported
CROSS_DEVICE_INTRO - User reached the cross device "Continue on your phone" intro screen
CROSS_DEVICE_GET_LINK - User reached the cross device "Get your secure link" screen
CROSS_DEVICE_START - User reached the "document capture" screen on mobile after visiting the cross device link
DOCUMENT_CAPTURE_FRONT - User reached the "document capture" screen for the front side (for one-sided or two-sided document)
DOCUMENT_CAPTURE_BACK - User reached the "document capture" screen for the back side (for two-sided document)
DOCUMENT_CAPTURE_CONFIRMATION_FRONT - User reached the "document confirmation" screen for the front side (for one-sided or two-sided document)
DOCUMENT_CAPTURE_CONFIRMATION_BACK - User reached the "document confirmation" screen for the back side (for two-sided document)
FACIAL_INTRO - User reached the "selfie intro" screen
FACIAL_CAPTURE - User reached the "selfie capture" screen
FACIAL_CAPTURE_CONFIRMATION - User reached the "selfie confirmation" screen
VIDEO_FACIAL_INTRO - User reached the "liveness intro" screen
VIDEO_FACIAL_CAPTURE_STEP_1 - User reached the 1st challenge during "liveness video capture", challenge_type can be found in eventProperties
VIDEO_FACIAL_CAPTURE_STEP_2 - User reached the 2nd challenge during "liveness video capture", challenge_type can be found in eventProperties
UPLOAD - User's file is uploading
```

## Premium Enterprise Features

These features must be enabled for your account before they can be used. For more information, please contact your Onfido Solution Engineer or Customer Success Manager.

### Customized API Requests - Premium Enterprise Feature

This premium enterprise feature enables you to control the data collected by the Onfido SDK through the use of callbacks that are invoked when the user submits their captured media. These callbacks provide all of the information that would normally be sent directly to the Onfido API and expect a promise in response that controls what the SDK does next. Before the feature can be used, it must be enabled for your account. Once enabled, you will need to set `useCustomizedApiRequests` to `true` and provide the callbacks for `onSubmitDocument` and `onSubmitSelfie` within the `enterpriseFeatures` block of the configuration options. The callback for video is not supported yet.

Example:

```javascript
Onfido.init({
  // Other options here
  enterpriseFeatures: {
    useCustomizedApiRequests: true,
    onSubmitDocument: (documentData) => {
      // Your callback code here
    },
    onSubmitSelfie: (selfieData) => {
      // Your callback code here
    },
  },
})
```

To enable callbacks on the cross-device flow you must also host the cross-device experience of the Onfido SDK yourself. This can be done using the [cross device URL](#cross-device-url) premium enterprise feature. Once you have a server with the Onfido Web SDK installed and set up you must initialize the SDK with `mobileFlow: true` as well as the callbacks and `useCustomizedApiRequests` options shown above.

#### Callbacks Overview

The callbacks will provide you with a FormData object including the information that the SDK would send to Onfido. These callbacks will be invoked when the user confirms their image on the UI and won’t send the request to Onfido unless requested in the response.

**onSubmitDocument FormData Paramaters**

```javascript
{
  file: blob,
  side: string,
  type: string,
  sdk_validations: object,
  sdk_source: string,
  sdk_version: string,
  sdk_metadata: object,
}
```

**onSubmitSelfie FormData Paramaters**

```javascript
{
  file: blob,
  snapshot: blob,
  sdk_source: string,
  sdk_version: string,
  sdk_metadata: object,
}

```

**Allowing the SDK to upload data to Onfido**

If you would like the SDK to upload the user-submitted data to Onfido you can resolve the promise with an object containing `continueWithOnfidoUpload: true`

Example:

```javascript
onSubmitDocument: (data) => {
  // Send data to your backend then resolve promise,
  return Promise.resolve({ continueWithOnfidoUpload: true })
})
```

**Providing the SDK with the Onfido response**

If you would like to upload the data yourself from your backend, we strongly recommend that you add all of the data provided to you through the callbacks in your request to the appropriate endpoint - `/documents` or `/live_photos`. Additionally, you should use the SDK token created for each applicant in the `Authorization` header of the request as shown below. Please note, the SDK token is not included in the FormData provided by the callbacks. You may want to append this or some other unique identifier that is mapped to the applicant's SDK token on your backend before sending it off.

Example:

```
Authorization: Bearer <SDK token here>
```

Once you have sent the request to Onfido yourself, you can supply the SDK with the response so it can determine what the user should be presented with. In the case where a success response is received, the promise should be resolved with `onfidoSuccessResponse: <onfidoResponse>`, otherwise reject the promise with the Onfido error response. Please note that an error response could be returned due to image quality issues and the SDK will present the user with the appropriate error message.

Example:

```javascript
onSubmitDocument: (data) => {
  // Send request to Onfido API /documents via your backend proxy
  .then(onfidoSuccessResponse =>
    Promise.resolve({ onfidoSuccessResponse }))
  .catch(onfidoError => Promise.reject(onfidoError))
}

```

Below is a sample openAPI YAML file you could use as an example to start your own proxy.

```yaml
openapi: 3.0.0
info:
  title: Network decouple back-end sample
  description: Network decouple back-end setup skeleton
  version: '1.0'
  contact: {}
tags: []
servers: []
components:
  schemas:
    IDocumentsRequest:
      type: object
      properties:
        file:
          type: string
          format: binary
          description: Uploaded document. Passed in from the web SDK callback.
        type:
          type: string
          default: passport
          description: >-
            The type of document that was submitted. Passed in from the web SDK
            callback.
        side:
          type: string
          default: front
          description: >-
            The type side of the document that was submitted. Passed in from the
            web SDK callback.
        sdk_metadata:
          type: object
          description: >-
            The metadata that web SDK collects. Forward this to Onfido API
            without modifications. Passed in from the web SDK callback.
        sdk_validations:
          type: object
          description: >-
            This is a an object used by web SDK to seek image quality feedback
            from the API. Forward this object without modifications to Onfido
            API. Passed in from the web SDK callback.
        sdk_source:
          type: string
          default: onfido_web_sdk
          description: >-
            The source of origin of the requests. Forward this without
            modifications to the Onfido API. Passed in from the web SDK callback.
        sdk_version:
          type: string
          description: >-
            The SDK version. Forward this without modifications to the Onfido
            API. Passed in from the web SDK callback.
    IMultiFrameSelfieRequest:
      type: object
      properties:
        file:
          type: string
          format: binary
          description: Uploaded photo
        sdk_metadata:
          type: object
          description: >-
            The metadata that web SDK collects. Forward this to Onfido API
            without modifications. Passed in from the web SDK callback.
        sdk_source:
          type: string
          default: onfido_web_sdk
          description: >-
            The source of origin of the requests. Forward this without
            modifications to the Onfido API. Passed in from the web SDK callback.
        sdk_version:
          type: string
          description: >-
            The SDK version. Forward this without modifications to the Onfido
            API. Passed in from the web SDK callback.
        snapshot:
          type: string
          format: binary
          description: Uploaded snapshot taken by the Web SDK to improve fraud analysis.
paths:
  /onfido/v3/documents:
    post:
      operationId: OnfidoController documents
      parameters:
        - name: Auhorization
          in: header
          description: Customer back-end Authentication token
          schema:
            type: string
      requestBody:
        required: true
        description: The API endpoint to intercept the document upload from the Web SDK
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/IDocumentsRequest'
      responses:
        '200':
          description: >-
            The response received from Onfido v3/documents API call. The
            response format might slightly vary with the use case. Forward it
            without modifications as the callback response.
          content:
            application/json:
              schema:
                properties:
                  id:
                    type: string
                    format: uuid
                  created_at:
                    type: string
                    format: date-time
                  file_name:
                    type: string
                  file_size:
                    type: integer
                  file_type:
                    type: string
                  type:
                    type: string
                  side:
                    type: string
                  issuing_country:
                    type: string
                  applicant_id:
                    type: string
                  href:
                    type: string
                  download_href:
                    type: string
                  sdk_warnings:
                    type: object
        '201':
          description: ''
          content:
            application/json:
              schema:
                type: object
        '422':
          description: ''
          content:
            application/json:
              schema:
                properties:
                  error:
                    type: object
                    properties:
                      type:
                        type: string
                      message:
                        type: string
                  fields:
                    type: object
  /onfido/v3/live_photos:
    post:
      operationId: OnfidoController
      parameters:
        - name: Auhorization
          in: header
          description: Customer back-end Authentication token
          schema:
            type: string
      requestBody:
        required: true
        description: The API endpoint to intercept the live photos upload from the Web SDK
        content:
          multipart/form-data:
            schema:
              $ref: '#/components/schemas/IMultiFrameSelfieRequest'
      responses:
        '200':
          description: >-
            The response received from Onfido v3/live_photos API call. The
            response format might slightly vary with the use case. Forward it
            without modifications as the callback response.
          content:
            application/json:
              schema:
                properties:
                  id:
                    type: string
                    format: uuid
                  created_at:
                    type: string
                    format: date-time
                  file_name:
                    type: string
                  file_type:
                    type: string
                  file_size:
                    type: integer
                  href:
                    type: string
                  sdk_source:
                    type: string
                  sdk_version:
                    type: string
                  download_href:
                    type: string
        '201':
          description: ''
          content:
            application/json:
              schema:
                type: object
```

### Cross device URL - Premium Enterprise Feature

This feature allows you to specify your own custom or whitelabel url that the cross device flow will redirect to instead of the Onfido default `id.onfido.com`. To use this feature generate a SDK token as shown below and use it to start the SDK.

```shell
$ curl https://api.onfido.com/v3/sdk_token \
 -H 'Authorization: Token token=YOUR_API_TOKEN' \
 -F 'applicant_id=YOUR_APPLICANT_ID' \
 -F 'referrer=REFERRER_PATTERN' \
 -F 'cross_device_url=YOUR_CUSTOM_URL'
```

In addition to this, you must either:

1. Set up a server to forward the incoming HTTP request, including the path, to `https://id.onfido.com`. This can be done by setting up a server as a reverse proxy so that the URL that the end-user sees is your selected URL but the content shown is the Onfido-hosted Web SDK.

Below is an example set-up for a minimal nginx server using docker.

**Example**

nginx.conf

```nginx
server {
  # Change the next 2 lines as needed
  listen       80;
  server_name  localhost;

  location / {
    # This forwards the path to Onfido and is the only change
    # necessary when working with the default nginx configuration
    proxy_pass https://id.onfido.com;
  }
}
```

dockerfile

```
FROM nginx:1.15.8-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf
```

2. Set up a server to host the Onfido Web SDK yourself at the provided URL. This server must use the same version of the Onfido Web SDK and must initialize the SDK with `Onfido.init({ mobileFlow: true })`. All other configuration options, except for callbacks provided for the `useCustomizedApiRequests` feature, will be provided by your original instance of the Onfido Web SDK.

Below is an example of how you could host the Onfido Web SDK with minimal setup, but it does not have to be done this way.

**Example**

This example involves using docker and an nginx image to serve an html file which starts the Onfido Web SDK using just the minified js and css files from the dist directory. (`onfido-sdk-ui/dist/onfido.min.js` and `onfido-sdk-ui/dist/style.css`)

To help with getting the correct version of the Web SDK, we append the Onfido files with the base32 version that is associated with each release. This value can be obtained from the first 2 characters in the appended path when using the cross-device flow. For example, if the current release appends a path that starts with `BW` we would rename the minified files `BW-onfido.min.js` and `BW-style.css` for this example to work.

File structure for this minimal example

```
- dist
  - <BASE32>-onfido.min.js
  - <BASE32>-style.css
- dockerfile
- nginx.conf
- index.html
```

dockerfile

```
FROM nginx:1.15.8-alpine

COPY ./nginx.conf /etc/nginx/conf.d/default.conf

COPY ./index.html /usr/share/nginx/html/

COPY ./dist /usr/share/nginx/sdk/
```

nginx.conf

```nginx
server {
  # Change the next 2 lines as needed
  listen       80;
  server_name  localhost;

  location ~ ^/[0-9a-zA-Z]+$ {
    root   /usr/share/nginx/html;
    try_files $uri /index.html =404;
  }

  location ~* \.(js|jpg|png|css)$ {
    root /usr/share/nginx/sdk/;
  }
}
```

index.html

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta
      charset="utf-8"
      name="viewport"
      content="width=device-width, initial-scale=1"
    />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="format-detection" content="telephone=no" />
    <title>Onfido Verification</title>
    <style type="text/css">
      html,
      body {
        height: 100%;
        margin: 0;
      }
      body,
      button {
        -webkit-font-smoothing: antialiased;
      }
      @media (min-width: 30em) {
        #onfido-mount {
          position: relative;
          top: 10%;
        }
        .onfido-sdk-ui-Modal-inner {
          font-family: 'Open Sans', sans-serif !important;
        }
      }
    </style>
    <script type="text/javascript">
      var version = window.location.pathname.substring(1, 3)
      var jsPath = version + '-onfido.min.js'
      var cssPath = version + '-style.css'

      var link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = cssPath

      var script = document.createElement('script')
      script.onload = function () {
        window.onfidoOut = Onfido.init({ mobileFlow: true })
      }
      script.src = jsPath

      document.head.appendChild(link)
      document.head.appendChild(script)
    </script>
  </head>

  <body>
    <div id="onfido-mount"></div>
  </body>
</html>
```

## Going live

Once you are happy with your integration and are ready to go live, please contact [client-support@onfido.com](mailto:client-support@onfido.com) to obtain live version of the API token. We will have to replace the sandbox token in your code with the live token.

A few things to check before you go live:

- Make sure you have set up webhooks to receive live events
- Make sure you have entered correct billing details inside your [Onfido Dashboard](https://onfido.com/dashboard/)

## Accessibility

The Onfido SDK has been optimised to provide the following accessibility support by default:

- Screen reader support: accessible labels for textual and non-textual elements available to aid screen reader navigation, including dynamic alerts
- Keyboard navigation: all interactive elements are reachable using a keyboard
- Sufficient color contrast: default colors have been tested to meet the recommended level of contrast
- Sufficient touch target size: all interactive elements have been designed to meet the recommended touch target size

Refer to our [accessibility statement](https://developers.onfido.com/guide/sdk-accessibility-statement) for more details.

### Note

If you are making your own UI customizations, you are responsible for ensuring that the UI changes will still adhere to accessibility standards for such things like accessible color contrast ratios and dyslexic friendly fonts.

## TypeScript

From version `6.5.0`, TypeScript is officially supported, providing typings for:

- `init()` method.
- `options` argument (`SdkOptions`) and return object (`SdkHandle`) of `init()` method.
- Arguments (`SdkResponse` and `SdkError`) for `onComplete()` and `onError()` callbacks.
- `steps` option (`StepTypes` and `StepConfig`).
- `language` option (`SupportedLanguages` and `LocaleConfig`).
- `region` option (`ServerRegions`).

## More information

### Browser compatibility

| ![Chrome](https://raw.githubusercontent.com/alrra/browser-logos/master/src/chrome/chrome_48x48.png) | ![Firefox](https://raw.githubusercontent.com/alrra/browser-logos/master/src/firefox/firefox_48x48.png) | ![IE](https://raw.githubusercontent.com/alrra/browser-logos/master/src/archive/internet-explorer_9-11/internet-explorer_9-11_48x48.png) | ![Edge](https://raw.githubusercontent.com/alrra/browser-logos/master/src/edge/edge_48x48.png) | ![Safari](https://raw.githubusercontent.com/alrra/browser-logos/master/src/safari/safari_48x48.png) |
| --------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- |
| Latest ✔                                                                                            | Latest \* ✔                                                                                            | 11 ✔                                                                                                                                    | Latest ✔                                                                                      | Latest ✔                                                                                            |

\* _Firefox on Android, iOS not supported_

### Troubleshooting

#### Content Security Policy issues

In order to mitigate potential cross-site scripting issues, most modern browsers use Content Security Policy (CSP). These policies might prevent the SDK from correctly displaying the images captured during the flow or to correctly load styles. If CSP is blocking some of the SDK functionalities, make sure you add the following snippet inside the `<head>` tag of your application.

```html
<meta
  http-equiv="Content-Security-Policy"
  content="
  default-src 'self' https://assets.onfido.com;
  script-src 'self' https://www.woopra.com https://assets.onfido.com https://sentry.io;
  style-src 'self' https://assets.onfido.com;
  connect-src blob: *.onfido.com wss://*.onfido.com https://www.woopra.com https://sentry.io;
  img-src 'self' data: blob: https://lipis.github.io/flag-icon-css/;
  media-src blob:;
  object-src 'self' blob:;
  frame-src 'self' data: blob:;
"
/>
```

#### SDK navigation issues

In rare cases, the SDK back button might not work as expected within the application history. This is due to the interaction of `history/createBrowserHistory` with the browser history API.
If you notice that by clicking on the SDK back button, you get redirected to the page that preceeded the SDK initialisation, you might want to consider using the following configuration option when initialising the SDK: `useMemoryHistory: true`. This option allows the SDK to use the `history/createMemoryHistory` function, instead of the default `history/createBrowserHistory`. This option is intended as workaround, while a more permanent fix is implemented.

Example:

```javascript
Onfido.init({
  useMemoryHistory: true,
})
```

### Support

Please open an issue through [GitHub](https://github.com/onfido/onfido-sdk-ui/issues). Please be as detailed as you can. Remember **not** to submit your token in the issue. Also check the closed issues to check whether it has been previously raised and answered.

If you have any issues that contain sensitive information please send us an email with the ISSUE: at the start of the subject to [web-sdk@onfido.com](mailto:web-sdk@onfido.com).

Previous version of the SDK will be supported for a month after a new major version release. Note that when the support period has expired for an SDK version, no bug fixes will be provided, but the SDK will keep functioning (until further notice).

## How is the Onfido SDK licensed?

Please see [LICENSE](https://github.com/onfido/onfido-sdk-ui/blob/master/LICENSE) for licensing details.
