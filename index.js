const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config(); // подключение .env файла для работы с переменными окружения
const app = express() // создание экземпляра приложения express
const PORT = 8080
const logger = require('./logger.js') // импорт логгера из файла logger.js


main().catch(err => logger.error('Main error: ' + err)) // функция main, которая будет выполнять асинхронные операции с базой данных, catch ошибки и выводить её в консоль

// async function main() {
//   await mongoose.connect(process.env.MONGODB_URI, {
//     useNewUrlParser: true, // использование нового парсера URL
//     useUnifiedTopology: true // использование нового топологического парсера
//   }).then(() => console.log('Connected to MongoDB Atlas')); // подключение к базе данных MongoDB Atlas

async function main() {
  await mongoose.connect('mongodb://127.0.0.1:27017/kittens') // подключение к базе данных MongoDB
    .then(() => logger.info('Connected to MongoDB'))
  .catch(err => logger.error('MongoDB connection error: ' + err)) // обработка ошибок подключения к базе данных
  
  const kittySchema = new mongoose.Schema({ // создание схемы для коллекции "kitty" в БД. Schema - это структура документа, которая определяет поля и их типы
    name: String
  })

  kittySchema.methods.speak = function speak() { // метод speak, который будет выводить в консоль имя котёнка
    const greeting = this.name
      ? 'Meow, my name is ' + this.name
      : "I don't have a name"
    logger.info(greeting) // вывод имени котёнка в консоль
  }

  const Kitten = mongoose.model('Kitten', kittySchema) // создание модели "Kitten" на основе схемы "kittySchema"; модель - это конструктор, который позволяет создавать и управлять документами в коллекции "kittens" в БД

  app.use(express.json())

  // POST /kittens — add a new kitten
  app.post('/kittens', async (req, res) => {
    try {
      const kitten = new Kitten(req.body) // создание нового котёнка на основе данных из тела запроса
      kitten.name = req.body.name // присвоение имени котёнку из тела запроса
      await kitten.save() // сохранение котёнка в базе данных
      kitten.speak() // speak - метод, который выводит в консоль имя котёнка
      logger.info(`Kitten created: ${kitten.name}`)
      res.status(201).json(kitten)
    } catch (err) {
      logger.error('Error creating kitten: ' + err.message)
      res.status(400).json({ error: err.message })
    }
  })

  // GET /kittens — get all kittens
  app.get('/kittens', async (_, res) => {
    try {
      const kittens = await Kitten.find() // find - метод, который ищет все документы в коллекции "kittens"
      logger.info('Fetched all kittens') // вывод в консоль сообщения о том, что все котята были получены
      res.json(kittens)
    } catch (err) {
      logger.error('Error fetching kittens: ' + err.message)
      res.status(500).json({ error: err.message })
    }
  })

  // DELETE — delete kitten by name
  app.delete('/kittens', async (req, res) => {
    const { name } = req.body // деструктуризация имени котёнка из тела запроса
  try {
    const kitten = await Kitten.findOneAndDelete({ name })
    if (!kitten) {
      logger.warn(`Kitten '${req.params.name}' not found`)
      return res.status(404).json({ error: 'Kitten not found' })
    }
    logger.info(`Kitten deleted: ${req.params.name}`)
    res.json({ message: `Kitten '${req.params.name}' deleted`, kitten })
  } catch (err) {
    logger.error('Error deleting kitten: ' + err.message)
    res.status(500).json({ error: err.message })
  }
})


  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
  })
}