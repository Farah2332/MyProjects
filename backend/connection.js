import mongoose from 'mongoose';

const mongoDBURL = 'mongodb://127.0.0.1:27017/Book-Store-MERN'; // Your MongoDB connection URL

mongoose.connect(mongoDBURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Connected to MongoDB');
}).catch((error) => {
    console.error('Error connecting to MongoDB:', error);
});

export default mongoose; // Export the mongoose object
