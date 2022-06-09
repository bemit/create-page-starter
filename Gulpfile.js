import dotenv from 'dotenv'
import path from 'path'
import {ampCreator, gulp} from 'create-amp-page'
import {merge} from 'webpack-merge'
import webpackTask from './Gulpfile.esnext.js'

const result = dotenv.config()
if(result.error) {
    throw result.error
}

const makePathFromFile = file => path.basename(file).replace('.twig', '').replace('.md', '')
const port = process.env.PORT || 4489
const isDev = process.env.NODE_ENV === 'development'

const urls = {
    defaultPage: {
        local: {base: 'http://localhost:' + port + '/defaultPage/'},
        prod: {base: 'https://create-page-starter.netlify.app/'},
    },
}

const pages = {
    defaultPage: {
        paths: {
            styles: 'src/styles',
            stylesInject: 'main.css',
            style: 'main.scss',
            html: 'src/html',
            copy: [
                {src: ['src/api/*'], prefix: 1},
                {src: ['public/*'], prefix: 2},
                {src: ['src/email/*'], prefix: 1},
                {src: ['public/**/*'], prefix: 1},
                {src: ['src/js/sw.js'], prefix: 2},
            ],
            dist: 'build/defaultPage',
            distStyles: 'styles',
        },
    },
}

// for infos check `create-amp-page` docs or typings/inline-doc!
const tasks = ampCreator({
    port: port,
    open: '/defaultPage',
    dist: 'build',
    srcMedia: 'src/media',
    distMedia: 'media',
    minifyHtml: !isDev,
    cleanInlineCSS: !isDev,
    cleanInlineCSSWhitelist: [
        // headline anchors
        '#anc-*',
        // footnotes
        '#fn*',
        // the react mount point
        '#root-pwa',
    ],
    pages: pages,
    collections: [{
        fm: (file) => 'src/data/' + makePathFromFile(file) + '.md',
        tpl: 'src/html/pages/*.twig',
        base: '',
        pageId: 'defaultPage',
    }, {
        fm: 'src/data/blog/*.md',
        tpl: 'src/html/blog.twig',
        base: '',
        pageId: 'defaultPage',
    }],
    cssInjectTag: '<style>',
    data: {
        cssInject: !isDev,
        injectNetlifyIdentity: false,
        serviceWorker: {
            load: !isDev,
            // activated logging on success and error
            loadDebug: isDev,
            // activates logging only on error:
            //loadDebugError: true,
        },
    },
    fmMap: async (data, files) => await import('./logic/fmMap.js?buster=' + new Date().getTime()).then(m => m.default(port, urls, pages, data, files)),
    customMerge: merge,
    twig: {
        logicLoader: async () => {
            const functions = await import('./logic/functions.js?buster=' + new Date().getTime()).then(m => m.default)
            return {
                functions,
            }
        },
        functions: [],
    },
    watchFolders: {
        twig: ['src/data/**/*.json', 'src/data/**/*.md', 'logic/**/*.js'],
        sass: [],
        media: [],
    },
    prettyUrlExtensions: ['html'],
}, undefined, (gulp, tasks, options, internals) => {

    const webpackSrc = [
        'src/js/main.tsx',
        //'src/js/sw.js',
    ]

    const pageIds = Object.keys(options.pages)
    const webpack = watch => gulp.parallel(
        ...pageIds.map(pageId =>
            webpackTask(
                pageId,
                {srcDir: 'src/js', src: webpackSrc},
                {dist: options.pages[pageId].paths.dist},
                {browsersync: internals.browsersync, watch},
            ),
        ),
    )

    return {
        ...tasks,
        build: gulp.series(tasks.clean, webpack(false), tasks.builder),
        watch: gulp.series(
            // run webpack first without watching, so ampTasks may already use compiled JS when needed
            webpack(false),
            gulp.parallel(webpack(true), tasks.watcher, internals.browserSyncSetup),
        ),
    }
})
Object.keys(tasks).forEach(taskName => gulp.task(taskName, tasks[taskName]))
