const mongoose =require("mongoose");

const connectMangoDB = async ()=>{
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`Mongo db bağlantısı başarılı  ${conn.connection.host}`);
    } catch (error) {
        console.log(`MongoDB bağlantısı başarısız ${error.message}`);
        
    }
};

module.exports=connectMangoDB;