/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:02
 * To change this template use File | Settings | File Templates.
 */

var questionnaireModule = angular.module('Optimise.questionnaire',[]);

/*10001 test8 password
10009 test2 password
*/
questionnaireModule.service('questionnaires', function () {
    var questionnaires = [];

    var clearAll = function() {
        questionnaires = [];
    }

    var generateSEQ = function () {
        return new Date().getTime() + Math.floor((Math.random() * 100) + 1);
    }

    var addQuestion = function (QSDTC, question) {
        question.QSSEQ = generateSEQ();
        question.QSDTC = new Date(QSDTC);
        questionnaires.push(question);
        //console.log(question);
    }

    var getQuestionnaires = function() {
        return questionnaires;
    }


    return {
        addQuestion: addQuestion,
        getQuestionnaires: getQuestionnaires,
        clearAll: clearAll
    }
})

questionnaireModule.factory('question', function () {
    return function(USUBJID, QSCAT) {
        this.STUDYID="OPTIMISE";
        this.USUBJID= USUBJID;
        this.QSSEQ= "";
        this.QSTESTCD= "";   // Question short name
        this.QSTEST= "";  // Question Name eg. EDSS-Pyramidal
        this.QSCAT= QSCAT;     // Category eg. EDSS
        this.QSORRES= "";   //Finding in Original Units
        this.QSSTRESC= ""; //Character Result/Finding in Standard Format
        this.QSSTRESN= ""; // ￼Numeric Finding in Standard Units
        this.VISITNUM= "";
        this.VISIT= "";
        this.QSDTC= "";
        this.DOMAIN="QS";
    }
});
