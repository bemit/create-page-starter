export interface PrivacyConfig {
    googleTracking?: string
    fbqId?: string
    googleAdditional?: (page_path: string) => void
}

const setupConfig = {
    wrapperId: 'overlay-privacy',
}

export const setConsentTrack = (): void => window.localStorage.setItem('noTrack', '0')
export const setNoTrack = (): void => window.localStorage.setItem('noTrack', '1')

export const isDenied = (): boolean => window.localStorage.getItem('noTrack') === '1'
export const isAllowed = (): boolean => window.localStorage.getItem('noTrack') === '0'

export function privacyModule(config: PrivacyConfig): void {
    if(isDenied()) {
        return
    }

    window.acceptPrivacy = () => {
        setConsentTrack()
        initPrivacy(config)
    }

    window.denyPrivacy = () => {
        setNoTrack()
        document.getElementById(setupConfig.wrapperId)?.remove()
    }

    if(isAllowed()) {
        initPrivacy(config)
    } else {
        const overlayPrivacy = document.getElementById(setupConfig.wrapperId) as HTMLDivElement
        if(overlayPrivacy) {
            overlayPrivacy.style.display = 'block'
        }
    }
}

const initGtag = (googleTracking: string, googleAdditional: PrivacyConfig['googleAdditional']) => {
    const tmpLayer = [...window.dataLayer]
    window.dataLayer = []

    const scriptGa = document.createElement('script')
    scriptGa.async = true
    scriptGa.src = 'https://www.googletagmanager.com/gtag/js?id=' + googleTracking
    scriptGa.onload = () => {
        window.gtag('js', new Date())
        window.sendPageView = function(page_path: string) {
            window.gtag('config', googleTracking, {
                'anonymize_ip': true,
                'transport_type': 'beacon',
                'page_path': page_path,
            })
            window.gtag('send', 'pageview')

            if(googleAdditional) {
                googleAdditional(page_path)
            }
        }
        window.sendPageView(window.location.pathname)

        tmpLayer.forEach(function(elem) {
            window.dataLayer.push(elem)
        })
    }
    document.body.append(scriptGa)
}

const initFbq = (fbqId: string) => {
    /** @formatter:off **/
    // @ts-ignore
    // eslint-disable-next-line prefer-rest-params,prefer-spread
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script','https://connect.facebook.net/en_US/fbevents.js')
    /** @formatter:on **/

    const fbpxInv = window.setInterval(function() {
        if(window.fbq) {
            window.clearInterval(fbpxInv)
            window.fbq('init', fbqId)
            window.fbq('track', 'PageView')
        }
    }, 30)
}

export function initPrivacy(config: PrivacyConfig): void {
    const {
        googleTracking, googleAdditional,
        fbqId,
    } = config

    googleTracking && initGtag(googleTracking, googleAdditional)
    fbqId && initFbq(fbqId)

    const overlayPrivacy = document.getElementById(setupConfig.wrapperId)
    if(overlayPrivacy) {
        overlayPrivacy.remove()
    }
}
