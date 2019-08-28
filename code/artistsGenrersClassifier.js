const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

routes.get("/classify", async function (req, res) {
    
    //let musical_genrers = await models.musical_genrer.findAll();
    
    const genUri = (l) => `https://www.letras.mus.br${l}`;

    let musical_genrers = [{id: 1, gender_url: '/estilos/alternativo/'}, {id: 2, gender_url: '/estilos/axe/'}];

    let promisses_genrer_pages = [];

    musical_genrers.forEach(mg => {
        let url = genUri(mg.gender_url);

        promisses_genrer_pages.push(new Promise((resolve, reject) => {
            console.log("Request: " + url + " ...")
            request({uri: url}, (error, response, body) => { 
                if (error) {
                    console.log("Request: " + url + " ...failure")
                    reject(error);
                }
                
                console.log("Request: " + url + " ...ok")
                resolve(body);
            });
        }));

    });

    Promise.all(promisses_genrer_pages).then(gender_page => {
        
        let artists_in_gender_page = getArtists(gender_page);

        setTimeout(() => {
            //http://casperjs.org/
        }, 2000);
        
        res.send(genrers);
    })
    
});

module.exports = routes;