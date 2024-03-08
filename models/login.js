const login = async (data) => {
    try {

    } catch(err) {
        console.error(`ERROR LOGGING IN: ${err} ${JSON.stringify(data)}`)
    }
}

const logout = async (data) => {
    try  {

    } catch(err) {
        console.error(`ERROR LOGGING OUT: ${err} ${JSON.stringify(data)}`)
    }
}

module.exports = { login, logout }