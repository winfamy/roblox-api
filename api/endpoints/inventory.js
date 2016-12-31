import express from "express";

var router = express.Router();
router.get('/', (req, res) => {
    UserAPI.getUsername(202331844).then((response) => {
        res.send(response);
    });
});

module.exports = (app) => {
    app.use('/inventory', router);
}