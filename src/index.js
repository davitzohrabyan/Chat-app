const path = require('path');
const http = require('http');
const express = require('express');
const socketio = require('socket.io');
const Filter = require('bad-words');
const app = express();
const server = http.createServer(app);
const io = socketio(server);

const {
    generateMessage,
    generateLocationMessage
    } = require('./utils/messages');

const {
    addUser,
    removeUser,
    getUser,
    getUsersInRoom
    } = require('./utils/users');

const port = process.env.PORT || 3000;
const publicDirectoryPath = path.join(__dirname, '../public');

app.use(express.static(publicDirectoryPath));

io.on('connection', (socket) => {
    socket.emit('stopMessage', {
        message: ''
    });

    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username, room });
        if (error) {
            return callback(error);
        }

        socket.join(user.room);

        socket.emit('message', generateMessage('', 'Welcome!'));
        socket.broadcast.to(user.room)
            .emit('message', generateMessage('', `${user.username} has joined!`));
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        });
        callback();
    });

    socket.on('sendMessage', (message, callback) => {

        const user = getUser(socket.id);
        const filter = new Filter();

        if(filter.isProfane(message)) {
            return callback('Profanity is not allowed');
        }
        if(!message) {
            return callback();
        }

        io.to(user.room).emit('message', generateMessage(user.username, message));
        callback();
    });

    socket.on('userTyping', async (message, callback) => {
        const user = getUser(socket.id);
        if(!message) {
            return callback();
        }
        socket.broadcast.to(user.room).emit('typingMessage', {
            message: `${user.username} is typing...`
        });
    });

    socket.on('stopTyping', async (message, callback) => {
        const user = getUser(socket.id);
        if(!message) {
            return callback();
        }
        socket.broadcast.to(user.room).emit('stopMessage', {
            message: ''
        })
    });

    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id);
        io.to(user.room).emit('locationMessage', generateLocationMessage(user.username,`https://google.com/maps?q=${coords.latitude},${coords.longitude}`));
        callback();
    });

    socket.on('disconnect', () => {
        const user = removeUser(socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('',`${user.username} has left!`));
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    });
});

server.listen(port);



