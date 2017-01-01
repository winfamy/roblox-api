import express from "express";
import InventoryAPI from "../roblox/inventory.js";

var router = express.Router();
router.get('/:user_id', (req, res) => {
    InventoryAPI.getInventory(req.params.user_id).then((inventory) => {
        res.json(inventory);
    });
});
router.get('/owners/:asset_id', (req, res) => {
    InventoryAPI.getAssetOwners(req.params.asset_id).then((owners) => {
        res.json(owners);
    })
})

module.exports = (app) => {
    app.use('/inventory', router);
} 