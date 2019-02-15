export const header = ({ heading, body }: { heading: string, body: string }) => `
${heading}
${'='.repeat(Math.max(10, heading.length + 2))}

${body}`
