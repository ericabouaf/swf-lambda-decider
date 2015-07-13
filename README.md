# swf-lambda-decider

Amazon Lambda Decider for Simple WorkFlow (SWF)

NOTE: under development, use at your own risks

## Usage

 * Create a new npm package for your workflow decider :
````sh
$ mkdir myworkflowdecider
$ cd myworkflowdecider
$ npm init
````

 * Add dependency to swf-lambda-decider :
 ````sh
 $ npm install swf-lambda-decider --save
 ````

 * edit your index.js file with your decider code (see example below)

 * zip and upload to Amazon Lambda

 Important: Lambda IAM Role MUST be able to call SWF functions (be sure to set policy)

 Input of this lambda should be the decisionTask itself

## Example

````js
exports.handler = require('swf-lambda-decider')(function (w) {

    w.activity({
      name: 'step1',
      activity: 'sleep'
    })(function(err, results) {

      w.timer({
        name: 'step2',
        delay: 10
      }, { timerId: '12345' })(function(err, data) {

        w.stop({
          result: 'Everything is good !'
        });

      });

    });

});
````
