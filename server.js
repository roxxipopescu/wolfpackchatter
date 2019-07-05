const express = require('express')
const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)

io.on('connection', (socket) => {
  socket.on('message', (msg, chatId) => io.emit('message', { 'user': socket.username, 'message': msg, 'chatId': chatId } ))
  socket.on('join', (username) => {
    socket.username = username;
  })
})

http.listen(3000, () => console.log('listening on port 3000'))