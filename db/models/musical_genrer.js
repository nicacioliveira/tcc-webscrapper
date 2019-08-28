module.exports = (sequelize, DataTypes) => {
    const MusicalGenrers = sequelize.define('musical_genrers', {
        name: DataTypes.STRING,
        gender_url: DataTypes.STRING,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
}, {
    charset: 'utf8', 
    collate: 'utf8_unicode_ci',
});

    MusicalGenrers.associate = function (models) {
        MusicalGenrers.belongsToMany(models.artist, {through: 'artists_musical_genrers', foreignKey: 'musical_genrer_id', as: 'artists'})
    };

    return MusicalGenrers;
};