[![CircleCI](https://circleci.com/gh/klazuka/elm-hot-webpack-loader.svg?style=svg)](https://circleci.com/gh/klazuka/elm-hot-webpack-loader)

# elm-hot-webpack-loader

Hot code swapping support for Elm 0.19. This improves the Elm development workflow by automatically reloading your code in the browser after a change, while preserving your current app state.

This package provides a Webpack loader that can be used in conjunction with [elm-webpack-loader](https://github.com/elm-community/elm-webpack-loader). If you're looking for something that doesn't require Webpack, see [elm-hot](https://github.com/klazuka/elm-hot) (although integrating it will be much more work).


## Changelog

### 1.1.5
- upgrade elm-hot to 1.1.3 (fix a crash when using Elm debugger and elm/browser 1.0.2)

### 1.1.3 and 1.1.4
- published but forgot to update the changelog and then forgot to git pull. Sigh.

### 1.1.2
- upgrade elm-hot to 1.1.2 (bug fix)

### 1.1.1
- upgrade elm-hot to 1.1.1 (added support for Elm 0.19.1)

### 1.0.2
- upgrade elm-hot to 1.0.1 (various bug fixes)

### 1.0.1
- upgrade elm-hot to 1.0.0 (various bug fixes)

### 1.0.0
- use official `elm-webpack-loader` 5.0.0

### 0.9.2
- first release as a separate repo & package

### 0.9.0
- originally shipped as part of elm-hot


## Installation

```bash
$ npm install --save-dev elm-hot-webpack-loader
```

You will also need to install [elm-webpack-loader](https://github.com/elm-community/elm-webpack-loader), if you haven't already.


## Usage

Assuming that you're already using `elm-webpack-loader`, just add `{ loader: 'elm-hot-webpack-loader' }` immediately 
**before** `elm-webpack-loader` in the `use` array. 

It should look something like this:

```javascript
module.exports = {
    module: {
        rules: [
            {
                test: /\.elm$/,
                exclude: [/elm-stuff/, /node_modules/],

                use: [
                    { loader: 'elm-hot-webpack-loader' },
                    {
                        loader: 'elm-webpack-loader',
                        options: {
                            cwd: __dirname
                        }
                    }
                ]
            }
        ]
    }
}
```

It's important that the `elm-hot-webpack-loader` loader comes *before* the `elm-webpack-loader` in the `use` array.

When running `webpack-dev-server`, you must add the `--hot` flag.


## Example

Check out the [example app](https://github.com/klazuka/example-elm-hot-webpack).


----------------------------------------------------------------------------------

### Caveats

- Elm 0.18 is not supported. Use fluxxu/elm-hot-loader@0.5.x instead.


### Attribution

Elm hot code swapping is based on the work of Flux Xu's [elm-hot-loader](https://github.com/fluxxu/elm-hot-loader). That project is no longer maintained, and it does not support Elm 0.19.
