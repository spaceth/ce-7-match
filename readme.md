# CE-7 MATCH

The landing page for CE-7 MATCH, Thailand’s particle detector on the Chang’e-7 lunar orbiter.

https://match.spaceth.co

## How this site is made

The page is one scrolling story in eight chapters. Each chapter is a section of a React app. The words on the page come from a single English catalog, so a chapter can be rewritten without editing the view that draws it.

Chapters 1 and 5 show the flight instrument as a 3D model. That model is the CAD file supplied for the project, exported as `model.glb` and loaded in the browser. Chapter 3 draws the Chang’e-7 spacecraft from simple shapes, separate from that CAD file. The layers drawn inside the detector are a diagram along the instrument’s axis. They explain the measurement. They are not extra parts from the CAD file.

To work on the site locally:

```bash
npm install
npm run dev
```

`npm run build` typechecks the project and writes the static site. `npm run preview` serves that build.

## Tech stack

- [Vite](https://vite.dev) builds the site.
- [React 19](https://react.dev) renders the page.
- [TypeScript](https://www.typescriptlang.org) checks the source.
- [Three.js](https://threejs.org), with [React Three Fiber](https://r3f.docs.pmnd.rs) and [Drei](https://github.com/pmndrs/drei), draws the instrument, the orbit, and the spacecraft.
- [Poppins](https://fontsource.org/fonts/poppins), through Fontsource, is the typeface.

## Data

Visitor-facing copy, including the page title and description, lives in `src/content/en.ts`. Views read it through `src/content/index.ts`. To add a language, duplicate `en.ts`, keep the same keys, and switch the export in `index.ts`.

Engineering figures used in Chapter 6 live in `src/lib/engineering.ts`. Detector measurements taken from the CAD file live in `src/lib/instrument.ts`. The hardware model itself is `model.glb` at the root of the repository.

## Credits

The 3D model is from the NARIT Engineering Team. Thank you for the CAD file.

Thank you to Prof. David Ruffolo for the information.

Website by Nattanon Dungsunenarn. Science data by Jirasin Aswakool.
