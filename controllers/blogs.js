const blogsRouter = require('express').Router()
const Blog = require('../models/blog')
require('express-async-errors')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

blogsRouter.get('/', async (request, response) => {
  const blogs = await Blog.find({}).populate('user', {username :1, name: 1})

  response.json(blogs.map(b=> b.toJSON()))
})

blogsRouter.post('/', async (request, response) => {
  const body = request.body
  const decodedToken = await jwt.verify(request.token, process.env.SECRET)

  const user = await User.findById(decodedToken.id)

  const blog = new Blog({
    author: body.author,
    title: body.title,
    url: body.url,
    likes: body.likes,
    user : user._id
  })

  const saved = await blog.save()
  user.blogs = user.blogs.concat(saved._id)
  await user.save()

  response.status(201).json(saved)
})

blogsRouter.delete('/:id', async (request, response) =>{
  let decodedToken = jwt.verify(request.token, process.env.SECRET)

  const blog = await Blog.findById(request.params.id)

  if(decodedToken.id.toString() !== blog.user.toString())
    return response.status(401).json({error: 'only creator can delete this blog'})

  const user = await User.findById(decodedToken.id)

  user.blogs = user.blogs.filter(b => b.toString() !== blog.id.toString())

  await blog.delete()
  await user.save()

  response.status(204).end()
})

blogsRouter.put('/:id', async (request, response) =>{
  const body = request.body

  const blog = {
    title: body.title,
    author: body.author,
    url: body.url,
    likes: body.likes
  }

  const updatedBlog = await Blog.findByIdAndUpdate(request.params.id, blog, { new: true })
  response.json(updatedBlog)
})

module.exports = blogsRouter