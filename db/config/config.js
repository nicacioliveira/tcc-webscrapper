module.exports = {
    development: {
        username: 'root',
        password: 'root',
        database: 'tcc',
        host: 'localhost',
        dialect: 'mysql',
        pool: {
            max: 100,
            min: 0,
            acquire: 100*1000
        },
        define: { 
            charset: 'utf8', 
            collate: 'utf8_unicode_ci',
            timestamps: false },
        operatorsAliases: false,
        logging: false
    },
    env: process.env.NODE_ENV === "production" || process.env.NODE_ENV === "test" ? "production" : "development"
};