# game-library

## Installation

`npm create vite@latest`

Framework: React <br>
Variant: JavaScript

`cd game-library`

Install all 3rd party dependencies: <br>
`npm install`

Additional dependencies to install: <br>

<pre>
npm i three @react-three/fiber
npm i three @react-three/drei
npm i -D sass-embedded
</pre>

`node_modules` folder <br>
Contains all installed 3rd-party dependencies. <br>
When Vite builds application, it sees imports for 'three' and pulls three.js files automatically from this folder. <br>
This folder is used only during development, and shouldn't be uploaded to web hosting provider or committed.

`public` folder <br>
Contains public assets like images.

`index.html` <br>
div with id = root. <br>
Container for application.

`script` tag <br>
Entry point for application.

`package.json` <br>
Information on which versions of each dependency installed in project. <br>
Install the original versions of each dependency by running `npm install`.

`devDependencies` <br>
Libraries used only in development, won't be deployed in application.

## Creating JSX Components

To convert a gltf/glb file to jsx component:
`npx gltfjsx <path/to/gltf or glb file>`

Generated file will be placed in main directory.

Example: <br>
model named `case.glb` inside public: <br>
`npx gltfjsx public/models/case.glb`

## Development

Runs web server: <br>
`npm run dev`

Visit [http://localhost:5173/](http://localhost:5173/)

## Production

Tell Vite to run a production build: <br>
`npx vite build`

When code is ready for production, run: <br>
`npm run build`

Everything used by the application will be compiled, optimized, and copied into the `dist/` folder. <br>
The contents of that folder are ready to be hosted on your website.

To run production build: <br>
`npm run preview`

Visit [http://localhost:4173/](http://localhost:4173/)

## Dev Notes

Multi cursor editing <br>
Highlight word. <br>
Ctrl + D

`-Math.PI / 2` = 90 degrees in radians
