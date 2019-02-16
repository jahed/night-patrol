// Type definitions for require-dir 1.0
// Project: https://github.com/aseemk/requireDir
// Definitions by: weekens <https://github.com/weekens>
//                 Jahed Ahmed <https://github.com/jahed>
// Definitions: https://github.com/DefinitelyTyped/DefinitelyTyped

declare module 'require-dir' {
  interface Options {
    recurse?: boolean
    duplicates?: boolean
    filter?: any
    mapKey?: any
    mapValue?: any
    noCache?: boolean
  }

  function requireDir (directory: string, options?: Options): { [path: string]: any }

  export default requireDir
}
