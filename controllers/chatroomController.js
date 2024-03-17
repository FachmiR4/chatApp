const mongoose = require('mongoose');
const Chatroom = mongoose.model('Chatroom');

exports.createChatroom = async (req, res) => {
    const { name } = req.body;

    const nameRegex = /^[A-Za-z\s]+$/;

    if(!nameRegex.test(name)) throw "chatroom name can contain only alphabets";

    const chatroomExists = await Chatroom.findOne({name});

    if(chatroomExists) throw "chatroom with that name already exists!";

    
    const chatroom = new Chatroom({
        name,
    });

    await chatroom.save();

    res.json({
        massage: "chatroom created!",
    });
}


exports.getAllChatrooms = async (req, res) => {
    const chatroom = await Chatroom.find({});

    res.json(chatroom);
}
