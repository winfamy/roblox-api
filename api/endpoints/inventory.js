import express from "express";
import InventoryAPI from "../roblox/inventory.js";

var router = express.Router();
router.get('/:user_id', (req, res) => {
    InventoryAPI.getInventory(req.params.user_id).then((inventory) => {
        res.json(inventory);
    });
});

module.exports = (app) => {
    app.use('/inventory', router);
} 