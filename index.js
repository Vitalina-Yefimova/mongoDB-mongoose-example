const express = require('express')
const mongoose = require('mongoose')
require('dotenv').config(); // подключение .env файла для работы с переменными окружения
const app = express() // создание экземпляра приложения express
const PORT = 8080


main().catch(err => console.error(err)) // функция main, которая будет выполнять асинхронные операции с базой данных, catch ошибки и выводить её в консоль

async function main() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser: true, // использование нового парсера URL
    useUnifiedTopology: true // использование нового топологического парсера
  }).then(() => console.log('Connected to MongoDB Atlas')); // подключение к базе данных MongoDB Atlas

// async function main() {
//   await mongoose.connect('mongodb://127.0.0.1:27017/kittens') // подключение к базе данных MongoDB
//   .then(() => console.log('Connected to MongoDB'))
  
  const kittySchema = new mongoose.Schema({ // создание схемы для коллекции "kitty" в БД. Schema - это структура документа, которая определяет поля и их типы
    name: String
  })

  kittySchema.methods.speak = function speak() { // метод speak, который будет выводить в консоль имя котёнка
    const greeting = this.name
      ? 'Meow, my name is ' + this.name
      : "I don't have a name"
    console.log(greeting)
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
      res.status(201).json(kitten)
    } catch (err) {
      res.status(400).json({ error: err.message })
    }
  })

  // GET /kittens — get all kittens
  app.get('/kittens', async (_, res) => {
    try {
      const kittens = await Kitten.find() // find - метод, который ищет все документы в коллекции "kittens"
      res.json(kittens)
    } catch (err) {
      res.status(500).json({ error: err.message })
    }
  })

  // DELETE /kittens/:name — delete kitten by name
app.delete('/kittens/:name', async (req, res) => {
  try {
    const kitten = await Kitten.findOneAndDelete({ name: req.params.name })
    if (!kitten) {
      return res.status(404).json({ error: 'Kitten not found' })
    }
    res.json({ message: `Kitten '${req.params.name}' deleted`, kitten })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})


  app.listen(PORT, () => {
    console.log(`Server is running at http://localhost:${PORT}`)
  })
}