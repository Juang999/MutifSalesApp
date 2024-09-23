const {devEnvironment} = require('../config/environment');
const axios = require('axios');

class ProductStock {
    getData = async (route, dataHeader, dataBody) => {
        let {data} = await axios.get(`${devEnvironment.parsed.PRODUCT_STOCK}${route}`, {
            headers: dataHeader,
            data: dataBody
        })

        return data.data;
    }

    postData = async (route, dataHeader, dataBody) => {
        let {data} = await axios.post(`${devEnvironment.parsed.PRODUCT_STOCK}${route}`, dataBody, dataHeader)

        return data.data;
    }

    patchData = async (route, dataHeader, dataBody) => {
        let {data} = axios.patch(`${devEnvironment.parsed.PRODUCT_STOCK}${route}`, dataHeader, dataBody);
    }

    putData = async (route, dataHeader, dataBody) => {
        let {data} = axios.put(`${devEnvironment.parsed.PRODUCT_STOCK}${route}`, dataHeader, dataBody);
    }
}

module.exports = new ProductStock();