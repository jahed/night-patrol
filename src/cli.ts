import minimist from 'minimist'
import Vorpal from 'vorpal'
import { setConfig } from './actions/config'
import { getDelimiter } from './selectors/getDelimiter'
import { getHistoryKey } from './selectors/getHistoryKey'
import { createStore } from './createStore'
import { State } from './types'
import { createCommonExtension } from './vorpal/createCommonExtension'
import { createRootExtension } from './vorpal/createRootExtension'
import { useExtensions } from './vorpal/useExtensions'

const cli = () => {
  const store = createStore()
  const argv = minimist(process.argv.slice(2))

  store.dispatch(setConfig({
    configPath: argv.config,
    executablePath: argv.nightwatch
  }))

  const rootVorpal = new Vorpal()
  rootVorpal.history(getHistoryKey(store.getState()))
  useExtensions(rootVorpal, [
    createCommonExtension(store),
    createRootExtension(store)
  ])

  const reloadDelimiter = (vorpal: Vorpal, state: State) => {
    const delimiter = getDelimiter(state)
    vorpal.delimiter(delimiter) // Future delimiters
    vorpal.ui.delimiter(delimiter) // Current delimiter
  }

  reloadDelimiter(rootVorpal, store.getState())
  store.subscribe(() => {
    reloadDelimiter(rootVorpal, store.getState())
  })

  rootVorpal.show()
}

export {
  cli
}
