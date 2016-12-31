import Axios from "axios";

var API = {
    getUsername: (user_id) => {
        return new Promise((resolve, reject) => {
            Axios.get('http://api.roblox.com/users/' + user_id.toString())
                .then((response) => {
                    resolve(response.data.Username);
                })
                .catch((err) => { reject(err); });
        });
    }
}

module.exports = API;