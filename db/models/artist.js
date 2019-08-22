module.exports = (sequelize, DataTypes) => {
    const Artists = sequelize.define('artists', {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: DataTypes.STRING,
        letras_url: DataTypes.STRING,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
}, {
    charset: 'utf8',
    collate: 'utf8_unicode_ci'
});

    Artists.associate = function (models) {
        Artists.belongsToMany(models.musical_genrer, {through: 'artists_musical_genrers', foreignKey: 'artist_id', as: 'musical_genrers'})
    };

    return Artists;
};