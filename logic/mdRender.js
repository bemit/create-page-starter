import markdownit from 'markdown-it'
import {adjustHeadingLevel} from '../markdown-it-headline-adjust.js'
import markdownFootnote from 'markdown-it-footnote'
import markdownAbbr from 'markdown-it-abbr'
import markdownDeflist from 'markdown-it-deflist'
import markdownIns from 'markdown-it-ins'
import markdownMark from 'markdown-it-mark'
import markdownItAnchor from 'markdown-it-anchor'
import markdownItTocDoneRight from 'markdown-it-toc-done-right'

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
    .use(markdownItAnchor, {
        permalink: true, permalinkBefore: true, permalinkSymbol: '#',
        level: 3,
        slugify,
    })
    .use(markdownItTocDoneRight, {
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

export const renderMd = (text) => {
    return md.render(text)
}
export const renderInlineMd = (text) => {
    return md.renderInline(text)
}
