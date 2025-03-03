class ServiceContainer {
    constructor() {
        return {
            InventoryService: require('./InventoryService'),
            ProductService: require('./ProductService')
        }
    }
}

module.exports = new ServiceContainer();