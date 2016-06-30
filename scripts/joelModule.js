/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var joelModule = angular.module('Data.joel',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.questionnaire',
    'Optimise.exposure',
    'Optimise.morphology']);

joelModule.service('joelService', function() {
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

joelModule.service('joelData', function($http, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            exposures, Exposure,
                                            Morphology, morphologyServices,
                                            joelService){

    var headings = [];
    var values = [];

    var getData = function () {
        var Url   = "data/JoelDataNewID.csv";
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

            var value = values[s];
            var RecordItems = [];
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
            morphologyServices.clearAll();

            var DM = new Patient(value['id']);
            if (value['Gender']==0)
                DM.SEX = 'Male';
            else
                DM.SEX = 'Female';
            DM.BRTHDTC = joelService.getDate(value['DOB']);
            DM.INVNAM = "Joel Raffel";
            var dmRecordItem = joelService.getRecordItem(DM);
            fieldNameIndex++;
            RecordItems.push(dmRecordItem);

            if ((value['OneYearRelapse']!='')&&((value['OneYearRelapse']>0))) {
                var CE = new clinicalEvent(value['id'],'Multiple Sclerosis Relapse','MS Relapse');
                CE.CESTDTC = joelService.getDate(value['OneYearRelapse Date']);
                CE.CEENDTC = joelService.advanceDate(CE.CESTDTC, 7);
                CE.displayDate = joelService.getDateString(CE.CESTDTC);
                clinicalEvents.addEvent(CE);
                //console.log(CE);
            }

            if ((value['TwoYearsRelapse']!='')&&((value['TwoYearsRelapse']>0))) {
                var CE = new clinicalEvent(value['id'],'Multiple Sclerosis Relapse','MS Relapse');
                CE.CESTDTC = joelService.getDate(value['TwoYearsRelapse Date']);
                CE.CEENDTC = joelService.advanceDate(CE.CESTDTC, 7);
                CE.displayDate = joelService.getDateString(CE.CESTDTC);
                clinicalEvents.addEvent(CE);
            }

            if ((value['ThreeYearsRelapse']!='')&&((value['ThreeYearsRelapse']>0))) {
                var CE = new clinicalEvent(value['id'],'Multiple Sclerosis Relapse','MS Relapse');
                CE.CESTDTC = joelService.getDate(value['ThreeYearsRelapse Date']);
                CE.CEENDTC = joelService.advanceDate(CE.CESTDTC, 7);
                CE.displayDate = joelService.getDateString(CE.CESTDTC);
                clinicalEvents.addEvent(CE);
            }

            if ((value['FourYearsRelapse']!='')&&((value['FourYearsRelapse']>0))) {
                var CE = new clinicalEvent(value['id'],'Multiple Sclerosis Relapse','MS Relapse');
                CE.CESTDTC = joelService.getDate(value['FourYearsRelapse Date']);
                CE.CEENDTC = joelService.advanceDate(CE.CESTDTC, 7);
                CE.displayDate = joelService.getDateString(CE.CESTDTC);
                clinicalEvents.addEvent(CE);
            }

            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
                var event = clinicalEvents.getClinicalEvents()[ce];
                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(event)};
                var recordItem = joelService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }


            var MH = new MedicalEvent(value['id'],'Primary Diagnosis');
            if (value['IndicationTy'] == 0){
                MH.MHTERM = 'Relapse Remitting Multiple Sclerosis';
            }
            else {
                MH.MHTERM = 'Secondary Progressive Multiple Sclerosis';
            }
            MH.MHSCAT = "Onset Course";
            if (value['firstsymptomMS'] != '')
                MH.MHSTDTC = new Date(value['firstsymptomMS']);
            medicalHistory.addOccurence(MH);

            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                //var recordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(event)};
                var recordItem = joelService.getRecordItem(event);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            if ((value['PreTysabriT2'] != '')||(value['PreTysabriT2'] != '')){
                var mri = new procedure(value['id'], 'MRI');
                mri.PRSTDTC = joelService.getDate(value['Scan1']);
                mri.PRLOC = 'Head';
                mri.displayLabel = 'MRI';
                mri.displayDate = mri.PRSTDTC.toDateString();
                procedures.addProcedure(mri);
            }

            if (value['PreTysabriT2'] != '')
            {
                var newGdFinding = new Morphology(value['id'], "T2 Hypo Intense Lesions");
                if (value['PreTysabriT2'] == 0) {
                    newGdFinding.MOORRES = "None";
                }
                if (value['PreTysabriT2'] >= 9) {
                    newGdFinding.MOORRES = "More than 9";
                }
                if (value['PreTysabriT2'] < 9) {
                    newGdFinding.MOORRES = "Less than 9";
                }
                newGdFinding.MODTC = joelService.getDate(value['Scan1']);
                newGdFinding.MOLOC = 'Brain';
                newGdFinding.displayLabel = "T2 Hypo Intense Lesions";
                newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                morphologyServices.addMorphologicalFinding(newGdFinding);
            }

            if (value['PreTyGd'] != ''){
                var newGdFinding = new Morphology(value['id'], "Gd Enhancing Lesions");
                if (value['PreTyGd'] == 0) {
                    newGdFinding.MOORRES = "None";
                }
                if (value['PreTyGd'] > 1) {
                    newGdFinding.MOORRES = "Multiple";
                }
                if (value['PreTyGd'] == 1) {
                    newGdFinding.MOORRES = "Single";
                }
                newGdFinding.MODTC = joelService.getDate(value['Scan1']);
                newGdFinding.MOLOC = 'Brain';
                newGdFinding.displayLabel = "Gd Enhancing Lesions";
                newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                morphologyServices.addMorphologicalFinding(newGdFinding);
            }

            if (value['Scan2'] != ''){
                var mri = new procedure(value['id'], 'MRI');
                mri.PRSTDTC = joelService.getDate(value['Scan2']);
                mri.PRLOC = 'Head';
                mri.displayLabel = 'MRI';
                mri.displayDate = mri.PRSTDTC.toDateString();
                procedures.addProcedure(mri);
            }

            if (value['New T2W lesions scan 2'] != '')
            {
                if (value['PreTysabriT2'] != '') {
                    var newGdFinding = new Morphology(value['id'], "T2 Hypo Intense Lesions");
                    var raw = value['New T2W lesions scan 2']+value['PreTysabriT2'];
                    if (raw == 0) {
                        newGdFinding.MOORRES = "None";
                    }
                    if (raw >= 9) {
                        newGdFinding.MOORRES = "More than 9";
                    }
                    if (raw < 9) {
                        newGdFinding.MOORRES = "Less than 9";
                    }
                    newGdFinding.MOORRES
                    newGdFinding.MODTC = joelService.getDate(value['Scan2']);
                    newGdFinding.MOLOC = 'Brain';
                    newGdFinding.displayLabel = "T2 Hypo Intense Lesions";
                    newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                    morphologyServices.addMorphologicalFinding(newGdFinding);
                }
            }

            if (value['enhancescan2'] != ''){
                var newGdFinding = new Morphology(value['id'], "Gd Enhancing Lesions");
                if (value['enhancescan2'] == 0) {
                    newGdFinding.MOORRES = "None";
                }
                if (value['enhancescan2'] > 1) {
                    newGdFinding.MOORRES = "Multiple";
                }
                if (value['enhancescan2'] == 1) {
                    newGdFinding.MOORRES = "Single";
                }
                newGdFinding.MODTC = joelService.getDate(value['Scan2']);
                newGdFinding.MOLOC = 'Brain';
                newGdFinding.displayLabel = "Gd Enhancing Lesions";
                newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                morphologyServices.addMorphologicalFinding(newGdFinding);
            }

            if (value['Scan3'] != ''){
                var mri = new procedure(value['id'], 'MRI');
                mri.PRSTDTC = joelService.getDate(value['Scan3']);
                mri.PRLOC = 'Head';
                mri.displayLabel = 'MRI';
                mri.displayDate = mri.PRSTDTC.toDateString();
                procedures.addProcedure(mri);
            }

            if (value['enhancescan3'] != ''){
                var newGdFinding = new Morphology(value['id'], "Gd Enhancing Lesions");
                if (value['enhancescan3'] == 0) {
                    newGdFinding.MOORRES = "None";
                }
                if (value['enhancescan3'] > 1) {
                    newGdFinding.MOORRES = "Multiple";
                }
                if (value['enhancescan3'] == 1) {
                    newGdFinding.MOORRES = "Single";
                }
                newGdFinding.MODTC = joelService.getDate(value['Scan3']);
                newGdFinding.MOLOC = 'Brain';
                newGdFinding.displayLabel = "Gd Enhancing Lesions";
                newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                morphologyServices.addMorphologicalFinding(newGdFinding);
            }

            if (value['Scan4'] != ''){
                var mri = new procedure(value['id'], 'MRI');
                mri.PRSTDTC = joelService.getDate(value['Scan4']);
                mri.PRLOC = 'Head';
                mri.displayLabel = 'MRI';
                mri.displayDate = mri.PRSTDTC.toDateString();
                procedures.addProcedure(mri);
            }

            if (value['enhancescan4'] != ''){
                var newGdFinding = new Morphology(value['id'], "Gd Enhancing Lesions");
                if (value['enhancescan4'] == 0) {
                    newGdFinding.MOORRES = "None";
                }
                if (value['enhancescan4'] > 1) {
                    newGdFinding.MOORRES = "Multiple";
                }
                if (value['enhancescan4'] == 1) {
                    newGdFinding.MOORRES = "Single";
                }
                newGdFinding.MODTC = joelService.getDate(value['Scan4']);
                newGdFinding.MOLOC = 'Brain';
                newGdFinding.displayLabel = "Gd Enhancing Lesions";
                newGdFinding.displayDate = newGdFinding.MODTC.toDateString();
                morphologyServices.addMorphologicalFinding(newGdFinding);
            }

            var PR = procedures.getProcedures();
            for (var pr = 0; pr < PR.length; pr++) {
                //var prRecordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(PR[pr])};
                var prRecordItem = joelService.getRecordItem(PR[pr]);
                fieldNameIndex++;
                RecordItems.push(prRecordItem);
            }

            var MO = morphologyServices.getMorphologicalFindings();
            for (var mo = 0; mo < MO.length; mo++) {
                //var prRecordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(PR[pr])};
                var moRecordItem = joelService.getRecordItem(MO[mo]);
                fieldNameIndex++;
                RecordItems.push(moRecordItem);
            }

            var newExposure = new Exposure (value['id'], 'Tysabri');
            newExposure.EXSTDTC = joelService.getDate(value['DateTyStart']);
            if (value['DateTyDiscontinued'] != '') {
                newExposure.EXENDTC = joelService.getDate(value['DateTyDiscontinued']);
            }
            newExposure.EXDOSE = 300.00;
            newExposure.EXDOSU = 'mg';
            newExposure.EXDOSFRM = 'IV';
            newExposure.EXDOSFRQ= '/ Month';
            newExposure.displayDate = newExposure.EXSTDTC.toDateString();
            newExposure.displayLabel = newExposure.EXTRT;
            newExposure.EXCAT = 'Disease Modifying';
            exposures.addExposure(newExposure);

            for (var ex = 0; ex < exposures.getExposures().length; ex++) {
                var exposure = exposures.getExposures()[ex];
                var recordItem = joelService.getRecordItem(exposure);
                fieldNameIndex++;
                RecordItems.push(recordItem);
            }

            var preTysabriEDSS = value['PreTyEDSS'];
            if (preTysabriEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['PreTyEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['PreTyEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['PreTyEDSS Date']), EDSS);
            }

            var twoYearsEDSS = value['TwoYearsEDSS'];
            if (twoYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['TwoYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['TwoYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['TwoYearsEDSS Date']), EDSS);
            }

            var threeYearsEDSS = value['ThreeYearsEDSS'];
            if (threeYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['ThreeYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['ThreeYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['ThreeYearsEDSS Date']), EDSS);
            }

            var fourYearsEDSS = value['FourYearsEDSS'];
            if (fourYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['FourYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['FourYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['FourYearsEDSS Date']), EDSS);
            }

            var fiveYearsEDSS = value['FiveYearsEDSS'];
            if (fiveYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['FiveYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['FiveYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['FiveYearsEDSS Date']), EDSS);
            }

            var sixYearsEDSS = value['SixYearsEDSS'];
            if (sixYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['SixYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['SixYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['SixYearsEDSS Date']), EDSS);
            }

            var sevenYearsEDSS = value['SevenYearsEDSS'];
            if (sevenYearsEDSS != '') {
                var newVisit = new subjectVisit(value['id']);
                newVisit.SVSTDTC = joelService.getDate(value['SevenYearsEDSS Date']);
                subjectVisits.addVisit(newVisit);

                var EDSS = new question(value['id'], "EDSS");
                EDSS.QSTEST = "EDSS-Total Human";
                EDSS.QSSTRESC = value['SevenYearsEDSS'];
                questionnaires.addQuestion(joelService.getDate(value['SevenYearsEDSS Date']), EDSS);
            }

            var QS = questionnaires.getQuestionnaires();
            for (var ce = 0; ce < QS.length; ce++) {
                //var ceRecordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(QS[ce])};
                var ceRecordItem = joelService.getRecordItem(QS[ce]);
                fieldNameIndex++;
                RecordItems.push(ceRecordItem);
            }

            var SV = subjectVisits.getSubjectVisits();
            for (var sv = 0; sv < SV.length; sv++) {
                //var svRecordItem = {"fieldName":fieldNameIndex.toString(), value:joelService.getRecordItem(SV[sv])};
                var svRecordItem = joelService.getRecordItem(SV[sv]);
                fieldNameIndex++;
                RecordItems.push(svRecordItem);
            }

            subjects.push(root);
        }

        //console.log(subjects);
        return subjects;
    }

    var getID = function(index) {
        return values[index]['id'];
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