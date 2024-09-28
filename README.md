# game-library

## Installation

`npm create vite@latest`

Framework: React
Variant: JavaScript

`cd game-library`

Install all 3rd party dependencies:
`npm install`

Additional dependencies to install:
`npm i three @react-three/fiber`
`npm i three @react-three/drei`
`npm i -D sass-embedded`

`node_modules` folder
Contains all installed 3rd-party dependencies.
When Vite builds application, it sees imports for 'three' and pulls three.js files automatically from this folder.
This folder is used only during development, and shouldn't be uploaded to web hosting provider or committed.

`public` folder
Contains public assets like images.

`index.html`
div with id = root.
Container for application.

`script` tag
Entry point for application.

`package.json`
Information on which versions of each dependency installed in project.
Install the original versions of each dependency by running `npm install`.

`devDependencies`
Libraries used only in development, won't be deployed in application.

## Creating JSX Components

To convert a gltf/glb file to jsx component:
`npx gltfjsx <path/to/gltf or glb file>`

Generated file will be placed in main directory.

Example:
model named `case.glb` inside public
`npx gltfjsx public/models/case.glb`

## Development

Runs web server:
`npm run dev`

Visit [http://localhost:5173/](http://localhost:5173/)

## Production

Tell Vite to run a production build:
`npx vite build`

When code is ready for production, run:
`npm run build`

Everything used by the application will be compiled, optimized, and copied into the `dist/` folder.
The contents of that folder are ready to be hosted on your website.

To run production build:
`npm run preview`

Visit [http://localhost:4173/](http://localhost:4173/)

## Dev Notes

Multi cursor editing
Highlight word.
Ctrl + D

A component cannot return more than 1 element.
