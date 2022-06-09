import {getPageInfo, getPagesIndex} from 'create-amp-page'
import {renderMd} from './mdRender.js'

const isDev = process.env.NODE_ENV === 'development'

const pageIndexCache = {}
const getCachedPageIndex = (urls, pageEnv) => {
    if(pageIndexCache[pageEnv]) return pageIndexCache[pageEnv]
    const pagesIndexEnv = getPagesIndex(urls, pageEnv)
    pageIndexCache[pageEnv] = pagesIndexEnv
    return pagesIndexEnv
}

export default function fmMap(port, urls, pages, data, file) {
    const pageId = file.pageId
    const pageEnv = isDev ? 'local' : 'prod'
    const {
        pagePath, pageBase, relPath,
    } = getPageInfo(file, urls, pageId, pageEnv)
    const pagesIndex = getCachedPageIndex(urls, pageEnv)
    const pageData = pages[pageId]
    const {title, description, lang, keywords} = data.attributes
    return {
        pageId: pageId,
        styleSheets: [
            pageData.paths.stylesInject,
        ],
        head: {title, description, lang, keywords},
        timeContext: {
            year: new Date().getFullYear(),
        },
        links: {
            canonical: pageBase + pagePath,
            origin: pageBase,
            cdn: isDev ? 'http://localhost:' + port + '/' : pageBase,
            pages: pagesIndex,
        },
        request: {
            path: pagePath,
            relPath,
        },
        hero_image: data.attributes.hero_image,
        content: renderMd(data.body),
        //doc: {},
    }
}
