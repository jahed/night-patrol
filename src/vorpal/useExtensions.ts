import Vorpal from 'vorpal'

const useExtensions = (vorpal: Vorpal, extensions: Vorpal.Extension[]) => {
  extensions.forEach(extension => vorpal.use(extension))
}

export {
  useExtensions
}
