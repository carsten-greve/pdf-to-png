# PDF to PNG Converter

Allow PDF files to be converted in local browser to PNG image files.

The default PDF background color can be changed.

The PNG can be saved at any scaled resolution, up to the allowed canvas size of the local device/browser.

## Building it locally

`npm install` to install dependencies.

`npm run build` to build.

`npm run dev` sets up a local development server.

## Testing

Use any PDF file or these:

- helloworld.pdf
- PageSizes_output.pdf

## Notes

`react-pdf` and `pdfjs-dist` must use matching `pdfjs` versions, so they are fixed in `package.json`.
