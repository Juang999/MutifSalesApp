class Page {
    constructor(page, limit) {
        let pagePage = (page) ? page : 1
        let pageLimit = limit
    
        return {
            page: pagePage,
            limit: pageLimit,
            offset: (pagePage * pageLimit) - pageLimit
        }
    }
}

module.exports = Page;