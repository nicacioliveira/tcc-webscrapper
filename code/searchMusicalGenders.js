const models = require('../db/models').models;
const cheerio = require('cheerio');
const request = require('request');

async function run() {
    
    const url = 'https://www.letras.mus.br/estilos/';


    console.log("Request: " + url + " ...");
    let requestPromise = new Promise((resolve, reject) => {
        request({uri: url}, (error, response, body) => { 
            if (error)
                reject(error)
            
            resolve(body);
        });
    });

    requestPromise.then(resp => {
        let genders = getMusicaGenders(resp);

        models.musical_genrer.bulkCreate(genders, {}).then(resp => {
            console.log(`Bulk saved.`);
        }).finally(() => {
            console.log(genders)
        });
    });
};

function getMusicaGenders(html) {
    let $ = cheerio.load(html);

    let genders = [];


    $('ul.cnt-list li').each((i, el) => {
        let name = $(el).text();
        let gender_url = $(el).find('a').attr('href');  

        let obj = { name, gender_url };

        genders.push(obj);
    });

    return genders;
}

//run();