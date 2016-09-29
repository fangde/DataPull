/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 05/11/15
 * Time: 12:39
 * To change this template use File | Settings | File Templates.
 */

var iMedModule = angular.module('Data.iMed',['Optimise.patient',
    'Optimise.clinicalEvent',
    'Optimise.medicalHistory',
    'Optimise.findingAbout',
    'Optimise.procedure',
    'Optimise.relationship',
    'Optimise.subjectVisit',
    'Optimise.questionnaire',
    'Optimise.exposure',
    'Optimise.morphology',
    'Optimise.csf']);

iMedModule.service('iMedService', function() {
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
        endtc.setDate(stdtc.getDate()+parseInt(days));
        return endtc;
    }

    return {
        getRecordItem: getRecordItem,
        getDate: getDate,
        advanceDate: advanceDate,
        getDateString: getDateString
    }
})

iMedModule.service('iMedData', function($q, Patient,
                                            clinicalEvent, clinicalEvents,
                                            MedicalEvent, medicalHistory,
                                            findingsAbout, findingAbout,
                                            procedures, procedure,
                                            relationship, relationships,
                                            subjectVisit, subjectVisits,
                                            question, questionnaires,
                                            exposures, Exposure, DrugFactory,
                                            Morphology, morphologyServices,
                                            LaboratoryTestResult, laboratoryTestResults,
                                            nervousSystemFindings, NervousSystemFinding,
                                            csfService,
                                            iMedService){

    var headings = [];
    var values = [];

    var getData = function (file) {
        return $q(function(resolve, reject) {
        //setTimeout(function() {
            var iMedReader = new FileReader();
            iMedReader.onloadend = function(e){
                var data = e.target.result;
                resolve(data);
            }
            iMedReader.readAsText(file);
        //}, 500);
    })};

    var setData = function (domainData, domains) {
        //var domains = Object.keys(domainData);
        for (var d = 0; d < domains.length; d++) {
            if ((domainData[domains[d]] != null)&&(domainData[domains[d]].length > 0)) {
                headings[domains[d]] = Object.keys(domainData[domains[d]][0]);
                values[domains[d]] = domainData[domains[d]].slice(0);
            }
        }
        //console.log(domains);
    }

    var print = function (domains) {
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

    var addMedicalHistory = function(USUBJID, MHCAT, MHSCAT, MHSTDTC, MHTERM) {
        var MH = new MedicalEvent(USUBJID, MHCAT);
        MH.MHSTDTC = MHSTDTC;
        MH.MHTERM = MHTERM;
        MH.MHSCAT = MHSCAT;
        MH.displaySTDTC = MHSTDTC.getFullYear();
        medicalHistory.addOccurence(MH);
    }

    var generateOPTID = function(patientID) {
        return 'OPT-iMED-03-'+patientID;
    }

    var ID_CDISC = function(RecordItems, value) {

        // GOSH
        //var USUBJID = generateOPTID(value['Patient ID']);
        //var USUBJID = generateOPTID(value['Patient Code']);

        //J Radcliff
        var USUBJID = generateOPTID(value['Patient ID']);


        var DM = new Patient(USUBJID);

        // GOSH
        //DM.NHS_USUBJID = value['Patient Code'];

        // J Radcliff
        DM.NHS_USUBJID = value['Last Name']+", "+value['First Name']+" ("+value['Birth Date']+")";

        DM.SEX = value['Gender'];
        DM.BRTHDTC = iMedService.getDate(value['Birth Date']);
        DM.COUNTRY = value['Birth Country'];
        DM.ETHNIC = value['Ethnic Origin'];
        var dmRecordItem = iMedService.getRecordItem(DM);
        RecordItems.push(dmRecordItem);

        if (value['Diagnosis Date'] != ""){
            addMedicalHistory(USUBJID, 'Primary Diagnosis', 'Onset Course',
                iMedService.getDate(value['Diagnosis Date']),
                'Relapsing Remitting Multiple Sclerosis');
        }

        if (value['Since'] != ""){
            console.log(value['Since']);
        }

        if (value['Date of Onset'] != ""){
            if (value['Supratentorial'] == 'Yes')
                addMedicalHistory(USUBJID, 'Initial Symptom', 'Initial Symptom',
                    iMedService.getDate(value['Diagnosis Date']), 'Supratentorial');

            if (value['Optic Pathways'] == 'Yes')
                addMedicalHistory(USUBJID, 'Initial Symptom', 'Initial Symptom',
                    iMedService.getDate(value['Diagnosis Date']), 'Optic Pathways');

            if (value['Brainstem-Cerebellum'] == 'Yes')
                addMedicalHistory(USUBJID, 'Initial Symptom', 'Initial Symptom',
                    iMedService.getDate(value['Diagnosis Date']), 'Brainstem-Cerebellum');

            if (value['Spinal Cord'] == 'Yes')
                addMedicalHistory(USUBJID, 'Initial Symptom', 'Initial Symptom',
                    iMedService.getDate(value['Diagnosis Date']), 'Spinal Cord');

            if (value['Other Symptoms'] != '')
                addMedicalHistory(USUBJID, 'Initial Symptom', 'Initial Symptom',
                    iMedService.getDate(value['Diagnosis Date']), value['Other Symptoms']);
        }

        if (value['Date Secondary Progressive'] != ""){
            addMedicalHistory(USUBJID, 'Primary Diagnosis','Progressive Course',
                iMedService.getDate(value['Date Secondary Progressive']),
                'Secondary Progressive Multiple Sclerosis');
        }
    }

    var addVisit = function(USUBJID, SVSTDTC) {
        var newVisit = new subjectVisit(USUBJID);
        newVisit.SVSTDTC = SVSTDTC;
        subjectVisits.addVisit(newVisit);
    }

    var addTest = function(USUBJID, QSCAT, QSTEST, QSSTRESC, QSDTC) {
        var aTest = new question(USUBJID, QSCAT);
        aTest.QSTEST = QSTEST;
        aTest.QSSTRESC = QSSTRESC;
        questionnaires.addQuestion(QSDTC, aTest);
    }

    var addNinePegTest = function(USUBJID, aProcedure, left1, right1, left2, right2) {
        var ninePegTest = aProcedure;

        var ninePegTestFinding1 = new findingAbout(USUBJID, 'Mobility', 'Functional Test', '');
        ninePegTestFinding1.FAORES = left1;
        ninePegTestFinding1.FASTRESU = 'seconds';
        ninePegTestFinding1.FADTC = ninePegTest.PRSTDTC;
        ninePegTestFinding1.FALNKID = ninePegTest.PRSTDTC+" Nine Hole Peg Test";
        ninePegTestFinding1.FALOC = "Hand";
        ninePegTestFinding1.FALAT = "Left";
        ninePegTestFinding1.FATPT = "1/2";
        findingsAbout.addFinding(ninePegTestFinding1);
        //relationships.addRelationship(ninePegTest,ninePegTestFinding1, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding1.FALNKID);

        var ninePegTestFinding2 = new findingAbout(USUBJID, 'Mobility', 'Functional Test', '');
        ninePegTestFinding2.FAORES = right1;
        ninePegTestFinding2.FASTRESU = 'seconds';
        ninePegTestFinding2.FADTC = ninePegTest.PRSTDTC;
        ninePegTestFinding2.FALNKID = ninePegTest.PRSTDTC+" Nine Hole Peg Test";
        ninePegTestFinding2.FALOC = "Hand";
        ninePegTestFinding2.FALAT = "Right";
        ninePegTestFinding2.FATPT = "1/2";
        findingsAbout.addFinding(ninePegTestFinding2);
        //relationships.addRelationship(ninePegTest,ninePegTestFinding2, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding2.FALNKID);


        var ninePegTestFinding3 = new findingAbout(USUBJID, 'Mobility', 'Functional Test', '');
        ninePegTestFinding3.FAORES = left2;
        ninePegTestFinding3.FASTRESU = 'seconds';
        ninePegTestFinding3.FADTC = ninePegTest.PRSTDTC;
        ninePegTestFinding3.FALNKID = ninePegTest.PRSTDTC+" Nine Hole Peg Test";
        ninePegTestFinding3.FALOC = "Hand";
        ninePegTestFinding3.FALAT = "Left";
        ninePegTestFinding3.FATPT = "2/2";
        findingsAbout.addFinding(ninePegTestFinding3);
        //relationships.addRelationship(ninePegTest,ninePegTestFinding3, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding3.FALNKID);

        var ninePegTestFinding4 = new findingAbout(USUBJID, 'Mobility', 'Functional Test', '');
        ninePegTestFinding4.FAORES = right2;
        ninePegTestFinding4.FASTRESU = 'seconds';
        ninePegTestFinding4.FADTC = ninePegTest.PRSTDTC;
        ninePegTestFinding4.FALNKID = ninePegTest.PRSTDTC+" Nine Hole Peg Test";
        ninePegTestFinding4.FALOC = "Hand";
        ninePegTestFinding4.FALAT = "Right";
        ninePegTestFinding4.FATPT = "2/2";
        findingsAbout.addFinding(ninePegTestFinding4);
        //relationships.addRelationship(ninePegTest,ninePegTestFinding4, 'PRLNKID', 'FALNKID', 'One', 'Many', ninePegTestFinding4.FALNKID);

    }

    var addProcedure = function (USUBJID, PRTRT, SVSTDTC) {
        var aProcedure = new procedure(USUBJID, PRTRT);
        aProcedure.PRSTDTC = SVSTDTC;
        aProcedure.PRLNKID = SVSTDTC+" "+PRTRT;
        procedures.addProcedure(aProcedure);
        return aProcedure;
    }

    var SV_CDISC = function(patientID) {
        for (var v = 0; v < values['VI'].length; v++) {
            if (patientID == values['VI'][v]['Patient ID']){
                var visit = values['VI'][v];

                var USUBJID = generateOPTID(patientID);

                var SVDTC = iMedService.getDate(visit['Visit Date']);
                addVisit(USUBJID, SVDTC);

                if (visit['EDSS'] != ''){
                    addTest(USUBJID, 'EDSS', 'EDSS-Total Human', visit['EDSS'], SVDTC);

                    if ((visit['Score Pyramidal'] != "ND")&&(visit['Score Pyramidal'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Pyramidal', visit['Score Pyramidal'], SVDTC);

                    if ((visit['Score Cerebellar'] != "ND")&&(visit['Score Cerebellar'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Cerebellar', visit['Score Cerebellar'], SVDTC);

                    if ((visit['Score BrainStem'] != "ND")&&(visit['Score BrainStem'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-BrainStem', visit['Score Pyramidal'], SVDTC);

                    if ((visit['Score Sensory'] != "ND")&&(visit['Score Sensory'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Sensory', visit['Score Sensory'], SVDTC);

                    if ((visit['Score Bowel'] != "ND")&&(visit['Score Bowel'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-BowelBladder', visit['Score Bowel'], SVDTC);

                    if ((visit['Score Visual'] != "ND")&&(visit['Score Visual'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Visual', visit['Score Visual'], SVDTC);

                    if ((visit['Score Ambulation'] != "ND")&&(visit['Score Ambulation'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Ambulation', visit['Score Ambulation'], SVDTC);

                    if ((visit['Score Mental'] != "ND")&&(visit['Score Mental'])!= "")
                        addTest(USUBJID, 'EDSS', 'EDSS-Mental', visit['Score Mental'], SVDTC);
                }

                if ((visit['NineHPT Left 1'] != "")
                    || (visit['NineHPT Left 2'] != "")
                    || (visit['NineHPT Right 1'] != "")
                    || (visit['NineHPT Right 2'] != "")) {
                    var aProcedure = addProcedure(USUBJID, 'Nine Hole Peg Test', SVDTC);
                    addNinePegTest(USUBJID, aProcedure,
                        visit['NineHPT Left 1'], visit['NineHPT Right 1'],
                        visit['NineHPT Left 2'], visit['NineHPT Right 2']);
                }
            }
        }
    }

    var addRelapseFinding = function(CE, FASCAT) {
        var aFinding = new findingAbout(CE.USUBJID, CE.CETERM, 'Severity Test', FASCAT); // Is it mobility??
        aFinding.FAORES = 'Yes';
        aFinding.FADTC = CE.CESTDTC;
        aFinding.FALNKID = CE.CESTDTC+" Multiple Sclerosis Relapse";
        findingsAbout.addFinding(aFinding);
    }

    var addEvent = function(CEBODYSYS, CEGRPID, relapse) {
        var USUBJID = generateOPTID(relapse['Patient ID']);
        var newEvent = new clinicalEvent(USUBJID, 'Multiple Sclerosis Relapse', 'MS Relapse');
        newEvent.CEBODSYS = CEBODYSYS;
        newEvent.CEGRPID = CEGRPID;
        newEvent.CESTDTC = iMedService.getDate(relapse["Relapse Date"]);
        if (relapse['Duration'] != '')
               newEvent.CEENDTC = iMedService.advanceDate(newEvent.CESTDTC, relapse['Duration']);
        newEvent.CELNKID = newEvent.CESTDTC+" Multiple Sclerosis Relapse";
        newEvent.CESEV = relapse['Severity'];
        newEvent.displayDate = parseInt(newEvent.CESTDTC.getMonth()+1)+"/"+newEvent.CESTDTC.getFullYear();
        newEvent.displayLabel = newEvent.CESEV;

        clinicalEvents.addEvent(newEvent);

        if ((relapse['Impact ADL Functions'] != '') && ((relapse['Impact ADL Functions'] != 0)))
            addRelapseFinding(newEvent, 'Impact on ADL');

        if (relapse['Corticosteroids'] == 'Yes'){
            addRelapseFinding(newEvent, 'Cortisteroids prescribed');
            newEvent.displayLabel = newEvent.CESEV+ ", Steroids";
        }

        //console.log(newEvent);
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
        for (var r = 0; r < values['RE'].length; r++) {
            if (patientID == values['RE'][r]['Patient ID']){
                var relapse = values['RE'][r];
                clinicalEvents.clearEvent();

                if (relapse["CNS Pyramidal Tract"] == "Yes") {
                    addRelapse('Pyramidal Tract', relapse);
                }

                if (relapse["CNS Brain Stem"] == "Yes") {
                    addRelapse('Brain Stem', relapse);
                }

                if (relapse["CNS Bowel Bladder"] == "Yes") {
                    addRelapse('Bowel Bladder', relapse);
                }

                if (relapse["CNS Neuropsycho Functions"] == "Yes") {
                    addRelapse('Higher Function', relapse);
                }

                if (relapse["CNS Cerebellum"] == "Yes") {
                    addRelapse('Cerebellum', relapse);
                }

                if (relapse["CNS Visual Functions"] == "Yes") {
                    addRelapse('Visual', relapse);
                }

                if (relapse["CNS Sensory Functions"] == "Yes") {
                    addRelapse('Sensory', relapse);
                }
            }
        }
    }

    var TR_CDISC = function(patientID) {
        for (var e = 0; e < values['TR'].length; e++) {
            if (patientID == values['TR'][e]['Patient ID']) {
                var treatment = values['TR'][e];
                var USUBJID = generateOPTID(patientID);
                var newExposure = new Exposure (USUBJID, treatment['Medication']);
                newExposure.EXSTDTC = iMedService.getDate(treatment['Start Date']);
                if (treatment['End Date'] != '') {
                    newExposure.EXENDTC = iMedService.getDate(treatment['End Date']);
                }

                if (treatment['Discontinuation'] != '') {
                    newExposure.EXADJ = iMedService.getDate(treatment['Discontinuation']);
                }
                newExposure.EXDOSE = treatment['Dosage'];
                newExposure.EXDOSU = treatment['Unit'];
                newExposure.EXDOSFRM = treatment['Route'];
                newExposure.EXDOSFRQ = treatment['Frequency'];
                newExposure.displayDate = newExposure.EXSTDTC.toDateString();
                newExposure.displayLabel = newExposure.EXTRT;
                if (treatment["MS Specific"] != 'Yes')
                    newExposure.EXCAT = 'Disease Modifying';
                else
                    newExposure.EXCAT = '';
                exposures.addExposure(newExposure);
            }
        }
    }

    var MR_CDISC = function(patientID) {
        for (var e = 0; e < values['MR'].length; e++) {
            if (patientID == values['MR'][e]['Patient ID']) {
                var mri = values['MR'][e];
                var USUBJID = generateOPTID(patientID);
                var newProcedure = addProcedure(USUBJID, "MRI", iMedService.getDate(mri['Exam Date']));
                newProcedure.displayDate = mri['Exam Date'];
            }
        }
    }

    var addLab = function (USUBJID, LBTEST, LBDTC) {
        var aLab = new LaboratoryTestResult(USUBJID, LBTEST);
        aLab.LBDTC = LBDTC;
        laboratoryTestResults.addResult(aLab);
        return aLab;
    }

    var LB_CDISC = function(patientID) {
        for (var e = 0; e < values['LT'].length; e++) {
            if (patientID == values['LT'][e]['Patient ID']) {
                var lab = values['LT'][e];
                var USUBJID = generateOPTID(patientID);
                var newLab = addLab(USUBJID, "", iMedService.getDate(lab['Exam Date']));
                newLab.displayDate = lab['Exam Date'];
                newLab.displayLabel = 'Lab Tests';
            }
        }
    }

    var addVEP = function (USUBJID, NVTEST, NVDTC, NVLAT, NVORRES) {
        var newFinding = new NervousSystemFinding(USUBJID, NVTEST);
        newFinding.NVORRES = NVORRES;
        newFinding.NVDTC = NVDTC;
        newFinding.NVLAT = NVLAT;
        newFinding.displayLabel = 'Evoked Potential';
        newFinding.NVCAT = "Evoked Potential";
        nervousSystemFindings.addFinding(newFinding);
        return newFinding;
    }

    var addSEP = function (USUBJID, NVTEST, NVDTC, NVLAT, NVLOC, NVORRES) {
        var newFinding = new NervousSystemFinding(USUBJID, NVTEST);
        newFinding.NVORRES = NVORRES;
        newFinding.NVDTC = NVDTC;
        newFinding.NVLAT = NVLAT;
        newFinding.NVLOC = NVLOC;
        newFinding.NVCAT = "Evoked Potential";
        newFinding.displayLabel = 'Evoked Potential';
        console.log(newFinding);
        nervousSystemFindings.addFinding(newFinding);
        return  newFinding;
    }

    var VEP_CDISC = function(patientID) {
        for (var e = 0; e < values['EP'].length; e++) {
            if (patientID == values['EP'][e]['Patient ID']) {
                var ep = values['EP'][e];
                //console.log(ep);
                var USUBJID = generateOPTID(patientID);
                if (ep['Latency Right Result'] != '') {
                    var newEP = addVEP(USUBJID, 'Intepretation', iMedService.getDate(ep['Exam Date']), 'Right', ep['Latency Right Result']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['Latency Right'] != '') ) {
                    var newEP = addVEP(USUBJID, 'P100 Latency', iMedService.getDate(ep['Exam Date']), 'Right', ep['Latency Right']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if (ep['Latency Left Result'] != '') {
                    var newEP = addVEP(USUBJID, 'Intepretation', iMedService.getDate(ep['Exam Date']), 'Left', ep['Latency Left Result']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['Latency Left'] != '') ) {
                    var newEP = addVEP(USUBJID, 'P100 Latency', iMedService.getDate(ep['Exam Date']), 'Left', ep['Latency Left']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['Amplitude Right'] != '') ) {
                    var newEP = addVEP(USUBJID, 'P100 Amplitude', iMedService.getDate(ep['Exam Date']), 'Right', ep['Amplitude Right']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['Amplitude Left'] != '') ) {
                    var newEP = addVEP(USUBJID, 'P100 Amplitude', iMedService.getDate(ep['Exam Date']), 'Left', ep['Amplitude Left']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['SEP Upper R'] != '') ) {
                    var newEP = addSEP(USUBJID, 'SEP', iMedService.getDate(ep['Exam Date']), 'Right', 'Upper', ep['SEP Upper R']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['SEP Upper L'] != '') ) {
                    var newEP = addSEP(USUBJID, 'SEP', iMedService.getDate(ep['Exam Date']), 'Left', 'Upper', ep['SEP Upper L']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['SEP Lower R'] != '') ) {
                    var newEP = addSEP(USUBJID, 'SEP', iMedService.getDate(ep['Exam Date']), 'Right', 'Lower', ep['SEP Lower R']);
                    newEP.displayDate = ep['Exam Date'];
                }

                if ((ep['SEP Lower L'] != '') ) {
                    var newEP = addSEP(USUBJID, 'SEP', iMedService.getDate(ep['Exam Date']), 'Left', 'Lower', ep['SEP Lower L']);
                    newEP.displayDate = ep['Exam Date'];
                }
            }
        }
    }

    var CSF_CDISC = function(patientID) {
        //console.log(values);
        for (var e = 0; e < values['CS'].length; e++) {
            if (patientID == values['CS'][e]['Patient ID']) {
                var lp = values['CS'][e];
                var LBDTC = iMedService.getDate(lp['Exam Date']);

                var USUBJID = generateOPTID(patientID);
                if (lp['Result'] != '') {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var result = '';
                    if (lp['Result'] == 'Abnormal MS-atypical')
                        result = 'Abnormal MS-Atypical';
                    else if (lp['Result'] == 'Abnormal MS-typical')
                        result = 'Abnormal MS-Typical';
                    else
                        result = lp['Result'];
                    var newLP = addLab(USUBJID, 'Summary', LBDTC);
                    newLP.LBNRIND = result;
                    newLP.displayDate = lp['Exam Date'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                }

                if ((lp['Proteins'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'Total Protein', LBDTC);
                    newLP.LBORRES = lp['Proteins'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['Glucose'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'Glucose', LBDTC);
                    newLP.LBORRES = lp['Glucose'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['Albumin'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'Albumin', LBDTC);
                    newLP.LBORRES = lp['Albumin'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['Q Albumin'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'Q Albumin', LBDTC);
                    newLP.LBORRES = lp['Q Albumin'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['lgG'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'IgG', LBDTC);
                    newLP.LBORRES = lp['lgG'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['IgG Index'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'IgG Index', LBDTC);
                    newLP.LBORRES = lp['IgG Index'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['White Cell Count'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'White Cell Count', LBDTC);
                    newLP.LBORRES = lp['White Cell Count'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }

                if ((lp['Lymphocytes'] != '') ) {
                    csfService.addProcedure(USUBJID, LBDTC);
                    var newLP = addLab(USUBJID, 'Lymphocytes', LBDTC);
                    newLP.LBORRES = lp['Lymphocytes'];
                    newLP.LBSPEC = "CSF";
                    newLP.displayLabel = "CSF";
                    newLP.displayDate = lp['Exam Date'];
                }


            }
        }
    }


//    40,000
//    0203 862 3347
//    Julie

    var toCDISC = function () {
        var subjects = [];
        for (var s = 0; s < values['ID'].length; s++) {

            var value = values['ID'][s];
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
            morphologyServices.clearAll();
            clinicalEvents.clearEvent();
            laboratoryTestResults.deleteLabTestResults();
            nervousSystemFindings.deleteNervousSystemFindings();

            ID_CDISC(RecordItems, value);
            SV_CDISC(value['Patient ID']);
            RE_CDISC(value['Patient ID']);
            TR_CDISC(value['Patient ID']);
            MR_CDISC(value['Patient ID']);
            LB_CDISC(value['Patient ID']);
            VEP_CDISC(value['Patient ID']);
            CSF_CDISC(value['Patient ID']);

            for (var ce = 0; ce < medicalHistory.getMedicalHistory().length; ce++) {
                var event = medicalHistory.getMedicalHistory()[ce];
                var recordItem = iMedService.getRecordItem(event);
                RecordItems.push(recordItem);
            }

            for (var sv = 0; sv < subjectVisits.getSubjectVisits().length; sv++) {
                var visit = subjectVisits.getSubjectVisits()[sv];
                var recordItem = iMedService.getRecordItem(visit);
                RecordItems.push(recordItem);
            }

            for (var qs = 0; qs < questionnaires.getQuestionnaires().length; qs++) {
                var question = questionnaires.getQuestionnaires()[qs];
                var recordItem = iMedService.getRecordItem(question);
                RecordItems.push(recordItem);
            }

            for (var pr = 0; pr < procedures.getProcedures().length; pr++) {
                var procedure = procedures.getProcedures()[pr];
                var recordItem = iMedService.getRecordItem(procedure);
                RecordItems.push(recordItem);
            }

            for (var fa = 0; fa < findingsAbout.getFindings().length; fa++) {
                var finding = findingsAbout.getFindings()[fa];
                var recordItem = iMedService.getRecordItem(finding);
                RecordItems.push(recordItem);
            }

            for (var re = 0; re < relationships.getRelationships().length; re++) {
                var rel = relationships.getRelationships()[re];
                var recordItem = iMedService.getRecordItem(rel);
                RecordItems.push(recordItem);
            }

            for (var ce = 0; ce < clinicalEvents.getClinicalEvents().length; ce++) {
                var event = clinicalEvents.getClinicalEvents()[ce];
                var recordItem = iMedService.getRecordItem(event);
                RecordItems.push(recordItem);
            }

            for (var ex = 0; ex < exposures.getExposures().length; ex++) {
                var exposure = exposures.getExposures()[ex];
                var recordItem = iMedService.getRecordItem(exposure);
                RecordItems.push(recordItem);
            }

            for (var lb = 0; lb < laboratoryTestResults.getLabTestResults().length; lb++) {
                var labTest = laboratoryTestResults.getLabTestResults()[lb];
                var recordItem = iMedService.getRecordItem(labTest);
                RecordItems.push(recordItem);
            }

            for (var ep = 0; ep < nervousSystemFindings.getNervousSystemFindings().length; ep++) {
                var epTest = nervousSystemFindings.getNervousSystemFindings()[ep];
                var recordItem = iMedService.getRecordItem(epTest);
                RecordItems.push(recordItem);
            }

            subjects.push(root);
        }

        return subjects;
    }

    var getID = function(s) {
        return generateOPTID(values['ID'][s]['Patient ID']);
        //return values[index];
    }

    var getNHS_ID = function(s) {
        //GOSH
        return values['ID'][s]['Patient Code'];
        //return generateOPTID(values['ID'][s]['Patient ID']);
        //return values[index];
    }

    return {
        getData: getData,
        print: print,
        setData: setData,
        toCDISC: toCDISC,
        getID: getID,
        getNHS_ID: getNHS_ID
    }


});