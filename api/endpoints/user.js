import express from "express";
import UserAPI from "../roblox/user.js";

var router = express.Router();
router.get('/username/:user_id', (req, res) => {
    UserAPI.getUsername(req.params.user_id).then((username) => {
        res.json({ username : username });
    })
    .catch((err) => {
        res.status(500).json({ error : err });
    })
});

module.exports = (app) => {
    app.use('/user', router);
}