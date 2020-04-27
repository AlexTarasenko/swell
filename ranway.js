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
        new winston.transports.File({ filename: 'debug.log' })
    ]
});

class Product {
    // fieldNames = [ranway, heel, category_eng, season ]
    constructor(name){
        this.fieldName = name;
    }

    // GET products with a fieldName
    async getProductsWithField(fieldName) {
        let products = await swell.get('/products/?{field}[$exists]=true',
            {
                field: fieldName

            }).then(products => { // products is a result of promise execution (Object)
            let array = [];
            let count = products.results.length;
            logger.info(" GET products with field " + fieldName);
            logger.info(" Products count:" + count );
            if ( products.results && count > 0){
                products.results.forEach(product => {
                    logger.info(product.id + " : " + product.name + " : " + product[fieldName]);
                    array[product.id] = product[fieldName];
                });
            }
            return array; // callback on resolves
        }).catch(err => {
            console.log(err); // callback on reject
        });
        return products;
    }

    // PUT attributes to product:
    async setAttributesToProduct(attributeName, key, attributeValue ) {
        await swell.put('/products/{id}/?attributes.{attribute}={value}',
            {
                id: key,
                attribute: attributeName,
                value: attributeValue // text, array format for attribute of checkbox type

            }).then(products => {
            logger.info( products.id + " : " + products.name + " : " + products.attributes[attributeName])
        }).catch(err => {
            console.log(err);
        });
    }

    // GET products with attributes
    async getProductsWithAttribute(attributeName) {
        let attributes = await swell.get('/products/?attributes.{name}[$exists]=true',
            {
                name: attributeName

            }).then(products => {
            let array = [];
            let count = products.results.length;
            logger.info(" GET products with attribute " + attributeName);
            logger.info(" Products count: " + count );
            if ( products.results && count > 0){
                products.results.forEach(product =>{
                    logger.info( product.id + " : " + product.name + " : " + product.attributes[attributeName]);
                    array[product.id] = product.attributes[attributeName];
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

    let product = new Product("season");
    console.log(" Running..." + product.fieldName);
    let products = await product.getProductsWithField(product.fieldName); // result => array of products or empty array

    if ( Object.entries(products).length > 0 ){
        console.table(products);
        const productsArray = Object.entries(products);
        logger.info(" Update products with attribute: " + product.fieldName);
        productsArray.forEach(([key, value]) => {
            product.setAttributesToProduct(product.fieldName, key, value);
        });
        let attributes = await product.getProductsWithAttribute(product.fieldName);
        console.table(attributes);
    }else{
        console.log(" No products with a field: " + product.fieldName );
    }
}

run();
