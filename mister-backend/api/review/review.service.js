const dbService = require('../../services/db.service')
const ObjectId = require('mongodb').ObjectId
const logger= require ('../../services/logger.service')
const asyncLocalStorage = require('../../services/als.service')

async function query(filterBy = {}) {
    try {
        // const criteria = _buildCriteria(filterBy)
        console.log('filterBy:' , filterBy)
        const collection = await dbService.getCollection('review')
        // const reviews = await collection.find(criteria).toArray()
        var reviews = await collection.aggregate([
            {
                $match: filterBy
            },
            {
                $lookup:
                {
                    from: 'user',
                    localField: 'userId',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $unwind: '$user'
            },
            {
                $lookup:
                {
                    from: 'toy',
                    localField: 'toyId',
                    foreignField: '_id',
                    as: 'toy'
                }
            },
            {
                $unwind: '$toy'
            }
        ]).toArray()
        reviews = reviews.map(review => {
            review.user = { _id: review.user._id, username: review.user.username }
            review.toy = { _id: review.toy._id, name: review.toy.name, price: review.toy.price }
            delete review.userId
            delete review.toyId
            return review
        })
        
        return reviews
    } catch (err) {
        logger.error('cannot find reviews', err)
        throw err
    }

}

async function remove(reviewId) {
    try {
        const store = asyncLocalStorage.getStore()
        const { userId, isAdmin } = store
        const collection = await dbService.getCollection('review')
        // remove only if user is owner/admin
        const query = { _id: ObjectId(reviewId) }
        // if (!isAdmin) query.byUserId = ObjectId(userId)
        await collection.deleteOne(query)
        // return await collection.deleteOne({ _id: ObjectId(reviewId), byUserId: ObjectId(userId) })
    } catch (err) {
        logger.error(`cannot remove review ${reviewId}`, err)
        throw err
    }
}

    async function add(review) {
        try {
            // peek only updatable fields!
            const reviewToAdd = {
                userId:review.userId,
                toyId: review.toyId,
                content: review.content,
                date:review.date,
                rating:review.rating
            }
            const collection = await dbService.getCollection('review')
            await collection.insertOne(reviewToAdd)
            return reviewToAdd;
        } catch (err) {
            throw err
        }
    }

function _buildCriteria(filterBy) {
    const criteria = {}
    return criteria
}

module.exports = {
    query,
    remove,
    add
}


