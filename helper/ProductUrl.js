const {devEnvironment} = require('../config/environment');
const axios = require('axios');

class ProductUrl {
    getData = async (route) => {
        let {data} = await axios.get(`${devEnvironment.parsed.PRODUCT_URL}${route}`)

        return data;
    }
}

module.exports = new ProductUrl();