var param = require(`./${process.argv[2]}`)

// ------ Node6.10用 -----
var callback = function(err,data) {
    console.log("-------------SUCCESS-------------")
    console.log('Response data:', JSON.stringify(data, null, 2));
}

var fail = function(err, data) {
    console.log("-------------ERROR-------------")
    console.log(err)
    console.log(data)
}

var success = function(err, data) {
    console.log("-------------SUCCESS-------------")
    if (data == null) {
        console.log(err);
    } else {
        console.log('Response data:', JSON.stringify(data, null, 2));
    }
}

var context = {succeed: success, fail: fail};


// ------ Node8.10用 -----

function successCallback(result) {
    console.log("-------------SUCCESS-------------")
    console.log(JSON.stringify(result,undefined,4));
}
  
function failCallback(error) {
    console.log("-------------ERROR-------------")
    console.log(error);
    console.log(error.message);
    console.log(error.stack);
}

var index = require(`../functions/skill/index.js`);
index.handle(param.event, context)
.then(successCallback, failCallback);
