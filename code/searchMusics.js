const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const { Op } = require('sequelize');
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

routes.get("/searchMusics", async function (req, res) {

    let page = 8;
    let limit = 150;
    let offset = (page-1) * limit;
    let numberOfSuccess = 0;

    let allArtists = await models.artist.findAll(
        {   
            offset, limit,
            
            attributes: ['id', 'name', 'letras_url'], 
            include: [
                {
                    model: models.musical_genrer, 
                    as: 'musical_genrers', 
                    where: {name: 'Forró'}, 
                    attributes: ['id', 'name'], 
                    through: { attributes: [] }
                }
            ]
        });
    

    const genUri = (l) => `https://www.letras.mus.br${l}`;

    let pagePromises = [];

    allArtists.forEach(a => {
        let uri = genUri(a.letras_url);
        pagePromises.push(new Promise((resolve, reject) => {
            console.log("Request: " + genUri(a.letras_url) + " ...")
            request({uri}, (error, response, body) => {

                if (error) {
                    console.log(`request failure for: ${a.name} | successes/total: ${numberOfSuccess}/${allArtists.length}`);
                    reject(error);
                }
                numberOfSuccess+=1;
                console.log(`request success for: ${a.name} | successes/total: ${numberOfSuccess}/${allArtists.length}`);
                
                resolve({artist_id: a.id, body});
            });
        }))
        
    });

    Promise.all(pagePromises).then(doms => {

        let bulkOfMusics = [];
        let bulkLimitToSave = 200;
        let resolvedRequestsCounter = 0;
        let numberOfAllRequests = allArtists.length;

        doms.forEach(d => {
            console.log("ArtistId: ", d.artist_id);
            resolvedRequestsCounter += 1;

            bulkOfMusics =  [...bulkOfMusics, ...getMusicList(d)];

            if (resolvedRequestsCounter % bulkLimitToSave === 0) {
                //save bulk;
                
                models.music.bulkCreate(bulkOfMusics, {}).then(ok => {
                    console.log("bulk saved!");
                }).catch(err => {
                    console.log("bulk save error!");
                });
                
                bulkOfMusics = [];
            } else if (resolvedRequestsCounter === numberOfAllRequests) {
                //done...
                //save last bulkOfMusics;
                
                models.music.bulkCreate(bulkOfMusics, {}).then(ok => {
                    console.log("bulk saved!");
                }).catch(err => {
                    console.log("bulk save error!");
                });
                
                bulkOfMusics = [];

            }

        })

        res.send(allArtists);
    });

});

function getMusicList(d) {
    let html = d.body;
    let artist_id = d.artist_id;

    let $ = cheerio.load(html);

    let artists = [];

    let todasAsMusicas = $('a[data-action="all"]');

    if (todasAsMusicas.length === 0) {
        //nao tem todas as musicas
        $('ol.cnt-list li').each((i, el) => {
            let name = $(el).text();
            let url = $(el).find('a').attr('href');  
            if (name && url) {
                let obj = { artist_id, name, url };
                artists.push(obj);
            }
        });
    } else {
        $('ul.cnt-list li').each((i, el) => {
            let name = $(el).text();
            let url = $(el).find('a').attr('href');  
    
            if (name && url) {
                let obj = { artist_id, name, url };
                artists.push(obj);
            }
        });


    }

    return artists;
}

module.exports = routes;