import shell from 'shelljs'
import _ from 'lodash'

export function exec(commandString) {
    console.log(commandString)
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

export function createCommandString(command, args) {
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
