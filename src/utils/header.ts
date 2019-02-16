type Header = {
  title: string,
  subtitle: string
}

export const header = ({ title, subtitle }: Header): string => {
  const fullTitle = `${title} ~ ${subtitle}`
  const underline = '='.repeat(Math.min(Math.max(10, fullTitle.length), 80))
  return ['', '  ' + fullTitle, '  ' + underline].join('\n')
}
