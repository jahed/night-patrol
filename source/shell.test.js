import { createCommandString } from './shell'

test('should create a command string of args', () => {
    const result = createCommandString('somecommand', {
        'arg-1': 'value1',
        'arg-2': undefined,
        'arg-3': 'value3'
    })

    expect(result).toEqual('somecommand --arg-1 "value1" --arg-2 --arg-3 "value3"')
})
