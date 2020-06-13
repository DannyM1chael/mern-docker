const express = require('express');
const socketio = require('socket.io');
const http = require('http');

const app = express();
const server = http.createServer(app);
const io = socketio(server);
const { addUser, removeUser, getUser, getUsersInRoom } = require('./users');

const PORT = process.env.PORT || 5000;
const router = require('./router');

const mongoose = require('mongoose');
const Message = require('./message.model');
const connectDb = require('./config');
async function startDb(){
    try {
        await mongoose.connect(connectDb, {
            useNewUrlParser: true,
            useUnifiedTopology: true
        })
        console.log('MongoDb is connected')
    } catch (error) {
        console.log(error)
    }
};

startDb();

app.use(router);

io.on('connect', (socket) => {

    Message.find().sort({createdAt: -1}).limit(10).exec((error, messages) => {
        if(error) return console.log(error);
        socket.emit('init', messages);
    });

    socket.on('join', ({ name, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, name, room });
        if(error){
            return callback(error);
        };

        socket.emit('message', { user: 'admin', text: `${user.name}, welcome to the room ${user.room}`});
        socket.broadcast.to(user.room).emit('message', { user: 'admin', text: `${user.name} has joined`});

        socket.join(user.room);

        io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        callback();
    });

    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id);

        io.to(user.room).emit('message', { user: user.name, text: message });

        let chatMessage = new Message({ text: message, name: user.name, room: user.room });
        chatMessage.save();

        callback();
        
    });
    
    socket.on('disconnect', () => {
        const user = removeUser(socket.id);
        if(user){
            io.to(user.room).emit('message', { user: 'admin', text:`${user.name} has left`});
            io.to(user.room).emit('roomData', { room: user.room, users: getUsersInRoom(user.room)});
        }
    });
});

server.listen(PORT, () => console.log(`Server has running  on ${PORT}`));