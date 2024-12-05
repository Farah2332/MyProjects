const handleSearch = async () => {
    const res = await fetch('https://www.amazon.com/Harry-Potter-Chamber-Secrets-Rowling')
    const html = await res.text()
    console.log("html", html)
    return ''
}
export default handleSearch