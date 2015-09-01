# swf-lambda-decider

Amazon Lambda Decider for Amazon Simple WorkFlow (SWF)

## Intro

This library tries its best to make it easy to write SWF deciders in Javascript, and host them on Amazon Lambda.

Important: this library does not poll SWF for decision task. To launch decider-lambdas, we recommand using the [swf-lambda-decider-poller project](https://github.com/neyric/swf-lambda-decider-poller).


## Usage

New: To simplify the developpement of lambda-deciders, please check out the [swf-lambda-decider YeoMan generator](https://github.com/neyric/generator-swf-lambda-decider)

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

To send the lambda response, we need the aws-sdk version >=2.1.45

At the time this is being written, the version available into lambda is 2.1.35 :
http://docs.aws.amazon.com/lambda/latest/dg/current-supported-versions.html


## Deployment

We recommand using https://github.com/neyric/swf-lambda-decider-gulp-tasks to automate deployment.

(Which is made automatically available if you use [swf-lambda-decider YeoMan generator](https://github.com/neyric/generator-swf-lambda-decider))


## API


### Simple Activity

```js
w.activity({
  name: 'step1', // Must be unique
  activity: 'sleep'
})(function(err, results) {
  // ...
});
```

To specify a custom taskList :

```js
w.activity({
  name: 'step2', // Must be unique
  activity: 'echo',
  taskList: 'my-custom-tasklist'
})(function(err, results) {
  // ...
});
```


### Calling a lambda function

```js
w.lambda({
  "id": "step_0", // Must be unique
  "name": "yql", // Name of the lambda function
  "input": {
    "yqlquery": "SELECT * FROM slideshare.slideshows WHERE user='neyric'",
    "diagnostics": "true",
    "envURL": "http://datatables.org/alltables.env"
  },
  "startToCloseTimeout": "30"
})(function (err, results) {
  // ...
});
```
