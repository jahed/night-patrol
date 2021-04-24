# Night Patrol

[![npm](https://img.shields.io/npm/v/night-patrol.svg)](https://www.npmjs.com/package/night-patrol)

An Interactive Test Runner for Nightwatch.

- [Introducing Night Patrol](https://jahed.dev/2018/01/29/introducing-night-patrol/)

![Demonstration](https://www-static.jahed.dev/night-patrol/np3.gif)

## Installation

You can install Night Patrol like any other dev dependency. Depending on if you
use Yarn or NPM as your package manager, the command may vary.

```sh
yarn add --dev night-patrol
```

```sh
npm install --save-dev night-patrol
```

## Usage

To start a Night Patrol session, run:

```sh
yarn night-patrol
```

```sh
npx night-patrol
```

For help, just run the `help` command in the Night Patrol session.

### Choose the Nightwatch Configuration

By default, Night Patrol will look for a `nightwatch.config.js` in the current
directory. You can use a different path by using the `--config` argument.

```sh
night-patrol --config [path to nightwatch.config.js]
```

### Choose the Nightwatch Executable

By default, Night Patrol will use the Nightwatch executable under
`./node_modules/.bin/nightwatch`. If you want to use a different executable, use
the `--nightwatch` argument.

```sh
night-patrol --nightwatch [path to nightwatch executable]
```

### Choose the Launch Environment


By default, Night Patrol will use the `default` environment. If you want to use
a different environment, use the `--env` argument.

If the given environment is not found, Night Patrol will default to the first
environment under `test_settings` in your Nightwatch configuration.

```sh
night-patrol --env [environment key from test_settings]
```

## License

[MIT](LICENSE).
