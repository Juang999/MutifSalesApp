class ServiceContainer {
    constructor() {
        return {
            CartService: require('./CartService'),
            PriceService: require('./PriceService'),
            PartnerService: require('./PartnerService'),
            ProductService: require('./ProductService'),
            InventoryService: require('./InventoryService'),
            SalesQuotationService: require('./SalesQuotationService'),
        }
    }
}

module.exports = new ServiceContainer();