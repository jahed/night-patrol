// Type definitions for vorpal 1.11
// Project: https://github.com/dthree/vorpal
// Definitions by: Daniel Byrne <https://github.com/danwbyrne>
//                 Jahed Ahmed <https://github.com/jahed>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped
// TypeScript Version: 2.2

declare module 'vorpal' {
  import { Chalk } from 'chalk'
  import { PromptModule } from 'inquirer'

  class Vorpal {
    parse (argv: ReadonlyArray<string>): this

    delimiter (value: string): this

    show (): this

    hide (): this

    find (command: string): Vorpal.Command

    exec (command: string): Promise<{}>

    execSync (command: string): {}

    log (value: string, ...values: string[]): this

    history (id: string): this

    localStorage (id: string): object

    help (value: (cmd: string) => string): this

    pipe (value: (stdout: string) => string): this

    use (extension: Vorpal.Extension): this

    catch (command: string, description?: string): Vorpal.Catch

    command (command: string, description?: string): Vorpal.Command

    version (version: string): this

    sigint (value: () => void): this

    ui: Vorpal.UI
    activeCommand: Vorpal.CommandInstance
    commands: Vorpal.Command[]
    chalk: Chalk
  }

  namespace Vorpal {

    interface Args {
      [key: string]: any

      options: {
        [key: string]: any;
      }
    }

    type Action = (this: CommandInstance, args: Args) => Promise<void>
    type Cancel = () => void

    class Command {
      _name: string
      _fn: Action
      _cancel: Cancel | undefined

      alias (command: string): this

      parse (value: (command: string, args: Args) => string): this

      option (option: string, description: string, autocomplete?: ReadonlyArray<string>): this

      types (types: { string?: ReadonlyArray<string> }): this

      hidden (): this

      remove (): this

      help (value: (args: Args) => void): this

      validate (value: (args: Args) => boolean | string): this

      autocomplete (
        values: (
          ReadonlyArray<string>
          | { data: () => ReadonlyArray<string> | Promise<ReadonlyArray<string>> }
          )
      ): this

      action (action: Action): this

      cancel (cancel: Cancel): this

      allowUnknownOptions (): this
    }

    class Catch extends Command {
    }

    type Extension = Command[] | ((vorpal: Vorpal) => Command[])

    class UI {
      delimiter (text?: string): string

      input (text?: string): string

      imprint (): void

      submit (command: string): string

      cancel (): void

      redraw: {
        (text: string, ...texts: string[]): void;
        clear (): void;
        done (): void;
      }
    }

    class CommandInstance {
      log (value: string, ...values: string[]): void

      prompt: PromptModule

      delimiter (value: string): void
    }
  }

  export default Vorpal
}
