require('dotenv').config({ path: './enviroments.env' })

const controlador = require('./controlador')

// load the things we need
var express = require('express');

const app = express()
const port = process.env['PORT']
const host = process.env['HOST']

app.set('view engine', 'ejs');

app.get('', function (req, res) {
    controlador.index(req, res)
})

app.listen(port, () => {
    console.log(`App at http://${host}:${port}`)
})