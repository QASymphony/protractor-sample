# protractor-sample
This repo demonstrates how to integrate Protrator with qTest Automation Host's Universal Agent. The sample project is originated from here [http://www.protractortest.org/#/tutorial](http://www.protractortest.org/#/tutorial)

## Pre-requitesites:
1. Git
2. NodeJS 12+
3. Protractor is installed globally via `npm install -g protractor`. After installation, check that protractor is working using command `protractor --version`
4. Update webdriver via this command `webdriver-manager update`
5. Clone this source code to your local machine at
    1. Mac or Linux: `/usr/local/var/protractor-sample`
    2. Windows: `D:\protractor-sample`

## Setup
1. Open Terminal (for Mac or Linux), or Command Prompt if you are on Windows
2. Navigate to source code folder
    1. Mac or Linux: `cd /usr/local/var/protractor-sample`
    2. Windows: `cd "D:\protractor-sample"`
3. Run this command to install required node modules: `npm run setup`

## Run Protractor test from command line
This step is to verify you can run Protractor test from command line before integrating it with Universal Agent.

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
2. Open web browser and navigate to Automation Host UI at http://localhost:6789 (assuming you installed automation host in the default port, which is 6789. Otherwise, make sure you change the port number 6789 to your desired port number.
3. Select `+ Add` button to create a new agent.
4. On New Agent dialog, enter the followings:
- Agent Name: Protractor Universal Agent
- qTest Manager Project: qConnect Sample Project
- Agent Type: Universal Agent
- Pre-Execute Scripts: enter the following script dependent on your Operating System

**Mac/Linux**
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
```javascript
var http = require("http");
const RETRY_THRESHOLDS = 10;
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
    return retryOrStop();
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

// let's do our biz
waitForWebDriverReady(webDriverRequestOptions, (ready) => {
  try {
    if (ready) {
      console.log('Kickoff Protractor test...');
      // build protractor execute command, what it does:
      // 1. if there is no test case being specified, the command is: `npm run test`
      // 2. else, the command should be like this: `npm run test -- --grep="<test case name 1>|<test case name 2>|<test case name n>"`. Reference: https://stackoverflow.com/a/50310279

      // this is the default execute command that will run all specs
      let testCommand = 'npm run test';
      // get scheduled test cases' automation content from magic variable $TESTCASES_AC
      let testcases_ac = $TESTCASES_AC;
      // if there is/are test cases/runs being scheduled, the testcases_ac
      // will have value something like: "<spec name 1>#<test case name 1>,<spec name 2>#<test case name 2>,<spec name N>#<test case name N>"
      if (testcases_ac && testcases_ac.trim() !== "") {
        // split testcases_ac into into array, each item now has value: <spec name>#<test case name>
        let testcaseIncludingSpecnames = testcases_ac.split(',');
        if (testcaseIncludingSpecnames.length > 0) {
	  // this array will hold final test cases
          let testcaseNamesOnly = [];
	  // loop thru all item in the array, and grab the test case bame in it
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
          // if there are test case names in the arracy, rebuild the execute command to execute them
          if (testcaseNamesOnly.length > 0) {
            testCommand += ' -- --grep="' + testcaseNamesOnly.join('|') + '"';
          }
        }
      }
      execSync(testCommand, {
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
6. Path to Results: enter path to test result folder that is relative to the source folder
- Mac: enter `/usr/local/var/protractor-sample/test-results`
- Windows: enter `D:\protractor-sample\test-results`
7. Result Parser: select `JUnit for Java (built-in)`. Your agent now look like below

![Protractor Universal Agent](/docs/protractor-agent.png)

8. Click Save to finish creating the agent. You will be returned back to the Automation Host home page
9. From Agent list, locate the agent **Protractor Universal Agent** you just created. Click on action icon in the last column and select `Run Now`
10. From the run agent dialog, click Execute to execute the agent.

![Run Agent](/docs/run-now.png)

11. When the execution finished, the test results will be submitted to qTest, as below screenshot

![Test Result](/docs/test-results.png)
