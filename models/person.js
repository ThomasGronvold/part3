require('dotenv').config();
const mongoose = require('mongoose');

mongoose.set('strictQuery', false);


const url = process.env.MONGODB_URI;

console.log('connecting to', url);

mongoose.connect(url)

  .then(result => {
    console.log('connected to MongoDB');
  })
  .catch((error) => {
    console.log('error connecting to MongoDB:', error.message);
  });

const personSchema = new mongoose.Schema({
  name: {
    type: String,
    minLength: 3,
    required: true,
  },
  number: {
    type: String,
    minLength: 8,
    required: true,
    validate: {
      validator: (value) => {
        /* 
          Checks if you have 2 or 3 numbers in the front, and checks the length of numbers in the back to
          find out if the Phone-number is atleast 8 numbers long. 
        */
        return /^(?:[0-9]{2}-[0-9]{6,}|[0-9]{3}-[0-9]{5,})$/.test(value);
      }
    }
  }
});

personSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString();
    delete returnedObject._id;
    delete returnedObject.__v;
  }
});

module.exports = mongoose.model('Person', personSchema);