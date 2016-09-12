/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 28/02/2015
 * Time: 21:31
 * To change this template use File | Settings | File Templates.
 */

var immunogenicitySpecimenAssessmentModule = angular.module('Optimise.immunogenicitySpecimenAssessment',['Optimise.view','Optimise.record']);

immunogenicitySpecimenAssessmentModule.factory('ImmunogenicitySpecimenAssessment', function() {
    return function(USUBJID, ISTEST) {
        var assessment = {
            STUDYID :"OPTIMISE",
            DOMAIN :"IS",
            USUBJID :USUBJID,
            ISSEQ:"",
            ISIND:"",
            ISGRPID:"",
            ISREFID:"",
            ISTESTCD:"",
            ISTEST:ISTEST,
            ISCAT:"",
            ISORRES:"",
            ISORRESU:"",
            ISNAM:"",
            ISSPEC:"",
            ISMETHOD:"",
            //VISITNUM:"",
            VISIT:"",
            ISDTC:"",
            displayDate:'',
            displayLabel:''
        }
        return assessment;
    }
});

immunogenicitySpecimenAssessmentModule.service('immunogenicitySpecimenAssessments', function(ImmunogenicitySpecimenAssessment,
                                                                                            viewService,
                                                                                            records){
    var immunogenicitySpecimenAssessments = [];

    var deleteISAs = function() {
        immunogenicitySpecimenAssessments=[];
    }
    var currentCollectionDate = new Date();

    var printISAs= function () {
        console.log(immunogenicitySpecimenAssessments);
    }

    var getAssessments = function () {
        return immunogenicitySpecimenAssessments;
    }

    var populateISA = function (RecordItems) {
        var newISA = new ImmunogenicitySpecimenAssessment();
        for (var i = 0; i < RecordItems.length; i++){
            switch (RecordItems[i].fieldName) {
                case 'STUDYID':{
                    newISA.STUDYID = RecordItems[i].value;
                    break;
                }
                case 'DOMAIN':{
                    newISA.DOMAIN = RecordItems[i].value;
                    break;
                }
                case 'USUBJID':{
                    newISA.USUBJID = RecordItems[i].value;
                    break;
                }
                case 'ISSEQ':{
                    newISA.ISSEQ = parseInt(RecordItems[i].value);
                    break;
                }
                case 'ISGRPID':{
                    newISA.ISGRPID = RecordItems[i].value;
                    break;
                }
                case 'ISREFID':{
                    newISA.ISREFID = RecordItems[i].value;
                    break;
                }
                case 'ISTESTCD':{
                    newISA.ISTESTCD = RecordItems[i].value;
                    break;
                }
                case 'ISTEST':{
                    newISA.ISTEST = RecordItems[i].value;
                    break;
                }
                case 'ISCAT':{
                    newISA.ISCAT = RecordItems[i].value;
                    break;
                }
                case 'ISIND':{
                    newISA.ISIND = RecordItems[i].value;
                    break;
                }
                case 'ISORRES':{
                    newISA.ISORRES = RecordItems[i].value;
                    break;
                }
                case 'ISORRESU':{
                    newISA.ISORRESU = RecordItems[i].value;
                    break;
                }
                case 'ISNAM':{
                    newISA.ISNAM = RecordItems[i].value;
                    break;
                }
                case 'ISSPEC':{
                    newISA.ISSPEC = RecordItems[i].value;
                    break;
                }
                case 'ISMETHOD':{
                    newISA.ISMETHOD = RecordItems[i].value;
                    break;
                }
                /*
                case 'VISITNUM':{
                    newISA.VISITNUM = RecordItems[i].value;
                    break;
                }*/
                case 'VISIT':{
                    newISA.VISIT = RecordItems[i].value;
                    break;
                }
                case 'ISDTC':{
                    newISA.ISDTC = records.formatStringToDate(RecordItems[i].value);
                    break;
                }
                case 'displayDate':{
                    newISA.displayDate = RecordItems[i].value;
                    break;
                }
                case 'displayLabel':{
                    newISA.displayLabel = RecordItems[i].value;
                    break;
                }
            }
        }
        immunogenicitySpecimenAssessments.push(newISA);

    }

    var getAssessmentResult = function(ISTEST,ISDTC) {
        var dateCriteria = ISDTC.toDateString();
        for (var t = 0; t < immunogenicitySpecimenAssessments.length; t++){
            if (dateCriteria==immunogenicitySpecimenAssessments[t].ISDTC.toDateString()){
                if (ISTEST==immunogenicitySpecimenAssessments[t].ISTEST) {
                    return immunogenicitySpecimenAssessments[t];
                }
            }
        }
        return null;
    }

    var generateSEQ = function () {
        var SEQs = compileAssessments();
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


    var compileAssessments = function () {
        var seq = [];
        for (var e = 0; e < immunogenicitySpecimenAssessments.length; e++) {
            seq.push(immunogenicitySpecimenAssessments[e].ISSEQ);
        }
        return seq;
    }

    var addResult = function (IS){
        IS.ISSEQ = generateSEQ();
        immunogenicitySpecimenAssessments.push(IS);
        if (!viewService.workOffline())
            records.saveRecord(IS);
    }

    var editResult = function (is, recordToChange, valueToChange){
        var USUBJID = {fieldName: "USUBJID", value: is.USUBJID};
        var ISSEQ = {fieldName:"ISSEQ", value: is.ISSEQ};

        var RECTOCHANGE = {fieldName:recordToChange, value: valueToChange};
        var idRecord = [USUBJID, ISSEQ];
        var valueRecord = [RECTOCHANGE];

        if (!viewService.workOffline())
            records.editRecord(idRecord, valueRecord);
    }

    var deleteResult = function (IS){
        var index = immunogenicitySpecimenAssessments.indexOf(IS);
        console.log('deleting');
        console.log(IS);
        if (index > -1) {
            immunogenicitySpecimenAssessments.splice(index, 1);
            if (!viewService.workOffline())
                records.deleteRecord(IS);
        }
    }

    var getUniqueDates = function () {
        var uniqueDates = [];

        for (var d = 0; d < immunogenicitySpecimenAssessments.length; d++){   // select events that happened on different days
            //console.log(immunogenicitySpecimenAssessments[d].ISDTC);
            //console.log(immunogenicitySpecimenAssessments[d].ISDTC.toDateString());
            if (!dateExists(uniqueDates, immunogenicitySpecimenAssessments[d].ISDTC.toDateString())){
                uniqueDates.push(immunogenicitySpecimenAssessments[d]);
            }
        }
        return uniqueDates;
    }

    var dateExists = function (uniqueDates, ISDTC){
        for (var d = 0; d < uniqueDates.length; d++) {
            if (uniqueDates[d].ISDTC.toDateString() == ISDTC) {
                return true;
            }
        }
        return false;
    }

    var getAssessmentResultsByDate = function (LBDTC) {
        var testsOnDate = [];
        var dateCriteria = LBDTC.toDateString();
        for (var t = 0; t < immunogenicitySpecimenAssessments.length; t++){
            //console.log(immunogenicitySpecimenAssessments[t].ISDTC.toDateString());
            //console.log(LBDTC.toDateString());
            if (dateCriteria==immunogenicitySpecimenAssessments[t].ISDTC.toDateString()){
                testsOnDate.push(immunogenicitySpecimenAssessments[t]);
            }
        }
        return testsOnDate;
    };

    var getAssessmentsOfCurrentDate = function() {
        return getAssessmentResultsByDate(currentCollectionDate);
    }

    var setCurrentCollectionDate = function(event) {
        if (event.DOMAIN=='IS') {
            currentCollectionDate = event.ISDTC;
        }
        else if (event.DOMAIN=='LB'){
            currentCollectionDate = event.LBDTC;
        }
        else  {
            currentCollectionDate = event.NVDTC;
        }
        //console.log("setting collection day");
        //console.log(currentCollectionDate);
    }

    var getAssessmentByDate = function (ISDTC) {
        var testsOnDate = [];
        var dateCriteria = ISDTC.toDateString();
        for (var t = 0; t < immunogenicitySpecimenAssessments.length; t++){
            //console.log(immunogenicitySpecimenAssessments[t].ISDTC.toDateString());
            //console.log(ISDTC.toDateString());
            if (dateCriteria==immunogenicitySpecimenAssessments[t].ISDTC.toDateString()){
                testsOnDate.push(immunogenicitySpecimenAssessments[t]);
            }
        }
        return testsOnDate;
    };

    return {
        printISAs:printISAs,
        populateISA:populateISA,
        //populateManual:populateManual,
        getAssessmentResult: getAssessmentResult,
        addResult: addResult,
        deleteResult:deleteResult,
        getUniqueDates:getUniqueDates,
        getAssessmentsOfCurrentDate: getAssessmentsOfCurrentDate,
        setCurrentCollectionDate:setCurrentCollectionDate,
        getAssessmentByDate:getAssessmentByDate,
        editResult:editResult,
        deleteISAs:deleteISAs,
        getAssessments:getAssessments
    };
});
