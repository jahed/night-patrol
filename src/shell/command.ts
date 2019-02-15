type ExecArgs = { [key: string]: string | undefined }

export const command = (executable: string, args: ExecArgs = {}): string => {
  const argStrings = Object.keys(args).map((key) => (
    args[key]
      ? `--${key} "${args[key]}"`
      : `--${key}`
  ))

  return [executable, ...argStrings].join(' ')
}
