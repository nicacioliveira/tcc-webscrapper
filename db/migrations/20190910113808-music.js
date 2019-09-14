'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    
    await queryInterface.createTable("music", 
      {
        "id": {
          "type": Sequelize.INTEGER,
          "field": "id",
          "autoIncrement": true,
          "primaryKey": true,
          "allowNull": false
        },
        "nme": {
          "type": Sequelize.STRING,
          "field": "name"
        },
        "artist_id": {
          type: Sequelize.INTEGER,
          field: "artist_id",
          references: {
            model: "artists",
            key: "id"
          },
          allowNull: false
        },
        "lyric": {
          "type": Sequelize.TEXT,
          "field": "lyric"
        },
        "url": {
          "type": Sequelize.STRING,
          "field": "url"
        },
        "created_at": {
          type: Sequelize.DATE,
          defaultValue: new Date()
        }
      },
      {
        charset: 'utf8',
        collate: 'utf8_unicode_ci'
      }
    );

    

  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("music", {});
  }
};
