module.exports = (app) => {
    require('fs').readdirSync( require("path").join(__dirname, "endpoints")).forEach( (file) => {
        console.log(file);
        require('./endpoints/' + file)(app);
    });
}