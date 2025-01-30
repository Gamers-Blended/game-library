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

## Postgres Database

- Included with Supabase
- Able to define own complex data types
- Not vendor-locked
- Open source
- Row-level security

## Problems

| Issues Faced                                                                                                  | Solutions                                               |
| ------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------- |
| Figuring out how to rotate the edge of a mesh instead of its origin                                           | Shift origin point to be at the edge                    |
| Learning how glfx works (coverting a .glb file into separate mesh components)                                 | Refer to glfx documentation                             |
| Unable to use mouse scroll for zooming in/out while maintaining button active condition when limit is reached | Remove mouse scroll function and use arrow keys instead |

| Unable to map a .jpg file to a circular geometry exported from a .glb file <br>
Unable to save material into exported .glb file inside Blender <br>
Using a plane geometry and converting it into a circular plane, export it to glfx <br>
Using `discFrontImage.wrapS = discFrontImage.wrapT = THREE.ClampToEdgeWrapping` <br>
Passing an array of jpgs to `material` parameter in `geometry` <br>
Adding a `side="THREE.FrontSide / THREE.BackSide"` to material components <br>
Using `attach = "material-n"` inside `geometry` component (works in normal threejs geometries, but not those from bvh) <br>
Difficulty in finding a suitable library to subtract geometries (`ThreeBSP`, `three-js-csg`, `THREE-CSGMESH`) | Use subtraction method from `three-bvh-csg` |
| Unable to map each face of CylinderGeometry created from `three-bvh-csg` | Use 3 different CylinderGeometries with their own textures |
| Unable to persist y-positions of each Manual Page upon a page flip | Place Page Component outside main Model() function |
| The number of pages a manual will not tally with the last page number in the UI (e.g. manual has page 1-4, UI will only have 3 states [pg1, pg2-pg3, pg4]) | Using (number of pages/2 + 1) to get the number of states the UI will have for a manual |
| Selected value in Dropdown box in MetaDataHandler does not persist upon selection (only persists when same option selected twice) | Use the value prop of Select to get the current selected option based on the value from Valtio state |
| Rendered more hooks than during the previous render | Call Hooks at the top level of the component |
| Selection in metadata handler takes awhile to update state | Use `Object.assign()` |
| How to keep current selections from disappearing | |
| How to display current state selection when view isn't clicked | |
| Calls to Supabase are async, need to wait for images to be ready before rendering the mesh objects using them as textures | Refactor as separate Component |
| Manual page will rotate anti-clockwise instead | Replace `useFrame()` with `useSpring` |
