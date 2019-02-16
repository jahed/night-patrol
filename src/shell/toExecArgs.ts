import { ExecArgs } from '../types'

export const toExecArgs = (args: ExecArgs = {}): string[] => (
  Object.keys(args).reduce((acc, next) => {
    acc.push(`--${next}`)
    const value = args[next]
    if (value) {
      acc.push(value)
    }
    return acc
  }, [] as string[])
)
