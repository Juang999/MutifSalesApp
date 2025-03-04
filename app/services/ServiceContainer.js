class ServiceContainer {
    constructor() {
        return {
            CartService: require('./CartService'),
            PriceService: require('./PriceService'),
            ProductService: require('./ProductService'),
            InventoryService: require('./InventoryService'),
        }
    }
}

module.exports = new ServiceContainer();