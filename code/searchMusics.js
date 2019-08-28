const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

routes.get("/searchMusics", async function (req, res) {
    let pageSize = 1;
    let offset = 0;
    
    let allArtists = await models.artist.findAll({where: {}, limit: pageSize, offset: offset});
    
    console.log(allArtists);

    res.send("ok");
});

module.exports = routes;