import { isAllowed, isDenied, PrivacyConfig, privacyModule, setNoTrack } from './privacyModule'

window.dataLayer = window.dataLayer || []

window.gtag = function() {
    if(process.env.NODE_ENV === 'development') {
        // eslint-disable-next-line prefer-rest-params
        console.log('gtag debug', arguments)
    }
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments)
}

if(process.env.NODE_ENV === 'development') {
    if(!process.env.WEB_APP_FBQ_ID) {
        console.log('MISSING env `WEB_APP_FBQ_ID` var for tracking')
    }
    if(!process.env.WEB_APP_GTAG_ID) {
        console.log('MISSING env `WEB_APP_GTAG_ID` var for tracking')
    }
}

const config: PrivacyConfig = {
    googleTracking: process.env.WEB_APP_GTAG_ID,
    fbqId: process.env.WEB_APP_FBQ_ID,
    googleAdditional: (page_path: string) => {
        if(process.env.NODE_ENV === 'development') {
            return
        }
        if(process.env.WEB_APP_GTAG_AW) {
            // adwords traffic conversion
            window.gtag('config', process.env.WEB_APP_GTAG_AW, {
                'anonymize_ip': true,
                'transport_type': 'beacon',
                'page_path': page_path,
            })
        }
        // todo: only call after conversion
        //window.gtag('event', 'conversion', {'send_to': process.env.WEB_APP_GTAG_AW_CONV})
    },
}

if(process.env.NODE_ENV === 'development') {
    console.log((isAllowed() ? 'using' : isDenied() ? 'not using' : 'maybe using') + ' analytics test target', config)
    console.log('noTrack', window.localStorage.getItem('noTrack'))
}

if(window.location.search.substring(1).split('&').indexOf('noTrack=1') !== -1) {
    // turn off tracking anywhere with `?noTrack=1`
    setNoTrack()
}

privacyModule(config)
