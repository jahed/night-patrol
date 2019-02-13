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

export type NightwatchState = {
  configPath: string,
  executablePath: string,
  environments: { [name: string]: any },
  currentEnvironment: string,
  suites: Suites,
  currentSuite?: string
}

export type ActionsState = {
  [datetime: string]: AnyAction
}

export type NightPatrolState = {
  nightwatch: NightwatchState,
  testFailures: TestFailuresByName,
  actions: ActionsState
}

export type PackageJSON = {
  name: string
  version: string
}
