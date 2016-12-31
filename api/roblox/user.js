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
    },
    getUserId: (username) => {
        return new Promise((resolve, reject) => {
            Axios.get('https://api.roblox.com/users/get-by-username?username=' + username).then((response) => {
                resolve(response.data.Id);
            })
            .catch((err) => { reject(err); })
        });
    }
}

module.exports = API;