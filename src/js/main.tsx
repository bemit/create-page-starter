import React from 'react'
import { hydrate, render } from 'react-dom'
import { loadableReady } from '@loadable/component'

function App(): React.ReactElement {
    return <div className={'container container-medium container-fixed px2'}>
        <p className={'mt0 mb1'}>Hello from React!</p>
    </div>
}

// into this html node
const rootElement = document.getElementById('root-pwa')
if(rootElement?.hasChildNodes()) {
    loadableReady(() => {
        hydrate(<App/>, rootElement)
    }).then().catch()
} else {
    render(<App/>, rootElement)
}
