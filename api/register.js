module.exports = (app) => {
    require('fs').readdirSync( require("path").join(__dirname, "endpoints")).forEach( (file) => {
        require('./endpoints/' + file)(app);
    });
}