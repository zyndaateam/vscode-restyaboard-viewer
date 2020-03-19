'use strict';

import * as testRunner from 'vscode/lib/testrunner';

testRunner.configure({
    ui: 'tdd',
    useColors: true,
    timeout: 100000,
});

module.exports = testRunner;