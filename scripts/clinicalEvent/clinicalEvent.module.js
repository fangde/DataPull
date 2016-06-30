/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:24
 * To change this template use File | Settings | File Templates.
 */

var clinicalEventModule = angular.module('Optimise.clinicalEvent',[]);

clinicalEventModule.service('clinicalEvents', function() {
    var clinicalEvents = [];
    var currentEvent = null;

    var clearAll = function() {
        clinicalEvents = [];
    }

    var compileGrpIds = function () {
        var seq = [];
        for (var e = 0; e < clinicalEvents.length; e++) {
            seq.push(clinicalEvents[e].CEGRPID);
        }
        return seq;
    }

    var getNewCEGRPID = function() {
        var SEQs = compileGrpIds();
        if (SEQs.length > 0) {
            SEQs.sort(sortNumber);
            return (SEQs[SEQs.length-1]+1);
        }
        else {
            return 0;
        }
    }

    var generateSEQ = function () {
        var SEQs = compileEvents();
        if (SEQs.length > 0) {
            SEQs.sort(sortNumber);
            return (SEQs[SEQs.length-1]+1);
        }
        else {
            return 0;
        }
    }

    function sortNumber(a,b) {
        return a - b;
    }


    var compileEvents = function () {
        var seq = [];
        for (var e = 0; e < clinicalEvents.length; e++) {
            seq.push(clinicalEvents[e].CESEQ);
        }
        return seq;
    }

    var addEvent = function (newEvent) {
        newEvent.CESEQ = generateSEQ();
        clinicalEvents.push(newEvent);
    }

    var setEvent = function (event) {
        if (event != null)
        //currentEvent = getEventsByTerm(event.CECAT, event.CETERM, event.CESTDTC);
            if (event.CETERM == 'Multiple Sclerosis Relapse') {
                currentEvent =  getEventsByCatTermAndGroupID(event.CECAT, "Multiple Sclerosis Relapse", event.CEGRPID);
            }
            else
                currentEvent =  getEventsByTerm(event.CECAT, "Multiple Sclerosis Relapse", event.CESTDTC);
        else
            currentEvent = [];
    }

    var getEventsByTerm = function (CECAT, CETERM, CESTDTC) {   // eg. all 'multiple sclerosis relapses'
        var events = [];
        for (var e = 0; e < clinicalEvents.length; e++) {
            if ((clinicalEvents[e].CETERM == CETERM) && (clinicalEvents[e].CECAT == CECAT))
            {
                if  (clinicalEvents[e].CESTDTC.toDateString() == CESTDTC.toDateString()){
                    events.push(clinicalEvents[e]);
                }
            }
        }
        return events;
    }

    var getEventsByCatTermAndGroupID = function (CECAT, CETERM, CEGRPID) {   // eg. all 'multiple sclerosis relapses'
        var events = [];
        for (var e = 0; e < clinicalEvents.length; e++) {
            if ((clinicalEvents[e].CETERM == CETERM)
                && (clinicalEvents[e].CECAT == CECAT)
                && (clinicalEvents[e].CEGRPID == CEGRPID))
            {
                events.push(clinicalEvents[e]);
            }
        }
        return events;
    }

    var getClinicalEvents = function () {
        return clinicalEvents;
    }

    var getCurrentEvent = function () {
        return currentEvent;
    }

    var clearEvent = function () {
        currentEvent = [];
    }

    return {
        addEvent: addEvent,
        getClinicalEvents: getClinicalEvents,
        getNewCEGRPID: getNewCEGRPID,
        clearAll: clearAll,
        setEvent: setEvent,
        getCurrentEvent: getCurrentEvent,
        clearEvent: clearEvent
    }
});

clinicalEventModule.factory('clinicalEvent', function() {
    return function(USUBJID, CETERM, CECAT) {
        var clinicalEvent = {
            STUDYID: 'OPTIMISE',
            DOMAIN: 'CE',
            USUBJID: USUBJID,
            CESEQ: '',
            CEGRPID:'',
            CELNKID: '',
            CETERM: CETERM,
            CESEV: '',
            CESTDTC: '',
            CEENDTC: '',
            CEBODSYS: '',
            CEOUT: '',
            displayLabel:'',
            displayDate:'',
            CECAT:CECAT
        }
        return clinicalEvent;
    }
});
