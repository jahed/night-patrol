const dataCollector = (stream: NodeJS.ReadableStream) => {
  const chunks: Buffer[] = []
  const handler = (chunk: Buffer) => {
    chunks.push(chunk)
  }
  stream.on('data', handler)
  return () => {
    stream.off('data', handler)
    return Buffer.concat(chunks)
  }
}

export {
  dataCollector
}
