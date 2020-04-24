exports.config = {
  framework: 'jasmine',
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['spec-1.js', 'spec-2.js'],
  multiCapabilities: [{
    browserName: 'chrome'
  }],
  framework: 'jasmine2',
  onPrepare: function () {
    var jasmineReporters = require('jasmine-reporters');
    jasmine.getEnv().addReporter(new jasmineReporters.JUnitXmlReporter({
      consolidateAll: true,
      savePath: 'test-results'
    }));
  }
}