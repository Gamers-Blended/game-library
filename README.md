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

## Technical Design

TODO

## Dev Notes

Multi cursor editing <br>
Highlight word. <br>
Ctrl + D <br>
Shortcut to import libraries Ctrl + Space

`-Math.PI / 2` = 90 degrees in radians

## Problems

- Figuring out how to rotate the edge of a mesh instead of its origin
- Learning how glfx works (coverting a .glb file into separate mesh components)
- How to darken background whenever a div appears
- Unable to use mouse scroll for zooming in/out while maintaining button active condition when limit is reached
- Unable to map a .jpg file to a circular geometry exported from a .glb file
- Unable to map each face of CylinderGeometry created from `three-bvh-csg`
- Unable to persist y-positions of each Manual Page upon a page flip (unresolved)
- The number of pages a manual will not tally with the last page number in the UI (e.g. manual has page 1-4, UI will only have 3 states [pg1, pg2-pg3, pg4])
- Selected value in Dropdown box in MetaDataHandler does not persist upon selection (only persists when same option selected twice)
- Rendered more hooks than during the previous render.

## Tried

- Using a plane geometry and converting it into a circular plane, export it to glfx
- Using `discFrontImage.wrapS = discFrontImage.wrapT = THREE.ClampToEdgeWrapping`
- Unable to save material into exported .glb file inside Blender
- Difficulty in finding a suitable library to subtract geometries (`ThreeBSP`, `three-js-csg`, `THREE-CSGMESH`)
- Passing an array of jpgs to `material` parameter in `geometry`
- Using `attach = "material-n"` inside `geometry` component (works in normal threejs geometries, but not those from bvh)
- Adding a `side="THREE.FrontSide / THREE.BackSide"` to material components
- Using (number of pages/2 + 1) to get the number of states the UI will have for a manual
- Use the value prop of Select to get the current selected option based on the value from Valtio state
- According to the Rules of Hooks, Hooks must be called at the top level of a React function component or a custom Hook. They cannot be called inside loops, conditions, or nested functions, including inside useEffect, useMemo, or other Hooks.
