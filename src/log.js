export function getLogger(debug = false) {
    if (debug) {
        return console.log.bind(console);
    } else {
        return function () {}
    }
}
