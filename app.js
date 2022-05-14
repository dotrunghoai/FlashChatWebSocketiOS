const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');

const { User, MessageHead, Friend, MessageDetail } = require('./db')

const app = express();
app.use(bodyParser.json());

const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server, {
    allowEIO3: true
});

/// API
app.post('/add', (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const name = req.body.name;
    User.findAll({
        where: {
            email
        }
    }).then((users) => {
        if (users.length > 0) {
            res.send({ resultCode: 0 })
        } else {
            User.create({
                email, password, name
            }).then(() => {
                res.send({ resultCode: 1 })
            }).catch(() => {
                res.send({ resultCode: 0 })
            })
        }
    })
})

app.post('/login', (req, res) => {
    const {email, password} = req.body;
    User.findAll({
        where: {
            email, password
        }
    }).then((users) => {
        if (users.length > 0) {
            res.send({ resultCode: 1 })
        } else {
            res.send({ resultCode: 0 })
        }
    }).catch(() => {
        res.send({ resultCode: 0 })
    })
})

app.get('/', (req, res) => {
    User.findAll()
        .then((users) => {
            res.send({ resultCode: 1, users })
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
})

app.post('/notMyEmail', (req, res) => {
    const Sequelize = require('sequelize');
    const Op = Sequelize.Op;
    const { email } = req.body;
    console.log(email);
    User.findAll({
        where: {
            email: {
                [Op.not]: email
            }
        }
    })
        .then((users) => {
            res.send({ resultCode: 1, users })
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
})

app.post('/getMessage', (req, res) => {
    const Sequelize = require('sequelize');
    const Op = Sequelize.Op;
    const { myEmail, yourEmail } = req.body;
    MessageDetail.findAll({
        where: {
            [Op.or]: [
                { 
                    [Op.and]: [
                        { myEmail, yourEmail }
                    ]
                },
                { 
                    [Op.and]: [
                        { 
                            myEmail: yourEmail, 
                            yourEmail: myEmail
                        }
                    ]
                 }
            ]
        },
        order: [
            ['createdAt', 'ASC']
        ]
    })
        .then((messages) => {
            res.send({ resultCode: 1, messages })
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
})

app.post('/update', (req, res) => {
    const {id, password, name} = req.body;
    User.update({
        email, password
    }, {
        where: {
            id
        }
    })
        .then((row) => {
            res.send({ resultCode: 1, row: row[0] })
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
})


app.post('/delete', (req, res) => {
    const { id } = req.body;
    User.destroy({
        where: {
            id
        }
    })
        .then((row) => {
            res.send({ resultCode: 1, row })
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
})

/// SocketIO
io.on('connection', (socket) => {
    console.log('User connected');
    socket.on('sendMessage', (data) => {
        MessageDetail.create({
            myEmail: data.sender,
            yourEmail: data.receiver,
            message: data.content
        }).then(() => {
            io.sockets.emit('sendResponse', data);
        }).catch(() => {
            res.send({ resultCode: 0 })
        })
    })
})

server.listen(3000, () => {
    console.log("Listening at port 3000...");
})