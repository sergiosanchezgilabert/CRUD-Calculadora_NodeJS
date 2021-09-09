const mongoose= require('mongoose')

const NumeroSchema = new mongoose.Schema({
    _id:Number,
    total: Number,
    operaciones:String,
    contador:Number
})

const Numero = mongoose.model('Numero', NumeroSchema)

module.exports=Numero