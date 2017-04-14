const os = require('os')

function getDefaultNightwatchExec() {
    switch (os.platform()) {
        case 'win32': {
            return 'node_modules\\.bin\\nightwatch'
        }
        default: {
            return './node_modules/.bin/nightwatch'
        }
    }
}

module.exports = {
    getDefaultNightwatchExec
}
