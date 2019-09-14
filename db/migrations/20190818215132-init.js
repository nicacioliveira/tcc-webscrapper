'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.createTable("artists", 
      {
        "id": {
          "type": Sequelize.INTEGER,
          "field": "id",
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false
        },
        "name": {
          "type": Sequelize.STRING,
          "field": "name"
        },
        "letras_url": {
          "type": Sequelize.STRING,
          "field": "letras_url"
        },
        "created_at": {
          type: Sequelize.DATE,
          defaultValue: new Date()
        }
      }, {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
      }
    );

    await queryInterface.createTable("musical_genrers", 
      {
        "id": {
          "type": Sequelize.INTEGER,
          "field": "id",
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false
        },
        "name": {
          "type": Sequelize.STRING,
          "field": "name"
        },
        "created_at": {
          type: Sequelize.DATE,
          defaultValue: new Date()
        }
      }, {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
      }
    );

    await queryInterface.createTable("artists_musical_genrers", 
      {
        "id": {
          "type": Sequelize.INTEGER,
          "field": "id",
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false
        },
        artist_id: {
          type: Sequelize.INTEGER,
          field: "artist_id",
          references: {
            model: "artists",
            key: "id"
          },
          allowNull: false
        },
        musical_genrer_id: {
          type: Sequelize.INTEGER,
          field: "musical_genrer_id",
          references: {
            model: "musical_genrers",
            key: "id"
          },
          allowNull: false
        }
      }
    );
  },

  down: (queryInterface, Sequelize) => {
    return Promise.all([
    queryInterface.dropTable("artists_musical_genrers", {}),
    queryInterface.dropTable("artists", {}),
    queryInterface.dropTable("musical_genrers", {})
    ])
  }
};
