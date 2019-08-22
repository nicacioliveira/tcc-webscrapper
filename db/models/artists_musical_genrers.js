module.exports = (sequelize, DataTypes) => {

    const ArtistsMusicalGenrers = sequelize.define('artists_musical_genrer', {
        artist_id: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
        },
        musical_genrer_id: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
        }
    }, {
        charset: 'utf8', 
        collate: 'utf8_unicode_ci',
    });

    ArtistsMusicalGenrers.associate = function (models) {
        ArtistsMusicalGenrers.belongsTo(models.artist, {foreignKey: 'artist_id', as: 'artist'});
        ArtistsMusicalGenrers.belongsTo(models.musical_genrer, {foreignKey: 'musical_genrer_id', as: 'musical_genrer'});
    };

    return ArtistsMusicalGenrers;
};