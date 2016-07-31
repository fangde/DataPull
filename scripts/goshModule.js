/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var goshModule = angular.module('Data.gosh',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.questionnaire']);

goshModule.service('goshService', function() {
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

goshModule.service('goshData', function($http, $q, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            goshService){

    var headings = [];
    var values = [];

    var getData = function (sourceFile) {
        //var Url   = "data/gosh(full).csv";
        //var Url   = "data/gosh.csv";
        //var Url   = "data/ClinicalData_Single.csv";
        //var Url   = "data/ClinicalData.csv";
        //var Url   = "data/GOSH/yael.csv";
        /*
        var Items = $http.get(Url).then(function(response){
            //console.log(response.data);
            return (response.data);
        });*/

        //var sourceFile = element.files[0];

        return $q(function(resolve, reject) {
            if (sourceFile.type.match(textType)) {
                var reader = new FileReader();
                reader.onloadend = (function (e) {
                    resolve(e.target.result);
                });
                reader.readAsText(sourceFile);
            } else {
                console.log("File not supported!")
            }
        });

          /*
            setTimeout(function() {
                var iMedReader = new FileReader();
                iMedReader.onloadend = function(e){
                    var data = e.target.result;
                    resolve(data);
                }
                iMedReader.readAsText(file);
            }, 500);
            */

        console.log(sourceFile.type);
        var textType = /csv.*/;


        //return "test";
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

    //ID,Recruitment,Age,DOB,Gender,DiseaseDuration,Onset,Diagnosis,Treatment,RelapseDate,FunctionalSystemsAffected,EDSS,9HPT_L1,9HPT_R1,9HPT_L2,9HPT_R2,25Ft_1,25Ft_2
    var toCDISC = function () {
        var subjects = [];
        for (var s = 0; s < values.length; s++) {
            /*
             var value = values[s];
             var RecordItems = [];
             var recordSet = [{"RecordItems":RecordItems}];
             var root = {"RecordSet":recordSet};
             var fieldNameIndex = 0;
             */
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

            var DM = new Patient(value['Name']);
            DM.NHS_USUBJID = value['Name'];
            DM.SEX = value['S'];
            DM.BRTHDTC = goshService.getDate(value['DOB']);
            DM.INVNAM = value['Hospital'];
            DM.ETHNIC = value['COB'];
            var dmRecordItem = goshService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);

//            var CE = new clinicalEvent(value['Name'],'Multiple Sclerosis Relapse','MS Relapse');
//            CE.CESTDTC = goshService.getDate(value['Last relapse']);
//            CE.CEENDTC = goshService.advanceDate(CE.CESTDTC, 7);
//            CE.displayDate = goshService.getDateString(CE.CESTDTC);
//            clinicalEvents.addEvent(CE);
//            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
//                var event = clinicalEvents.getClinicalEvents()[ce];
//                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:goshService.getRecordItem(event)};
//                var recordItem = goshService.getRecordItem(event);
//                fieldNameIndex++;
//                RecordItems.push(recordItem);
//            }
            var newVisit = new subjectVisit(value['Name']);
            newVisit.SVSTDTC = goshService.getDate(value['DateOfPresentation']);
            subjectVisits.addVisit(newVisit);
            var SV = subjectVisits.getSubjectVisits();
            for (var sv = 0; sv < SV.length; sv++) {
                //var svRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(SV[sv])};
                var svRecordItem = goshService.getRecordItem(SV[sv]);
                fieldNameIndex++;
                RecordItems.push(svRecordItem);
            }

            var MH = new MedicalEvent(value['Name'],'Primary Diagnosis');
            MH.MHTERM = value['PhenotypeAtPresentation'];
            if (MH.MHTERM=="ON")
                MH.MHTERM = "NMOSD Optic Neuritis";
            MH.MHSCAT = "Onset Course";
            MH.MHSTDTC = goshService.getDate(value['DateOfPresentation']);
            MH.displaySTDTC = MH.MHSTDTC.getFullYear();
            MH.displayLabel = MH.MHSTDTC.getFullYear();
            MH.displayDate = MH.MHSTDTC.getFullYear();

            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:goshService.getRecordItem(event)};
                var recordItem = goshService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var newEDSS = new question(value['Name'], "EDSS");
            newEDSS.QSTEST = "EDSS-Total Human";
            newEDSS.QSSTRESC = value['EDSS'];

            questionnaires.addQuestion(goshService.getDate(value['DateOfPresentation']), newEDSS);

            var QS = questionnaires.getQuestionnaires();
            for (var ce = 0; ce < QS.length; ce++) {
                //var ceRecordItem = {"fieldName":fieldNameIndex.toString(), value:goshService.getRecordItem(QS[ce])};
                var ceRecordItem = goshService.getRecordItem(QS[ce]);
                fieldNameIndex++;
                RecordItems.push(ceRecordItem);
            }

            subjects.push(root);
        }

        return subjects;
    }

    var getID = function(index) {
        return values[index]['Name'];
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
