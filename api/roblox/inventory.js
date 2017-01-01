import request from "request";
import Axios from "axios";

var API = {
    getInventory: (user_id) => {
        return new Promise((resolve, reject) => {
            var types = [8,18,19,41,42,43,44,45,46,47];
            var left = types.length;
            var inventory = [];
            var pages = [];
            for (var i = 0; i < types.length; i++)
                getPage(types[i], 1);

            function getPage(type, num, maxpages, tries) {
                request.get('https://www.roblox.com/Trade/inventoryhandler.ashx?userid=' + user_id.toString() + '&page=' + num.toString() + '&itemsPerPage=25&assetTypeId=' + type.toString(), {timeout:5000}, function(err, resp, body) {
                    if(err) {
                        if(tries == 5)
                            return complete(type);
                        return getPage(type, num, maxpages, (tries == undefined)?1:tries+1);
                    }

                    var json = JSON.parse(body);
                    if(!(json.msg == 'Inventory retreived!'))
                        return complete(type);

                    if(num == 1) {
                        var maxpages = Math.ceil(json.data.totalNumber/25);
                        if(maxpages == 1)
                            return push(json, function() { complete(type); });
                        push(json, function() { getPage(type, num + 1, maxpages); });
                    } else {
                        if(num == maxpages)
                            return push(json, function() { complete(type); });
                        push(json, function() { getPage(type, num + 1, maxpages); });
                    }
                });
            }

            function push(json, cb) {
                var left_to_process = json.data.InventoryItems.length;
                json.data.InventoryItems.forEach(function(item) {
                    inventory.push({
                        name: item.Name,
                        rap: parseInt(item.AveragePrice),
                        uaid: item.UserAssetID,
                        link: item.ItemLink
                    });
                    if(!--left_to_process) {
                        cb();
                    }
                });
            }

            function complete(type) {
                if(!--left) {
                    resolve(inventory);
                }
            }          
        })
    },
    getAssetOwners: (asset_id) => {
        return new Promise((resolve, reject) => {
            var owners = [];
            function getPage(asset_id, page_cursor, attempts) {
                var url = "https://inventory.roblox.com/v1/assets/"+asset_id.toString()+"/owners?sortOrder=Asc&limit=100" + (page_cursor?"&cursor=" + page_cursor:"");
                Axios.get(url).then((response) => {
                    console.log(owners.length);
                    return (response.data.nextPageCursor == null)
                        ? push(response.data, () => { resolve(owners); })
                        : push(response.data, () => { getPage(asset_id, response.data.nextPageCursor, 1); });
                })
                .catch((err) => {
                    console.log(err);
                    return (attempts == 3) ? resolve(owners) : getPage(asset_id, page_cursor, attempts+1);
                });
            }

            function push(json, callback) {
                var left_to_process = json.data.length;
                json.data.forEach(function(item) {
                    if(item.owner != null)
                        owners.push({
                            uaid: item.userAssetID,
                            serial: item.serialNumber,
                            owner: item.owner.userId
                        });
                    if(!--left_to_process) {
                        callback();
                    }
                });
            }

            getPage(asset_id, undefined, 1);
        });
    }
}

module.exports = API;