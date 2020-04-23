# protractor-sample
This repo demonstrates how to integrate Protrator with qTest Automation Host's Universal Agent. The sample project is originated from here [http://www.protractortest.org/#/tutorial](http://www.protractortest.org/#/tutorial)

## Pre-requitesites:
1. NodeJS 12+
2. Protractor is installed globally via `npm install -g protractor`. After installation, check that protractor is working using command `protractor --version`

## Verify you can run Protractor test from command line before integrating it with Universal Agent following below steps

### Install node modules
1. Clone this source code to your local machine. You can optionally choose to download the source code and unzip it to a preferred location on your machine
2. Open Terminal (or Command Prompt if you are using Windows)
3. Navigate to source code folder `/path/to/protractor-sample/`
4. Run this command to install required node modules: `npm run setup`

### Start WebDriver 
Still on Terminal, run this command to start WebDriver: `npm run start-webdriver`

### Execute Protractor test
1. Open another Terminal window
2. Navigate to source code folder `/path/to/protractor-sample/`
3. Run this command to execute Protractor test `npm run test`
