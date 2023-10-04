const mongoose = require('mongoose');

if (process.argv.length < 3) {
    console.log("Missing password");
    process.exit(1);
}

const password = process.argv[2];

const mongoUrl = `mongodb+srv://admin:${password}@phonebook.j1g3dtw.mongodb.net/phonebook`;
mongoose.connect(mongoUrl);

const personSchema = new mongoose.Schema({
    name: String,
    number: String,
});

const Person = mongoose.model("Person", personSchema);

function GetAll() {
    const persons = {};
    Person.find({}).then(result => {
        person += result;
    });
    mongoose.connection.close();
    return persons;
};


if (process.argv.length === 3) {
        console.log("phonebook:");
        Person.find({}).then(result => {
            result.forEach(person => {
                console.log(person.name, person.number);
            });
            mongoose.connection.close();
        });
} else {
    const person = new Person({
        name: process.argv[3],
        number: process.argv[4],
    });

    person.save().then(result => {
        console.log(`Added ${result.name} number ${result.number} to the phonebook.`);
        mongoose.connection.close();
    });
}
