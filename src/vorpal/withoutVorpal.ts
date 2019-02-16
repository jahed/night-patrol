import Vorpal from 'vorpal'

const withoutVorpal = <T> (vorpal: Vorpal, fn: () => Promise<T>): Promise<T> => {
  return Promise.resolve()
    .then(() => vorpal.hide())
    .then(() => fn())
    .then(
      result => {
        vorpal.show()
        return result
      },
      error => {
        vorpal.show()
        return Promise.reject(error)
      }
    )
}

export {
  withoutVorpal
}
