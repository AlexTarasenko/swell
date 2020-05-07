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

/*
* GET products with the field
* returns {field , product_id} for example:
* [
    { ranway: 'true', id: '5e9d51c709d4900c9eff118f' },
    { ranway: 'false', id: '5e984d27d4af9b0a952f56b9' }
  ]
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
* PUT empty badges attribute to all products. It is an array with 2 fields ranway, popular
* check if field ranway is set, then add it to array
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

            attributes.badges = [];
            if (typeof(attributes.ranway) !== 'undefined'){ // ranway = false, "false"
                if ( attributes.ranway && attributes.ranway != 'false' ){
                    attributes.badges = ["ranway"];
                }
                delete attributes.ranway;
            }

            return {
                url: `/products/${id}`,
                method: 'PUT',
                data: {
                    attributes,
                }
            }
        }),
    );
}





const fields = ["ranway", "heel", "category_ENG", "season"];
// note category_ENG != category_eng
const LIMIT = 100;
const limit = parseInt(process.argv.slice(2));

async function run(field, limit) {
    let threshold = (limit && limit < LIMIT) ? limit : LIMIT;
    console.log(" Running..." + field );
    let page = 1;
    try {
        while (true) {
            // Get products
            const products = await getProductsWithField(field, {limit: threshold, page});
            logger.info(products);
            // Update products
            const updatedProducts = await setDataToProducts(products);
            if (products.length < LIMIT) {
                break;
            }
            page++;
        }
    } catch (e) {
        console.log(e);
    }
}

fields.forEach(field => run(field, limit));

