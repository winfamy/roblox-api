const request = require('request');

exports.module = function getInventory(roblox_user_id, callback) {
  var assettypes = [8, 18, 19];
  var left = 3;
  var inventory = [];

  for (var i = 0; i < 3; i++) {
    startAssetType(assettypes[i]);
  }

  function startAssetType(assettype) {
    request.get('https://www.roblox.com/Trade/inventoryhandler.ashx?userid=' + roblox_user_id + '&page=1&itemsPerPage=14&assetTypeId=' + assettype.toString(), function(err, resp, body) {
      json = JSON.parse(body);
      if(!(json.msg == 'Inventory retreived!'))
        return completed(assettype);

      maxpages = Math.ceil(json.data.totalNumber/14);
      pushInv(json);
      for(i = 1; i <= maxpages; i++) {
        nextPage(assettype, i, maxpages, roblox_user_id)
      }
    });
  }
  function nextPage(assettype, page, maxpages, roblox_user_id) {
    if(++page == maxpages)
      return completed(assettype);
    request.get('https://www.roblox.com/Trade/inventoryhandler.ashx?userid=' + roblox_user_id + '&page=' + page.toString() + '&itemsPerPage=14&assetTypeId=' + assettype.toString(), function(err, resp, body) {
      json = JSON.parse(body);
      if(!(json.msg == 'Inventory retreived!'))
        return completed(assettype);
      pushInv(json);
    });
  }
  function completed(assettype) {
    if(!--left) {
      callback(inventory);
    }
  }
  function pushInv(json) {
    json.data.InventoryItems.forEach(function(item) {
      inventory.push({
        name: item.Name,
        rap: parseInt(item.AveragePrice),
        uaid: item.UserAssetID,
        link: item.ItemLink
      });
    });
  }
}
