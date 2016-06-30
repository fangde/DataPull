/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:06
 * To change this template use File | Settings | File Templates.
 */

var visitModule = angular.module('Optimise.subjectVisit',[]);

visitModule.service('subjectVisits', function() {
    var subjectVisits = [];

    var clearAll = function() {
        subjectVisits = [];
    }

    var getSubjectVisits = function() {
        return subjectVisits;
    }

    var generateSEQ = function () {
        var SEQs = compileVisits();
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


    var compileVisits = function () {
        var seq = [];
        for (var e = 0; e < subjectVisits.length; e++) {
            seq.push(subjectVisits[e].VISITNUM);
        }
        return seq;
    }

    var addVisit = function (visit) {
        visit.VISITNUM = generateSEQ();
        //visit.SVSTDTC_display = visit.SVSTDTC.toDateString();
        visit.SVSTDTC_display = visit.SVSTDTC.getDate()+"/"+(parseInt(visit.SVSTDTC.getMonth()+1))+"/"+visit.SVSTDTC.getFullYear();
        visit.displayDate = visit.SVSTDTC.getDate()+"/"+(parseInt(visit.SVSTDTC.getMonth()+1))+"/"+visit.SVSTDTC.getFullYear();
        subjectVisits.push(visit);
    }


    return {
        addVisit:addVisit,
        getSubjectVisits: getSubjectVisits,
        clearAll: clearAll
    }

})

visitModule.factory('subjectVisit', function() {
    return function(USUBJID) {
        this.STUDYID= 'OPTIMISE';
        this.DOMAIN= 'SV';
        this.USUBJID= USUBJID;
        this.VISITNUM = '';
        this.VISIT= '';      //Visit Name
        this.SVSTDTC= '';     //Start Date/Time of Visit
        this.SVENDTC= '';    //End Date/Time of Visit
        this.SVSTDTC_display='';
        this.displayDate='';
    }
});