// run this command in Terminal (Mac) or Command Prompt (Windows) to execute test using nodejs: 
// path/to/protractor-sample $ node test.js

var http = require("http");
const RETRY_THRESHOLDS = 10; // will retry 10 times (10 secods) to check for WebDriver availability
let retryCount = 0;
function waitForWebDriverReady(options, callback) {
  retryOrStop = () => {
    if (retryCount < RETRY_THRESHOLDS) {
      retryCount++;
      // wait for 1 second and retry
      setTimeout(() => { waitForWebDriverReady(options, callback) }, 1000);
    } else {
      return callback(false);
    }
  }
  const req = http.request(options, res => {
    if (res.statusCode === 302) {
      return callback(true);
    } else {
      retryOrStop();
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
      execSync('npm run test', {
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