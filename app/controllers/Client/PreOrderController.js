const {
    sequelize,
} = require('../../../models');
const Auth = require('../../../helper/Auth');
const Helper = require('../../../helper/Helper');
const {info, errorV2: errorLog} = require('../../../helper/Logging');
const {CartService, InventoryService} = require('../../services/ServiceContainer');

class PreOrderController {
    index = async (req, res) => {
        CartService.retrieveDataCart(Auth.user().userid, 'Y')
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog('GET DATA PRE-ORDER', err.message)

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: Helper.errorResponse(err.message)
                })
        })
    }

    store = async (req, res) => {
        // data user
        let {userid, usernama: username} = Auth.user();
        // data body
        let {product_id, entity_id, inventory_oid, quantity, pricelist_id} = req.body;

        sequelize.transaction(async t => {
            let dataPreOrder = await CartService.findDataCart(product_id, inventory_oid, userid, 'Y');

            if (!dataPreOrder) {
                let bodyPreOrder = {
                    productId: product_id, 
                    entityId: entity_id, 
                    inventoryOid: inventory_oid, 
                    quantity: parseInt(quantity),
                    priceListId: pricelist_id,
                }

                await Promise.all([
                    CartService.inputIntoCart(bodyPreOrder, {userid, username}, 'Y', t),
                    InventoryService.updateQtyAllocated(inventory_oid, `CAST(invc_qty_alloc AS INTEGER) + ${parseInt(quantity)}`, t)
                ])
            } else {
                await Promise.all([
                    CartService.updateCart(dataPreOrder.dataValues.cs_oid, dataPreOrder.dataValues.qty + parseInt(quantity), 'D', t),
                    InventoryService.updateQtyAllocated(inventory_oid, `CAST(invc_qty_alloc AS INTEGER) + ${parseInt(quantity)}`, t)
                ])
            }
        })
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'stored',
                    data: true,
                    error: null
                })
        })
        .catch(err => {
            errorLog('INPUT PRE-ORDER', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: true,
                    error: Helper.errorResponse(err.message)
                })
        })
    }

    destroy = async (req, res) => {
        try {
            let {userid: userId, usernama: userName} = Auth.user();

            let dataCart = await CartService.retrieveDataCartByProductId(req.params.product_id, userId, 'Y');

            if (!dataCart) {
                res.status(404)
                    .json({
                        status: 'unknown',
                        message: 'unknown',
                        data: null,
                        error: 'data not found!'
                    });

                return;
            }

            await sequelize.transaction(async t => {
                
                for (const {dataValues: singularDataCart} of dataCart) {
                    await Promise.all([
                        InventoryService.updateQtyAllocated(singularDataCart.cs_invc_oid, `CAST(invc_qty_alloc AS INTEGER) - ${parseInt(singularDataCart.cs_qty)}`, t),
                        CartService.deleteDataCart(singularDataCart.cs_oid, {userId, userName}, t)
                    ]);
                }
            })

            res.status(200)
                .json({
                    status:'success',
                    message: 'data berhasil dihapus',
                    data: true,
                    error: null
                })
        } catch (error) {
            errorLog('DELETE PRE-ORDER', error.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: error.message
                })
        }
    }

    dataCheckout = async (req, res) => {
        let {userid} = Auth.user()

        CartService.retrieveDataToCheckout(userid, 'D', 'Y')
        .then(result => {
            res.status(200)
                .json({
                    status: 'success',
                    message: 'ok',
                    data: result,
                    error: null
                })
        })
        .catch(err => {
            errorLog('PRE-ORDER | GET DATA CHECKOUT', err.message);

            res.status(400)
                .json({
                    status: 'failed',
                    message: 'error',
                    data: null,
                    error: Helper.errorResponse(err.message)
                })
        })
    }
}

module.exports = new PreOrderController();