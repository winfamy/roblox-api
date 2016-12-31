import request from "request";

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
    }
}

module.exports = API;