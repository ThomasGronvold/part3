const express = require("express");
const app = express();
const morgan = require("morgan");

app.use(express.json());
app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms - :req-body')
);
app.use(express.static('dist'));

morgan.token("req-body", (req) => {
    return JSON.stringify(req.body);
});

let phoneBook = [
    {
        "id": 1,
        "name": "Arto Hellas",
        "number": "040-123456"
    },
    {
        "id": 2,
        "name": "Ada Lovelace",
        "number": "39-44-5323523"
    },
    {
        "id": 3,
        "name": "Dan Abramov",
        "number": "12-43-234345"
    },
    {
        "id": 4,
        "name": "Mary Poppendieck",
        "number": "39-23-6423122"
    }
];

app.get('/api/persons', (request, response) => {
    response.send(phoneBook);
});

app.get('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    const person = phoneBook.find(person => person.id === id);

    if (person) {
        res.send(person);
    } else {
        res.status(404).end();
    }
});

app.get('/info', (req, res) => {
    const phoneBookLength = phoneBook.length;
    const timeOfReq = new Date;

    const html = `
        <div>
            <p>Phonebook has info for ${phoneBookLength.toString()} people.</p> <br/>
            ${timeOfReq}
        </div>
    `;

    res.send(html);
});

app.post('/api/persons', (req, res) => {
    const body = req.body;

    if (!body.name || !body.number) {
        return res.status(400).json({
            error: 'content missing'
        });
    } else if (phoneBook.find(person => person.name === body.name)) {
        return res.status(409).json({
            error: 'That name is already in the phonebook.'
        });
    }

    const id = (Math.floor(Math.random() * 10000));

    const newPerson = {
        id: id,
        name: body.name,
        number: body.number,
    };

    phonebook = phoneBook.concat(newPerson);
    res.json(newPerson);
});

app.delete('/api/persons/:id', (req, res) => {
    const id = Number(req.params.id);
    phoneBook = phoneBook.filter(person => person.id !== id);
    res.status(204).end();
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});