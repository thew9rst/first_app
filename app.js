//настройка сервера
const express = require('express') //глобальная функция для подключения пакетов
const config = require('config') //подключается из нодмодулей
const mongoose = require('mongoose') //для подключения к монго дб
const { json } = require('express')
const path = require('path')

const app = express() //результат работы функции експресс

app.use(express.json({ extended: true }))

app.use('/api/auth', require('./routes/auth.routes'))
app.use('/api/link', require('./routes/link.routes'))
app.use('/t', require('./routes/redirect.routes'))

if (process.env.NODE_ENV === 'production') {
  app.use('/', express.static(path.join(__dirname, 'frontend', 'build')))

  app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, 'frontend', 'build', 'index.html'))
  })
}

const PORT = config.get('port') || 5000

async function start() {
  // обертка для использования синтаксиса асинк евейт

  try {
    await mongoose.connect(config.get('mongoUri'), {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true, //параметры для успешной работы конекта
    }) // так как єто промис авейт нужен чтобы подождать пока процесс не завершится
    app.listen(5000, () =>
      console.log(`app hes benn started on port ${PORT}....`)
    ) //запускаем сервер на порте 5000
  } catch (e) {
    console.log('server error', e.message)
    process.exit(1) //выход из процесса ноудджиес
  }
}

start()
