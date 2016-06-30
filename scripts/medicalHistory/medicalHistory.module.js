/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:16
 * To change this template use File | Settings | File Templates.
 */

var medicalHistoryModule = angular.module('Optimise.medicalHistory',[]);

medicalHistoryModule.service('medicalHistory', function() {
    var medicalHistory = [];

    var getMedicalHistory = function() {
        return medicalHistory;
    }

    var generateSEQ = function () {
        var SEQs = compileHistory();
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

    var compileHistory = function () {
        var seq = [];
        for (var e = 0; e < medicalHistory.length; e++) {
            seq.push(medicalHistory[e].MHSEQ);
        }
        return seq;
    }

    var addOccurence = function (newOccurence) {
        newOccurence.MHSEQ = generateSEQ();
        /*
        if (newOccurence.MHSTDTC != '') {
            newOccurence.displayLabel = newOccurence.MHSTDTC.getFullYear();
            newOccurence.displayDate = newOccurence.MHSTDTC.getFullYear();
        } */
        medicalHistory.push(newOccurence);
    }

    var clearAll = function(){
        medicalHistory = [];
    }

    return {
        getMedicalHistory: getMedicalHistory,
        addOccurence: addOccurence,
        clearAll: clearAll
    }
});

medicalHistoryModule.factory('MedicalEvent', function() {

    return function(USUBJID, mhcat) {
        var medicalHistory = {
            STUDYID: 'OPTIMISE',
            DOMAIN: 'MH',
            USUBJID: USUBJID,
            MHSEQ: '',
            MHCAT: mhcat,
            MHSCAT: '',
            MHTERM: '',
            MHSTDTC: '',
            MHENDTC: '',
            MHENRTPT: '',
            MHLOC: '',
            MHLAT: '',    //LEFT/ Right /Bilateral
            displaySTDTC:'',
            displayENDTC:'',
            displayLabel:'',
            displayDate:''
        }
        return medicalHistory;
    }
});

