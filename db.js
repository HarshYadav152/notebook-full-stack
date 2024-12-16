require('dotenv').config();
const mongoose = require('mongoose');
const mstring = process.env.STRING_URL
const mongoURL = mstring; // mongodb connection string which is used to connect with database

const connectToMongo = async () => {
   await mongoose.connect(mongoURL)
}

module.exports = connectToMongo;