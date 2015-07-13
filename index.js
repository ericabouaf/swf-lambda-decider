
var DecisionTask = require('./lib/decision-task');

module.exports = function (workflowFunction) {

  var AWS = require('aws-sdk');
  var swf = new AWS.SWF();

  return function(event, context) {

    // TODO: get all paginated events

    var d = new DecisionTask(event);

      /*if(err) {
        context.fail(data);
      }*/

    try {
      workflowFunction(d);
    }
    catch(ex) {
      context.fail(ex.message);
      return;
    }

    var params = {
      taskToken: event.taskToken,
      decisions: d.decisions
    };


    swf.respondDecisionTaskCompleted(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        context.fail(err);
        return;
      }

      context.succeed(data);
    });


  };

};
