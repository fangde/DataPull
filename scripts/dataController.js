/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 03/11/15
 * Time: 16:21
 * To change this template use File | Settings | File Templates.
 */

var dataModule = angular.module('Data.parser',['Data.gourab','Data.joel','Optimise.patient', 'Data.iMed']);

dataModule.service('dataService', function () {
    var stringToObject = function (values) {
        return $.csv.toObjects(values);
    }

    return {
        stringToObject:stringToObject
    }
})

dataModule.controller('dataCtrl', function ($scope, $q,
                                            $rootScope,
                                            dataService,
                                            gourabData, joelData, iMedData) {
    $scope.readGourab = function() {
        var urlData = gourabData.getData();

        urlData.then(function (data) {
            console.log(data);
            var objects = dataService.stringToObject(data);
            gourabData.setData(objects);
            $scope.values = gourabData.print();

            var subjects = gourabData.toCDISC();

            for (var s = 0; s < subjects.length; s++) {
                console.log(gourabData.getID(s));
                $scope.jsonValues = angular.toJson(subjects[s]);


                var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
                var id = gourabData.getID(s);
                var url = id.concat('.json');
                saveAs(blob, url);



            }
        })
    };

    $scope.readJoel = function() {
        var urlData = joelData.getData();

        urlData.then(function (data) {
            //console.log(data);
            var objects = dataService.stringToObject(data);
            joelData.setData(objects);
            $scope.values = joelData.print();
            var subjects = joelData.toCDISC();
            for (var s = 0; s < subjects.length; s++) {
                //console.log(joelData.getID(s));
                $scope.jsonValues = angular.toJson(subjects[s]);

                var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
                var id = joelData.getID(s);
                var url = id.concat('.json');
                saveAs(blob, url);
            }
        })
    };

    var getIMedDomain = function(file) {
        return $q(function(resolve, reject) {
            setTimeout(function() {
                if (file != null) {
                    var promise = iMedData.getData(file);
                    promise.then(function(data) {
                        //console.log(data);
                        var dataObject = dataService.stringToObject(data);
                        resolve (dataObject);
                    }, function() {
                        alert('Failed: File Not found');
                    });
                }
            }, 1000)});
    }

    var readImedFiles = function(dataFile, domainData) {
        return $q(function(resolve, reject) {
            setTimeout(function() {
                var domain = "ID";
                var IDpromise = getIMedDomain(dataFile[domain]);
                IDpromise.then(function(data) {
                    console.log(domain);
                    if (data != [])
                        domainData[domain] = data;

                    domain = "VI";
                    var VIPromise = getIMedDomain(dataFile[domain]);
                    VIPromise.then(function(data) {
                        console.log(domain);
                        domainData[domain] = data;

                        domain = "RE";
                        var REPromise = getIMedDomain(dataFile[domain]);
                        REPromise.then(function(data) {
                            console.log(domain);
                            domainData[domain] = data;


                            domain = "TR";
                            var TRPromise = getIMedDomain(dataFile[domain]);
                            TRPromise.then(function(data) {
                                console.log(domain);
                                domainData[domain] = data;
                                resolve(domain);
//
//                                domain = "EP";
//                                var EPPromise = getIMedDomain(dataFile[domain]);
//                                EPPromise.then(function(data) {
//                                    console.log(domain);
//                                    domainData[domain] = data;
//
//                                    domain = "FH";
//                                    var FHPromise = getIMedDomain(dataFile[domain]);
//                                    FHPromise.then(function(data) {
//                                        console.log(domain);
//                                        domainData[domain] = data;
//
//                                        domain = "LT";
//                                        var LTPromise = getIMedDomain(dataFile[domain]);
//                                        LTPromise.then(function(data) {
//                                            console.log(domain);
//                                            domainData[domain] = data;
//
//                                            domain = "MR";
//                                            var MRPromise = getIMedDomain(dataFile[domain]);
//                                            MRPromise.then(function(data) {
//                                                console.log(domain);
//                                                domainData[domain] = data;
//
//                                                domain = "PG";
//                                                var PGPromise = getIMedDomain(dataFile[domain]);
//                                                PGPromise.then(function(data) {
//                                                    console.log(domain);
//                                                    domainData[domain] = data;
//
//                                                    domain = "RE";
//                                                    var REPromise = getIMedDomain(dataFile[domain]);
//                                                    REPromise.then(function(data) {
//                                                        console.log(domain);
//                                                        domainData[domain] = data;
//
//                                                        domain = "RL";
//                                                        var RLPromise = getIMedDomain(dataFile[domain]);
//                                                        RLPromise.then(function(data) {
//                                                            console.log(domain);
//                                                            domainData[domain] = data;
//
//                                                            domain = "TR";
//                                                            var TRPromise = getIMedDomain(dataFile[domain]);
//                                                            TRPromise.then(function(data) {
//                                                                console.log(domain);
//                                                                domainData[domain] = data;
//
//                                                                domain = "AE";
//                                                                var AEPromise = getIMedDomain(dataFile[domain]);
//                                                                AEPromise.then(function(data) {
//                                                                    console.log(domain);
//                                                                    domainData[domain] = data;
//
//                                                                    resolve(domain);
//                                                                })
//                                                            })
//                                                        })
//                                                    })
//                                                })
//                                            })
//                                        })
//                                    })
//                                })
                           })
                        })
                    })
                })
        }, 1000)});
    }

    $scope.readIMed = function() {
        var files = document.getElementById('iMedFiles').files;
        var domains = [];
        var dataFile = [];
        var domainData = [];


        for (var f = 0; f < files.length; f++) {
            var nameIndex = files[f].name.indexOf("_");
            var domainName = files[f].name.substr(nameIndex+1, 2);
            domains.push(domainName);
            dataFile[domainName] = files[f];
        }

        var promise = readImedFiles(dataFile, domainData);
        promise.then(function() {
            //console.log(domainData);
            iMedData.setData(domainData, domains);
            $scope.values = iMedData.print(domains);
            var subjects = iMedData.toCDISC();

            $scope.jsonValues = "";
            for (var s = 0; s < subjects.length; s++) {
                $scope.jsonValues = angular.toJson(subjects[s]);
                //console.log($scope.jsonValues);
//
                var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
                var id = iMedData.getID(s);
                var url = id.concat('.json');
                saveAs(blob, url);
            }
        }), function() {
            alert('Failed: ');
        };
    };

    var downloadToDrive = function (RecordSet, USUBJID) {
        var data = angular.toJson(RecordSet);
        //localStorage.setItem(USUBJID, data);
        //console.log(localStorage.getItem(patients.getCurrentPatient().USUBJID));

//        var subjects = localStorage.getItem("NHS_OPT_Map");
//        if (subjects == null)
//            subjects = [];
//        else
//            subjects = JSON.parse(subjects);
//
//        if (!IDExists(USUBJID)){
//
//            var newPair = {'NHS_USUBJID': USUBJID,
//                'USUBJID': USUBJID};
//            subjects.push(newPair);
//            localStorage.setItem("NHS_OPT_Map",JSON.stringify(subjects));
//        }

        //saveJSON(data, USUBJID);
        //savePDF();
    }

    var IDExists = function (OPT_ID) {
        var subjectList = localStorage.getItem('NHS_OPT_Map');
        if (subjectList != null) {
            subjectList = JSON.parse(subjectList);
            for (var s = 0; s < subjectList.length; s++) {
                if (subjectList[s].USUBJID == OPT_ID) {
                    return true;
                }
            }
        }
        return false;
    }

    var saveJSON = function (text, fileID) {
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var url = fileID + '.json';
        saveAs(blob, url);
    };
});
