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

chxModule.service('chxData', function($http, Patient,
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

    var toCDISC_Fingalimod = function () {
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

            var name = value['Surname'] +", "+ value['FirstName']
            var DM = new Patient(name);
            DM.BRTHDTC = chxService.getDate(value['DOB']);
            var dmRecordItem = chxService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);


            var MH = new MedicalEvent(name,'Primary Diagnosis');
            MH.MHTERM = value['MSType'];
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

            var newExposure = new Exposure (name, 'Fingalimod');
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

            var name = value['Patient Surname '] +", "+ value['Patient First name '];
            if (!subjectsExists(existingSubjects, name)) {
                var DM = new Patient(name);
                DM.BRTHDTC = chxService.getDate(value['DOB ']);
                var dmRecordItem = chxService.getRecordItem(DM);
                fieldNameIndex++;
                RecordItems.push(dmRecordItem);
            }

            var MH = new MedicalEvent(name,'Primary Diagnosis');
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
                var newExposure = new Exposure (name, 'Dimethyl fumarate');
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

    var getFingolimodID = function(values, index) {

        return values[index]['Surname']+", "+values[index]['FirstName'];
        //return values[index];
    }

    var getTecfideraID = function(values, index) {
        return values[index]['Patient Surname ']+", "+values[index]['Patient First name '];
        //return values[index];
    }

    return {
        getFingolimodData: getFingolimodData,
        getTecfideraData: getTecfideraData,
        print: print,
        setData: setData,
        toCDISC_Fingalimod: toCDISC_Fingalimod,
        toCDISC_Tecfidera: toCDISC_Tecfidera,
        getFingolimodID: getFingolimodID,
        getTecfideraID: getTecfideraID
    }
});
