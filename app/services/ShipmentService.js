const {SoShipMstr, SoShipdDet} = require('../../models');

class ShipmentService {
    getDetailShipment = async (shipmentCode) => {
        let result = await SoShipMstr.findOne({
            attributes: ['soship_oid', 'soship_code'],
            where: {
                soship_code: shipmentCode
            }
        })

        return result;
    }
}

module.exports = new ShipmentService();