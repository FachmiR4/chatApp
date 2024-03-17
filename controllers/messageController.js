const express = require("express");
const jwt = require("jwt-then");
const mongoose = require("mongoose");
const server = require('../server');
const broker = require('../middlewares/broker');

const Message = mongoose.model("Message");
const User = mongoose.model("User");

const io = require('socket.io')(server, {
    allowEIO3: true,
    cors: {
      origin: true,
      methods: ['GET', 'POST'],
      credentials: true
    }
});

const setupRabbitMQ = broker.setupRabbitMQ;
async function sendMessage(message) {
    try {
      const { channel, exchange } = await setupRabbitMQ();
      await channel.publish(exchange, '', Buffer.from(JSON.stringify(message)));
      console.log('Pesan berhasil dikirim ke broker:', message);
    } catch (error) {
      console.error('Error mengirim pesan:', error);
      throw error;
    }
  };

exports.sendMessage = async (req, res) => {
    const {chatroomId, message } = req.body;

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    const payload = await jwt.verify(token, process.env.SECRET);
    const userId = payload.id;

    let userCountInChatroom = {};

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!message || message.trim().length === 0) {
      return res.status(400).json({ message: "Message cannot be empty" });
    }
    io.on("connection", (socket) => {
      console.log("Connected: " + socket.userId);

      socket.on("disconnect", () => {
        console.log("Disconnected: " + socket.userId);
      });

      socket.on("joinRoom", ({ chatroomId }) => {
        socket.join(chatroomId);
        console.log("A user joined chatroom: " + chatroomId);
        if (!userCountInChatroom[chatroomId]) {
            userCountInChatroom[chatroomId] = 1;
        } else {
            userCountInChatroom[chatroomId]++;
        }
        if (userCountInChatroom[chatroomId] >= 2) {
            startRabbitMQConsumer();
        }
      });

      socket.on("leaveRoom", ({ chatroomId }) => {
        socket.leave(chatroomId);
        console.log("A user left chatroom: " + chatroomId);
        if (userCountInChatroom[chatroomId]) {
          userCountInChatroom[chatroomId]--;
          if (userCountInChatroom[chatroomId] < 2) {
                stopRabbitMQConsumer(chatroomId);
              }
        }
      });
      socket.on("chatroomMessage", async ({ chatroomId, message }) => {
        if (message.trim().length > 0) {
          const user = await User.findOne({ _id: socket.userId });
          const newMessage = new Message({
            chatroom: chatroomId,
            user: socket.userId,
            message,
          });
          io.to(chatroomId).emit("newMessage", {
            message,
            name: user.username,
            userId: userId,
          });
          await newMessage.save();
          sendMessage(message);
          console.log(user.username + ': ' + message );
          res.status(200).json({ message: "Message sent successfully" });
        }
      });
    });
}

let rabbitMQConsumerRunning = false;
async function startRabbitMQConsumer(chatroomId) {
try {
    if (!rabbitMQConsumerRunning) {
        const { channel, exchange } = await setupRabbitMQ();
        const q = await channel.assertQueue(chatroomId, { exclusive: true });
        await channel.bindQueue(q.queue, exchange, '');
        return channel.consume(q.queue, (msg) => {
            if (msg !== null) {
                const message = JSON.parse(msg.content.toString());
                console.log(message);
                channel.ack(msg);
            }
        });
        rabbitMQConsumerRunning = true;
        console.log('RabbitMQ Consumer started.');
    }
} catch (error) {
    console.error('Error starting RabbitMQ Consumer:', error);
    throw error;
}
};

async function stopRabbitMQConsumer() {
try {
    if (rabbitMQConsumerRunning) {
        rabbitMQConsumerRunning = false;
        console.log('RabbitMQ Consumer stopped.');
    }
} catch (error) {
    console.error('Error stopping RabbitMQ Consumer:', error);
    throw error;
}
};