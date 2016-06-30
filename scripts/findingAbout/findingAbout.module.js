/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:18
 * To change this template use File | Settings | File Templates.
 */

var findingModule = angular.module('Optimise.findingAbout',[]);

findingModule.factory('findingAbout', function() {
    return function(USUBJID, FAOBJ, FACAT, FASCAT) {
        var findingsAbout = {
            STUDYID: 'OPTIMISE',
            DOMAIN: 'FA',
            USUBJID: USUBJID,
            FASEQ: '',
            FATESTCD: '',
            FATEST: '',
            FAOBJ: FAOBJ,      //RRMS
            FACAT: FACAT,     //PRIMARY DIAGNOSIS
            FASCAT: FASCAT,    // ONSET COURSE
            FALOC: '',    //EYE
            FALAT: '',    //Right
            FATPT: '',    //Right
            FAMETHOD: '',    //MRI
            FAORES:'',
            FASTRESU:'',
            //FADTC: new Date (2015, 01, 01),
            FADTC: new Date (),
            FALNKID:''
        }
        return findingsAbout;
    }
});

findingModule.service('findingsAbout', function() {
    var findings = [];

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
        for (var e = 0; e < findings.length; e++) {
            seq.push(findings[e].FASEQ);
        }
        return seq;
    }

    var addFinding = function (newFinding) {
        newFinding.FASEQ = generateSEQ();
        findings.push(newFinding);
    }


    var getFindings = function() {
        return findings;
    }

    var clearAll = function(){
        findings = [];
    }

    return {
        addFinding: addFinding,
        getFindings: getFindings,
        clearAll: clearAll
    }
});
