/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var gourabModule = angular.module('Data.gourab',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.questionnaire']);

gourabModule.service('gourabService', function() {
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

gourabModule.service('gourabData', function($http, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            gourabService){

    var headings = [];
    var values = [];

    var getData = function () {
        //var Url   = "data/gourab(full).csv";
        //var Url   = "data/gourab.csv";
        //var Url   = "data/ClinicalData_Single.csv";
        //var Url   = "data/ClinicalData.csv";
       var Url   = "data/GourabData.csv";
        var Items = $http.get(Url).then(function(response){
            return (response.data);
        });

        return Items;
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

            var DM = new Patient(value['Subject ID']);
            DM.SEX = value['Gender'];
            DM.BRTHDTC = gourabService.getDate(value['DOB']);
            DM.INVNAM = "Gourab Datta";
            var dmRecordItem = gourabService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);

            var CE = new clinicalEvent(value['Subject ID'],'Multiple Sclerosis Relapse','MS Relapse');
            CE.CESTDTC = gourabService.getDate(value['Last relapse']);
            CE.CEENDTC = gourabService.advanceDate(CE.CESTDTC, 7);
            CE.displayDate = gourabService.getDateString(CE.CESTDTC);
            clinicalEvents.addEvent(CE);
            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
                var event = clinicalEvents.getClinicalEvents()[ce];
                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(event)};
                var recordItem = gourabService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var MH = new MedicalEvent(value['Subject ID'],'Primary Diagnosis');
            MH.MHTERM = value['MS type'];
            MH.MHSCAT = "Onset Course";
            MH.MHSTDTC = gourabService.getDate(value['Onset Date']);
            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(event)};
                var recordItem = gourabService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var newVisit = new subjectVisit(value['Subject ID']);
            newVisit.SVSTDTC = gourabService.getDate(value['Recruitment date']);
            //console.log(value['Recruitment date']);
            //console.log(newVisit.SVSTDTC);
            subjectVisits.addVisit(newVisit);
            var SV = subjectVisits.getSubjectVisits();
            for (var sv = 0; sv < SV.length; sv++) {
                //var svRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(SV[sv])};
                var svRecordItem = gourabService.getRecordItem(SV[sv]);
                fieldNameIndex++;
                RecordItems.push(svRecordItem);
            }

            var PRTRT = 'Eight Metre Walk Test';
            var FeetWalkTest = new procedure(value['Subject ID'], PRTRT);
            FeetWalkTest.PRSTDTC = gourabService.getDate(value['Recruitment date']);
            FeetWalkTest.PRLNKID = FeetWalkTest.PRSTDTC+" "+PRTRT;
            procedures.addProcedure(FeetWalkTest);

            var FA_FeetWalkTest1 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', ''); // Is it mobility??
            FA_FeetWalkTest1.FAORES = value['25Ft walk 1'];
            FA_FeetWalkTest1.FASTRESU = 'seconds';
            FA_FeetWalkTest1.FADTC = gourabService.getDate(value['Recruitment date']);
            FA_FeetWalkTest1.FALNKID = FA_FeetWalkTest1.FADTC+" "+PRTRT;
            findingsAbout.addFinding(FA_FeetWalkTest1);
            relationships.addRelationship(FeetWalkTest,FA_FeetWalkTest1, 'PRLNKID', 'FALNKID', 'One', 'Many', FA_FeetWalkTest1.FALNKID);

            var FA_FeetWalkTest2 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', ''); // Is it mobility??
            FA_FeetWalkTest2.FAORES = value['25Ft walk 2'];
            FA_FeetWalkTest2.FASTRESU = 'seconds';
            FA_FeetWalkTest2.FADTC = gourabService.getDate(value['Recruitment date']);
            FA_FeetWalkTest2.FALNKID = FA_FeetWalkTest2.FADTC+" "+PRTRT;
            findingsAbout.addFinding(FA_FeetWalkTest2);
            relationships.addRelationship(FeetWalkTest,FA_FeetWalkTest2, 'PRLNKID', 'FALNKID', 'One', 'Many', FA_FeetWalkTest2.FALNKID);


            PRTRT = 'Nine Hole Peg Test';
            var ninePegTest = new procedure(value['Subject ID'], PRTRT);
            ninePegTest.PRSTDTC = gourabService.getDate(value['Recruitment date']);
            ninePegTest.PRLNKID = ninePegTest.PRSTDTC+" "+PRTRT;
            procedures.addProcedure(ninePegTest);

            var ninePegTestFinding1 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding1.FAORES = value['9HPT R1'];
            ninePegTestFinding1.FASTRESU = 'seconds';
            ninePegTestFinding1.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding1.FALNKID = ninePegTestFinding1.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding1.FALOC = "Hand";
            ninePegTestFinding1.FALAT = "Right";
            ninePegTestFinding1.FATPT = "1/2";
            findingsAbout.addFinding(ninePegTestFinding1);
            relationships.addRelationship(ninePegTest,ninePegTestFinding1, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding1.FALNKID);

            var ninePegTestFinding2 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding2.FAORES = value['9HPT L1'];
            ninePegTestFinding2.FASTRESU = 'seconds';
            ninePegTestFinding2.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding2.FALNKID = ninePegTestFinding2.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding2.FALOC = "Hand";
            ninePegTestFinding2.FALAT = "Left";
            ninePegTestFinding2.FATPT = "1/2";
            findingsAbout.addFinding(ninePegTestFinding2);
            relationships.addRelationship(ninePegTest,ninePegTestFinding2, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding2.FALNKID);


            var ninePegTestFinding3 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding3.FAORES = value['9HPT R2'];
            ninePegTestFinding3.FASTRESU = 'seconds';
            ninePegTestFinding3.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding3.FALNKID = ninePegTestFinding3.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding3.FALOC = "Hand";
            ninePegTestFinding3.FALAT = "Right";
            ninePegTestFinding3.FATPT = "2/2";
            relationships.addRelationship(ninePegTest,ninePegTestFinding3, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding3.FALNKID);

            var ninePegTestFinding4 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding4.FAORES = value['9HPT L2'];
            ninePegTestFinding4.FASTRESU = 'seconds';
            ninePegTestFinding4.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding4.FALNKID = ninePegTestFinding4.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding4.FALOC = "Hand";
            ninePegTestFinding4.FALAT = "Left";
            ninePegTestFinding4.FATPT = "2/2";
            findingsAbout.addFinding(ninePegTestFinding4);
            relationships.addRelationship(ninePegTest,ninePegTestFinding4, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding4.FALNKID);


            var PR = procedures.getProcedures();
            for (var pr = 0; pr < PR.length; pr++) {
                //var prRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(PR[pr])};
                var prRecordItem = gourabService.getRecordItem(PR[pr]);
                fieldNameIndex++;
                RecordItems.push(prRecordItem);
            }

            var FA = findingsAbout.getFindings();
            for (var fa = 0; fa < FA.length; fa++) {
                //var faRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(FA[fa])};
                var faRecordItem = gourabService.getRecordItem(FA[fa]);
                fieldNameIndex++;
                RecordItems.push(faRecordItem);
            }

            var EDSS = new question(value['Subject ID'], "EDSS");
            EDSS.QSTEST = "EDSS-Total Human";
            EDSS.QSSTRESC = value['EDSS'];

            questionnaires.addQuestion(gourabService.getDate(value['Recruitment date']), EDSS);

            var QS = questionnaires.getQuestionnaires();
            for (var ce = 0; ce < QS.length; ce++) {
                //var ceRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(QS[ce])};
                var ceRecordItem = gourabService.getRecordItem(QS[ce]);
                fieldNameIndex++;
                RecordItems.push(ceRecordItem);
            }

            subjects.push(root);
        }

        /*
        angular.forEach(values, function(value) {
            var RecordItems = [];
            var recordSet = [{"RecordItems":RecordItems}];
            var root = {"RecordSet":recordSet};
            var fieldNameIndex = 0;

            var DM = new Patient(value['Subject ID']);
            DM.SEX = value['Gender'];
            DM.BRTHDTC = gourabService.getDate(value['DOB']);
            var dmRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(DM)};
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);

            var CE = new clinicalEvent(value['Subject ID'],'Multiple Sclerosis Relapse','MS Relapse');
            CE.CESTDTC = gourabService.getDate(value['Last relapse']);
            CE.CEENDTC = gourabService.advanceDate(CE.CESTDTC, 7);
            CE.displayDate = gourabService.getDateString(CE.CESTDTC);
            clinicalEvents.addEvent(CE);
            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
                var event = clinicalEvents.getClinicalEvents()[ce];
                var recordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(event)};
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var MH = new MedicalEvent(value['Subject ID'],'Primary Diagnosis');
            MH.MHTERM = value['MS type'];
            MH.MHSCAT = "Onset Course";
            MH.MHSTDTC = gourabService.getDate(value['Onset Date']);
            medicalHistory.addOccurence(MH);
            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(event)};
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var newVisit = new subjectVisit(value['Subject ID']);
            newVisit.SVSTDTC = gourabService.getDate(value['Recruitment date']);
            //console.log(value['Recruitment date']);
            //console.log(newVisit.SVSTDTC);
            subjectVisits.addVisit(newVisit);
            var SV = subjectVisits.getSubjectVisits();
            for (var sv = 0; sv < SV.length; sv++) {
                var svRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(SV[sv])};
                fieldNameIndex++;
                RecordItems.push(svRecordItem);
            }

            var PRTRT = 'Eight Metre Walk Test';
            var FeetWalkTest = new procedure(value['Subject ID'], PRTRT);
            FeetWalkTest.PRSTDTC = gourabService.getDate(value['Recruitment date']);
            FeetWalkTest.PRLNKID = FeetWalkTest.PRSTDTC+" "+PRTRT;
            procedures.addProcedure(FeetWalkTest);

            var FA_FeetWalkTest1 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', ''); // Is it mobility??
            FA_FeetWalkTest1.FAORES = value['25Ft walk 1'];
            FA_FeetWalkTest1.FASTRESU = 'seconds';
            FA_FeetWalkTest1.FADTC = gourabService.getDate(value['Recruitment date']);
            FA_FeetWalkTest1.FALNKID = FA_FeetWalkTest1.FADTC+" "+PRTRT;
            findingsAbout.addFinding(FA_FeetWalkTest1);
            relationships.addRelationship(FeetWalkTest,FA_FeetWalkTest1, 'PRLNKID', 'FALNKID', 'One', 'Many', FA_FeetWalkTest1.FALNKID);

            var FA_FeetWalkTest2 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', ''); // Is it mobility??
            FA_FeetWalkTest2.FAORES = value['25Ft walk 2'];
            FA_FeetWalkTest2.FASTRESU = 'seconds';
            FA_FeetWalkTest2.FADTC = gourabService.getDate(value['Recruitment date']);
            FA_FeetWalkTest2.FALNKID = FA_FeetWalkTest2.FADTC+" "+PRTRT;
            findingsAbout.addFinding(FA_FeetWalkTest2);
            relationships.addRelationship(FeetWalkTest,FA_FeetWalkTest2, 'PRLNKID', 'FALNKID', 'One', 'Many', FA_FeetWalkTest2.FALNKID);


            PRTRT = 'Nine Hole Peg Test';
            var ninePegTest = new procedure(value['Subject ID'], PRTRT);
            ninePegTest.PRSTDTC = gourabService.getDate(value['Recruitment date']);
            ninePegTest.PRLNKID = ninePegTest.PRSTDTC+" "+PRTRT;
            procedures.addProcedure(ninePegTest);

            var ninePegTestFinding1 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding1.FAORES = value['9HPT R1'];
            ninePegTestFinding1.FASTRESU = 'seconds';
            ninePegTestFinding1.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding1.FALNKID = ninePegTestFinding1.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding1.FALOC = "Hand";
            ninePegTestFinding1.FALAT = "Right";
            ninePegTestFinding1.FATPT = "1/2";
            findingsAbout.addFinding(ninePegTestFinding1);
            relationships.addRelationship(ninePegTest,ninePegTestFinding1, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding1.FALNKID);

            var ninePegTestFinding2 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding2.FAORES = value['9HPT L1'];
            ninePegTestFinding2.FASTRESU = 'seconds';
            ninePegTestFinding2.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding2.FALNKID = ninePegTestFinding2.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding2.FALOC = "Hand";
            ninePegTestFinding2.FALAT = "Left";
            ninePegTestFinding2.FATPT = "1/2";
            findingsAbout.addFinding(ninePegTestFinding2);
            relationships.addRelationship(ninePegTest,ninePegTestFinding2, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding2.FALNKID);


            var ninePegTestFinding3 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding3.FAORES = value['9HPT R2'];
            ninePegTestFinding3.FASTRESU = 'seconds';
            ninePegTestFinding3.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding3.FALNKID = ninePegTestFinding3.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding3.FALOC = "Hand";
            ninePegTestFinding3.FALAT = "Right";
            ninePegTestFinding3.FATPT = "2/2";
            relationships.addRelationship(ninePegTest,ninePegTestFinding3, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding3.FALNKID);

            var ninePegTestFinding4 = new findingAbout(value['Subject ID'], 'Mobility', 'Functional Test', '');
            ninePegTestFinding4.FAORES = value['9HPT L2'];
            ninePegTestFinding4.FASTRESU = 'seconds';
            ninePegTestFinding4.FADTC = gourabService.getDate(value['Recruitment date']);
            ninePegTestFinding4.FALNKID = ninePegTestFinding4.FADTC+" Nine Hole Peg Test";
            ninePegTestFinding4.FALOC = "Hand";
            ninePegTestFinding4.FALAT = "Left";
            ninePegTestFinding4.FATPT = "2/2";
            findingsAbout.addFinding(ninePegTestFinding4);
            relationships.addRelationship(ninePegTest,ninePegTestFinding4, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding4.FALNKID);


            var PR = procedures.getProcedures();
            for (var pr = 0; pr < PR.length; pr++) {
                var prRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(PR[pr])};
                fieldNameIndex++;
                RecordItems.push(prRecordItem);
            }

            var FA = findingsAbout.getFindings();
            for (var fa = 0; fa < FA.length; fa++) {
                var faRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(FA[fa])};
                fieldNameIndex++;
                RecordItems.push(faRecordItem);
            }

            var EDSS = new question(value['Subject ID'], "EDSS");
            EDSS.QSTEST = "EDSS-Total Human";
            EDSS.QSSTRESC = value['EDSS'];
            
            questionnaires.addQuestion(gourabService.getDate(value['Recruitment date']), EDSS);

            var QS = questionnaires.getQuestionnaires();
            for (var ce = 0; ce < QS.length; ce++) {
                var ceRecordItem = {"fieldName":fieldNameIndex.toString(), value:gourabService.getRecordItem(QS[ce])};
                fieldNameIndex++;
                RecordItems.push(ceRecordItem);
            }

            subjects.push(root);
        });
        */

        //console.log(subjects);
        return subjects;
    }

    var getID = function(index) {
        return values[index]['Subject ID'];
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