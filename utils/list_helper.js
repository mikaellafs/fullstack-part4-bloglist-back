const dummy = (blogs) =>{
    return 1
}

const totalLikes = (blogs) =>{
    const reducer = (sum, blog) => sum + blog.likes

    return blogs.lenght === 0? 0 : blogs.reduce(reducer, 0)
}

const favoriteBlog = (blogs) =>{
    const reducer = (fav, blog) => (blog.likes > fav.likes) ? blog : fav

    return blogs.length === 0? null : blogs.reduce(reducer, blogs[0])
}

const mostBlogs = (blogs) =>{
    if(blogs.length === 0) return null

    
    const countBlogs = (total, next) => {
        let newElement

        if(total[next.author]){
            newElement = {...total[next.author]}
            newElement.blogs++
        }else
            newElement = {author: next.author, blogs: 1}

        total[next.author] = newElement

        return total
    }

    const blogsByAuthor = blogs.reduce(countBlogs, [])
    let greatest = {blogs : -1}

    for(let aut in blogsByAuthor){
        if(blogsByAuthor[aut].blogs > greatest.blogs)
            greatest = blogsByAuthor[aut]
    }

    return greatest
}

const mostLikes = (blogs) =>{
    if(blogs.length === 0) return null

    const countBlogs = (total, next) => {
        let newElement

        if(total[next.author]){
            newElement = {...total[next.author]}
            newElement.likes += next.likes
        }else
            newElement = {author: next.author, likes: next.likes}

        total[next.author] = newElement

        return total
    }

    const likesByAuthor = blogs.reduce(countBlogs, [])
    let greatest = {likes : -1}

    for(aut in likesByAuthor){
        if(likesByAuthor[aut].likes > greatest.likes)
            greatest = likesByAuthor[aut]
    }

    return greatest
}

module.exports = {
    dummy,
    totalLikes,
    favoriteBlog,
    mostBlogs,
    mostLikes
}