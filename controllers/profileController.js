const mongoose = require('mongoose');
const profile = require('../models/profile');
const Profile = mongoose.model('Profile');
const User = mongoose.model("User");
const jwt = require("jwt-then");


function getZodiacSign(day, month) {
    const zodiacSigns = [
      { sign: "Capricornus,Goat", from: { day: 22, month: 12 }, to: { day: 19, month: 1 } },
      { sign: "Aquarius,Water Bearer", from: { day: 20, month: 1 }, to: { day: 18, month: 2 } },
      { sign: "Pisces,Fish", from: { day: 19, month: 2 }, to: { day: 20, month: 3 } },
      { sign: "Aries,Ram", from: { day: 21, month: 3 }, to: { day: 19, month: 4 } },
      { sign: "Taurus,Bull", from: { day: 20, month: 4 }, to: { day: 20, month: 5 } },
      { sign: "Gemini,Twins", from: { day: 21, month: 5 }, to: { day: 20, month: 6 } },
      { sign: "Cancer,Crab", from: { day: 21, month: 6 }, to: { day: 22, month: 7 } },
      { sign: "Leo,Lion", from: { day: 23, month: 7 }, to: { day: 22, month: 8 } },
      { sign: "Virgo,Virgin", from: { day: 23, month: 8 }, to: { day: 22, month: 9 } },
      { sign: "Libra,Balance", from: { day: 23, month: 9 }, to: { day: 22, month: 10 } },
      { sign: "Scorpio,Scorpion", from: { day: 23, month: 10 }, to: { day: 21, month: 11 } },
      { sign: "Sagittarius,Archer", from: { day: 22, month: 11 }, to: { day: 21, month: 12 } }
    ];
  
    for (const zodiac of zodiacSigns){
      const { from, to } = zodiac;
      if ((month === from.month && day >= from.day) || (month === to.month && day <= to.day)) {
        return zodiac.sign;
      }
    }
  
    return "Unknown";
}

function getZodiacSignFromDate(dateString) {
    const dateParts = dateString.split('-');
    const day = parseInt(dateParts[2], 10);
    const month = parseInt(dateParts[1], 10);
    return getZodiacSign(day, month);
}

exports.createProfile = async (req, res) => {
    const {image, displayname, gender, birthday, 
        height, weight, interest } = req.body;

    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];

    const payload = await jwt.verify(token, process.env.SECRET);
    
    req.userID = payload.id;

    const userExists = await Profile.findOne({ idUser: req.userID});

    if (userExists) throw "User profile already exits.";

    const inputDate = birthday;
    
    const zodiacSign = getZodiacSignFromDate(inputDate);

    let sign = "";
    let animal = "";

    if (zodiacSign != "Unknown") {
        const splittedSign = zodiacSign.split(",");

        sign = splittedSign[0];
        animal = splittedSign[1];
    }

    const profile = new Profile({
        idUser: req.userID,
        about: {
            image,
            displayname, 
            gender, 
            birthday,
            horoscope: animal,
            zodiak: sign,  
            height, 
            weight,
        },
        interest
    });
    
    await profile.save();

    res.json({
        message: "Profile Create"
    });
}

exports.getProfile = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    const payload = await jwt.verify(token, process.env.SECRET);
    
    req.userID = payload.id;

    console.log( req.userID)

    const profile = await Profile.findOne({ idUser: req.userID});

    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }

    return res.json(profile);
};

exports.updateProfile = async (req, res) => {
    const token = req.headers.authorization && req.headers.authorization.split(' ')[1];
    
    const payload = await jwt.verify(token, process.env.SECRET);
    
    req.userID = payload.id;

    const {image, displayname, gender, birthday, 
        height, weight, interest } = req.body;

    const profile = await Profile.findOneAndUpdate({idUser: req.userID},{
        image, 
        displayname, 
        gender, 
        birthday, 
        height, 
        weight, 
        interest},
        {new: true});

    if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
    }
    return res.json({ message: 'Profile updated successfully', profile });
}