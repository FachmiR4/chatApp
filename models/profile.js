const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
    idUser: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    },
    about: {
        image: {type: String},
        displayname: {type: String},
        gender: {type: String},
        birthday: {type: String},
        horoscope: {type: String},
        zodiak: {type: String},
        height: {type: String},
        weight: {type: String}
    },
    interest:{type: Array},
});

module.exports = mongoose.model("Profile", profileSchema);