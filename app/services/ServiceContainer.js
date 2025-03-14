class ServiceContainer {
    constructor() {
        return {
            UserService: require('./UserService'),
            CartService: require('./CartService'),
            PriceService: require('./PriceService'),
            PartnerService: require('./PartnerService'),
            GetDescService: require('./GetDescService'),
            ProductService: require('./ProductService'),
            InventoryService: require('./InventoryService'),
            SalesQuotationService: require('./SalesQuotationService'),
        }
    }
}

module.exports = new ServiceContainer();