const usersRouter = require('express').Router()
const User = require('../models/user')
require('express-async-errors')
const bcrypt = require('bcryptjs')

usersRouter.post('/', async (request, response) =>{
    const body = request.body

    if(!body.password || body.password.length <3){
        return response.status(400).json({
            error: 'invalid password'
          })
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const newUser = new User({
        name: body.name,
        username : body.username,
        passwordHash : passwordHash
    })

    const savedUser = await newUser.save()
    response.json(savedUser)
})

usersRouter.get('/', async (request, response) => {
    const users = await User.find({}).populate('blogs', {url :1, title: 1, author: 1})
    response.json(users.map(u => u.toJSON()))
})

module.exports = usersRouter