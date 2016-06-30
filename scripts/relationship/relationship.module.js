/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 23/01/2015
 * Time: 16:22
 * To change this template use File | Settings | File Templates.
 */
var relationshipModule = angular.module('Optimise.relationship',[]);

relationshipModule.factory('relationship', function () {
    return function() {
        this.USUBJID= '';
        this.STUDYID="OPTIMISE"
        this.DOMAIN="REL";
        this.RDOMAIN="";
        this.IDVAR= "";
        this.IDVARVAL= "";   // Question short name
        this.RELTYPE= "";
        this.RELID= "";

    }
})

relationshipModule.service('relationships', function (relationship) {
    var relationships = [];

    var clearAll = function() {
        relationships = [];
    }

    var groupsIndex = 0;

    var addRelationship = function(domain1, domain2, IDVAR1, IDVAR2, RELTYPE1, RELTYPE2, IDVARVAL)
    {
        var newRel1 = new relationship();
        newRel1.USUBJID = domain1.USUBJID;
        newRel1.RELID = groupsIndex;
        newRel1.RDOMAIN = domain1.DOMAIN;
        newRel1.IDVAR = IDVAR1;
        newRel1.IDVARVAL = IDVARVAL;
        newRel1.RELTYPE = RELTYPE1;

        var newRel2 = new relationship();
        newRel2.USUBJID = domain2.USUBJID;
        newRel2.RELID = groupsIndex;
        newRel2.RDOMAIN = domain2.DOMAIN;
        newRel2.IDVAR = IDVAR2;
        newRel2.IDVARVAL = IDVARVAL;
        newRel2.RELTYPE = RELTYPE2;

        groupsIndex = groupsIndex+1;

        relationships.push(newRel1);
        relationships.push(newRel2);
    }

    var getRelationshipByIDVARVAL = function(IDVARVAL) {
        var relevantRelationships = [];
        for (var r = 0; r < relationships.length; r++) {
            if (relationships[r].IDVARVAL == IDVARVAL){
                relevantRelationships.push(relationships[r]);
            }
        }
        return relevantRelationships;
    }

    var getRelationships = function () {
        return relationships;
    }

    return {
        addRelationship:addRelationship,
        getRelationships: getRelationships,
        clearAll: clearAll
    };
})