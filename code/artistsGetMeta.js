const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');
const wiki = require('wikijs').default;

routes.get("/meta", async function (req, res) {
   
    wiki({apiUrl: 'https://pt.wikipedia.org/w/api.php'}).find('Os tres do nordeste').then(page => {
        page.html().then(r => {
            res.send(r);
        });
    })

    //res.send('ok');
});

module.exports = routes;