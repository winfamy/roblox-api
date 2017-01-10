import request from "request";
import Axios from "axios";

var API = {
    getInventory: (user_id) => {
        return new Promise((resolve, reject) => {
            var types = [8,18,19,41,42,43,44,45,46,47];
            var left = types.length;
            var inventory = [];
            var pages = [];
            for (var i = 0; i < types.length; i++) {
                pages[i] = [];
                getPage(types[i], 1);
            }

            function getPage(type, num, maxpages, tries=1) {
                request.get('https://www.roblox.com/Trade/inventoryhandler.ashx?userid=' + user_id + '&page=' + num.toString() + '&itemsPerPage=25&assetTypeId=' + type.toString(), {timeout:5000}, function(err, resp, body) {
                if(err) {
                    if(tries == 5) return complete(type);
                    return getPage(type, num, maxpages, tries+1);
                }

                var json = JSON.parse(body);
                if(!(json.msg == 'Inventory retreived!'))
                    return complete(type);


                if(num == 1) {
                    var maxpages = Math.ceil(json.data.totalNumber/25);
                    if(maxpages == 1)
                        return push(json, function() { complete(type); });
                    push(json, function() {
                        for (var i = 2; i <= maxpages; i++) {
                            pages[types.indexOf(type)].push(i);
                            getPage(type, i)
                        }
                    });
                } else {
                    push(json, function() {
                       pageComplete(type, num);
                    });
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
                        link: item.ItemLink,
                        img: item.ImageLink
                    });
                    if(!--left_to_process) {
                        cb();
                    }
                });
            }

            function pageComplete(type, page) {
                pages[types.indexOf(type)].splice(pages[types.indexOf(type)].indexOf(page), 1);
                if(!pages[types.indexOf(type)].length) { complete(type); }
            }

            function complete(type) {
                if(!--left) { resolve(inventory); }
            }          
        })
    },
    getAssetOwners: (asset_id) => {
        return new Promise((resolve, reject) => {
            var owners = [];
            function getPage(asset_id, page_cursor, attempts) {
                console.log(owners.length);
                var url = "https://inventory.roblox.com/v1/assets/"+asset_id.toString()+"/owners?sortOrder=Asc&limit=100" + (page_cursor?"&cursor=" + page_cursor:"");
                Axios.get(url).then((response) => {
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
    },
    getLimiteds: () => {
        return new Promise((resolve, reject) => {
            API.getInventory(1).then((inventory) => {
                for(var i = 0; i < inventory.length; i++)
                    inventory[i].id = parseInt(inventory[i].split('?id=')[1]);
                resolve(inventory);
            });
        });
    }
}

module.exports = API;