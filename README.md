# Create Page Starter ⚛️

[![Netlify Status](https://api.netlify.com/api/v1/badges/81882d4d-14be-4ff8-b30c-e7a4426eb744/deploy-status)](https://app.netlify.com/sites/create-page-starter/deploys)
[![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square)](http://makeapullrequest.com)

Starting point for static pages generated with [create-amp-page](https://github.com/bemit/create-amp-page) and using [@formanta/sass](https://formanta.bemit.codes) for styling - but **for PWA enhanced web pages** and **not** AMP. Directly deploy with [netlify cms](https://www.netlifycms.org/) as git managed static site generator!

[![Deploy to Netlify](https://img.shields.io/badge/Deploy%20to%20netlify-success?style=for-the-badge&logo=netlify&labelColor=0e1e25&color=00C7B7)](https://app.netlify.com/start/deploy?repository=https://github.com/bemit/create-page-starter) [![Run on CodeSandbox](https://img.shields.io/badge/run%20on%20CodeSandbox-blue?labelColor=fff&logoColor=505050&style=for-the-badge&logo=codesandbox)](https://codesandbox.io/s/github/bemit/create-page-starter)

    npm i
    npm start

    # or
    npm run build

    npm run tasks
    npm run clean

    npm run test
    # test driven UI development (with cypress):
    npm run tdd-ui
    # test driven JS development (with jest):
    npm run tdd-js

Open [localhost:4489/defaultPage](http://localhost:4489/defaultPage) for your local page preview and change something in `src/*`!

[![Features](https://img.shields.io/badge/Features-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#features)

[![File Structure](https://img.shields.io/badge/File%20Structure-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#default-file-structure)

[![Netlify CMS](https://img.shields.io/badge/Netlify%20CMS-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#netlify-cms)

[![Component Library](https://img.shields.io/badge/Component%20Library-blue?labelColor=333&color=f4f4f4&style=for-the-badge&logo=vercel&logoColor=333)](#amp-component-library)

[![License](https://img.shields.io/badge/License-blue?labelColor=333&style=for-the-badge&logo=vercel&logoColor=333&color=f4f4f4)](#license)

## Features

Provides a basic file structure and uses the gulp build tasks of [create-amp-page](https://github.com/bemit/create-amp-page), with additionally: markdown and netlify cms.

Has the same basic features as create-amp-page, [check the list there](https://github.com/bemit/create-amp-page-starter#features).

Additionally, this starter has babel and webpack configured for Typescript and React.

**Universal Twig functions**, used within templates, are included in `create-amp-page`, check out the [function docs](https://github.com/bemit/create-amp-page#twig-functions)

## Default File Structure

- `.env` for configuration of env vars
    - need to be prefixed with either `REACT_APP_` or `WEB_APP_` to be available in javascript
- `build` dist folder after running `npm run build` or while `npm run start`
    - each page will be saved in a folder, standard: `build/defaultPage`
    - media files are saved in `build/media`
- `public` with general files in root like `manifest.json`
- `public/admin` config and setup files for netlify cms
- `src/api` may be used as mock api
- `src/data` contains the page frontmatter and data
- `src/html` is the base for all twig templates
- `src/html/pages` will be build to individual HTML pages
- `src/media` may contain images
- `src/styles/main.scss` is the style sheet
- `twigLogic/*` extra twig functions, reloaded on every build

## Files to Adjust

- `Gulpfile.js` needs e.g. domain of production environment and a bit of other stuff
- `.env` just needs to exist, take a look at [.env.example](.env.example) for available env vars
- `public/` needs all icons, like favicon etc.
- `public/manifest.json` needs some proper namings and colors
- `public/offline.html` needs some proper namings and email address
- `src/js/sw.js` maybe needs a new cache key and "pages to cache" configuration

## Netlify CMS

Uses the same setup as create-amp-page, [check the Netlify CMS docs there](https://github.com/bemit/create-amp-page-starter#netlify-cms).

### Twig Embed Image

Displays an `img` or `amp-img` tag using `ampEnabled`, `layout` defaults to 'responsive'. Set's width and height using `getImage` fn, adds sha1 cachebuster.

> todo: srcset and image resizing support

```twig
{% embed 'blocks/image.twig' with {
    src: '/media/img-01.png',
    alt: 'A blog hero image',
    classes: 'mb2',
    layout: 'responsive',
} %}
{% endembed %}
```

### React Static

Render your React directly at the build process, clean and rich HTML for SEO and client side speedup!

> very very alpha: it works, but features need optimizing / coworking-with-twig, like: resizing used images
>
> template structure must be adjusted before using snap, as every dynamic thing must be rendered with react and not through twig
> or react-snap uses a different twig template for each page (seems to be hard)

Uses [react-snap](https://github.com/stereobooster/react-snap) for "server side react rendering" and fixing [react-snap#493](https://github.com/stereobooster/react-snap/issues/493) through the custom `/copy.js`, adding the HTML cleaning and optimizing tasks again.

First install `react-snap`: `npm i --save react-snap`

Commands:

    # use `snap-build` now instead of `build`
    npm run snap-build

## License

This project is free software distributed under the **MIT License**.

See: [LICENSE](LICENSE).

### Contributors

By committing your code/creating a pull request to this repository you agree to release the code under the MIT License attached to the repository.

## Copyright

2022 | [Michael Becker](https://mlbr.xyz), [bemit UG (haftungsbeschränkt)](https://bemit.codes)

