import path from 'path'
import fs from 'fs'

export default [
    {
        name: 'getAsset',
        func: (name) => {
            try {
                const toLoadInfoFile = path.resolve('src', 'toLoadInfo.json')
                if(fs.existsSync(toLoadInfoFile)) {
                    const toLoadInfo = JSON.parse(fs.readFileSync(toLoadInfoFile).toString())
                    // todo: warn/fail when not found?
                    return toLoadInfo[name] || []
                }
            } catch(e) {
                if(process.env.NODE_ENV !== 'production') {
                    console.warn('getAsset', e)
                } else {
                    console.error('getAsset', e)
                    throw e
                }
            }
            return []
        },
    },
    {
        name: 'getFullLink',
        func: (origin, target) => {
            return origin + target
        },
    },
]
