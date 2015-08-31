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


## Note about the aws-sdk dependency

To send the lambda response, we need the aws-sdk version 2.1.45

At the time this is being written, the version available into lambda is 2.1.35 :
http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html


## Deployment

We recommand using https://github.com/ThoughtWorksStudios/node-aws-lambda to automate deployment

TODO: Write a YeoMan Generator !
