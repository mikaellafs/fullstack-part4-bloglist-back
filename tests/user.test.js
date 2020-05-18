const User = require('../models/user')
const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')
const api = supertest(app)
const bcrypt = require('bcryptjs')

describe('when there is initially one user in db', () => {
    beforeEach(async () => {
        await User.deleteMany({})
    
        const passwordHash = await bcrypt.hash('ge34!al7line', 10)
        const user = new User({ name: 'Geraldo Jaqueline', username: 'geraldin', passwordHash })
    
        await user.save()
    })

    test('creation succeeds with a fresh username', async () => {
      const usersAtStart = await helper.usersInDb()
  
      const newUser = {
        username: 'lumarilu',
        name: 'Marilu Lut',
        password: 'galenha',
      }
  
      await api
        .post('/api/users')
        .send(newUser)
        .expect(200)
        .expect('Content-Type', /application\/json/)
  
      const usersAtEnd = await helper.usersInDb()
      expect(usersAtEnd).toHaveLength(usersAtStart.length + 1)
  
      const usernames = usersAtEnd.map(u => u.username)
      expect(usernames).toContain(newUser.username)
    })

    test('creation fails with invalid username', async () =>{
        const usersAtStart = await helper.usersInDb()
  
        const newUser = {
            username: 'lu',
            name: 'Marilu Lut',
            password: 'galenha',
        }

        await api.post('/api/users').send(newUser).expect(400)

        const usersAtEnd = await helper.usersInDb()
        expect(usersAtEnd).toHaveLength(usersAtStart.length)
    })
})

afterAll(() =>{
    mongoose.connection.close()
})