/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 13:20
 * To change this template use File | Settings | File Templates.
 */

var patientModule = angular.module('Optimise.patient',[]);

patientModule.factory('Patient',function() {
    return function(USUBJID) {
        var demographic = {
            STUDYID :"OPTIMISE",
            DOMAIN :"DM",
            USUBJID :USUBJID,
            SUBJID : USUBJID,
            RFSTDTC :"",
            RFENDTC :"",
            DTHDTC:"",
            DTHFL :"",
            SITEID :"",
            INVNAM :"" ,
            SEX:"",
            BRTHDTC:"",
            ALCOHOL:"",
            SMOKER:"",
            DOMINANT:"",
            ETHNIC:"",
            COUNTRY:""
        }
        return demographic;
    }
});
