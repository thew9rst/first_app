const { Router } = require('express') // достаем роутер из експресса
const User = require('../models/User')
const config = require('config')
const jwt = require('jsonwebtoken')
const { check, validationResult } = require('express-validator')
const bcrypt = require('bcryptjs') //для хеширования паролей со сравнением
const router = Router() // создаем роутер
//нам нужно обработать два пост запроса
// /api/auth/register
router.post(
  '/register',
  [
    check('email', 'некоректный email...').isEmail(),
    check('password', 'минимальная длина пароля 6 символов...').isLength({
      min: 6,
    }),
  ], // массив мидлваров для валидации
  async (req, res) => {
    try {
      const errors = validationResult(req) // таким образом мы валидируем входящие поля

      if (!errors.isEmpty) {
        return res.status(400).json({
          errors: errors.array(), //приводим к массиву
          message: 'некоректные данные при регистрации...',
        }) //если ошибки не пусты то мы возвращаем результат на фронтенд указывая код ошибки
      }

      const { email, password } = req.body // это то что мы будем отправлять с фронтенда

      const candidate = await User.findOne({ email }) // мы ждем пока модель пользователя будет искать человека по емеилу
      if (candidate) {
        return res
          .status(400)
          .json({ message: 'такой пользователь уже существует' }) // вывожу номер ошибки и сообщение, чтоб дальше скрипт не ишел ретурн
      } // проверяем есть ли такой пользователь в базе

      const hashedPassword = await bcrypt.hash(password, 12) //хешируем пароль полсле чего
      //создаем нового пользователя
      const user = new User({ email, password: hashedPassword })
      //после чего мы ждем пока новый пользователь сохранится
      await user.save()
      // после чего мы отвечаем фронтенду
      res.status(201).json({ message: 'пользователь создан....' })
    } catch (e) {
      res
        .status(500)
        .json({ message: 'что-то пошло не так попробуйте снова...' }) //при ошибке выводится номер ошибки и сообщение
    }
  }
)
// /api/auth/login
router.post(
  '/login',
  [
    check('email', 'введите коректный емеил').normalizeEmail().isEmail(),
    check('password', 'введите пароль').exists(),
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req) // таким образом мы валидируем входящие поля

      if (!errors.isEmpty) {
        return res.status(400).json({
          errors: errors.array(), //приводим к массиву
          message: 'некоректные данные при входе в систему...',
        }) //если ошибки не пусты то мы возвращаем результат на фронтенд указывая код ошибки
      }

      const { email, password } = req.body //

      const user = await User.findOne({ email })
      if (!user) {
        return res.status(400).json({ message: 'пользователь не найдет' })
      } // поиск пользователя

      const isMatch = await bcrypt.compare(password, user.password) //бикрипт позволяет сравнивать пароли // первый аргумент это пароль который мы получили а второй котрый находится в базе
      if (!isMatch) {
        return res
          .status(400)
          .json({ message: 'неверный пароль, попробуйте снова' })
      } //если пароли не совпадают выводим ошибку

      const token = jwt.sign({ userId: user.id }, config.get('jwtSecret'), {
        expiresIn: '1h',
      }) //создание токена / первы параметр это обьект в котором нам необходимо указать те данные которые буддут зашифрованы в нашем токене
      //вторым параметром передаем секретный ключ / третий параметр это обьект в котором указыввется время существования токена

      res.json({ token, userId: user.id }) // ответ человеку
    } catch (e) {
      res
        .status(500)
        .json({ message: 'что-то пошло не так попробуйте снова...' }) //при ошибке выводится номер ошибки и сообщение
    }
  }
)

module.exports = router //из модуля мы експорртируем обьект роутера
