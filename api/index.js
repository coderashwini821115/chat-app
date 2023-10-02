const express = require('express');
const app = express();
const Model = require('./models/db');
const Message = require('./models/Message');
const jwt = require('jsonwebtoken');
const dontenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser')
const bcrypt = require('bcrypt');
const ws = require('ws');
const fs = require('fs');
const PORT =  8080;
const host_url = process.env.HOST_URL;
const {
    connect
} = require('mongoose');
dontenv.config();
const jwtSecret = process.env.JWT_SECRET;
const bcryptSalt = bcrypt.genSaltSync(10);
app.use('/uploads', express.static(__dirname + '/uploads'));
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    credentials: true,
    origin: host_url,
}));


async function getUserDataFromRequest(req) {
    return new Promise((resolve, reject) => {
        const {
            token
        } = req.cookies; 
        if(token) {
            jwt.verify(token, jwtSecret, (err, userData) => {
                if (err) throw err;
                resolve(userData);
            })
        } else {
            reject('No token');
        }
    })
}
app.get('/test', (req, res) => {
    res.json('Ok tested');
});
app.get('/profile', (req, res) => {
    const {
        token
    } = req.cookies;
    jwt.verify(token, jwtSecret, (err, userData) => {
        if (err) throw err;
        res.json(userData);
    })

});

app.get('/messages/:userId', async(req, res) => {
    const {userId} = req.params;
    const userData = await getUserDataFromRequest(req);
    const ourUserId = userData.userId;
    const messages = await Message.find({
        sender: {$in: [userId, ourUserId]},
        recipient: {$in: [userId, ourUserId]},
    }).sort({createdAt: 1});
    res.json(messages);
}) 

app.get('/people', async(req, res) => {
    const users = await Model.find({}, {'_id': 1, username: 1});
    res.json(users);
})
app.post('/login', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    const foundUser = await Model.findOne({
        username
    });
    if (foundUser) {
        const passOk = bcrypt.compareSync(password, foundUser.password);
        if (passOk) {
            console.log('runneed')
            jwt.sign({
                userId: foundUser._id,
                username
            }, jwtSecret, {}, (err, token) => {
                if (err) throw err;
                res.cookie('token', token, {
                    sameSite: 'none',
                    secure: true
                }).json({
                    id: foundUser._id,
                });
            });
        } else console.log('Wrong Password');
    } else console.log('Invalid username');
});

app.post('/logout', (req, res) => {
    res.cookie('token', '', {sameSite: 'none', secure: true}).json('ok');
    // Here we are emptying the cookie token too to user that user remains logged out even after refresh otherwise the UserContext.jsx would fetch the username and id from cookie on refresh and thus make user auto logged in
})

app.post('/register', async (req, res) => {
    const {
        username,
        password
    } = req.body;
    try {
        const hashedPassword = bcrypt.hashSync(password, bcryptSalt);
        const User = await Model.create({
            username: username,
            password: hashedPassword,
        });
        jwt.sign({
            userId: User._id,
            username
        }, jwtSecret, (err, token) => {
            if (err) throw err;
            res.cookie('token', token, {
                sameSite: 'none',
                secure: true
            }).status(201).json({
                _id: User._id,
            });
        });

    } catch (e) {
        console.log(e.message);
    }
});
const server = app.listen(PORT);

const wss = new ws.WebSocketServer({
    server
});

wss.on('connection', (connection, req) => {

    function notifyAboutOnlinePeople() {
        [...wss.clients].forEach(client => {
            client.send(JSON.stringify({
                online: [...wss.clients].map(c => ({userId: c.userId, username:c.username}))
            }));
        });
    };

    connection.isAlive = true;

    connection.timer = setInterval(() => {
        connection.ping();
        connection.deathTimer = setTimeout(() => {
            connection.isAlive = false;
            connection.terminate();
            clearInterval(connection.timer);
            notifyAboutOnlinePeople();
            console.log('Dead');
        }, 1000);
    }, 5000);

    connection.on('pong', () => {
        clearTimeout(connection.deathTimer);
    })

    // read username and id from the cookie for this connection
    const cookies = req.headers.cookie;
    if (cookies) {
        const tokenCookieString = cookies.split(';').find(str => str.startsWith('token='));
        if (tokenCookieString) {
            const token = tokenCookieString.split('=')[1];
            if (token) {
                jwt.verify(token, jwtSecret, {}, (err, userData) => {
                    if (err) throw err;
                    const {
                        userId,
                        username
                    } = userData;
                    connection.userId = userId;
                    connection.username = username;
                });
            }
        }
    }
    connection.on('message', async(message) => {
        const messageData = JSON.parse(message.toString());
        const {recipient, text, file} = messageData;
        // console.log(messageData);
        // console.log({recipient, text, file});
        let filename = null;
        if(file) {
            const part = file.name.split('.');
            const ext = part[part.length-1];
            filename = Date.now() + '.' + ext;
            const path = __dirname + '/uploads/' + filename;
            // console.log(file.data.split(',')[1]);
            // console.log(file);
            const bufferData =  Buffer.from(file.data.split(',')[1], 'base64');
            fs.writeFile(path, bufferData, () => {
                console.log('file saved:'+path);
            })
        }
        if(recipient && (text || file)) {
            const messageDoc = await Message.create({
                sender: connection.userId,
                recipient,
                text,
                file: file? filename: null,
            });
            [...wss.clients].
            filter(c => c.userId === recipient)
            .forEach(c => c.send(JSON.stringify({
                text, 
                sender: connection.userId,
                recipient,
                file: file ? filename: null,
            _id: messageDoc._id})));
        }
    });
    //notify everyone about online people
   notifyAboutOnlinePeople();
});
// OzinT2szfPVdM8aT