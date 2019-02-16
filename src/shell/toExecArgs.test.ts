import { toExecArgs } from './toExecArgs'

test('should create a command string of args', () => {
  const result = toExecArgs({
    'arg-1': 'value1',
    'arg-2': undefined,
    'arg-3': 'value3'
  })

  expect(result).toEqual(['--arg-1', 'value1', '--arg-2', '--arg-3', 'value3'])
})
