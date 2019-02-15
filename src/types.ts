import { Store as ReduxStore, AnyAction } from 'redux'
import { ThunkDispatch } from 'redux-thunk'

export type TestFailure = {
  suiteName: string,
  testName: string
}

export type TestFailuresBySuite = {
  [suite: string]: TestFailure
}

export type Suites = {
  [suiteName: string]: string[]
}

export type ConfigOptions = {
  configPath?: string,
  executablePath?: string
}

export type Config = {
  name: string,
  version: string,
  configPath: string,
  executablePath: string,
  environments: { [name: string]: true },
  currentEnvironment: string,
  suiteDirectories: string[],
  suites: Suites,
  currentSuite?: string
}

export type ActionsLog = {
  [datetime: string]: AnyAction
}

export type Store = (
  ReduxStore<State, AnyAction> &
  { dispatch: ThunkDispatch<State, {}, AnyAction> }
)

export type State = {
  config: Config,
  testFailures: TestFailuresBySuite,
  actions: ActionsLog
}

export type PackageJSON = {
  name: string
  version: string
}
