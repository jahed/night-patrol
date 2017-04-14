const shell = require('shelljs')
const _ = require('lodash')

function exec(commandString) {
    return new Promise((resolve, reject) => {
        shell.exec(commandString, (code, stdout, stderr) => {
            if (code !== 0) {
                reject({ code, stdout, stderr })
                return
            }
            resolve({ code, stdout, stderr })
        })
    })
}

function createCommandString(command, args) {
    const argString = _(args)
        .map((value, key) => (
            value
                ? `--${key} "${value}"`
                : `--${key}`
        ))
        .join(' ')

    return argString
        ? [command, argString].join(' ')
        : command
}

module.exports = {
    exec,
    createCommandString
}
