# PDF to PNG Converter

Allow PDF files to be converted in local browser to PNG image files.

The PDF default background color can be changed.

The PNG can be saved at any scaled resolution, up to the allowed canvas size of the local device/browser.

Try it here: [https://carsten-greve.github.io/pdf-to-png/](https://carsten-greve.github.io/pdf-to-png/)

## Building it locally

Uses [Vite](https://vite.dev/), [React](https://react.dev/) and [Tailwind CSS](https://tailwindcss.com/)

`npm install` to install dependencies.

`npm run build` to build.

`npm run dev` sets up a local development server.

## Testing

Use any PDF file or these:

- [helloworld.pdf](https://github.com/carsten-greve/pdf-to-png/raw/refs/heads/main/helloworld.pdf)
- [PageSizes_output.pdf](https://github.com/carsten-greve/pdf-to-png/raw/refs/heads/main/PageSizes_output.pdf)

## Notes

`react-pdf` and `pdfjs-dist` must use matching `pdfjs` versions, so they are fixed in `package.json`.
