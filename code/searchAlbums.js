const models = require('../db/models').models;
const { Op } = require('sequelize');
const cheerio = require('cheerio');
const request = require('request');

async function run() {

    const proxiesList = [
        '217.182.120.161:1080', 
        '109.199.133.161:23500', 
        '187.243.253.182:33796',
        '187.191.20.6:54375',
        '200.222.31.146:44726',
        '213.14.31.122:48024',
        '43.252.158.21:56595',
        '76.76.76.74:53281',
        '185.204.208.78:8080',
        '91.205.146.25:37501',
        '125.209.116.94:60364',
        '151.252.72.211:53281',
        '109.72.227.56:53281',
        '188.170.41.6:60332',
        '82.147.116.201:41234',
        '154.73.108.173:53281',
        '125.99.247.113:50107',
        '185.44.229.227:34930',
        '103.251.58.51:61489',
        '159.192.97.80:43278',
        '117.241.99.30:41064',
        '103.47.239.153:39797'
    ];
    
    const getProxy = () => proxiesList[Math.floor(Math.random() * proxiesList.length)];


    let page = 12; //2, 4, 5
    let limit = 100;
    let offset = (page-1) * limit;
    let numberOfSuccess = 0;
    //let allArtists = [{id: 220383, name: "Luiz Gonzaga", letras_url: "/luiz-gonzaga/" }, {id: 53746, name: "Genival Lacerda", letras_url: "/genival-lacerda/" }, {id: 1, name: "Waldonys", letras_url: "/waldonys/" }];
    //let allArtists = await models.artist.findAll({ offset, limit, attributes: ['id', 'name', 'letras_url'] });
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

    const genUri = (l) => `https://www.letras.mus.br${l}discografia`;

    let pagePromises = [];

    console.log("ALL MUSICS: ", allArtists.length);


    allArtists.forEach(a => {
        let uri = genUri(a.letras_url);
        pagePromises.push(new Promise((resolve, reject) => {
            console.log("Request: " + genUri(a.letras_url) + " ...")
            request({uri}, (error, response, body) => {

                if (error) {
                    reject(error);
                }
                
                resolve({artist_id: a.id, body});
            });
        }))
        
    });

    Promise.all(pagePromises).then( async doms => {
        //console.log(doms);

        for (let d of doms) {
            let list = await getMusicsWithAlbumDates(d);
            
            let artistMusics = await models.music.findAll({ where: { artist_id: d.artist_id } });

            for (let am of artistMusics) {
                for ( let ml of list) {
                    if (am.name === ml.name && ( am.year > ml.year || !am.year )) {
                        console.log(`Artist ${d.artist_id}, year updated (${am.year} -> ${ml.year})`);
                        am.year = ml.year;
                        await am.save();
                        break;
                    }
                }
            }
        }

    });

};

async function getMusicsWithAlbumDates(d) {
    let html = d.body;
    let musicsWithYear = [];
    let $ = cheerio.load(html);

    //validar se os albuns existem ou não...

    $('div.album-item').each((i, el) => {
        let headerText = $('div.header-info', el).text().split("•").map(t => t.trim());
        let year = headerText[0];
        let type = headerText[1]; //Álbum, Single/EP, Coletânea

        if (type === 'Álbum' || type === 'Single/EP') {
            $('ul.cnt-list-songs li', el).each((e, m) => {

                let musicName = $(m).text().trim();
                
                let musicIndex = musicsWithYear.map(e => e.name).indexOf(musicName);

                if (musicIndex === -1) {
                    musicsWithYear.push({ name: musicName, year });
                } else {
                    if (musicsWithYear[musicIndex].name === musicName && musicsWithYear[musicIndex].year > year) {
                        musicsWithYear[musicIndex].year = year;
                    }
                }

            });
        }

    });

    return musicsWithYear;
}

run();