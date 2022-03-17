import fs from 'fs'
import path from 'path'
import gulp from 'gulp'
import webpack from 'webpack'
import webpackStream from 'webpack-stream'
import isWsl from 'is-wsl'
import TerserPlugin from 'terser-webpack-plugin'
import named from 'vinyl-named-with-path'
import ESLintWebpackPlugin from 'eslint-webpack-plugin'
import {fileURLToPath} from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const safeEnvVars = ['NODE_ENV']

//
// Full webpack config for:
// - ESNext compiling configured by e.g. `babel.config.json`/`babel.config.js`
// - Asset importing like webfonts, css, scss, json, svg (SVG with components `import * as Icon form './Icon`
// - Importing css from node_modules as lazysingleton to be able to unmount them again!
// - Linting with `eslint` and when used `react` and `tsconfig`!
// - Typescript compilation and checks, simply use `file.ts` as entry instead of `file.js`
// - React compilation and code splitting, just install & register e.g. `react-component` preset/plugin
// - minimizing and bundling
// - when routing / loadables only `react-component` works when using `react-snap` for static site generation
//
//
// Files:
// - .eslintignore -> what linting should ignore
// - .eslintrc -> linting rules
// - babel.config.json -> babel presets and plugins
// - Gulpfile.esnext.js -> all webpack rules
// - Gulpfile.js -> import esnext rules and uses `wrap` on `ampCreator`
//                  here entry points are configured!
// - tsconfig.json -> Compiler settings for Typescript
// - src/js/main.js -> default source entrypoint
//

const isProd = process.env.NODE_ENV === 'production'

export default function webpackTask(pageId, srcDir, src, dist, browsersync, watch) {
    return function webpacker() {
        return gulp.src(src)
            .pipe(named())
            .pipe(webpackStream({
                watch,
                stats: {
                    preset: 'normal',
                    errorsCount: true,
                    warningsCount: true,
                    colors: true,
                },
                mode: isProd ? 'production' : 'development',
                output: {
                    filename: isProd ? 'js/[name].[fullhash:8].js' : 'js/[name].js',
                    chunkFilename: isProd ? 'js/[name].chunk.[chunkhash:8].js' : 'js/[name].chunk.js',
                    // filename: isProd ? 'js/' + name + '_[name].[fullhash:8].js' : 'js/' + name + '_[name].js',
                    // chunkFilename: isProd ? 'js/' + name + '_[name].chunk.[chunkhash:8].js' : 'js/' + name + '_[name].chunk.js',
                    // dist: dist,
                    //futureEmitAssets: true,
                },
                performance: {
                    hints: false,
                },
                resolve: {
                    extensions: ['.ts', '.tsx', '.js', '.jsx', '.json'],
                    modules: [
                        'node_modules',
                    ],
                },
                resolveLoader: {
                    modules: ['node_modules'],
                },
                module: {
                    rules: [{
                        test: /\.(js|jsx|ts|tsx)$/,
                        include: [
                            path.resolve(__dirname, srcDir),
                            //path.resolve(path.dirname(src)),
                            //path.join(context, 'src'),
                        ],
                        loader: 'babel-loader',
                        options: {
                            // This is a feature of `babel-loader` for webpack (not Babel itself).
                            // It enables caching results in ./node_modules/.cache/babel-loader/
                            // directory for faster rebuilds.
                            cacheDirectory: true,
                            // See #6846 for context on why cacheCompression is disabled
                            cacheCompression: false,
                            compact: isProd,
                        },
                    }, {
                        // Process any JS outside of the app with Babel.
                        // Unlike the application JS, we only compile the standard ES features.
                        test: /\.(js|mjs)$/,
                        exclude: [
                            /@babel(?:\/|\\{1,2})runtime/,
                            path.resolve(__dirname, srcDir),
                            //path.resolve(path.dirname(src)),
                            //path.join(context, 'src'),
                        ],
                        loader: 'babel-loader',
                        options: {
                            babelrc: false,
                            configFile: false,
                            compact: false,
                            presets: [
                                [
                                    //require.resolve('babel-preset-react-app/dependencies'),
                                    'babel-preset-react-app/dependencies',
                                    {helpers: true},
                                ],
                            ],
                            cacheDirectory: true,
                            cacheCompression: false,

                            // If an error happens in a package, it's possible to be
                            // because it was compiled. Thus, we don't want the browser
                            // debugger to show the original code. Instead, the code
                            // being evaluated would be much more helpful.
                            sourceMaps: false,
                        },
                    }, {
                        test: /\.html$/i,
                        // exclude: [/node_modules/],
                        use: [{
                            loader: 'ejs-loader',
                        }, {
                            loader: 'extract-loader',
                        }, {
                            loader: 'html-loader',
                            options: {
                                minimize: isProd,
                                interpolate: false,
                            },
                        }],
                    }, {
                        test: /\.css$/i,
                        exclude: [/node_modules/],
                        use: [
                            'style-loader',
                            'css-loader',
                        ],
                    }, {
                        test: /\.css$/i,
                        include: [/node_modules/],
                        use: [
                            {loader: 'style-loader', options: {injectType: 'lazySingletonStyleTag'}},
                            'css-loader',
                        ],
                    }, {
                        test: /\.s[ac]ss$/i,
                        exclude: [/node_modules/],
                        use: [
                            'style-loader',
                            'css-loader',
                            'sass-loader',
                        ],
                    }, {
                        // the following 3 rules handle font extraction
                        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: 'url-loader',
                        options: {
                            limit: 10000,
                            mimetype: 'application/font-woff',
                        },
                    }, {
                        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
                        loader: 'file-loader',
                    }, {
                        test: /\.otf(\?.*)?$/,
                        use: 'file-loader?name=/fonts/[name].[ext]&mimetype=application/font-otf',
                    }, {
                        loader: 'file-loader',
                        // Exclude `js` files to keep "css" loader working as it injects
                        // its runtime that would otherwise be processed through "file" loader.
                        // Also exclude `html` and `json` extensions so they get processed
                        // by webpacks internal loaders.
                        exclude: [/\.(js|css|s[ac]ss|mjs|jsx|ts|tsx)$/, /\.html$/, /\.json$/],
                        options: {
                            name: 'js/assets/[name].[fullhash:8].[ext]',
                        },
                    }],
                },
                optimization: {
                    runtimeChunk: false,
                    //splitChunks: false,
                    splitChunks: {
                        chunks: 'all',
                        name: false,
                        cacheGroups: {
                            default: false,
                            vendors: false,
                            react: {
                                test: /[\\/]node_modules[\\/](react|react-dom)[\\/]/,
                                name: 'vendor-react',
                            },
                            uiSchema: {
                                test: /[\\/]node_modules[\\/](@ui-schema)[\\/]/,
                                name: 'vendor-uis',
                            },
                            materialUi: {
                                test: /[\\/]node_modules[\\/](@material-ui)[\\/]/,
                                name: 'vendor-mui',
                            },
                            vendor: {
                                //chunks: 'all',
                                name: 'vendor',
                                test: /node_modules/,
                            },
                        },
                    },
                    minimize: isProd,
                    minimizer: [new TerserPlugin({
                        terserOptions: {
                            parse: {
                                // We want terser to parse ecma 8 code. However, we don't want it
                                // to apply any minification steps that turns valid ecma 5 code
                                // into invalid ecma 5 code. This is why the 'compress' and 'output'
                                // sections only apply transformations that are ecma 5 safe
                                // https://github.com/facebook/create-react-app/pull/4234
                                ecma: 8,
                            },
                            compress: {
                                ecma: 5,
                                warnings: false,
                                // Disabled because of an issue with Uglify breaking seemingly valid code:
                                // https://github.com/facebook/create-react-app/issues/2376
                                // Pending further investigation:
                                // https://github.com/mishoo/UglifyJS2/issues/2011
                                comparisons: false,
                                // Disabled because of an issue with Terser breaking valid code:
                                // https://github.com/facebook/create-react-app/issues/5250
                                // Pending further investigation:
                                // https://github.com/terser-js/terser/issues/120
                                inline: 2,
                            },
                            mangle: {
                                safari10: true,
                            },
                            // Added for profiling in devtools
                            keep_classnames: false,
                            keep_fnames: false,
                            /*keep_classnames: isEnvProductionProfile,
                            keep_fnames: isEnvProductionProfile,*/
                            output: {
                                ecma: 5,
                                comments: false,
                                // Turned on because emoji and regex is not minified properly using default
                                // https://github.com/facebook/create-react-app/issues/2488
                                ascii_only: true,
                            },
                        },
                        // Use multi-process parallel running to improve the build speed
                        // Default number of concurrent runs: os.cpus().length - 1
                        // Disabled on WSL (Windows Subsystem for Linux) due to an issue with Terser
                        // https://github.com/webpack-contrib/terser-webpack-plugin/issues/21
                        parallel: !isWsl,
                    })],
                },
                plugins: [
                    // using eslint with webpack only while watching, for `build` `jest` needs to check it
                    ...(watch ? [new ESLintWebpackPlugin({
                        context: path.resolve(__dirname, srcDir),
                        overrideConfigFile: path.resolve(__dirname, '.eslintrc'),
                        cache: true,
                        eslintPath: 'eslint',
                        emitWarning: true,
                        failOnWarning: isProd,
                        quiet: false,
                        extensions: ['.ts', '.tsx', '.js', '.jsx'],
                    })] : []),
                    // todo: mock inject `runtimeChunk` with twig / gulp tass
                    new BundleWebpackPlugin(pageId),
                    new webpack.DefinePlugin({
                        'process.env': (() => {
                            const safeEnv = {}
                            Object.keys(process.env)
                                .filter(k =>
                                    safeEnvVars.includes(k) ||
                                    k.indexOf('REACT_APP_') === 0 ||
                                    k.indexOf('WEB_APP_') === 0,
                                )
                                .map(k =>
                                    safeEnv[k] = JSON.stringify(process.env[k]),
                                )
                            return safeEnv
                        })(),
                    }),
                ],
            }))
            .pipe(gulp.dest(dist))
            .pipe(browsersync.stream())
    }
}

class BundleWebpackPlugin {
    pageId = undefined

    constructor(pageId) {
        this.pageId = pageId
    }

    apply(compiler) {
        compiler.hooks.done.tap('BundleWebpackPlugin', stats => {
            const toLoadInfo = {}
            for(let k of stats.compilation.entrypoints.keys()) {
                const {_moduleIndices, _moduleIndices2, ...chunkGroup} = stats.compilation.namedChunkGroups.get(k)
                if(!toLoadInfo[k]) {
                    toLoadInfo[k] = []
                }
                chunkGroup.chunks.forEach(chunk =>
                    chunk.files.forEach(file => {
                        toLoadInfo[k].push(file)
                    }),
                )
            }
            const toLoadInfoFile = path.resolve('src', 'toLoadInfo-' + this.pageId + '.json')
            fs.access(toLoadInfoFile, (err) => {
                if(err) {
                    fs.writeFileSync(toLoadInfoFile, '{}')
                }
                const data = fs.readFileSync(toLoadInfoFile) || '{}'
                const result = JSON.parse(data.toString())
                const nextUnordered = {...result, ...toLoadInfo}
                const ordered = Object.keys(nextUnordered).sort().reduce(
                    (obj, key) => {
                        obj[key] = nextUnordered[key]
                        return obj
                    },
                    {},
                )
                fs.writeFile(toLoadInfoFile, JSON.stringify(ordered, undefined, 0), 'utf8', function(err) {
                    if(err) {
                        return console.log(err)
                    } else {
                        console.log('success update ' + toLoadInfoFile, ordered)
                    }
                })
            })
        })
    }
}
