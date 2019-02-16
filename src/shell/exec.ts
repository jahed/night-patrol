import chalk from 'chalk'
import { spawn } from 'child_process'
import { ExecArgs, ExecResult } from '../types'
import { dataCollector } from '../utils/dataCollector'
import { toExecArgs } from './toExecArgs'

export const exec = (executable: string, args?: ExecArgs) => new Promise<ExecResult>((resolve, reject) => {
  const execArgs = toExecArgs(args)
  console.log(chalk.grey(`Executing:  ${[executable, ...execArgs].join(' ')}`))

  const childProcess = spawn(executable, execArgs)

  childProcess.stdout.pipe(process.stdout)
  childProcess.stderr.pipe(process.stderr)

  const stdoutCollector = dataCollector(childProcess.stdout)
  const stderrCollector = dataCollector(childProcess.stderr)

  childProcess.on('close', (code: number) => {
    const stdout = stdoutCollector().toString()
    const stderr = stderrCollector().toString()

    if (code !== 0) {
      reject({ code, stdout, stderr })
      return
    }
    resolve({ code, stdout, stderr })
  })
})
