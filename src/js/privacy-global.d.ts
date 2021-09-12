export type gtagConfig = (command: 'config', target: string, additional?: { [k: string]: any }) => void
export type gtagInit = (command: 'js', config: Date) => void
export type gtagSend = (command: 'send', action: string) => void
export type gtagEvent = (command: 'event', action: string, payload: any) => void
export type sendPageView = (page_path: string) => void

declare global {
    interface Window {
        dataLayer: any[]
        acceptPrivacy?: () => void
        denyPrivacy?: () => void
        gtag: gtagConfig & gtagInit & gtagSend & gtagEvent
        sendPageView?: sendPageView
        fbq?: (action: string, value: string | number) => void
    }
}

export const dataLayer = window.dataLayer
