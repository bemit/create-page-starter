'use strict'
import dotenv from 'dotenv'
import path from 'path'
// todo: use exported gulp from create-amp-page when reexported (again)
import gulp from 'gulp'
import {ampCreator} from 'create-amp-page'
import {merge} from 'webpack-merge'
import webpackTask from './Gulpfile.esnext.js'
import markdownit from 'markdown-it'
import {adjustHeadingLevel} from './markdown-it-headline-adjust.js'
import markdownFootnote from 'markdown-it-footnote'
import markdownAbbr from 'markdown-it-abbr'
import markdownAnchor from 'markdown-it-anchor'
import markdownToc from 'markdown-it-toc-done-right'
import markdownDeflist from 'markdown-it-deflist'
import markdownIns from 'markdown-it-ins'
import markdownMark from 'markdown-it-mark'

const result = dotenv.config()
if(result.error) {
    throw result.error
}

const liveUrl = 'https://create-page.netlify.app/'

const makePathFromFile = file => path.basename(file).replace('.twig', '')
const port = process.env.PORT || 4489
const isDev = process.env.NODE_ENV === 'development'

// for infos check `create-amp-page` docs or typings/inline-doc!
const tasks = ampCreator({
    port: port,
    paths: {
        styles: 'src/styles',
        stylesInject: 'main.css',
        html: 'src/html',
        htmlPages: 'src/html/pages',
        media: 'src/media',
        copy: [
            {src: ['src/api/*'], prefix: 1},
            {src: ['public/*'], prefix: 2},
            {src: ['src/email/*'], prefix: 1},
            {src: ['public/**/*'], prefix: 1},
            {src: ['src/js/sw.js'], prefix: 2},
        ],
        dist: 'build',
        distMedia: 'media',
        distStyles: 'styles',
    },
    ampOptimize: false,
    minifyHtml: !isDev,
    //cleanInlineCSS: process.env.NO_OPTIMIZE === 'bigfiles' ? false : process.env.NODE_ENV === 'production',
    cleanInlineCSS: false,
    cleanInlineCSSWhitelist: [
        // headline anchors
        '#anc-*',
        // footnotes
        '#fn*',
    ],
    collections: [{
        data: 'src/data/blog/*.md',
        tpl: 'src/html/blog.twig',
        base: 'blog/',
    }],
    twig: {
        data: {
            ampEnabled: false,
            injectNetlifyIdentity: false,
            serviceWorker: {
                load: !isDev,
                // activated logging on success and error
                loadDebug: isDev,
                // activates logging only on error:
                //loadDebugError: true,
            },
            includePrivacyConsent: true,
            links: {
                privacy: 'privacy',
                impress: 'impress',
            },
        },
        json: (file) => 'src/data/' + makePathFromFile(file) + '.json',
        fm: (file) => 'src/data/' + makePathFromFile(file) + '.md',
        fmMap: (data, file) => ({
            head: {
                title: data.attributes.title,
                description: data.attributes.description,
                lang: data.attributes.lang,
            },
            links: {
                canonical: makePathFromFile(file.path) === 'index' ? liveUrl : liveUrl + makePathFromFile(file.path),
                origin: isDev ? 'http://localhost:' + port + '/' : liveUrl,
            },
            hero_image: data.attributes.hero_image,
            content: renderMd(data.body),
        }),
        customMerge: merge,
        logicLoader: async () => {
            const buster = new Date().getTime()
            const functions = await import('./twigLogic/functions.js?buster=' + buster).then(m => m.default)
            return {
                functions,
            }
        },
        functions: [],
    },
    watchFolders: {
        twig: ['src/data/**/*.json', 'src/data/**/*.md', 'twigLogic/**/*.js'],
        sass: [],
        media: [],
    },
    prettyUrlExtensions: ['html'],
}, undefined, (gulp, tasks, options, internals) => {

    // todo: solve multiple entrypoints, this seems to be not supported by `webpack-stream`
    //       there can be used something like `parallel(webpackSrc.map(src => webpackTask(webpackSrc, options.paths.dist, false))`
    //       this will build multiple entrypoints into separate files, but can NOT share chunks between them automatically!

    const webpackSrc = [
        'src/js/main.tsx',
        'src/js/privacy.ts',
        //'src/js/sw.js',
    ]

    const webpack = watch => webpackSrc.map(
        src => webpackTask(src, options.paths.dist, internals.browsersync, watch),
    )

    return {
        ...tasks,
        build: gulp.series(tasks.clean, ...webpack(false), tasks.builder),
        watch: gulp.series(
            // run webpack first without watching, so ampTasks may already use compiled JS when needed
            ...webpack(false),
            gulp.parallel(...webpack(true), tasks.watcher, internals.browserSyncSetup),
        ),
    }
})
Object.keys(tasks).forEach(taskName => gulp.task(taskName, tasks[taskName]))

const slugify = s => 'anc-' + encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-').replace(/&/g, ''))
const md = markdownit({
    // html: true,
    xhtmlOut: true,
    linkify: true,
    typographer: true,
})
    .use(adjustHeadingLevel, {firstLevel: 2})
    .use(markdownFootnote)
    .use(markdownAbbr)
    .use(markdownAnchor, {
        permalink: true, permalinkBefore: true, permalinkSymbol: '#',
        level: 3,
        slugify,
    })
    .use(markdownToc, {
        slugify,
        level: 3,
    })
    .use(markdownDeflist)
    .use(markdownIns)
    .use(markdownMark)


const defaultLinkRenderer = md.renderer.rules.link_open || function(tokens, idx, options, env, self) {
    return self.renderToken(tokens, idx, options)
}
md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
    const hrefRaw = tokens[idx].attrs && tokens[idx].attrs.reduce((v, prev) => prev || v[0] === 'href')
    const href = hrefRaw ? hrefRaw[1] : ''
    if(
        href.indexOf('http://') === 0 ||
        href.indexOf('https://') === 0 ||
        href.indexOf('ftp://') === 0 ||
        href.indexOf('ftps://') === 0
    ) {
        // add target blank and security attrs to any external/full url
        tokens[idx].attrPush(['target', '_blank'])
        tokens[idx].attrPush(['rel', 'noreferrer noopener'])
    }

    return defaultLinkRenderer(tokens, idx, options, env, self)
}

// plugin for advanced use cases:
// https://github.com/markdown-it/markdown-it-container

const renderMd = (text) => {
    return md.render(text)
}
const renderInlineMd = (text) => {
    return md.renderInline(text)
}
