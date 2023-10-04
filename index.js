const express = require("express");
const app = express();
const morgan = require("morgan");
const Person = require('./models/person');
const cors = require('cors');

app.use(express.static('dist'));
app.use(express.json());
app.use(cors());

morgan.token("req-body", (req) => {
    return JSON.stringify(req.body);
});

app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms - :req-body')
);

const errorHandler = (error, req, res, next) => {
    console.log(error.message);

    if (error.name === "CastError") {
        return res.status(400).send({ error: "malformatted id" });
    } else if (error.name === "ValidationError") {
        return res.status(400).json({ error: error.message });
    }

    next(error);
};



app.get('/api/persons', (req, res) => {
    Person.find({}).then(result => {
        res.send(result);
    });
});

app.get('/api/persons/:id', (req, res, next) => {
    Person.findById(req.params.id)
        .then(person => {
            if (person) {
                res.json(person);
            } else {
                res.status(404).end();
            }
        })
        .catch(error => next(error));
});

app.get('/info', async (req, res) => {
    const timeOfReq = new Date;

    try {
        const count = await Person.count({});

        res.send(`<p>Phonebook has info for $z{count} people.</p> <br/> ${timeOfReq}`);
    } catch {
        error => next(error);
    }
});

app.put('/api/persons/:id', (req, res, next) => {
    const { name, number } = req.body;

    const person = {
        name: name,
        number: number,
    };

    Person.findByIdAndUpdate(req.params.id, person, { new: true, runValidators: true, context: "query" })
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
    const { name, number } = req.body;

    const newPerson = new Person({
        name: name,
        number: number,
    });

    Person.find({ name: name })
        .then((person) => {
            if (person.length > 0) {
                /* If there are an existing person, update it's number to the new number and save it in the db */
                person[0].number = number;
                return person[0].save().then(updatedPerson => {
                    res.json(updatedPerson);
                })
                    .catch(error => next(error));
            } else {
                newPerson.save().then(person => {
                    res.json(person);
                })
                    .catch(error => next(error));
            }
        });
});

app.delete('/api/persons/:id', (req, res) => {
    Person.findByIdAndDelete(req.params.id)
        .then(result => {
            res.status(204).end();
        })
        .catch(error => next(error));
});

app.use(errorHandler);

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});