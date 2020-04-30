const Schema = require('schema-client');
const client = new Schema.Client('alext', 'AJOwu5Ohe3yrOTp6022e8iC5b8PV9miF', {
    cache: false,
});
const swell = require('swell-node').init('alext', 'AJOwu5Ohe3yrOTp6022e8iC5b8PV9miF');
const winston = require('winston');

const logger = winston.createLogger({
    format: winston.format.json(),
    transports: [
        //
        // - Write all logs with level `error` and below to `error.log`
        // - Write all logs with level `info` and below to `combined.log`
        //
        new winston.transports.File({filename: 'error.log', level: 'error'}),
        new winston.transports.File({filename: 'debug.log'})
    ]
});
const fields = ["ranway", "heel", "category_eng", "season"];


/*
* GET products with the field
* returns {field , product_id}
*/
function getProductsWithField(field, options) {

    return swell.get(`/products`, // result is a promise => array of Objects or Object
        {
            ...options,
            [field]: {$exists: true},
            fields: ['id', field],
        })
        .then(data => data.results)
}

/*
* PUT attributes data to the product
* returns results
*/
function setDataToProducts(products) {

    if (!products || !products.length) {
        return Promise.resolve();
    }

    return swell.put(
        '/:batch',
        products.map(product => {
            const {id, ...attributes} = product;

            return {
                url: `/products/${id}`,
                method: 'PUT',
                data: {
                    attributes
                }
            }
        }),
    );
}

/*
* POST attributes data to the product
* returns results
*/
async function createProducts(field){
    await swell.post(`/products`,
        {
            name: Math.random()*300,
            sku: Math.random()*10,
            active: true,
            price: 99.00,
            [field]: Math.random().toString(36).replace(/[^a-z]+/g, '').substr(0, 5),
        }
    )
}


async function run(field) {

    console.log(" Running..." + field);
    let page = 1;
    try {
        while (true) {
            // Get products
            const products = await getProductsWithField(field, {limit: 100, page});
            logger.info(products);
            // Check if there is an attribute with a field: value
            // Update products
            const updatedProducts = await setDataToProducts(products);
            if (products.length < 100) {
                break;
            }
            page++;
        }
    } catch (e) {
        console.log(e);
    }
}

fields.forEach(field => run(field));

