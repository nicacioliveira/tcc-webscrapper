'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("musical_genrers", "gender_url",
        {type: Sequelize.STRING}, {"field": "gender_url"});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("musical_genrers", "gender_url");
  }
};
