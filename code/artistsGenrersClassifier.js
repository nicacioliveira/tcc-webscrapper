const models = require('../db/models').models;
const cheerio = require('cheerio');
const request = require('request');

async function run() {
    
    console.log(`finding all musical genders...`);
    await setTimeout(()=>{}, 3000);
    let musical_genrers = await models.musical_genrer.findAll({});
    
    const genUri = (l) => `https://www.letras.mus.br${l}todosartistas.html`;

    let promisses_genrer_pages = [];
    console.log(`getting all gender pages...`);
    await setTimeout(()=>{}, 3000);

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
                resolve({gender: mg, body});
            });
        }));

    });

    await Promise.all(promisses_genrer_pages).then(result => processPromises(result));
    
    console.log('--------------------------------------------------');
    console.log('-------------------------Done---------------------');
    console.log('--------------------------------------------------');

};

function processPromises(result) {
    console.log('--------------------------------------------------');
    console.log('-------------------starting process---------------');
    console.log('--------------------------------------------------');
    
    result.forEach(async page => {
        console.log('--------------------------------------------------');
        console.log(`getting ${page.gender.name} artists`);
        console.log(`${page.gender.name} id -> ${page.gender.id}`);
        console.log('--------------------------------------------------');
        console.log('get artist names');
        let artists_names = await getArtists(page.body);
        console.log('get artists');
        let artists = await models.artist.findAll({where: {name: artists_names}, raw: true});
        console.log('create bulk artist-gender');
        let bulk = await artists.map(a => ({artist_id: a.id, musical_genrer_id: page.gender.id}));
        console.log(`saving bulk with gender ${page.gender.name} ...`);
        await models.artists_musical_genrers.bulkCreate(bulk, {}).then(r => {
            console.log(`bulk with gender ${page.gender.name} saved.`);
        }).catch( err => {
            console.error(`bulk with gender ${page.gender.name} error.`);
        });
        
    });
}

function getArtists(html) {
    let $ = cheerio.load(html);
    let artists = [];
    $('ul.cnt-list li').each((i, el) => {
        let name = $(el).text();
        let letras_url = $(el).find('a').attr('href');

        artists.push(name);
    });

    return artists;
}

//run();