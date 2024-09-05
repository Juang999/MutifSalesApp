/**
 * config for Virtual Private Server
*/
// const {parsed: config} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env'});

/**
 * config for local WIndows
*/
const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env'});
const {get} = require('express-http-context');
const {verify} = require('jsonwebtoken');

class Auth {
    user = async () => {
        let token = get('token');

        if (token != null) {
            let {userid, usernama, password, groupid, user_ptnr_id, ptnrg_id} = verify(get('token'), config.ACCESS_TOKEN_SECRET);
            return {userid, usernama, password, groupid, user_ptnr_id, ptnrg_id};
        } else {
            return {
                userid: null, 
                usernama: null,
                password: null, 
                groupid: null, 
                user_ptnr_id: null, 
                ptnrg_id: null
            }
        }

    }
}

module.exports = new Auth();