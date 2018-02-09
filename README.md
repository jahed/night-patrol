# Night Patrol

[![Travis](https://img.shields.io/travis/jahed/night-patrol.svg)](https://travis-ci.org/search/night-patrol)
[![npm](https://img.shields.io/npm/v/night-patrol.svg)](https://www.npmjs.com/package/night-patrol)
[![Patreon](https://img.shields.io/badge/patreon-donate-f96854.svg)](https://www.patreon.com/jahed)

An Interactive CLI for Nightwatch.

## Installation

```sh
npm install -g night-patrol
```

## Usage

To start a Night Patrol session, run:

```sh
night-patrol --config <path-to-nightwatch-config>
```

For help, just run the `help` command in the Night Patrol session.

### Override the Nightwatch Executable

```sh
night-patrol --nightwatch [path-to-nightwatch-executable] --config <path-to-nightwatch-config>
```

By default, Night Patrol will use the Nightwatch executable under `./node_modules/.bin/nightwatch`. If you want to use a different executable, use the `--nightwatch` argument.


## License

See `LICENSE` file.
