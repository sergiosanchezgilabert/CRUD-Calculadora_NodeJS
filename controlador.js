/* === Cargamos la entidad Numero/Operaciones === */
const Numero = require('./model/Operacion')

const bbdd = require('./bbdd')

// load the things we need
var express = require('express');

const app = express()

app.set('view engine', 'ejs');

let todos = []
let cont = 0

//Calculo Total de Operacion de #_id
function calcularTotal(numeroAct, operacion, num) {

    let resul = -99999

    switch (operacion) {
        case 'Sumar':
            resul = parseInt(numeroAct.total) + parseInt(num)
            console.log('Sumando: ' + resul)

            break;
        case 'Restar':
            resul = numeroAct.total - num
            console.log('Restando: ' + resul)

            break;
        case 'Multiplicar':
            resul = numeroAct.total * num
            console.log('Multiplicando: ' + resul)

            break;
        case 'Dividir':
            resul = numeroAct.total / num
            console.log('Dividiendo: ' + resul)

            break;
    }
    if (resul === -99999) console.log('Operacion no valida')
    return resul
}

//Herramienta para eliminar las colecciones actuales(pruebas)
function eliminarColeccion() {
    Numero.remove({}, function (err) {
        console.log('collection removed')
    });
}

//Funcion para saber que tipo de operacion voy a realizar
function tipoOperacion(operacion) {
    var tipo = 'NULL'
    switch (operacion) {
        case 'Sumar':
            tipo = '+'

            break;
        case 'Restar':
            tipo = '-'

            break;
        case 'Multiplicar':
            tipo = '*'

            break;
        case 'Dividir':
            tipo = '/'

            break;
        case 'Limpiar':
            tipo = '!'

            break;
    }
    return tipo
}

//Funcion para guardar un contador de cada segundo para eliminar #id con un tiempo sin modificar de >60 seconds
setInterval(async function contador() {
    let todos = await Numero.find()
    for (let i = 0; i < todos.length; i++) {
        if (cont - (todos[i].contador + 60) >= 0) {
            await Numero.deleteOne({ "_id": todos[i]._id })
        }
    }
    cont++
}, 1000)

//Logica principal donde cargo y actualizo los #_id segun la situacion
async function logicaCalculadora(req, res){
    //eliminarColeccion()

    if ((req.query.inputId !== undefined || req.query.inputId !== ' ')
        && (req.query.inputNumber !== undefined || req.query.inputNumber !== ' ')
        && (req.query.inputOperacion !== undefined || req.query.inputOperacion !== ' ')) {

        const id = req.query.inputId
        const num = req.query.inputNumber
        const operacion = req.query.inputOperacion

        try {
            let numeroAct = await Numero.findById(id)

            if (numeroAct) {

                var tipo = tipoOperacion(operacion)
                var operacionInsertar = tipo + num
                var operacionAct = numeroAct.operaciones
                var totalCalculado = calcularTotal(numeroAct, operacion, num)

                if(tipo==='!'){
                    //Reseteo el #_id en la BBDD de Mongoose a 0 o ' ' (segun tipo de dato)
                    await Numero.findByIdAndUpdate(id, { total: 0, operaciones: ' ', contador: cont }, { new: true })
                }else{
                    //Actualizo la informacion del #_id en la BBDD de Mongoose
                    await Numero.findByIdAndUpdate(id, { total: totalCalculado, operaciones: operacionAct + operacionInsertar, contador: cont }, { new: true })
                }

            } else {
                //Guardar el #_id en la BBDD de Mongoose
                const ope = new Numero({ _id: req.query.inputId, total: num, operaciones: ' Operaciones: ' + num, contador: cont })
                await ope.save()
            }
        } catch (excepcion) {
            console.log('Aun no hay ningun numero que buscar')
        }
    }

    todos = await Numero.find()

    console.log(req.query.inputId)
    //Mando la informacion de los #_id al EJS (HTML)
    res.status(200).render('pages/index', {
        todos: todos,
        _id: req.query.inputId,
        numero:req.query.inputNumber,
        operacion:req.query.inputOperacion
    });
}

// index page 
var index=app.get('/', logicaCalculadora)

module.exports={index}