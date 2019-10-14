const models = require('../db/models').models;
const sequelize = require('../db/models/index').sequelize;
const puppeteer = require('puppeteer');

// https://free-proxy-list.net/


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

const puppeteerConf = () => {
    return {
        args: [`--proxy-server=http=${getProxy()}`, '--incognito', '--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
    }
};

//genSearchText('Uma e Quinze da Manhã', 'x10')
const genSearchText = (m, b) => `Data de lançamento ${m} ${b}`;


async function gsearch(page, music, artist) {
    try {

        //let conf = puppeteerConf();
        //const browser = await puppeteer.launch(conf);
        //const page = await browser.newPage();

        console.log(`find ${music}`);
        await page.goto('http://google.com.br', { waitUntil: 'networkidle2' });
        await page.type('input[name=q]',genSearchText(music, artist));
        await page.keyboard.down("Enter");
        await page.keyboard.up("Enter");
        await page.waitForNavigation();

        // data-attrid
        const ano_lancamento  = await page.$('[data-attrid="kc:/music/recording_cluster:release date"]');
        const album  = await page.$('[data-attrid="kc:/music/recording_cluster:first album"]');
        const artista  = await page.$('[data-attrid="kc:/music/recording_cluster:artist"]');
        const generos  = await page.$('[data-attrid="kc:/music/recording_cluster:skos_genre"]');
        
        let dataAttridValid = undefined;
        let dataAttridYear = undefined;
        
        if (ano_lancamento !== null)
            dataAttridValid = ano_lancamento;
        else if (album !== null)
            dataAttridValid = album;
        else if (artista !== null)
            dataAttridValid = artista;
        else if (generos !== null)
            dataAttridValid = generos;

        if (dataAttridValid) {
            let text = await dataAttridValid.getProperty('innerText');
            let value = await text.jsonValue();
            dataAttridYear = value;
        }

        const youtubeYear = await page.evaluate(() => {
            let d = document.getElementsByClassName('MjS0Lc nHGuld');
            d[0].children[0].removeChild(d[0].children[0].children[0])
            let str = d[0].textContent;

            let response = str.replace("-", "").split("de").map(s => s.trim());

            return response[2];
        });

        console.log(youtubeYear);

        if (dataAttridYear && youtubeYear && !isNaN(dataAttridYear) && !isNaN(youtubeYear)) {
            console.log("both", dataAttridYear, youtubeYear);
            if (dataAttridYear < youtubeYear)
                return dataAttridYear;
            else
                return youtubeYear;
        } else if (dataAttridYear && !youtubeYear && !isNaN(dataAttridYear)) {
            return dataAttridValid;
        } else if (!dataAttridYear && youtubeYear && !isNaN(youtubeYear)) {
            return youtubeYear;
        } else {

            return undefined;
        }
        
    } catch (error) {
        return undefined;
    }

}

async function run() {
    console.log('run')
    /*
    const data = [
        {m: 'Uma e Quinze da Manhã', a: 'X10'},
        {m: 'Menina', a: 'X10'},
        {m: 'Coisas de Amor', a: 'Xabapé'},
        {m: '7 Conchas', a: 'Xoxote'}
    ];*/

    try {
        

        let musicPage = 1;
        let limit = 150;
        let offset = (musicPage-1) * limit;
    
    
        var data = [];
    
        console.log(`page: ${musicPage}, offset: ${offset}`);
        await sequelize
        .query(`SELECT m.id as id, m.name as music, a.name as artist FROM music m INNER JOIN artists a ON m.artist_id = a.id INNER JOIN artists_musical_genrers AS amg ON amg.artist_id = a.id INNER JOIN musical_genrers AS mg ON mg.name = "Forró" AND mg.id = amg.musical_genrer_id WHERE m.id > 2400`,
         {
             raw: true
        })
        .then(musics => {
          data = musics[0];
        })

        let conf = puppeteerConf();
        let browser = await puppeteer.launch(conf);
        let page = await browser.newPage();
        let proxySwapCounter = 0;

        for (const i in data) {
        
            let d = data[i];
            console.log(`id: ${d.id}`);
            let year = await gsearch(page, d.music, d.artist);
    
            if (year) {
                await new Promise((resolve, reject) => {
                    sequelize.query(`UPDATE music SET year = ${year} WHERE id = ${d.id}`).then(res => {                    
                        resolve(res);
                    })
                });
            }
    
            if (proxySwapCounter === 20) {
                console.log('New browser for swap proxy');
                await page.close();
                await browser.close();
                conf = puppeteerConf();
                browser = await puppeteer.launch(conf);
                page = await browser.newPage();
                proxySwapCounter = 0;
            } else {
                page = await browser.newPage();
            }
    
            proxySwapCounter += 1;
        };
    
        await page.close();
        await browser.close();
    
    } catch (error) {
        console.log(error);
    }
};

run();