//exports is a JS object which is returned when we require() the module in app.js

exports.getDate = function getDate() {      //declaring a key, getDate, in exports object and assigning it value of function
    let options = {
        weekday: "long",
        day: "numeric",
        month: "long",
    };
    let today = new Date();
    let date = today.toLocaleDateString("en-US", options);
    return date;
}