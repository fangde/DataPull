/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 24/01/2015
 * Time: 16:31
 * To change this template use File | Settings | File Templates.
 */

var interventionModule = angular.module('Optimise.exposure', []);

interventionModule.factory('Exposure', function () {
    return function (USUBJID, extrt) {
        var Exposure = {
            USUBJID : USUBJID,
            STUDYID : 'OPTIMISE',
            DOMAIN:'EX',
            EXSEQ :'',
            EXTRT:extrt,
            EXDOSE:'',
            EXDOSU:'',
            EXDOSFRM:'',
            EXDOSFRQ:'',
            EXSTDTC: new Date(),
            EXENDTC: '',
            EXADJ: '',
            displayLabel:'',
            displayDate:''
        }
        return Exposure;
    }
});

interventionModule.service('exposures', function () {
    var exposures = [];

    var addExposure = function (EX){
        EX.EXSEQ = generateEXSEQ();
        exposures.push(EX);
    }

    var compileExposureSeq = function () {
        var seq = [];
        for (var e = 0; e < exposures.length; e++) {
            seq.push(exposures[e].EXSEQ);
        }
        return seq;
    }

    var generateEXSEQ = function () {
        var EXSEQs = compileExposureSeq();
        if (EXSEQs.length > 0) {
            EXSEQs.sort();
            return (EXSEQs[EXSEQs.length-1]+1);
        }
        else {
            return 0;
        }
    }

    var getExposures = function() {
        return exposures;
    }

    var clearAll = function() {
        return exposures = [];
    }

    return {
        addExposure: addExposure,
        getExposures: getExposures,
        clearAll: clearAll
    }
});

interventionModule.factory('DrugFactory', function () {

    var drugs = [
        {name: 'Avonex',cat: 'Disease Modifying',
            posology:[{dose:'30.00', unit:'mcg', form:'IM', frequency:'/ Week'}]},
        {name: 'Azathioprine', cat: 'Disease Modifying',
            posology:[{dose:'00.00', unit:'MIU', form:'00.00', frequency:'00.00'}]},
        {name: 'Betaferon', cat: 'Disease Modifying',
            posology:[{dose:'8.00', unit:'MIU', form:'SC', frequency:'/ 2 Days'}]},
        {name: 'Copazone', cat: 'Disease Modifying',
            posology:[{dose:'20.00', unit:'mg',  form:'00.00', frequency:'SC'}]},
        {name: 'Cyclophosphamide', cat: 'Disease Modifying',
            posology:[{dose:'00.00', unit:'MIU', form:'00.00', frequency:'00.00'}]},
        {name: 'Extavia', cat: 'Disease Modifying',
            posology:[{dose:'8.00', unit:'MIU', form:'SC', frequency:'/2 Days'}]},
        {name: 'Gilenya', cat: 'Disease Modifying',
            posology:[{dose:'0.50', unit:'00.00', form:'IV', frequency:'/ Day'}]},
        {name: 'Rituximab', cat: 'Disease Modifying',
            posology:[{dose:'0.0', unit:'00.00', form:'IV', frequency:'/ Day'}]},
        {name: 'Methotrexate', cat: 'Disease Modifying',
            posology:[{dose:'00.00', unit:'00.00', form:'00.00', frequency:'00.00'}]},
        {name: 'Novantrone', cat: 'Disease Modifying',
            posology:[{dose:'30.00', unit:'mcg', form:'IM', frequency:'00.00'}]},
        {name: 'Rebif', cat: 'Disease Modifying',
            posology:[{dose:'22.00', unit:'mcg', form:'SC', frequency:'3 /Week'},
                {dose:'44.00', unit:'mcg', form:'SC', frequency:'3 /Week'}]},
        {name: 'Tysabri', cat: 'Disease Modifying',
            posology:[{dose:'300.00', unit:'mg', form:'IV', frequency:'/ Month'}]},
        {name: 'Other', cat: 'Disease Modifying',
            posology:[{dose:'', unit:'', form:'', frequency:''}]},

        {name: '4-aminopyridine', cat: 'Symptomatic',
            posology:[{dose:'10.00', unit:'mg', form:'IV', frequency:'2/ Day'}]},
        {name: 'Amantadine', cat: 'Symptomatic',
            posology:[{dose:'200.00', unit:'mg', form:'IV', frequency:'/ Day'}]},
        {name: 'Baclofen', cat: 'Symptomatic',
            posology:[{dose:'30.00', unit:'mg', form:'IV', frequency:'/ Day'}]},
        {name: 'IV Methyl-prednisolone', cat: 'Symptomatic',
            posology:[{dose:'10.00', unit:'mg', form:'IV', frequency:'2/ Day'}]},
        {name: 'IVIG', cat: 'Symptomatic',
            posology:[{dose:'10.00', unit:'mg', form:'IV', frequency:'2/ Day'}]},
        {name: 'Plasma Exchange', cat: 'Symptomatic',
            posology:[{dose:'10.00', unit:'mg', form:'IV', frequency:'2/ Day'}]},
        {name: 'Mycophenolic Acid', cat: 'Symptomatic',
            posology:[{dose:'500', unit:'mg', form:'IV', frequency:'1/ Day'},
                {dose:'1000', unit:'mg', form:'IV', frequency:'1/ Day'}]},
        {name: 'Other', cat: 'Symptomatic',
            posology:[{dose:'', unit:'', form:'', frequency:''}]},

        {name: 'Neuropsych. Training', cat: 'Others',
            posology:[{dose:'', unit:'', form:'', frequency:''}]},
        {name: 'Physiotherapy', cat: 'Others',
            posology:[{dose:'', unit:'', form:'', frequency:''}]},
        {name: 'Psychotherapy', cat: 'Others',
            posology:[{dose:'', unit:'', form:'', frequency:''}]}


    ];

    drugs.isKnown = function (EXTRT) {
        for (var n = 0; n < drugs.length; n++) {
            if (EXTRT==drugs[n].name) {
                return true;
            }
        }
        return false;
    }

    return drugs;
});