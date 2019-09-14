require('dotenv').config();
const express = require('express');
var app = express();

const searchArtists = require('./code/searchArtists');
const searchMusics = require('./code/searchMusics');
const searchMusicalGenders = require('./code/searchMusicalGenders');
const artistsGenrersClassifier = require('./code/artistsGenrersClassifier');
const artistsGetMeta = require('./code/artistsGetMeta');
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-type');
    next();
});

app.use(searchArtists);
app.use(searchMusics);
app.use(searchMusicalGenders);
app.use(artistsGenrersClassifier);
app.use(artistsGetMeta);

// ---------------------------------


const PORT = process.env.PORT || 8080;


var server = app.listen(PORT, () => {
    console.log(`Running on port ${PORT}`);
});

server.on('close', () => {
    console.log(`closing....`);
});
