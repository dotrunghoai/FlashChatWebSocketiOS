const sequelize = require('sequelize')

const db = new sequelize({
    database: 'FlashChat',
    username: 'postgres',
    password: 'choikangta2',
    host: 'localhost',
    port: 5432,
    dialect: 'postgres',
    define: {
        freezeTableName: true
    }
})

// Check authentication
db.authenticate()
    .then(() => {
        console.log('Connect Successfully');
    })
    .catch((err) => {
        console.log(err.message);
    })

// Tạo model
const User = db.define('User', {
    email: sequelize.STRING,
    password: sequelize.STRING,
    name: sequelize.STRING
})

const MessageHead = db.define('MessageHead', {
    name: sequelize.STRING,
    lastMessage: sequelize.STRING,
    lastSendTime: sequelize.STRING
})

const MessageDetail = db.define('MessageDetail', {
    myEmail: sequelize.STRING,
    yourEmail: sequelize.STRING,
    message: sequelize.STRING
})

const Friend = db.define('Friend', {
    myEmail: sequelize.STRING,
    friendEmail: sequelize.STRING
})

// Tạo table trong postgres
// db.sync()
//     .then(() => {
//         console.log('Create successfully');
//     })
//     .catch((err) => {
//         console.log(err.message);
//     })

module.exports = {User, MessageHead, Friend, MessageDetail}