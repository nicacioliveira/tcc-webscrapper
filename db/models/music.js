module.exports = (sequelize, DataTypes) => {

    const Music = sequelize.define('music', {
        artist_id: {
            type: DataTypes.INTEGER,
            foreignKey: true,
            allowNull: false,
        },
        name: DataTypes.STRING,
        lyric: {
            type: DataTypes.TEXT
        },
        url: DataTypes.STRING,
        created_at: {
            type: DataTypes.DATE,
            defaultValue: DataTypes.NOW
        }
    }, {
        charset: 'utf8', 
        collate: 'utf8_unicode_ci',
    });

    Music.associate = function (models) {
        Music.belongsTo(models.artist, {foreignKey: 'artist_id', as: 'artist'});
    };

    return Music;
};