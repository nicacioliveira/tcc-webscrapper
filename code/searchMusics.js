const express = require('express');
const routes = express.Router();
const models = require('../db/models').models;
const cheerio = require('cheerio');
const fs = require('fs');
const request = require('request');

routes.get("/searchMusics", async function (req, res) {
    
    let allArtists = await models.artist.findAll({where: {}, limit: 1, offset: 0});
    
    console.log(allArtists);

    res.send("ok");
});

module.exports = routes;