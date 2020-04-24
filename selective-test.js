// run this command in Terminal (Mac) or Command Prompt (Windows) to execute test using nodejs: 
// path/to/protractor-sample $ node selective-test.js

var http = require("http");
const RETRY_THRESHOLDS = 10; // will retry 10 times (10 secods) to check for WebDriver availability
let retryCount = 0;
function waitForWebDriverReady(options, callback) {
  var retryOrStop = () => {
    if (retryCount < RETRY_THRESHOLDS) {
      retryCount++;
      // wait for 1 second and retry
      return setTimeout(() => { waitForWebDriverReady(options, callback) }, 1000);
    } else {
      return callback(false);
    }
  }
  const req = http.request(options, res => {
    // webdriver returns 302 Redirect status code when it's ready
    if (res.statusCode === 302) {
      return callback(true);
    } else {
      return retryOrStop();
    }
  });
  req.on('error', (err) => {
    retryOrStop();
  });
  req.end();
};

const { spawn, execSync } = require('child_process');
// install node modules with below command
execSync('npm run setup', {
  cwd: process.cwd(),
  stdio: 'inherit'
});

/* 
* start webdriver asynchronously 
*/
var childProcesses = spawn('npm', ['run', 'start-webdriver'], { 
  detached: true,
	cwd: process.cwd(),
	stdio: 'inherit'
});

var webDriverRequestOptions = {
  host: 'localhost',
  protocol: 'http:',
  port: 4444,
  path: '/wd/hub',
  method: 'GET'
};
waitForWebDriverReady(webDriverRequestOptions, (ready) => {
  try {
    if (ready) {
      console.log('Kickoff Protractor test...');
      // build protractor execute command (https://stackoverflow.com/a/50310279)
      // 1. if there is no test case being specified, the command is: `npm run test`
      // 2. else, the command should be like this: `npm run test -- --grep="<test case name 1>|<test case name 2>|<test case name n>"`
      let testCommand = 'npm run test';
      let testcases_ac = 'Spec 1#should add one and two,Spec 2#should add two and three,Spec 2#this is another failed test case';
      if (testcases_ac && testcases_ac.trim() !== "") {
        let testcaseIncludingSpecnames = testcases_ac.split(',');
        if (testcaseIncludingSpecnames.length > 0) {
          let testcaseNamesOnly = [];
          testcaseIncludingSpecnames.forEach(item => {
            item = item.trim();
            let i = item.indexOf('#');
            if (i > 0) {
              // extract test case name
              let testcaseName = item.substring(i + 1).trim();
              // push test case name to the array
              testcaseNamesOnly.push(testcaseName);
            }
          });
          // if there are test case names to be executed, rebuild the execute command
          if (testcaseNamesOnly.length > 0) {
            testCommand += ' -- --grep="' + testcaseNamesOnly.join('|') + '"';
          }
        }
      }
      execSync(testCommand, {
        cwd: process.cwd(),
        stdio: 'inherit'
      });
      console.log('Finished Protractor test execution.');
    } else {
      console.error('Cannot connect to WebDriver.');
    }
  } catch(error) {
    console.log('Error executing Protractor test: ' + error);
  } finally {
    // https://azimi.me/2014/12/31/kill-child_process-node-js.html
    process.kill(-childProcesses.pid);
  }
});