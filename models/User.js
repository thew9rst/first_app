const { Schema, model, Types } = require('mongoose')

const schema = new Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  links: [{ type: Types.ObjectId, ref: 'Link' }], //массив ссылок, указываю тип линок и реф(к какой колекции мы привязываемся)
}) // поля для пользователя

module.exports = model('User', schema) // експортируем из файла результат работы функции модел где мы даем название нашей модели и указываем схему работы
