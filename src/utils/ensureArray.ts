const ensureArray = <V>(value: V[] | V): V[] => (
  Array.isArray(value)
    ? value
    : [value]
)

export {
  ensureArray
}
