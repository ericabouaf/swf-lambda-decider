
var DecisionTask = require('./lib/DecisionTask');

module.exports = function (workflowFunction) {

  var AWS = require('aws-sdk');
  var swf = new AWS.SWF();

  return function(event, context) {

    var d = new DecisionTask(event);

    console.log('Running workflow function...');

    try {
      workflowFunction(d);
    }
    catch(ex) {
      console.log(ex, ex.stack); // an error occurred

      // TODO: here, we got an error in the worfklow decider, we should fail the workflow

      //context.fail(ex.message);

      swf.respondDecisionTaskCompleted({
        taskToken: event.taskToken,
        decisions: [{
           "decisionType": "FailWorkflowExecution",
           "failWorkflowExecutionDecisionAttributes": {
              "reason": "Execution error: "+ex.message,
              "details": ex.stack
           }
        }]
      }, function (err) {
         if (err) { console.error(err); return; }
         console.log("Workflow marked as failed ! (decision task)");
         context.succeed({err: "Workflow marked as failed ! "+ex.message});
      });

      return;
    }

    if(!d.decisions) {
      console.log("No decision sent and no decisions scheduled !");

      swf.respondDecisionTaskCompleted({
        taskToken: event.taskToken,
        decisions: [{
           "decisionType": "FailWorkflowExecution",
           "failWorkflowExecutionDecisionAttributes": {
              "reason": "No decision sent and no decisions scheduled !",
              "details": ""
           }
        }]
      }, function (err) {
         if (err) { console.error(err); return; }
         console.log("Workflow marked as failed ! (decision task)");
         context.succeed({err: "Workflow marked as failed ! No decision sent and no decisions scheduled"});
      });

      return;
    }

    var params = {
      taskToken: event.taskToken,
      decisions: d.decisions
    };

    console.log('Workflow function ok, sending '+d.decisions.length+' decisions...');
    console.log(JSON.stringify(params));

    swf.respondDecisionTaskCompleted(params, function(err, data) {
      if (err) {
        console.log('Error in respondDecisionTaskCompleted');
        console.log(err, err.stack); // an error occurred
        context.fail(err);
        return;
      }

      console.log('respondDecisionTaskCompleted results : ', data);
      context.succeed(data);
    });


  };

};
