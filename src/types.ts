import { AnyAction } from 'redux'

export type TestFailure = {
  suiteName: string,
  testName: string,
  line: string,
  name: string
}

export type TestFailuresByName = {
  [name: string]: TestFailure
}

export type Suites = {
  [suiteName: string]: string[]
}

export type ConfigOptions = {
  configPath?: string,
  executablePath?: string
}

export type Config = {
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

export type State = {
  config: Config,
  testFailures: TestFailuresByName,
  actions: ActionsLog
}

export type PackageJSON = {
  name: string
  version: string
}
