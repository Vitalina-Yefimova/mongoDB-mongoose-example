const winston = require('winston') // импорт библиотеки winston для логирования

const colorizer = winston.format.colorize() // форматирование цветного вывода в консоль

const logger = winston.createLogger({ // создание логгера
  level: 'debug', // уровень логирования
  format: winston.format.combine( // комбинированный формат логирования
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }), // добавление временной метки
    winston.format.printf(({ timestamp, level, message }) => { // форматирование сообщения
      return `[${timestamp}] ${level}: ${message}` // форматирование сообщения с временной меткой и уровнем логирования
    })
  ),
  transports: [ // транспорты - это место, куда будут отправляться логи
    new winston.transports.Console({ // транспорт для вывода логов в консоль
      format: winston.format.combine( // комбинированный формат логирования
        winston.format.printf(({ timestamp, level, message }) => { // форматирование сообщения
          return colorizer.colorize(level, `[${timestamp}] ${level}: ${message}`) // форматирование сообщения с временной меткой и уровнем логирования
        }),
      )
    }),
        new winston.transports.File({ // транспорт для записи логов в файл
          filename: 'logs/combined.log', // имя файла, в который будут записываться логи
        }),
        new winston.transports.File({
          filename: 'logs/warn.log',
          level: 'warn' // уровень логирования
        }),
  ]
});

module.exports = logger // экспорт логгера для использования в других файлах