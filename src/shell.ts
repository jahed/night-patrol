import { exec as execShellJs } from 'shelljs'
import _ from 'lodash'

type ExecResult = {
  code: number,
  stdout: string,
  stderr: string
}

type ExecArgs = { [key: string]: string | undefined }

export const exec = (commandString: string) => {
  console.log(commandString)
  return new Promise<ExecResult>((resolve, reject) => {
    execShellJs(commandString, (code, stdout, stderr) => {
      if (code !== 0) {
        reject({ code, stdout, stderr })
        return
      }
      resolve({ code, stdout, stderr })
    })
  })
}

export const createCommandString = (command: string, args: ExecArgs) => {
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
