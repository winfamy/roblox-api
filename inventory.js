const request = require('request');
const express = require('express');
const bodyParser = require('body-parser');

api = express();
api.use(bodyParser.json());
api.use(bodyParser.urlencoded({ extended: false }));

api.get('/inventory/:user', function(req, res) {
  console.log('Started request for ' + req.params.user);
  newInventory(req.params.user, function(json) {
    console.log('Finished request for ' + req.params.user);
    res.json(json);
  });
});

api.listen(8080, function() {});

function newInventory(roblox_user_id, callback) {
  var types = [8,18,19,41,42,43,44,45,46,47];
  var left = types.length;
  var test = types.length;
  var inventory = [];
  var pages = [];
  for (var i = 0; i < types.length; i++) {
    getPage(types[i], 1);
  }

  function getPage(type, num, maxpages, tries) {
    request.get('https://www.roblox.com/Trade/inventoryhandler.ashx?userid=' + roblox_user_id + '&page=' + num.toString() + '&itemsPerPage=25&assetTypeId=' + type.toString(), {timeout:5000}, function(err, resp, body) {
      if(err) {
        if(tries == 5) {
          return complete(type);
        }
        return getPage(type, num, maxpages, (tries == undefined)?1:tries+1);
      }

      json = JSON.parse(body);
      if(!(json.msg == 'Inventory retreived!')) {
        return complete(type);
      }

      if(num == 1) {
        maxpages = Math.ceil(json.data.totalNumber/25);
        if(maxpages == 1)
          push(json, function() { complete(type); });
        else
          push(json, function() { getPage(type, num + 1, maxpages); });
      } else {
        if(num == maxpages)
          return push(json, function() { complete(type); });
        push(json, function() { getPage(type, num + 1, maxpages); });
      }
    });
  }

  function push(json, cb) {
    left_to_process = json.data.InventoryItems.length;
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
      callback(inventory);
    }
  }
}
