import chalk from 'chalk'
import chokidar from 'chokidar'
import { difference } from 'lodash'
import minimist from 'minimist'
import { createSelector } from 'reselect'
import Vorpal from 'vorpal'
import { setConfig } from './actions/config'
import { createStore } from './createStore'
import { getDelimiter } from './selectors/getDelimiter'
import { getHistoryKey } from './selectors/getHistoryKey'
import { State, Store } from './types'
import { createCommonExtension } from './vorpal/createCommonExtension'
import { createRootExtension } from './vorpal/createRootExtension'
import { renderDelimiter } from './vorpal/renderDelimiter'
import { useExtensions } from './vorpal/useExtensions'

const watchPaths = (paths: string[] | string, handler: (path: string) => void) => {
  const watcher = chokidar.watch(paths, {
    ignoreInitial: true,
    awaitWriteFinish: true
  })

  watcher.on('add', handler)
  watcher.on('change', handler)
  watcher.on('unlink', handler)

  return watcher
}

const watchPathsAndSubscribe = (store: Store, pathsSelector: (state: State) => string[]) => {
  const state = store.getState()
  let currentPaths = pathsSelector(state)

  const watcher = watchPaths(currentPaths, () => {
    const state = store.getState()
    store.dispatch(setConfig(state.config))
  })

  store.subscribe(() => {
    const state = store.getState()
    const previousPaths = currentPaths
    currentPaths = pathsSelector(state)
    if (previousPaths !== currentPaths) {
      watcher.unwatch(difference(previousPaths, currentPaths))
      watcher.add(difference(currentPaths, previousPaths))
    }
  })
}

const subscribeDelimiter = (store: Store, vorpal: Vorpal) => {
  let currentDelimiter = getDelimiter(store.getState())
  renderDelimiter(vorpal, currentDelimiter)
  store.subscribe(() => {
    const state = store.getState()
    const previousDelimiter = currentDelimiter
    currentDelimiter = getDelimiter(state)
    if (previousDelimiter !== currentDelimiter) {
      renderDelimiter(vorpal, currentDelimiter)
    }
  })
}

const logConfigError = (vorpal: Vorpal, error: string) => {
  vorpal.log('\n')
  vorpal.log(chalk.yellow("  Failed to parse Nightwatch configuration and tests. Try fixing the error below and Night Patrol will automatically try again. If that doesn't work, please submit an issue ticket."))
  vorpal.log(chalk.grey(error))
  vorpal.log('')
}

const subscribeVorpal = (store: Store, vorpal: Vorpal) => {
  let currentConfig = store.getState().config
  if (!currentConfig.error) {
    vorpal.show()
  } else {
    vorpal.hide()
    logConfigError(vorpal, currentConfig.error)
  }

  store.subscribe(() => {
    const state = store.getState()
    const previousConfig = currentConfig
    currentConfig = state.config
    if (previousConfig !== currentConfig) {
      if (currentConfig.error && !previousConfig.error) {
        vorpal.hide()
        logConfigError(vorpal, currentConfig.error)
      }
      if (!currentConfig.error && previousConfig.error) {
        vorpal.log('\n  Config parsed successfully. Please continue.\n')
        vorpal.show()
      }
    }
  })
}

const cli = () => {
  const store = createStore()
  const argv = minimist(process.argv.slice(2))

  store.dispatch(setConfig({
    configPath: argv.config,
    executablePath: argv.nightwatch
  }))

  const vorpal = new Vorpal()
  vorpal.history(getHistoryKey(store.getState()))
  useExtensions(vorpal, [
    createCommonExtension(store),
    createRootExtension(store)
  ])

  watchPathsAndSubscribe(store, createSelector(
    state => state.config.configPath,
    configPath => [configPath]
  ))
  watchPathsAndSubscribe(store, state => state.config.suiteDirectories)

  subscribeDelimiter(store, vorpal)
  subscribeVorpal(store, vorpal)
}

export {
  cli
}
