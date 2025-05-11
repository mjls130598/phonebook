const express = require('express')
const morgan = require('morgan')
const cors = require('cors')
const app = express()
const PORT = process.env.PORT || 3002
const MAX = 9999

app.use(express.json())

morgan.token('body', (req) => JSON.stringify(req.body))

app.use(morgan((tokens, req, res) => {
  return [
    tokens.method(req, res),
    tokens.url(req, res),
    tokens.status(req, res),
    tokens.res(req, res, 'content-length'), '-',
    tokens['response-time'](req, res), 'ms',
    tokens.method(req, res) === 'POST' ? tokens.body(req, res) : ''
  ].join(' ')
}))

app.use(cors())

let persons = [
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
]

app.get("/api/persons", (request, response) => {
    response.json(persons)
})

app.get("/info", (request, response) => {
    response.send(
        `<p>Phonebook has info for ${persons.length} people</p>
         <p>${new Date()}</p>`
    )
})

app.get("/api/persons/:id", (request, response) => {
    const id = Number(request.params.id)
    const person = persons.find(person => person.id === id)

    if(person)
        response.json(person)
    else    
        response.status(404).end()
})

app.delete("/api/persons/:id", (request, response) =>{
    const id = Number(request.params.id)
    persons = persons.filter(person => person.id !== id)

    response.status(204).end()
})

const generateId = () => {
    return Math.floor(Math.random() * MAX)
}

app.post("/api/persons", (request, response) =>{
    const body = request.body

    if (!body.number){
        return response.status(422).json({
            error: "number missing"
        })
    }

    if (!body.name){
        return response.status(422).json({
            error: "name missing"
        })
    }
    else{
        if(persons.find(person => person.name === body.name)){
            return response.status(422).json({
                error: "name must be unique"
            })
        }
    }

    const person = {
        id: generateId(),
        name: body.name,
        number: body.number
    }

    persons = persons.concat(person)
    response.status(201).json({
        message: "Person added"
    })
})

app.listen(PORT, () =>{
    console.log(`Server is listening in port ${PORT}`)
})