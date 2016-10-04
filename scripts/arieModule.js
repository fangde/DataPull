/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var arieModule = angular.module('Data.arie',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.exposure',
    'Optimise.questionnaire']);

arieModule.service('arieService', function() {
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

arieModule.service('arieData', function($http, $q, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            Exposure, exposures,
                                            arieService){

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
                reject(e.target.error());
                console.log("File not supported!")
            }
        });
    }


    var setData = function (objects) {
        headings = Object.keys(objects[0]);
        values = objects.slice(0);
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


    var generateOPTID = function(patientID) {
        return 'OPT-AF-03-'+patientID;
    }

    //ID,Recruitment,Age,DOB,Gender,DiseaseDuration,Onset,Diagnosis,Treatment,RelapseDate,FunctionalSystemsAffected,EDSS,9HPT_L1,9HPT_R1,9HPT_L2,9HPT_R2,25Ft_1,25Ft_2
    var toCDISC = function () {
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

            var DM = new Patient(generateOPTID(value['Subject ID']));
            DM.NHS_USUBJID = value['Subject ID'];
            DM.BRTHDTC = arieService.getDate(value['D.O.B']);
            var dmRecordItem = arieService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);

            var newVisit = new subjectVisit(generateOPTID(value['Subject ID']));
            newVisit.SVSTDTC = arieService.getDate(value['Date of EDSS/MSFC']);
            subjectVisits.addVisit(newVisit);
            var SV = subjectVisits.getSubjectVisits();
            for (var sv = 0; sv < SV.length; sv++) {
                var svRecordItem = arieService.getRecordItem(SV[sv]);
                fieldNameIndex++;
                RecordItems.push(svRecordItem);
            }

            var MH = new MedicalEvent(generateOPTID(value['Subject ID']),'Initial Symptom');
            MH.MHTERM = value['First Symptom'];
            MH.MHSCAT = 'Initial Symptom';
            MH.MHSTDTC = new Date(value['Date_FirstSymptom'],1,1);
            MH.displaySTDTC = MH.MHSTDTC.getFullYear();
            MH.displayLabel = MH.MHSTDTC.getFullYear();
            MH.displayDate = MH.MHSTDTC.getFullYear();

            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = arieService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }


            var newEDSS = new question(generateOPTID(value['Subject ID']), "EDSS");
            newEDSS.QSTEST = "EDSS-Total Human";
            newEDSS.QSSTRESC = value['EDSS'];

            questionnaires.addQuestion(arieService.getDate(value['Date of EDSS/MSFC']), newEDSS);

            var QS = questionnaires.getQuestionnaires();
            for (var ce = 0; ce < QS.length; ce++) {
                var ceRecordItem = arieService.getRecordItem(QS[ce]);
                fieldNameIndex++;
                RecordItems.push(ceRecordItem);
            }

            var aProcedure = new procedure(generateOPTID(value['Subject ID']), "Eight Metre Walk Test");
            aProcedure.PRSTDTC = arieService.getDate(value['Date of EDSS/MSFC']);
            aProcedure.PRLNKID = aProcedure.PRSTDTC+" "+"Eight Metre Walk Test";
            procedures.addProcedure(aProcedure);

            var PR = procedures.getProcedures();
            for (var ce = 0; ce < QS.length; ce++) {
                var prRecordItem = arieService.getRecordItem(PR[ce]);
                fieldNameIndex++;
                RecordItems.push(prRecordItem);
            }

            var aFinding1 = new findingAbout(generateOPTID(value['Subject ID']), 'Mobility', 'Functional Test', ''); // Is it mobility??
            aFinding1.FAORES = value['MSFC - 25ft walk'];
            aFinding1.FASTRESU = 'seconds';
            aFinding1.FADTC = arieService.getDate(value['Date of EDSS/MSFC']);
            aFinding1.FALNKID = arieService.getDate(value['Date of EDSS/MSFC'])+" "+"Eight Metre Walk Test";
            findingsAbout.addFinding(aFinding1);

            var aFinding2 = new findingAbout(generateOPTID(value['Subject ID']), 'Mobility', 'Functional Test', ''); // Is it mobility??
            aFinding2.FAORES = "";
            aFinding2.FASTRESU = 'seconds';
            aFinding2.FADTC = arieService.getDate(value['Date of EDSS/MSFC']);
            aFinding2.FALNKID = arieService.getDate(value['Date of EDSS/MSFC'])+" "+"Eight Metre Walk Test";
            findingsAbout.addFinding(aFinding2);

            var FA = findingsAbout.getFindings();
            for (var ce = 0; ce < FA.length; ce++) {
                var faRecordItem = arieService.getRecordItem(FA[ce]);
                fieldNameIndex++;
                RecordItems.push(faRecordItem);
            }

            if (value['Date commencing BG-12']!='') {
                var newExposure = new Exposure (generateOPTID(value['Subject ID']), "BG-12");
                newExposure.EXCAT = "Disease Modifying";
                newExposure.EXSTDTC = arieService.getDate(value['Date commencing BG-12']);
                newExposure.displayDate = newExposure.EXSTDTC.toDateString();
                newExposure.displayLabel = newExposure.EXTRT;

                exposures.addExposure(newExposure);

                var EX = exposures.getExposures();
                for (var ce = 0; ce < EX.length; ce++) {
                    var exRecordItem = arieService.getRecordItem(EX[ce]);
                    fieldNameIndex++;
                    RecordItems.push(exRecordItem);
                }
            }

            subjects.push(root);
        }

        return subjects;
    }

    var getID = function(index) {
        return generateOPTID(values[index]['Subject ID']);
        //return values[index];
    }

    return {
        getData: getData,
        print: print,
        setData: setData,
        toCDISC: toCDISC,
        getID: getID

    }


});
