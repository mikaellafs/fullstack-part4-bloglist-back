const Blog = require('../models/blog')
const User = require('../models/user')

const initialUser = {
    name: "testando",
    username: "test",
    password: "secret"
}

const initialBlogs = [
    {
        title : 'Diario de uma patty',
        author : 'Luana Sales',
        url : 'www.comoserpaty.com',
        likes : 0
    }, 
    {
        title : 'Um titulo qualquer',
        author : 'Um alguem qualquer',
        url : 'www.nadacomoumnada.com',
        likes : 0
    }]

const blogsInDb = async () => {
    const blogs = await Blog.find({})
    return blogs.map(blog => blog.toJSON())
}

const usersInDb = async () => {
    const users = await User.find({})
    return users.map(u => u.toJSON())
}

module.exports = {initialBlogs, blogsInDb, usersInDb, initialUser}