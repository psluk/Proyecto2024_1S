const dbmgr = require("./DBManager")
const db = dbmgr.db

const getUsuarios = () => {
    try {
        const query = `SELECT * FROM Usuario`
        const readQuery = db.prepare(query)
        const rowList = readQuery.all()
        return rowList
    } catch (err) {
        console.error(err)
        throw err
    }
}

module.exports = {
    getUsuarios,

}
