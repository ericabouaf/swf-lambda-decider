

var DecisionTask = function (decisionTask) {
    this.task = decisionTask;

    this._events = decisionTask.events;

    // Containing decisions made (array, or null if no decision was taken)
    this.decisions = null;
}

DecisionTask.prototype = {


   /**
    * Add a decision
    * @param {Object} decision - decision to add to the response
    */
   addDecision: function(decision) {

      if (!this.decisions) {
         this.decisions = [];
      }

      this.decisions.push(decision);
   },


   /**
    * Sets the local decisions to an empty array. Call this method if no decisions can be made.<br />
    */
   wait: function() {

      if (!this.decisions) {
         this.decisions = [];
      }

   },


   /**
    * Add a "CompleteWorkflowExecution" decision to the response
    * @param {Object} stopAttributes - object containing a 'result' attribute. The result value can be a function (which will get evaluated), a string, or a json object.
    * @param {Object} [swfAttributes] - Additionnal attributes for 'completeWorkflowExecutionDecisionAttributes'
    */
   stop: function (stopAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // Result
      if(stopAttributes.result) {
         if (typeof stopAttributes.result === 'function') {
            sa.result = stopAttributes.result();
         }
         else {
            sa.result = stopAttributes.result;
         }
      }
      if(typeof sa.result !== 'string') {
         sa.result = JSON.stringify(sa.result);
      }

      this.addDecision({
         "decisionType": "CompleteWorkflowExecution",
         "completeWorkflowExecutionDecisionAttributes": sa
      });

    },



   /**
    * Add a new ScheduleActivityTask decision
    * @param {Object} scheduleAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'scheduleActivityTaskDecisionAttributes'
    */
    schedule: function (scheduleAttributes, swfAttributes) {

      var ta = swfAttributes || {};

      ta.activityId = scheduleAttributes.name; // scheduleAttributes.name required

      // Activity Type
      if(scheduleAttributes.activity) {
         ta.activityType = scheduleAttributes.activity;
      }
      if (typeof ta.activityType === "string") {
         ta.activityType = { name: ta.activityType, version: "1.0" };
      }

      // Activity Input
      if (scheduleAttributes.input) {
         if (typeof scheduleAttributes.input === 'function') {
            ta.input = scheduleAttributes.input();
         }
         else {
            ta.input = scheduleAttributes.input;
         }
      }
      else {
         ta.input = "";
      }

      if (typeof ta.input !== "string") {
         ta.input = JSON.stringify(ta.input);
      }

      // Task list (if not set, use the default taskList)
      if (!ta.taskList && this.defaultTaskList) {
          ta.taskList = this.defaultTaskList;
      }
      if (ta.taskList && typeof ta.taskList === "string") {
         ta.taskList = { name: ta.taskList};
      }

      // TODO: we should be able to override these defaults :
      if (!ta.scheduleToStartTimeout) {
        ta.scheduleToStartTimeout = scheduleAttributes.scheduleToStartTimeout || "60";
      }
      if (!ta.scheduleToCloseTimeout) {
        ta.scheduleToCloseTimeout = scheduleAttributes.scheduleToCloseTimeout || "360";
      }
      if (!ta.startToCloseTimeout) {
        ta.startToCloseTimeout = scheduleAttributes.startToCloseTimeout || "300";
      }
      if (!ta.heartbeatTimeout) {
        ta.heartbeatTimeout = scheduleAttributes.heartbeatTimeout || "60";
      }

      this.addDecision({
         "decisionType": "ScheduleActivityTask",
         "scheduleActivityTaskDecisionAttributes": ta
      });
   },

   /**
    * Schedule Lambda Function
    * @param {String} timerId
    */
   cancel_timer: function(timerId) {
      this.addDecision({
         "decisionType": "CancelTimer",
         "cancelTimerDecisionAttributes": {
            "timerId": timerId.toString()
         }
      });
   },

   /**
    * Add a RecordMarker decision
    * @param {String} markerName
    * @param {String} [details]
    */
    add_marker: function (markerName, details) {

      if (typeof markerName !== 'string') {
         markerName = markerName.toString();
      }

      if (typeof details !== 'string') {
         details = details.toString();
      }

      this.addDecision({
         "decisionType": "RecordMarker",
         "recordMarkerDecisionAttributes": {
            "markerName": markerName,
            "details": details
         }
      });
    },


   /**
    * Add a StartChildWorkflowExecution decision
    * @param {Object} startAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'startChildWorkflowExecutionDecisionAttributes'
    */
   start_childworkflow: function(startAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // control
      sa.control = startAttributes.name;

      // workflowType
      if(startAttributes.workflow) {
         sa.workflowType = startAttributes.workflow;
      }
      if(typeof sa.workflowType === 'string') {
         sa.workflowType = {
            name: sa.workflowType,
            version: "1.0"
         };
      }

      if( !sa.input ) {
        sa.input = "";
      }

      if (typeof sa.input !== "string") {
         sa.input = JSON.stringify(sa.input);
      }

      if(!sa.workflowId) {
         sa.workflowId = String(Math.random()).substr(2);
      }

      this.addDecision({
         "decisionType": "StartChildWorkflowExecution",
         "startChildWorkflowExecutionDecisionAttributes": sa
      });
   },


   /**
    * Add a new StartTimer decision
    * @param {Object} startAttributes
    * @param {Object} [swfAttributes] - Additionnal attributes for 'startTimerDecisionAttributes'
    */
   start_timer: function(startAttributes, swfAttributes) {

      var sa = swfAttributes || {};

      // control
      sa.control = startAttributes.name;

      if(startAttributes.delay) {
         sa.startToFireTimeout = String(startAttributes.delay);
      }
      if(!sa.startToFireTimeout) {
         sa.startToFireTimeout = "1";
      }

      if(!sa.timerId) {
         sa.timerId = String(Math.random()).substr(2);
      }

      this.addDecision({
         "decisionType": "StartTimer",
         "startTimerDecisionAttributes": sa
      });
   },

   /**
    * Cancel a Timer
    * @param {String} timerId
    */
   cancel_timer: function(timerId) {
      this.addDecision({
         "decisionType": "CancelTimer",
         "cancelTimerDecisionAttributes": {
            "timerId": timerId.toString()
         }
      });
   },

   /**
    * Cancel an activity task
    * @param {String} activityId
    */
   request_cancel_activity_task: function (activityId) {
      this.addDecision({
         "decisionType": "RequestCancelActivityTask",
         "requestCancelActivityTaskDecisionAttributes": {
            "activityId": activityId
         }
      });
    },

   /**
    * Signal a workflow execution
    * @param {Object} [swfAttributes] - Additionnal attributes for 'signalExternalWorkflowExecutionDecisionAttributes'
    */
   signal_external_workflow: function (swfAttributes) {
      var sa = swfAttributes || {};
      this.addDecision({
        "decisionType": "SignalExternalWorkflowExecution",
        "signalExternalWorkflowExecutionDecisionAttributes": sa
      });
    },

    /**
     * Send a RequestCancelExternalWorkflowExecution
     * @param {String} workflowId
     * @param {String} runId
     * @param {String} control
     */
    request_cancel_external_workflow: function (workflowId, runId, control) {
      this.addDecision({
        "decisionType": "RequestCancelExternalWorkflowExecution",
        "requestCancelExternalWorkflowExecutionDecisionAttributes": {
            "workflowId": workflowId,
            "runId": runId,
            "control": control
        }
      });
    },

    /**
     * Cancel a workflow execution
     * @param {String} details
     */
    cancel_workflow: function (details) {
        this.addDecision({
          "decisionType": "CancelWorkflowExecution",
          "cancelWorkflowExecutionDecisionAttributes": {
            "details": details
          }
        });
    },

    /**
     * Continue as a new workflow execution
     * @param {Object} [swfAttributes] - Additionnal attributes for 'continueAsNewWorkflowExecutionDecisionAttributes'
     */
    continue_as_new_workflow: function (swfAttributes) {
      var sa = swfAttributes || {};
      this.addDecision({
        'decisionType': 'ContinueAsNewWorkflowExecution',
        'continueAsNewWorkflowExecutionDecisionAttributes': sa
      });
    },




    // Method to wrap a "schedule" call in a closure, which returns immediatly if it has results
    // This prevents a lot of the inspection of the event list in the decider code
    activity: function(scheduleAttributes, swfAttributes) {
      var that = this;
        return function(cb) {
            if( that.is_activity_scheduled(scheduleAttributes.name) ) {
                if( that.has_activity_completed(scheduleAttributes.name) ) {
                    cb(null, that.results(scheduleAttributes.name) );
                }
                else {
                    console.log("waiting for "+scheduleAttributes.name+" to complete.");
                    that.wait();
                }
            }
            else {
                console.log("scheduling "+scheduleAttributes.name);
                that.schedule(scheduleAttributes, swfAttributes);
            }
        };
    },

    timer: function (startAttributes, swfAttributes) {
      var that = this;
        return function (cb) {
                if(that.timer_scheduled(swfAttributes.timerId)) {
                    if( that.timer_fired(swfAttributes.timerId) ) {
                        cb(null);
                    }
                    else {
                        console.log("waiting for timer "+swfAttributes.timerId+" to complete");
                    }
                }
                else {
                    console.log("starting timer "+swfAttributes.timerId);
                    that.start_timer(startAttributes, swfAttributes);
                }
        };
    },

    childworkflow: function (startAttributes, swfAttributes) {
      var that = this;
        return function (cb) {
                if(that.childworkflow_scheduled(startAttributes.control)) {
                    if(childworkflow_completed(control) ) {
                        cb(null, childworkflow_results(control) );
                    }
                    else {
                        console.log("waiting for childworkflow "+" to complete");
                    }
                }
                else {
                    console.log("starting childworkflow "+startAttributes.control);
                    that.start_childworkflow(startAttributes, swfAttributes);
                }
        };
    },





   /**
    * Return the activityId given the scheduledEventId
    * @param {String} scheduledEventId
    * @returns {String} activityId - The activityId if found, false otherwise
    */
   activityIdFor: function (scheduledEventId) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         if (evt.eventId === scheduledEventId) {
            return evt.activityTaskScheduledEventAttributes.activityId;
         }
      }
      return false;
   },

   /**
    * Return the activityId
    * @param {Integer} eventId
    * @returns {Object} evt - The event if found, false otherwise
    */
   eventById: function (eventId) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         if (evt.eventId === eventId) {
            return evt;
         }
      }
      return false;
   },


  /**
   * Return the key of event attributes for the given event type
   * @param {String} eventType
   * @returns {String} attributesKey
   */
  _event_attributes_key: function(eventType) {
    return eventType.substr(0, 1).toLowerCase() + eventType.substr(1) + 'EventAttributes';
  },

  /**
   * Return the Event for the given type that has the given attribute value
   * @param {String} eventType
   * @param {String} attributeKey
   * @param {String} attributeValue
   * @returns {Object} evt - The event if found, null otherwise
   */
  _event_find: function(eventType, attributeKey, attributeValue) {
    var attrsKey = this._event_attributes_key(eventType);
    for(var i = 0; i < this._events.length ; i++) {
      var evt = this._events[i];
      if ( (evt.eventType === eventType) && (evt[attrsKey][attributeKey] === attributeValue) ) {
        return evt;
      }
    }
    return null;
  },

  /**
   * Check the presence of an Event with the specified
   * @param {String} attributeKey
   * @param {String} attributeValue
   * @param {String} eventType
   * @returns {Boolean}
   */
  _has_event_with_attribute_value: function(attributeKey, attributeValue, eventType) {
    return !!this._event_find(eventType, attributeKey, attributeValue);
  },

   /**
    * This method returns true if the eventType already occured for the given activityId
    * @param {String} activityId
    * @param {String} eventType
    * @returns {Boolean}
    */
   _has_eventType_for_activityId: function (activityId, eventType) {
      return this._has_event_with_attribute_value('activityId', activityId, eventType);
   },


   /**
    * Search for an event with the corresponding type that matches the scheduled activityId
    * @param {String} eventType
    * @param {String} activityId
    * @returns {Boolean}
    */
   _has_event_for_scheduledEventId: function(eventType, activityId) {
      var attrsKey = this._event_attributes_key(eventType);
      return this._events.some(function (evt) {
          if (evt.eventType === eventType) {
             if (this.activityIdFor(evt[attrsKey].scheduledEventId) === activityId) {
                return true;
             }
          }
       }, this);
   },

   /**
    * Return true if the timer with the given timerId has an event with the given eventType
    * @param {String} timerId
    * @param {String} eventType
    * @returns {Boolean}
    */
   has_timer_event: function (timerId, eventType) {
      return this._has_event_with_attribute_value('timerId', timerId, eventType);
    },

   /**
    * Return true if the timer has been canceled
    * @param {String} timerId
    * @returns {Boolean}
    */
   timer_canceled: function (timerId) {
      return this.has_timer_event(timerId, 'TimerCanceled');
   },

   /**
    * Return true if the timer has been canceled
    * @param {String} timerId
    * @returns {Boolean}
    */
   timer_fired: function (timerId) {
      return this.has_timer_event(timerId, 'TimerFired');
   },

   /**
    * Return true if the timer has been started
    * @param {String} timerId
    * @returns {Boolean}
    */
   timer_scheduled: function (timerId) {
      return this.has_timer_event(timerId, 'TimerStarted');
   },


   /**
    * lookup for StartChildWorkflowExecutionInitiated
    * @param {String} control
    * @returns {Boolean}
    */
   childworkflow_scheduled: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "StartChildWorkflowExecutionInitiated") {
            if (evt.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         }
      });
   },

   /**
    * Return true if the child workflow is completed
    * @param {String} control
    * @returns {Boolean}
    */
   childworkflow_completed: function(control) {
      return this._events.some(function (evt) {
         if (evt.eventType === "ChildWorkflowExecutionCompleted") {
            var initiatedEventId = evt.childWorkflowExecutionCompletedEventAttributes.initiatedEventId;
            var initiatedEvent = this.eventById(initiatedEventId);

            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         }
      }, this);
   },

   /**
    * Return true if the child workflow has failed
    * @param {String} control
    * @returns {Boolean}
    */
   childworkflow_failed: function(control) {
      var initiatedEventId, initiatedEvent;
      return this._events.some(function (evt) {
         if (evt.eventType === "StartChildWorkflowExecutionFailed") {
            initiatedEventId = evt.startChildWorkflowExecutionFailedEventAttributes.initiatedEventId;
            initiatedEvent = this.eventById(initiatedEventId);
            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         } else if (evt.eventType === "ChildWorkflowExecutionFailed") {
            initiatedEventId = evt.childWorkflowExecutionFailedEventAttributes.initiatedEventId;
            initiatedEvent = this.eventById(initiatedEventId);
            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {
               return true;
            }
         }
      }, this);
   },

   /**
    * returns true if the activityId started
    * @param {String} activityId
    * @returns {Boolean}
    */
   is_activity_started: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskStarted");
   },

   /**
    * returns true if the activityId has timed out
    * @param {String} activityId
    * @returns {Boolean}
    */
   has_activity_timedout: function (activityId) {
      return this._has_event_for_scheduledEventId('ActivityTaskTimedOut', activityId);
   },

   /**
    * returns true if the activityId has failed
    * @param {String} activityId
    * @returns {Boolean}
    */
   has_activity_failed: function (activityId) {
      return this._has_event_for_scheduledEventId('ActivityTaskFailed', activityId);
   },

   /**
    * Check if one of the ScheduleActivityTask failed
    * @param {String} activityId
    * @returns {Boolean}
    */
   has_schedule_activity_task_failed: function (activityId) {
      return this._has_event_for_scheduledEventId('ScheduleActivityTaskFailed', activityId);
   },


   /**
    * Returns true if the arguments failed
    * @param {String} activityId
    * @returns {Boolean}
    */
   failed: function (activityId) {
      return this.has_activity_failed(activityId) ||
             this.has_schedule_activity_task_failed(activityId);
   },

   /**
    * Returns true if the activityId timed out
    * @param {String} activityId
    * @returns {Boolean}
    */
   timed_out: function (activityId) {
      return this.has_activity_timedout(activityId);
   },

   /**
    * Returns true if the signal has arrived
    * @param {String} signalName
    * @returns {Boolean}
    */
   signal_arrived: function (signalName) {
      return this._has_event_with_attribute_value('signalName', signalName, 'WorkflowExecutionSignaled')
    },

    /**
    * Returns the signal input or null if the signal is not found or doesn't have JSON input
    * @param {String} signalName
    * @returns {Mixed}
    */
   signal_input: function (signalName) {

      var evt = this._event_find('WorkflowExecutionSignaled', 'signalName', signalName);
      if(!evt) {
        return null;
      }

      var signalInput = evt.workflowExecutionSignaledEventAttributes.input;
      try {
        var d = JSON.parse(signalInput);
        return d;
      } catch (ex) {
        return signalInput;
      }
   },


   /**
    * returns true if the activityId is canceled
    * @param {String} activityId
    * @returns {Boolean}
    */
   is_activity_canceled: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskCanceled");
   },

   /**
    * returns true if the activityId is scheduled
    * @param {String} activityId
    * @returns {Boolean}
    */
   is_activity_scheduled: function (activityId) {
      return this._has_eventType_for_activityId(activityId, "ActivityTaskScheduled");
   },


   /**
    * Return true if the arguments are all scheduled
    * @param {String} [...]
    * @returns {Boolean}
    */
   scheduled: function () {
      var i;
      for (i = 0; i < arguments.length; i++) {
         if (!this.is_activity_scheduled(arguments[i])) {
            return false;
         }
      }
      return true;
   },

   /**
    * returns true if no Activity has been scheduled yet...
    * @returns {Boolean}
    */
   has_workflow_just_started: function () {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];
         var evtType = evt.eventType;
         if (evtType === "ActivityTaskScheduled") {
            return false;
         }
      }
      return true;
   },

   /**
    * alias for has_workflow_just_started
    * @returns {Boolean}
    */
   just_started: function () {
      return this.has_workflow_just_started();
   },

   /**
    * returns true if we have a Completed event for the given activityId
    * @param {String} activityId
    * @returns {Boolean}
    */
   has_activity_completed: function (activityId) {
      return this._has_event_for_scheduledEventId('ActivityTaskCompleted', activityId);
   },

   /**
    * Return true if all the arguments are completed
    * @param {String} [...]
    * @returns {Boolean}
    */
   completed: function () {
      var i;
      for (i = 0; i < arguments.length; i++) {
         if ( ! (this.has_activity_completed(arguments[i]) || this.childworkflow_completed(arguments[i])  || this.timer_fired(arguments[i]) ) ) {
            return false;
         }
      }
      return true;
   },

   /**
    * Get the input parameters of the workflow
    * @returns {Mixed}
    */
   workflow_input: function () {

      var wfInput = this._events[0].workflowExecutionStartedEventAttributes.input;

      try {
         var d = JSON.parse(wfInput);
         return d;
      } catch (ex) {
         return wfInput;
      }
   },


   /**
    * Get the results for the given activityId
    * @param {String} activityId
    * @returns {Mixed}
    */
   results: function (activityId) {
      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];

         if (evt.eventType === "ActivityTaskCompleted") {
            if (this.activityIdFor(evt.activityTaskCompletedEventAttributes.scheduledEventId) === activityId) {

               var result = evt.activityTaskCompletedEventAttributes.result;

               try {
                  var d = JSON.parse(result);
                  return d;
               } catch (ex) {
                  return result;
               }

            }
         }
      }

      return null;
   },


   /**
    * Get the results of a completed child workflow
    * @param {String} control
    * @returns {Mixed}
    */
   childworkflow_results: function(control) {

      var i;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];

         if (evt.eventType === "ChildWorkflowExecutionCompleted") {

            var initiatedEventId = evt.childWorkflowExecutionCompletedEventAttributes.initiatedEventId;
            var initiatedEvent = this.eventById(initiatedEventId);

            if (initiatedEvent.startChildWorkflowExecutionInitiatedEventAttributes.control === control) {

               var result = evt.childWorkflowExecutionCompletedEventAttributes.result;

               try {
                  result = JSON.parse(result);
               }
               catch(ex) {}

               return result;
            }
         }
      }

      return null;
   },

   /**
    * Get the details of the last marker with the given name
    * @param {String} markerName
    * @returns {Mixed}
    */
   get_last_marker_details: function (markerName) {
      var i, finalDetail;
      var lastEventId = 0;
      for (i = 0; i < this._events.length; i++) {
         var evt = this._events[i];

         if ((evt.eventType === 'MarkerRecorded') && (evt.markerRecordedEventAttributes.markerName === markerName) && (parseInt(evt.eventId, 10) > lastEventId)) {
            finalDetail = evt.markerRecordedEventAttributes.details;
            lastEventId = evt.eventId;
         }
      }
      return finalDetail;
   },

   /**
    * Get the raw event history
    * @returns {Array}
    */
   get_history: function () {
      return this._events;
   }



};


module.exports = DecisionTask;
