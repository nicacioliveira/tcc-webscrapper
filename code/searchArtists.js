const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

routes.get("/searchAllArtists", async function (req, res) {
    console.log("################### Searching All artists in website letras.com ###################");

    //formatt list of all artists on website
    console.log("################### Formatting urls for search ###################");
    // for name artists starting with 1-9
    const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1'.split('');
    const genUri = (l) => `https://www.letras.mus.br/letra/${l}/artistas.html`;
    console.log("Urls: ", alphabet);
    
    await setTimeout(() => {}, 3000);

    const urls = alphabet.map(l => genUri(l));
    const promiseDoms = [];

    console.log("################### Starting requests ###################");

    urls.forEach(url => {
        promiseDoms.push(new Promise((resolve, reject) => {
            console.log("Request: " + url + " ...")
            request({uri: url}, (error, response, body) => { 
                if (error)
                    reject(error)
                
                resolve(body);
            });
        }))
    })


    Promise.all(promiseDoms).then((doms) => {
        console.log("Creating bulk for insert in database...");
        let bulk = [];
        let response = [];

        doms.forEach(html => {
            bulk.push(getArtists(html));
        })
        
        bulk.forEach( (b, index) => {
            console.log(`preparing to save bulk ${index + 1}`);
            setTimeout(() => {
                models.artist.bulkCreate(b, {}).then(resp => {
                    response.push(resp);
                    console.log(`Bulk ${index + 1} saved.`);
                })
            }, 5000);
        })

        
        res.send(response);

    }).catch( (err) => {
        res.send(err);
    });
});

function getArtists(html) {
    let $ = cheerio.load(html);

    let artists = [];


    $('ul.cnt-list li').each((i, el) => {
        let name = $(el).text();
        let letras_url = $(el).find('a').attr('href');  

        let obj = { name, letras_url };

        artists.push(obj);
    });

    return artists;
}

module.exports = routes;