'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("music", "year",
        {type: Sequelize.STRING}, {"field": "year"});
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("music", "year");
  }
};
