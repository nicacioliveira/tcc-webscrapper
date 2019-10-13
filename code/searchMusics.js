const models = require('../db/models').models;
const { Op } = require('sequelize');
const cheerio = require('cheerio');
const request = require('request');

async function run() {

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

        //console.log(allArtists);
    });

};

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

function runSearchLyricsOfMusics() {

    let page = 1;
    let limit = 60;
    let offset = (page-1) * limit;
    let musicCount = await models.music.findAndCountAll();
    let totalOfPages = Math.round(musicCount.count / limit);

    console.log(`------------SEARCHING PAGE ${page}/${totalOfPages}--------------`);
    await getLyricsProcedure(page, offset, limit, totalOfPages);
    
    console.log("ok")
};

async function getLyricsProcedure(page, offset, limit, totalOfPages) {
    
    let pagePromises = [];

    try {
    
        let musics = await models.music.findAll({offset, limit});
        let numberOfSuccess = 0;
        const genUri = (l) => `https://www.letras.mus.br${l}`;
        
        musics.forEach(m => {
            let uri = genUri(m.url);
                //process.stdout.write(` ${genUri(m.url)} `);

            pagePromises.push(
                new Promise((resolve, reject) => {
                    request({uri}, async (error, response, body) => {

                    if (error) {
                        //console.log(`request failure for: ${m.name} | successes/total: ${numberOfSuccess}/${musics.length}`);
                        reject(error);
                    } else {
                        numberOfSuccess+=1;
                        //console.log(`request success for: ${m.name} | successes/total: ${numberOfSuccess}/${musics.length}`);
                        
                        let music = await getMusicLyric({m, body});
            
                        await music.save().then(ok => {
                            //console.log(`music ${music.name} saved! successes/total: ${numberOfSuccess}/${musics.length}`);
                            resolve({m, body});
                        }).catch(err => {
                            //console.error(`music ${music.name} save error! successes/total: ${numberOfSuccess}/${musics.length}`);
                            resolve({m, body});
                        });
                        
                    }
                    
                })})
            );
        });
    } catch (error) {
        console.log(`tentando novamente a página ${page}`);
        getLyricsProcedure(page, offset, limit, totalOfPages);
    }

    Promise.all(pagePromises).then(e => {
        
        if (page < totalOfPages) {
            page += 1;
            offset = (page-1) * limit;
            console.log(`------------SEARCHING PAGE ${page}/${totalOfPages}--------------`)
            getLyricsProcedure(page, offset, limit, totalOfPages);
        } else {
            console.log(`------------FINISH--------------`);
            return "ok";
        }
    }).catch(err => {
        console.log("erro catch promisses")
        console.log(`tentando novamente a página ${page}`);
        getLyricsProcedure(page, offset, limit, totalOfPages);
    });
}

function getMusicLyric(d) {
    let html = d.body;
    let music = d.m;
    let $ = undefined;

    if (html)
        $ = cheerio.load(html);
    else {
        return null;
    }

    let lyric = "";
    try {
        $('div.cnt-letra').each((i, el) => {
            let divBody = el.childNodes;
            if (!divBody)
                return null;
            divBody.forEach(node => {
                if (node.type === "tag" && node.name === "p") {
                    node.children.forEach(e => {
                        if (e.type === "text" && e.data && e.nodeValue) {
                            lyric += e.data;
                        } else if (e.type === "tag" && e.tagName === "br") {
                            lyric += '\n';
                        }
                    });
                    lyric += '\n\n ';
    
                }
            });
        });   
    } catch (error) {
        return null;
    }
    music.lyric = lyric;

    return music;
}

//run();
//runSearchLyricsOfMusics();