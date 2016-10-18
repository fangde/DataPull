/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var chxModule = angular.module('Data.chx',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.questionnaire']);

chxModule.service('chxService', function() {

    var getRecordItem  = function (aRecord) {
        var keys = Object.keys(aRecord);
        var keysAndItems = [];
        var newRecordItem = {"RecordItems":keysAndItems};

        for (var k = 0; k < keys.length; k++){
            var keyAndItem = {"fieldName":keys[k], "value": aRecord[keys[k]]};
            keysAndItems.push(keyAndItem);
        }
        return newRecordItem;
    }

    var getDate = function(dateString) {
        var dobArray = dateString.split("/");
        var year = parseInt(dobArray[2]);
        var month = parseInt(dobArray[1])-1;
        var day = parseInt(dobArray[0]);
        var date = new Date(year, month, day);

        return date;
    }

    var getDateString = function(date) {
        var month = parseInt(date.getMonth())+1;
        var year = date.getFullYear();
        return month+"/"+year;
    }

    var advanceDate = function (stdtc, days) {
        var endtc = new Date(stdtc);
        endtc.setDate(stdtc.getDate()+days);
        return endtc;
    }

    return {
        getRecordItem: getRecordItem,
        getDate: getDate,
        advanceDate: advanceDate,
        getDateString: getDateString
    }
})

chxModule.service('chxData', function($http, $q, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            Exposure, exposures,
                                            chxService){

    var headings = [];
    var values = [];

    var getData = function (sourceFile) {
        return $q(function(resolve, reject) {
            var textType = /csv.*/;
            if (sourceFile.type.match(textType)) {
                var reader = new FileReader();
                reader.onloadend = (function (e) {
                    resolve(e.target.result);
                });
                reader.readAsText(sourceFile);
            } else {
                reject("File not supported!");
            }
        });
    }

    var generateOPTID = function(patientID) {
        return 'OPT-CX-03-'+patientID;
    }

    var getFingolimodData = function () {
        var Url   = "data/CHX/Fingolimod.csv";
        var promise = $http.get(Url).then(function(response){
            //console.log(response.data);
            return (response.data);
        });

        return promise;
    }

    var getTecfideraData = function () {
        var Url   = "data/CHX/Tecfidera.csv";
        var promise = $http.get(Url).then(function(response){
            //console.log(response.data);
            return (response.data);
        });

        return promise;
    }

    var setData = function (objects) {
        headings = Object.keys(objects[0]);
        values = objects.slice(0);
        return values;
    }

    var setDataFromAccess = function (domainData, domains) {
        //var domains = Object.keys(domainData);
        for (var d = 0; d < domains.length; d++) {
            if ((domainData[domains[d]] != null)&&(domainData[domains[d]].length > 0)) {
                headings[domains[d]] = Object.keys(domainData[domains[d]][0]);
                values[domains[d]] = domainData[domains[d]].slice(0);
            }
        }
        //console.log(domains);
    }

    var print = function () {
        var display = "";
        angular.forEach(values, function (value, key, object) {
            var indices = Object.keys(headings);
            display=display.concat(headings[0]+"\t"+value[headings[0]]+"\n");
            for (var i = 1; i < indices.length; i++) {
                var headingName = headings[i];
                if (headingName != null)
                    display = display.concat(headings[i]+"\t\t\t"+value[headingName]+"\n");
            }
            display=display.concat("\n\n");
        });

        return display;
    }

    var printAccess = function(domains) {
        var display = "";
        //console.log(values);
        //console.log(headings);

        angular.forEach(domains, function (domain) {
            angular.forEach(values[domain], function (value) {
                display=display.concat(headings[domain][0]+"\t"+value[headings[domain][0]]+"\n");
                for (var i = 1; i < headings[domain].length; i++) {
                    var headingName = headings[domain][i];
                    if (headingName != null)
                        display = display.concat(headings[domain][i]+"\t\t\t"+value[headingName]+"\n");
                }
                display=display.concat("\n\n");
            });
        });

        return display;
    }

    var toCDISC_Fingolimod = function () {
        var subjects = [];
        for (var s = 0; s < values.length; s++) {
            var value = values[s];
            var RecordItems = [];
            var recordSet = [{"RecordItems":RecordItems}];
            var root = {"RecordSet":RecordItems};
            var fieldNameIndex = 0;

            findingsAbout.clearAll();
            medicalHistory.clearAll();
            procedures.clearAll();
            questionnaires.clearAll();
            relationships.clearAll();
            subjectVisits.clearAll();
            clinicalEvents.clearAll();
            exposures.clearAll();

            var hospNumber = generateOPTID(value['HospNo']);
            var DM = new Patient(hospNumber);
            DM.BRTHDTC = chxService.getDate(value['DOB']);
            DM.SUBJID = value['Surname'] +", "+ value['FirstName'];
            DM.NHS_USUBJID = value['Surname'] +", "+ value['FirstName'] +" ("+value['DOB']+")";;
            var dmRecordItem = chxService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);


            var MH = new MedicalEvent(hospNumber,'Primary Diagnosis');
            MH.MHTERM = value['MStype'];
            MH.MHSCAT = "Onset Course";
            MH.MHSTDTC = chxService.getDate(value['dateDx']);
            MH.displaySTDTC = MH.MHSTDTC.getFullYear();
            MH.displayLabel = MH.MHSTDTC.getFullYear();
            MH.displayDate = MH.MHSTDTC.getFullYear();

            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = chxService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var newExposure = new Exposure (hospNumber, 'Fingalimod');
            newExposure.EXSTDTC = chxService.getDate(value['DateStarted']);
            if (value['DateStopped'] != "")
                newExposure.EXENDTC = chxService.getDate(value['DateStopped']);
            else
                newExposure.EXENDTC = '';
            newExposure.displayDate = newExposure.EXSTDTC.toDateString();
            newExposure.displayLabel = newExposure.EXTRT;
            newExposure.EXCAT = 'Disease Modifying';
            exposures.addExposure(newExposure);

            for (var ex = 0; ex < exposures.getExposures().length; ex++) {
                var exposure = exposures.getExposures()[ex];
                var recordItem = chxService.getRecordItem(exposure);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            subjects.push(root);
        }

        return subjects;
    }

    var subjectsExists = function(existingSubjects, name) {
        for (var s = 0; s < existingSubjects.length; s++) {
            if ((existingSubjects[s]['Surname']+", "+existingSubjects[s]['FirstName'])==name){
                console.log("Duplicated!");
                console.log(existingSubjects[s]['Surname']+", "+existingSubjects[s]['FirstName']);
                console.log(name);
                return true;
            }
        }
        return false;
    }

    var toCDISC_Tecfidera = function (existingSubjects) {
        var subjects = [];
        for (var s = 0; s < values.length; s++) {
            var value = values[s];
            var RecordItems = [];
            var recordSet = [{"RecordItems":RecordItems}];
            var root = {"RecordSet":RecordItems};
            var fieldNameIndex = 0;

            findingsAbout.clearAll();
            medicalHistory.clearAll();
            procedures.clearAll();
            questionnaires.clearAll();
            relationships.clearAll();
            subjectVisits.clearAll();
            clinicalEvents.clearAll();
            exposures.clearAll();

            var NHS_USUBJID = value['Patient Surname '] +", "+ value['Patient First name ']+" ("+value['DOB ']+")";;
            var USUBJID = generateOPTID(value['Hospital No ']);
            //if (!subjectsExists(existingSubjects, name)) {
            var DM = new Patient(USUBJID);
            DM.BRTHDTC = chxService.getDate(value['DOB ']);
            DM.NHS_USUBJID = NHS_USUBJID;
            var dmRecordItem = chxService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);
            //}

            var MH = new MedicalEvent(USUBJID,'Primary Diagnosis');
            MH.MHTERM = 'Relapse Remitting Multiple Sclerosis';
            MH.MHSCAT = "Onset Course";
            MH.MHSTDTC = chxService.getDate(value['Diagnosis']);
            MH.displaySTDTC = MH.MHSTDTC.getFullYear();
            MH.displayLabel = MH.MHSTDTC.getFullYear();
            MH.displayDate = MH.MHSTDTC.getFullYear();

            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = chxService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            if (value['Start Date'] != "") {
                var newExposure = new Exposure (USUBJID, 'Dimethyl fumarate');
                newExposure.EXSTDTC = chxService.getDate(value['Start Date']);
                if (value['DateStopped'] != "")
                    newExposure.EXENDTC = chxService.getDate(value['Date']);
                else
                    newExposure.EXENDTC = '';
                newExposure.displayDate = newExposure.EXSTDTC.toDateString();
                newExposure.displayLabel = newExposure.EXTRT;
                newExposure.EXCAT = 'Disease Modifying';
                exposures.addExposure(newExposure);
            }

            for (var ex = 0; ex < exposures.getExposures().length; ex++) {
                var exposure = exposures.getExposures()[ex];
                var recordItem = chxService.getRecordItem(exposure);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }
            subjects.push(root);
        }

        return subjects;
    }

    var addMedicalHistory = function(USUBJID, MHCAT, MHSCAT, MHSTDTC, MHTERM) {
        var MH = new MedicalEvent(USUBJID, MHCAT);
        MH.MHSTDTC = MHSTDTC;
        MH.MHTERM = MHTERM;
        MH.MHSCAT = MHSCAT;
        MH.displaySTDTC = MHSTDTC.getFullYear();
        medicalHistory.addOccurence(MH);
    }

    var ID_CDISC = function(RecordItems, value) {

        var USUBJID = generateOPTID(value['mstcid']);
        var DM = new Patient(USUBJID);
        DM.NHS_USUBJID = value['lastName']+", "+value['firstName']+" ("+value['dateOfBirth']+")";

        DM.SEX = value['sex'];
        DM.BRTHDTC = chxService.getDate(value['dateOfBirth']);
        var dmRecordItem = chxService.getRecordItem(DM);
        RecordItems.push(dmRecordItem);

        if (value['ageonset'] != ""){
            var brthdtc = new Date(DM.BRTHDTC);
            var diagnosisDate = new Date();
            diagnosisDate.setFullYear(brthdtc.getFullYear()+parseInt(value['ageonset']));
            addMedicalHistory(USUBJID, 'Primary Diagnosis', 'Onset Course', diagnosisDate,
                'Relapsing Remitting Multiple Sclerosis');
        }
    }

    var addEvent = function(CEBODYSYS, CEGRPID, relapse) {
        var USUBJID = generateOPTID(relapse['mstcID']);
        var newEvent = new clinicalEvent(USUBJID, 'Multiple Sclerosis Relapse', 'MS Relapse');
        newEvent.CEBODSYS = CEBODYSYS;
        newEvent.CEGRPID = CEGRPID;
        newEvent.CESTDTC = chxService.getDate(relapse["startDate"]);
        newEvent.CELNKID = newEvent.CESTDTC+" Multiple Sclerosis Relapse";
        newEvent.displayDate = parseInt(newEvent.CESTDTC.getMonth()+1)+"/"+newEvent.CESTDTC.getFullYear();
        clinicalEvents.addEvent(newEvent);

        return newEvent;
    }

    var addRelapse = function(CEBODYSYS, relapse) {
        var currentCE = clinicalEvents.getCurrentEvent();

        if (currentCE.length == 0) { // if new relapse
            var newCEGRPID = clinicalEvents.getNewCEGRPID();
            var newEvent = addEvent(CEBODYSYS, newCEGRPID, relapse)
            clinicalEvents.setEvent(newEvent);
        }
        else {  // if there are existing events in this relapse
            //if (inFunctionalSys != null) {  // if this event already exists
            var newEvent = addEvent(CEBODYSYS, currentCE[0].CEGRPID, relapse);
        }
    }

    var RE_CDISC = function(patientID) {
        for (var r = 0; r < values['CE'].length; r++) {
            if (patientID == generateOPTID(values['CE'][r]['mstcID'])){
                var relapse = values['CE'][r];
                clinicalEvents.clearEvent();
                addRelapse('', relapse);
            }
        }
    }

    var EX_CDISC = function(patientID) {
        for (var e = 0; e < values['EX'].length; e++) {
            if (patientID == generateOPTID(values['EX'][e]['mstcID'])) {
                var treatment = values['EX'][e];
                var USUBJID = patientID;
                var newExposure = new Exposure (USUBJID, treatment['dmtName']);
                newExposure.EXSTDTC = chxService.getDate(treatment['dmtStartDate']);
                if (treatment['dmtStopDate'] != '') {
                    newExposure.EXENDTC = chxService.getDate(treatment['dmtStopDate']);
                }
                newExposure.displayDate = newExposure.EXSTDTC.toDateString();
                newExposure.displayLabel = newExposure.EXTRT;
                newExposure.EXCAT = 'Disease Modifying';
                exposures.addExposure(newExposure);
            }
        }
    }

    var toCDISC_Access = function () {
        var subjects = [];
        for (var s = 0; s < values['DM'].length; s++) {

            var value = values['DM'][s];
            var RecordItems = [];
            var root = {"RecordSet":RecordItems};

            findingsAbout.clearAll();
            medicalHistory.clearAll();
            procedures.clearAll();
            questionnaires.clearAll();
            relationships.clearAll();
            subjectVisits.clearAll();
            clinicalEvents.clearAll();
            exposures.clearAll();
            clinicalEvents.clearEvent();

            ID_CDISC(RecordItems, value);
            RE_CDISC(generateOPTID(value['mstcid']));
            EX_CDISC(generateOPTID(value['mstcid']));


            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = chxService.getRecordItem(event);
                RecordItems.push(recordItem);
            }

            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
                var event = clinicalEvents.getClinicalEvents()[ce];
                var recordItem = chxService.getRecordItem(event);
                RecordItems.push(recordItem);
            }

            for (var ex = 0; ex < exposures.getExposures().length; ex++) {
                var exposure = exposures.getExposures()[ex];
                var recordItem = chxService.getRecordItem(exposure);
                RecordItems.push(recordItem);
            }

            subjects.push(root);
        }

        return subjects;
    }

    var getFingolimodID = function(values, index) {

        //return values[index]['Surname']+", "+values[index]['FirstName'];
        return generateOPTID(values[index]['HospNo']);
        //return values[index];
    }

    var getFingolimodName = function(values, index) {
        return values[index]['Surname']+", "+values[index]['FirstName']+" ("+values[index]['DOB']+")";
    }

    var getTecfideraID = function(values, index) {
        return generateOPTID(values[index]['Hospital No ']);
        //return values[index];
    }

    var getTecfideraName = function(values, index) {
        return values[index]['Patient Surname ']+", "+values[index]['Patient First name ']+" ("+values[index]['DOB ']+")";;
    }


    var getAccessID = function(index) {
        return generateOPTID(values['DM'][index]['mstcid']);//return values[index];
    }

    var getAccessName = function(index) {
        return values['DM'][index]['lastName']+", "+values['DM'][index]['firstName']+" ("+values['DM'][index]['dateOfBirth']+")";
    }

    return {
        getData: getData,
        getFingolimodData: getFingolimodData,
        getFingolimodName: getFingolimodName,
        getTecfideraData: getTecfideraData,
        print: print,
        printAccess: printAccess,
        setData: setData,
        setDataFromAccess: setDataFromAccess,
        toCDISC_Fingolimod: toCDISC_Fingolimod,
        getTecfideraName: getTecfideraName,
        toCDISC_Tecfidera: toCDISC_Tecfidera,
        toCDISC_Access: toCDISC_Access,
        getFingolimodID: getFingolimodID,
        getTecfideraID: getTecfideraID,
        getAccessName: getAccessName,
        getAccessID: getAccessID
    }
});
