const mongoose = require('mongoose')

//* Loading env
const {loadEnvFile} = require('node:process')
loadEnvFile('./.env')

const ConnectDB = async()=>{
    try{
        await mongoose.connect(process.env.DB_Connection_String)
        console.log("DB connection is Successful");
    }catch(err){
        console.log(err.message);
    }
}

module.exports = ConnectDB