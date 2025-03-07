const {InventoryService, CartService} = require('../../services/ServiceContainer');
const {sequelize, Sequelize} = require('../../../models');
const Auth = require('../../../helper/Auth');
const {info, error: errorLog} = require('../../../helper/Logging');

class SalesV3Controller {
    insertToCart = async (req, res) => {
        try {
            const {body} = req;
            const {userid, user_ptnr_id} = Auth.user();
            const {
                pi_id: priceListId,
                pt_id: productId, en_id: entityId, 
                invc_oid: inventoryOid, qty: quantity, 
            } = body;

            await sequelize.transaction(async t => {
                let dataCart = await CartService.findDataCart(productId, userid);
                let dataQtyProduct = await InventoryService.getDataInventory(inventoryOid, t);

                let checkQtyProduct = this.validateQuantity(dataQtyProduct, dataCart, parseInt(quantity));

                if (checkQtyProduct == false) {
                    return 'pesanan melebihi stok'
                }

                await InventoryService.bookProductQuantity(inventoryOid, {
                    quantityAvailable: dataQtyProduct.dataValues.qty_available - parseInt(quantity),
                    quantityBooked: dataQtyProduct.dataValues.qty_booked + parseInt(quantity),
                }, t)

                if (!dataCart) {
                    return await CartService.inputIntoCart({productId, entityId, inventoryOid, quantity: parseInt(quantity), priceListId}, userid, t)
                } else {
                    return await CartService.updateCart(dataCart.dataValues.cs_oid, parseInt(dataCart.dataValues.cs_qty) + parseInt(quantity), t)
                }
            });

            res.status(200)
                .json({
                    status: 'success',
                    message: 'produk berhasil diinput',
                    data: true,
                    error: null
                })
        } catch (error) {
            errorLog('INPUT INTO CART', error.message);
            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    validateQuantity = (qtyProduct, qtyCart, qtyNeeded) => {
        let dataCart = (qtyCart != undefined) ? qtyCart.dataValues.cs_qty : 0;
        let qtyDelta = qtyProduct.dataValues.qty_available - (dataCart + qtyNeeded);

        return (qtyDelta < 0) ? false : true;
    }
}

module.exports = new SalesV3Controller();