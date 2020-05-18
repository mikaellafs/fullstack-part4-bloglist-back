const mongoose = require('mongoose')
const supertest = require('supertest')
const app = require('../app')
const helper = require('./test_helper')

const api = supertest(app)
const Blog = require('../models/blog')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

beforeEach(async () => {
    await Blog.deleteMany({})
    await User.deleteMany({})
    
    const user = new User(helper.initialUser)
    await user.save()

    const blogObjects = helper.initialBlogs
      .map(blog => new Blog(blog))
    const promiseArray = blogObjects.map(blog => {
        blog.user = user._id
        return blog.save()
    })
    await Promise.all(promiseArray)
})

describe('when there are blogs initially saved', () =>{
    test('blogs are returned as json', async () => {
        await api
          .get('/api/blogs')
          .expect(200)
          .expect('Content-Type', /application\/json/)
    })
})

describe('adding a new blog', () =>{
    test('blog is posted with success', async () =>{
        const user = await User.findOne({})
        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validToken = 'bearer '.concat(token)
        
        const newBlog = new Blog({
            title : 'A volta dos que nao foram',
            author : 'Ze ninguem',
            url : 'www.aasas.com',
            likes : 0
        })
    
        await api.post('/api/blogs').send(newBlog)
        .set('Authorization', validToken)
        .expect(201)
    
        const response = await api.get('/api/blogs')
    
        expect(response.body).toHaveLength(helper.initialBlogs.length+1)
    
        const titles = response.body.map(b => b.title)
        expect(titles).toContain(
            'A volta dos que nao foram'
        )
    })

    test('missing important content', async () => {
        const user = await User.findOne({})
        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validToken = 'bearer '.concat(token)

        const newBlog = new Blog({
            author : 'Manoel',
            likes: 2
        })
    
        await api.post('/api/blogs').send(newBlog)
        .set({Authorization : validToken})
        .expect(400)
    })

    test('invalid token', async () =>{
        const invalidToken = 'bearer ndhru93r893n9dr34hysdsrf7h3rbe'

        const newBlog = new Blog({
            title : 'A volta dos que nao foram',
            author : 'Ze ninguem',
            url : 'www.aasas.com',
            likes : 0
        })
    
        await api.post('/api/blogs').send(newBlog)
        .set({Authorization : invalidToken})
        .expect(401)
    })

    test('missing token', async () =>{
        const newBlog = new Blog({
            title : 'A volta dos que nao foram',
            author : 'Ze ninguem',
            url : 'www.aasas.com',
            likes : 0
        })
    
        await api.post('/api/blogs').send(newBlog)
        .expect(401)
    })
})

describe('schema properties', () =>{
    test('a property exists', async () => {
        const user = await User.findOne({})
        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validToken = 'bearer '.concat(token)
        
        const newBlog = new Blog({
            author: 'aaaa',
            title: 'bbbbb',
            url: 'ccccc'        
        })
        const res = await api.post('/api/blogs').send(newBlog)
        .set({Authorization : validToken})
        expect(res.body.id).toBeDefined()
    })
    
    
    test('if likes property that isnt in request is set to 0', async () => {
        const user = await User.findOne({})
        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validToken = 'bearer '.concat(token)

        const newBlog = new Blog({
            title : 'likes missing',
            author : 'Me',
            url : 'www.whereslikes.com',
        })
    
        const res = await api.post('/api/blogs').send(newBlog)
        .set({Authorization : validToken})
        expect(res.body.likes).toBe(0)
    })
})

describe('deleting a blog post', () =>{
    test('deleted blog with success', async () =>{
        const user = await User.findOne({})
        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validToken = 'bearer '.concat(token)

        let blogToDelete = await helper.blogsInDb()
        blogToDelete = blogToDelete[0]
        
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', validToken)
        .expect(204)
    })

    test('deleting a blog post unauthorized', async () =>{
        let user = new User({
            name: "errado",
            username: "muahaha",
            password: "malzao"
        })
        user = await user.save()

        const token = jwt.sign({username: user.username, id: user._id}, process.env.SECRET)
        const validTokenFromOtherUser = 'bearer '.concat(token)

        let blogToDelete = await helper.blogsInDb()
        blogToDelete = blogToDelete[0]
        
        await api
        .delete(`/api/blogs/${blogToDelete.id}`)
        .set('Authorization', validTokenFromOtherUser)
        .expect(401)
    })
})
afterAll(() => {
  mongoose.connection.close()
})