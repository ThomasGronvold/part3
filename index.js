const express = require("express");
const morgan = require("morgan");
const Person = require('./models/person');
const app = express();

app.use(express.static('dist'));
app.use(express.json());


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
    }

    next(error);
};

app.use(errorHandler);

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
        
        res.send(`<p>Phonebook has info for ${count} people.</p> <br/> ${timeOfReq}`);
    } catch {
        error => next(error);
    }
});

app.put('/api/persons/:id', (req, res, next) => {
    const body = req.body;

    const person = {
        name: body.name,
        number: body.number,
    };

    Person.findByIdAndUpdate(req.params.id, person, { new: true })
        .then(updatedPerson => {
            res.json(updatedPerson);
        })
        .catch(error => next(error));
});

app.post('/api/persons', (req, res, next) => {
    const body = req.body;

    /* If either Name or Number is not filled in, return 400 content missing */
    if (!body.name || !body.number) {

        return res.status(400).json({
            error: 'content missing'
        });
    }

    /* Looks if person is already added, else adds person */
    const newPerson = new Person({
        name: body.name,
        number: body.number,
    });

    Person.find({ name: body.name })
        .then((person) => {
            if (person.length > 0) {
                /* If there are an existing person, update it's number to the new number and save it in the db */
                person[0].number = body.number;
                return person[0].save().then(updatedPerson => {
                    res.json(updatedPerson);
                }).catch(error => next(error));
            } else {
                newPerson.save().then(person => {
                    res.json(person);
                });
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

const PORT = process.env.PORT;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});