
/**
 * route for Virtual Private Server
*/
// const {parsed: config} = require('dotenv').config({path: '/root/Project/MutifSalesApp/.env.development'});

/**
 * route for local Windows
*/
const {parsed: config} = require('dotenv').config({path: 'C:/Users/user/Project/MutifSalesApp/.env.development'});
const axios = require('axios');

class ProductUrl {
    getData = async (route) => {
        let {data} = await axios.get(`${config.PRODUCT_URL}${route}`)

        return data;
    }
}

module.exports = new ProductUrl();