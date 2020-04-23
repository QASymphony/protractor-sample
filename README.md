# protractor-sample
This repo demonstrates how to integrate Protrator with qTest Automation Host's Universal Agent. The sample project is originated from here [http://www.protractortest.org/#/tutorial](http://www.protractortest.org/#/tutorial)

## Pre-requitesites:
0. Git
1. NodeJS 12+
2. Protractor is installed globally via `npm install -g protractor`. After installation, check that protractor is working using command `protractor --version`
3. Clone this source code to your local machine at
    1. Mac or Linux: `/usr/local/var/protractor-sample`
    2. Windows: `D:\protractor-sample`

## Setup
1. Open Terminal (for Mac or Linux), or Command Prompt if you are on Windows
2. Navigate to source code folder at `/path/to/protractor-sample/`
3. Run this command to install required node modules: `npm run setup`

## Verify you can run Protractor test from command line before integrating it with Universal Agent following below steps
### Start WebDriver 
Still on Terminal, run this command to start WebDriver: `npm run start-webdriver`

### Execute Protractor test
1. Open another Terminal (or Command Prompt) window
2. Enter this command to navigate to source code folder
    1. Mac or Linux: `cd /usr/local/var/protractor-sample`
    2. Windows: `cd "D:\protractor-sample"`
3. Run this command to execute Protractor test `npm run test`

## Integrate Protractor test with Universal Agent
1. [Download and install qTest Automation Host](https://support.tricentis.com/community/manuals_detail.do?lang=en&version=On-Demand&module=Tricentis%20qTest%20On-Demand&url=qtest_launch/qtest_ahub_2_user_guides/download_qtest_automation_host2.htm)
2. Open web browser and navigate to Automation Host UI at http://localhost:6789 
3. Select `+ Add` button to create a new agent.
4. On New Agent dialog, enter the followings:
- Agent Name: Protractor Universal Agent
- qTest Manager Project: qConnect Sample Project
- Agent Type: Universal Agent
- Pre-Execute Scripts: enter the following script dependent on your Operating System

**Mac**
```
#!/bin/bash
if [ ! -d "/usr/local/var/protractor-sample" ]
then
  cd "/usr/local/var"
  git clone git@github.com:QASymphony/protractor-sample.git
else
  cd /usr/local/var/protractor-sample
  git pull --all
fi
```
**Windows**
```
if not exist "D:\protractor-sample" (
 cd /d D:\
 git clone https://github.com/QASymphony/protractor-sample
) else (
 cd /d "D:\protractor-sample"
 git pull --all
)
```
5. Execute Command
- Executor: select `node`
- Working Directory: 
    1. Mac or Linux: `/usr/local/var/protractor-sample`
    2. Windows: `D:\protractor-sample`  
- Enter the scripts below to the code area of Execute Command
```
var http = require("http");
const RETRY_THRESHOLDS = 10;
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
    // if WebDriver is ready, request to http://localhost:4444/wd/hub will response 302 status code (redirect)
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

// install node module with below command
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
```
6. Click Save to finish creating the agent. You will be returned back to the Automation Host home page
7. From Agent list, locate the agent **Protractor Universal Agent** we just created. Click on Action icon in the last column and select Run Now
8. From the opening run agent dialog, click Execute to execute the agent
