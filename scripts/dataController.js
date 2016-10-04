/**
 * Created with IntelliJ IDEA.
 * User: myyong
 * Date: 03/11/15
 * Time: 16:21
 * To change this template use File | Settings | File Templates.
 */

var dataModule = angular.module('Data.parser',['Data.gourab',
    'Data.joel',
    'Optimise.patient',
    'Data.iMed',
    'Data.gosh',
    'Data.chx',
    'Data.arie']);

dataModule.service('dataService', function () {
    var stringToObject = function (values) {
        return $.csv.toObjects(values);
    }

    return {
        stringToObject:stringToObject
    }
});

dataModule.controller('dataCtrl', function ($scope, $q,
                                            $rootScope,
                                            dataService,
                                            gourabData, joelData, iMedData, goshData, chxData, arieData) {
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

    $scope.readCHX = function() {
        var fingalimodURL = chxData.getFingolimodData();
        fingalimodURL.then(function (fingalimodData) {
            var fingalimodObjects = dataService.stringToObject(fingalimodData);
            var fingalimodValues = chxData.setData(fingalimodObjects);
            //var fingalimodValues = chxData.print();
            var fingalimodSubjects = chxData.toCDISC_Fingalimod();

            var tecfideraURL = chxData.getTecfideraData();
            tecfideraURL.then(function (tecfideraData) {
                var tecfideraObjects = dataService.stringToObject(tecfideraData);
                var tecfideraValues = chxData.setData(tecfideraObjects);
                //var tecfideraValues = chxData.print();
                //console.log(tecfideraValues);
                //$scope.values = tecfideraValues;
                var tecfideraSubjects = chxData.toCDISC_Tecfidera(fingalimodValues);




//            //for (var s = 0; s < subjects.length; s++) {
                for (var s = 0; s < 1; s++) {
                    $scope.jsonValues = angular.toJson(fingalimodSubjects[s]);
                    var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
                    var id = chxData.getFingolimodID(fingalimodValues, s);
                    var url = id.concat('.json');
                    //console.log(url);
                    saveAs(blob, url);
                }

                for (var s = 0; s < 1; s++) {
                    $scope.jsonValues = angular.toJson(tecfideraSubjects[s]);
                    var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
                    var id = chxData.getTecfideraID(tecfideraValues, s);
                    var url = id.concat('.json');
                    //console.log(url);
                    saveAs(blob, url);
                }
            })
        })
    };


    $scope.readGOSH = function() {

        var file = document.getElementById('yaelFile').files;
        //console.log(file[0]);

        var urlData = goshData.getData(file[0]);
        //console.log(urlData);

        urlData.then(function (data) {
            //console.log(data);
            //var result = data.replace(/[r|rn]/g, "/n");
            var objects = dataService.stringToObject(data);
            goshData.setData(objects);
            //$scope.values = goshData.print();
            var subjects = goshData.toCDISC();
            for (var s = 0; s < subjects.length; s++) {
            //for (var s = 0; s < 1; s++) {
                $scope.jsonValues = angular.toJson(subjects[s]);
//
//                var blob = new Blob([$scope.jsonValues], { type: "text/plain;charset=utf-8" });
//                var id = goshData.getID(s);
//                var url = id.concat('.json');
//                saveAs(blob, url);
                saveJSON($scope.jsonValues, goshData.getID(s));
                downloadToDrive($scope.jsonValues, goshData.getID(s));
            }
        })
    };

    $scope.readArie = function() {

        var file = document.getElementById('arieFile').files;
        console.log(file[0]);

        var urlData = arieData.getData(file[0]);
        console.log(urlData);

        urlData.then(function (data) {
            //console.log(data);

            var objects = dataService.stringToObject(data);
            arieData.setData(objects);
            $scope.values = arieData.print();
            var subjects = arieData.toCDISC();
            for (var s = 0; s < subjects.length; s++) {

                $scope.jsonValues = angular.toJson(subjects[s]);
                //saveJSON($scope.jsonValues, arieData.getID(s));
                downloadToDrive($scope.jsonValues, arieData.getID(s));
            }
        })
    };

    var getIMedDomain = function(file) {
        return $q(function(resolve, reject) {
            //setTimeout(function() {
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
        });
            //}, 0)});
    }

    var readImedFiles = function(dataFile, domainData) {
        return $q(function(resolve, reject) {
            //setTimeout(function() {
                var domain = "ID";
                var IDpromise = getIMedDomain(dataFile[domain]);
                IDpromise.then(function(data) {
                    console.log(domain);
                    if (data != [])
                        domainData[domain] = data;
                    console.log(data);

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
                                //resolve(domain);

                                domain = "EP";
                                var EPPromise = getIMedDomain(dataFile[domain]);
                                EPPromise.then(function(data) {
                                    console.log(domain);
                                    domainData[domain] = data;

//                                    domain = "FH";
//                                    var FHPromise = getIMedDomain(dataFile[domain]);
//                                    FHPromise.then(function(data) {
//                                        //console.log(domain);
//                                        domainData[domain] = data;

                                        domain = "LT";
                                        var LTPromise = getIMedDomain(dataFile[domain]);
                                        LTPromise.then(function(data) {
                                            console.log(domain);
                                            domainData[domain] = data;

                                            domain = "MR";
                                            var MRPromise = getIMedDomain(dataFile[domain]);
                                            MRPromise.then(function(data) {
                                                console.log(domain);
                                                domainData[domain] = data;

//                                                domain = "PG";
//                                                var PGPromise = getIMedDomain(dataFile[domain]);
//                                                PGPromise.then(function(data) {
//                                                    //console.log(domain);
//                                                    domainData[domain] = data;

                                                    domain = "RE";
                                                    var REPromise = getIMedDomain(dataFile[domain]);
                                                    REPromise.then(function(data) {
                                                        console.log(domain);
                                                        domainData[domain] = data;

//                                                        domain = "RL";
//                                                        var RLPromise = getIMedDomain(dataFile[domain]);
//                                                        RLPromise.then(function(data) {
//                                                            //console.log(domain);
//                                                            domainData[domain] = data;

                                                            domain = "TR";
                                                            var TRPromise = getIMedDomain(dataFile[domain]);
                                                            TRPromise.then(function(data) {
                                                                console.log(domain);
                                                                domainData[domain] = data;

                                                                domain = "CS";
                                                                var CSPromise = getIMedDomain(dataFile[domain]);
                                                                CSPromise.then(function(data) {
                                                                    console.log(domain);
                                                                    domainData[domain] = data;

                                                                    resolve(domainData);
                                                                })
                                                            })
                                                        //})
                                                    })
                                                //})
                                            })
                                        //})
                                    })
                                })
                           })
                        })
                    })
                })
       // }, 0)});
        });
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
        promise.then(function(domainData) {
            iMedData.setData(domainData, domains);
            $scope.values = iMedData.print(domains);
            var subjects = iMedData.toCDISC();

            $scope.jsonValues = "";
            for (var s = 0; s < subjects.length; s++) {
                $scope.jsonValues = angular.toJson(subjects[s]);
                saveJSON($scope.jsonValues, iMedData.getID(s));
                // used for GOSH
                //downloadToDriveiMED($scope.jsonValues, iMedData.getNHS_ID(s), iMedData.getID(s));
                downloadToDrive($scope.jsonValues, iMedData.getID(s));
            }
        }), function() {
            alert('Failed: ');
        };
    };

    var subjects = localStorage.getItem("NHS_OPT_Map");

    var downloadToDrive = function (data, USUBJID) {
        //if (!IDExists(USUBJID)){
            localStorage.setItem(USUBJID, data);
            //console.log(localStorage.getItem(USUBJID));
            var subjects = localStorage.getItem("NHS_OPT_Map");

            if (subjects === null){
                localStorage.setItem("NHS_OPT_Map", []);
                subjects = [];
            }
            else
                subjects = JSON.parse(subjects);

            var newPair = {'NHS_USUBJID': USUBJID,
                'USUBJID': USUBJID};
            subjects.push(newPair);
            localStorage.setItem("NHS_OPT_Map",JSON.stringify(subjects));
//        }
//        else {
//            console.log("NHS_USUBJID: "+USUBJID+" already in database");
//        }
    }

    var IDExists = function (OPT_ID) {
        var subjectList = localStorage.getItem('NHS_OPT_Map');

        if (subjectList != null ) {
                if (subjectList.length == 0){
                return false;
            }
            else {
                subjectList = JSON.parse(subjectList);
                for (var s = 0; s < subjectList.length; s++) {
                    if (subjectList[s].USUBJID == OPT_ID) {
                        return true;
                    }
                }
            }
        }
    }

    var downloadToDriveiMED = function (data, NHS_USUBJID, USUBJID) {
        if (!IDExistsIMed(NHS_USUBJID)){
            localStorage.setItem(USUBJID, data);
            //console.log(localStorage.getItem(USUBJID));
            var subjects = localStorage.getItem("NHS_OPT_Map");

            if (subjects === null){
                localStorage.setItem("NHS_OPT_Map", []);
                subjects = [];
            }
            else
                subjects = JSON.parse(subjects);

            var newPair = {'NHS_USUBJID': NHS_USUBJID,
                'USUBJID': USUBJID};
            subjects.push(newPair);
            localStorage.setItem("NHS_OPT_Map",JSON.stringify(subjects));
        }
        else {
            console.log("NHS_USUBJID: "+NHS_USUBJID+" already in database");
        }
    }

    var IDExistsIMed = function (OPT_ID) {
        var subjectList = localStorage.getItem('NHS_OPT_Map');

        if (subjectList != null ) {
            if (subjectList.length == 0){
                return false;
            }
            else {
                subjectList = JSON.parse(subjectList);
                for (var s = 0; s < subjectList.length; s++) {
                    if (subjectList[s].NHS_USUBJID == OPT_ID) {
                        return true;
                    }
                }
            }
        }
    }

    var saveJSON = function (text, fileID) {
        var blob = new Blob([text], { type: "text/plain;charset=utf-8" });
        var url = fileID + '.json';
        saveAs(blob, url);
    };
});
