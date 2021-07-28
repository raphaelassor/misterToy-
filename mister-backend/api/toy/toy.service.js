const fs = require('fs')
const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const gToys = require('../data/toy.json')
const asyncLocalStorage = require('../../services/als.service')


async function query(filterBy = { vendor: '', maxSpeed: Infinity, pageIdx: 0 }) {
    try {
        console.log('in query')
        const collection = await dbService.getCollection('toy')
        const toys = await collection.find(_buildCriteria(filterBy)).toArray()
        return toys
    } catch (err) {
        console.log('error in mongodb toys retreival')
        throw err
    }
}

async function getById(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.findOne({ _id:ObjectId(toyId) })
        return toy
    } catch (err) {
        console.log('error finding toy', err)
        throw err
    }
}

async function remove(toyId) {
    try {
        const collection = await dbService.getCollection('toy')
        const toy = await collection.remove({ _id: { $eq: toyId } })
        return toy
    } catch (err) {
        console.log('error finding toy', err)
        throw err
    }
}

async function save(toy) {
    if (toy._id) {
        try {
            const collection = await dbService.getCollection('toy')
            await collection.updateOne({
                _id: { $eq: toy._id }}, { $set: { ...toy } } 
            )
    return toy
} catch (err) {
    console.log('cannot update toy', err)
    throw err
}
    } else {
    // CREATE
    const savedToy = {
        ...toy,
        msgs:[],
        createdAt: Date.now()
    }
    savedToy.imgUrl = `https://robohash.org/${savedToy._id}`
    try {
        const collection = await dbService.getCollection('toy')
        await collection.insert(savedToy)
        return savedToy
    } catch (err) {
        console.log('could not insert toy in mongodb ', err)
        throw err
    }
}
}
async function addMsg(toyId,msg){
    
    const store = asyncLocalStorage.getStore()
    const { userId } = store
    const msgToAdd={
        ...msg,
        _id:ObjectId(),
        userId,
        sentAt:Date.now()
    }
    try{
        const collection = await dbService.getCollection('toy')
        const toy= await collection.findOne({_id:ObjectId(toyId)})
        await collection.updateOne({_id:ObjectId(toyId)},{$set:{msgs:[...toy.msgs,msgToAdd]}})
        return msgToAdd
    }catch(err){
        console.log('cannot add messgaes')
        throw err
    }
} 


function getStats() {
    const labels = []
    const pricePerTypeMap = gToys.reduce((acc, toy) => {
        if (acc[toy.type]) {
            acc[toy.type].total += toy.price
            acc[toy.type].counter++
        } else {
            acc[toy.type] = {
                price: toy.price,
                counter: 1
            }
        }
    }, {})
    const pricesPerType = []
    for (const key in pricePerTypeMap) {
        labels.push(key)
        pricesPerType.push(pricePerTypeMap[key].total / pricePerTypeMap[key].counter)
    }
    const stats = {
        labels,
        pricesPerType
    }
    return stats
}


module.exports = {
    query,
    getById,
    remove,
    save,
    getStats,
    addMsg
}

function _makeId(length = 5) {
    var txt = ''
    var possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
    for (let i = 0; i < length; i++) {
        txt += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return txt
}

function _buildCriteria(filterBy) {
    const criteria = {}
    const filterCtg = filterBy.ctg === 'all' ? '' : filterBy.ctg
    criteria.name = { $regex: filterBy.name, $options: 'i' }
    criteria.type = { $regex: filterCtg, $options: 'i' }
    if (filterBy.stock !== 'all') criteria.inStock = { $eq: filterBy.stock === 'inStock' ? true : false }
    return criteria
}


function _isInTodoFilter(filterBy, toy) {
    const filterNameRegex = new RegExp(filterBy.name, 'i')
    const filterCtgRegex = filterBy.ctg === 'all' ? new RegExp('', 'i') : new RegExp(filterBy.ctg, 'i')
    if (filterNameRegex.test(toy.name) && filterCtgRegex.test(toy.type)) {
        if (filterBy.stock === 'inStock') return toy.inStock
        if (filterBy.stock === 'noStock') return !toy.inStock
        return true
    }
    else return false
}