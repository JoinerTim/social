const mongoose = require('mongoose');

const connectDatabase = () => {
    mongoose.connect("mongodb://localhost:27017/Instagram", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
        console.log("Mongoose Connected");
    }).catch((error) => {
        console.log(error);
    });
}

module.exports = connectDatabase;


//mongodb+srv://nghiadepchai:nghia20diem@instagram.evrgbch.mongodb.net/?retryWrites=true&w=majority