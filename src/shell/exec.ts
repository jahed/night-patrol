import chalk from 'chalk'
import { exec as execShellJs } from 'shelljs'

type ExecResult = {
  code: number,
  stdout: string,
  stderr: string
}

export const exec = (command: string) => {
  console.log(chalk.grey(`Executing:  ${command}`))
  return new Promise<ExecResult>((resolve, reject) => {
    execShellJs(command, (code, stdout, stderr) => {
      if (code !== 0) {
        reject({ code, stdout, stderr })
        return
      }
      resolve({ code, stdout, stderr })
    })
  })
}
