class ServiceContainer {
    constructor() {
        return {
            PriceService: require('./PriceService'),
            ProductService: require('./ProductService'),
            InventoryService: require('./InventoryService'),
        }
    }
}

module.exports = new ServiceContainer();