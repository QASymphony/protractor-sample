describe('Spec 2', function() {
  var firstNumber = element(by.model('first'));
  var secondNumber = element(by.model('second'));
  var goButton = element(by.id('gobutton'));
  var latestResult = element(by.binding('latest'));

  beforeEach(function() {
    browser.get('https://juliemr.github.io/protractor-demo/');
  });

  it('should add two and three', function() {
    firstNumber.sendKeys(2);
    secondNumber.sendKeys(3);

    goButton.click();

    expect(latestResult.getText()).toEqual('5');
  });
  
  it('this is another failed test case', function() {
    firstNumber.sendKeys(1);
    secondNumber.sendKeys(1);
    goButton.click();
    expect(latestResult.getText()).toEqual('0');
  });
});