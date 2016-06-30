/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 06/05/2015
 * Time: 16:16
 * To change this template use File | Settings | File Templates.
 */

var morphologyModule = angular.module('Optimise.morphology',[]);

morphologyModule.factory('Morphology', function() {
    return function(USUBJID, MOTEST) {
        var Morphology = {
            STUDYID:'OPTIMISE',
            DOMAIN:'MO',
            USUBJID:USUBJID,
            SPDEVID:'',
            MOSEQ:'',
            MOLNKID:'',
            MOREFID:'',
            MOTESTCD:'',
            MOTEST:MOTEST,
            MOORRES:'',
            MOORRESU:'',
            MOSTRESC:'',
            MOSTRESN:'',
            MOSTRESU:'',
            MOLOC:'',
            MOSLOC:'',
            MOLAT:'',
            MOMETHOD:'',
            MOANMETH:'',
            MODTC:''
        }
        return Morphology;
    };
});

morphologyModule.service('morphologyServices', function() {
    var morphologicalFindings = [];

    var getMorphologicalFindings = function() {
        return morphologicalFindings;
    }

    var clearAll = function () {
        morphologicalFindings = [];
    }


    var generateSEQ = function () {
        var SEQs = compileFindings();
        if (SEQs.length > 0) {
            SEQs.sort(sortNumber);
            return (SEQs[SEQs.length-1]+1);
        }
        else {
            return 0;
        }
    }

    function sortNumber(a,b) {
        return a - b;
    }


    var compileFindings = function () {
        var seq = [];
        for (var e = 0; e < morphologicalFindings.length; e++) {
            seq.push(morphologicalFindings[e].MOSEQ);
        }
        return seq;
    }

    var addMorphologicalFinding = function(mo) {
        mo.MOSEQ = generateSEQ();
        morphologicalFindings.push(mo);
    }

    return {
        addMorphologicalFinding: addMorphologicalFinding,
        getMorphologicalFindings:getMorphologicalFindings,
        clearAll: clearAll
    }
});
