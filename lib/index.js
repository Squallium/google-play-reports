/**
 * Created by borja on 5/10/15.
 */

// imports
var exec = require('child_process').exec;
var fs = require('fs');
var unzip = require('unzip');
var path = require('path');
var parse = require('csv-parse');
var async = require('async');

// exports
exports.appEarnings = appEarnings;

// main methods
function appEarnings(urlEarnings, appId, reportPath, reportUnzipPath) {
    // get the list of reports
    var reportUrls = [];
    var reportUrl = null;
    gsutilLs(urlEarnings, null, onError, onSuccess);

    function onSuccess(res) {
        // select the last one
        reportUrls = res;
        reportUrl = reportUrls[reportUrls.length - 2];

        // Download the report
        gsutilCp(reportUrl, reportPath, onError, onFileDownloaded);

    }

    function onFileDownloaded() {
        console.log('Report downloaded');

        fs.createReadStream(reportPath + path.basename(reportUrl))
            .pipe(unzip.Extract({path: reportUnzipPath}))
            .on('close', function () {
                console.log('Report extracted');
            });
    }

    function onError() {
        console.log("Error");
    }
}


// auxiliar methods
function gsutilCp(cmd, folder, onError, onSuccess) {
    exec('gsutil cp ' + cmd + ' ' + folder, function (error, stdout, stderr) {
        if (error) {
            onError();
        } else {
            console.log(stdout);
            onSuccess();
        }
    });
}

function gsutilLs(cmd, appId, onError, onSuccess) {
    exec('gsutil ls ' + cmd, function (error, stdout, stderr) {
        //console.log(stdout);
        //console.log(stderr);
        if (error) {
            onError();
        }

        // Dividimos la salida del ls en un array
        var stdoutArray = stdout.split('\n');
        var appCrashReportUrls = [];

        if (appId) {
            for (var index in stdoutArray) {
                var crashReportUrl = stdoutArray[index];
                if (crashReportUrl.indexOf(_appId) > -1) {
                    appCrashReportUrls.push(crashReportUrl);
                }
            }
        } else {
            appCrashReportUrls = stdoutArray;
        }

        // Comprobamos que tenemos todas las urls
        onSuccess(appCrashReportUrls);
    });
}
