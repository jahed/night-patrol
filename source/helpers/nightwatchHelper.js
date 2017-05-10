/* eslint-disable import/prefer-default-export */

import os from 'os'

export function getDefaultNightwatchExec() {
    switch (os.platform()) {
        case 'win32': {
            return 'node_modules\\.bin\\nightwatch'
        }
        default: {
            return './node_modules/.bin/nightwatch'
        }
    }
}
