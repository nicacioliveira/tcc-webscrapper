const Sequelize = require('sequelize');
const config = require('../config/config')[require('../config/config').env];

const sequelize = new Sequelize(config.database, config.username, config.password, config);

const db = {
    sequelize: sequelize,
    Sequelize: Sequelize,
    models: { }
};

db.models = {
    artist: sequelize.import('./artist.js'),
    musical_genrer: sequelize.import('./musical_genrer.js'),
    artists_musical_genrers: sequelize.import('./artists_musical_genrers.js')
};

Object.keys(db.models)
    .forEach(function (modelName) {
        if ("associate" in db.models[modelName]) {
            db.models[modelName].associate(db.models);
        }
    });
    
module.exports = db;