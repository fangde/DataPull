/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:13
 * To change this template use File | Settings | File Templates.
 */

var procedureModule = angular.module('Optimise.procedure',[]);

procedureModule.factory('procedure', function () {
    return function(USUBJID, PRTRT) {
        this.USUBJID= USUBJID;
        this.STUDYID= 'OPTIMISE';
        this.DOMAIN="PR";
        this.PRSEQ= "";
        this.PRTRT= PRTRT;   // Question short name
        this.PRSTDTC= "";
        this.PRLNKID='';
        this.PRLOC='';
        this.PRLAT='';
        this.displayLabel='';
        this.displayDate='';
        this.XNATExperimentID='';
        this.XNATExperimentURI='';
    }
})

procedureModule.service('procedures', function (){

    var procedures = [];

    var clearAll = function() {
        procedures = [];
    }

    var getProcedures = function() {
        return procedures;
    }

    var generateSEQ = function () {
        var SEQs = compileProcedures();
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


    var compileProcedures = function () {
        var seq = [];
        for (var e = 0; e < procedures.length; e++) {
            seq.push(procedures[e].PRSEQ);
        }
        return seq;
    }

    var addProcedure = function(procedure)
    {
        procedure.PRSEQ = generateSEQ();
        procedures.push(procedure);
    }



    return {
        addProcedure:addProcedure,
        getProcedures: getProcedures,
        clearAll: clearAll

    };
})