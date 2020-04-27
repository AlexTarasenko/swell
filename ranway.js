const Schema = require('schema-client');
const client = new Schema.Client('alext', 'AJOwu5Ohe3yrOTp6022e8iC5b8PV9miF',{
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
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'ranway_debug.log', options: { flags: 'w' } })
    ]
});

class Product {

    constructor(name){
        this.fieldName = name;
    }

// step 0:  Update a record by ID: 5e9d51c709d4900c9eff118f , 5ea29d602a07ee687dc04da3, 5e984d27d4af9b0a952f56b9
    async setFieldToProduct() {
        await swell.put('/products/{id}', {
            id: '5e984d27d4af9b0a952f56b9',
            ranway: 'false'
        }).then(products => {
            // console.log(products);
            logger.info(" SET product[id] with field ranway[value] :");
            logger.info("product_id: " + products.id + " , name: " + products.name  + " , ranway: " + products.ranway);
        }).catch(err => {
            console.log(err);
        });
    }

// Step 1:  GET products with a field: ranway  5e9d51c709d4900c9eff118f , 5ea29d602a07ee687dc04da3, 5e984d27d4af9b0a952f56b9
// GET products/?ranway[$exists]= true
    async getProductsWithField(fieldName) {
        let products = await swell.get('/products/?{field}[$exists]= true',
            {
                field: fieldName

            }).then(products => { // products is a result of promise execution
            let array = [];
            let count = products.results.length;
            logger.info(" GET product[id] with field " + fieldName +" [value] :");
            logger.info(" Products count:" + count );
            if ( products.results && count > 0){
                products.results.forEach(product => {                                   // fieldName
                    logger.info(product.id + " : " + product.name  + " : " + product.fieldName);
                    array[product.id] = product.ranway;
                });
            }
            return array; // callback on resolves
        }).catch(err => {
            console.log(err); // callback on reject
        });
        return products;
    }

// Step 2: PUT Attributes to Products:
    async setAttributesToProduct( key, value ) {
        await swell.put('/products/{id}',
            {
                id: key, // put product_id
                attributes:{
                    ranway: [value] // put values in array format !
                }
            }).then(products => {
            logger.info("product_id: " + products.id  + " , name: " + products.name  + " , ranway: " + products.attributes.ranway)
        }).catch(err => {
            console.log(err);
        });
    }

// Step 3: GET Products with Attributes
// GET products/?attributes.ranway[$exists]=true
    async getProductsWithAttribute(attributeName) {
        let attributes = await swell.get('/products/?attributes.{name}[$exists]=true',
            {
                name: attributeName

            }).then(products => {
            let array = [];
            let count = products.results.length;
            logger.info(" GET product[id] with attributes " + attributeName + "[value] :");
            logger.info(" Products count: " + count );
            if ( products.results && count > 0){
                products.results.forEach(product =>{
                    logger.info("product_id: " + product.id + " , name: " + product.name  + " , ranway: " + product.attributes.attributeName);
                    array[product.id] = product.attributes.ranway;
                });
            }
            return array;

        }).catch(err => {
            console.log(err);
        });
        return attributes;
    }
}


async function run(){

    console.log('running...');

    let product = new Product("ranway");
    // GET products with a field: ranway
    let products = await product.getProductsWithField(product.fieldName); // result => array of products or empty array

    if ( Object.entries(products).length > 0 ){
        console.table(products);
        const productsArray = Object.entries(products);
        logger.info(" Update product[id] with attributes" + product.fieldName + " [value] :");
        productsArray.forEach(([key, value]) => {
            product.setAttributesToProduct(key, value);
        });
        let attributes = await product.getProductsWithAttribute(product.fieldName);
        console.table(attributes);
    }else{
        console.log(" No products with a field: " + product.fieldName );
    }
}

run();
