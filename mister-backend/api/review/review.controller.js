const logger = require('../../services/logger.service')
const userService = require('../user/user.service')
const socketService = require('../../services/socket.service')
const reviewService = require('./review.service')
const toyService=require('../toy/toy.service')

async function getReviews(req, res) {
    try {
        const reviews = await reviewService.query(req.query)
        res.send(reviews)
    } catch (err) {
        logger.error('Cannot get reviews', err)
        res.status(500).send({ err: 'Failed to get reviews' })
    }
}

async function deleteReview(req, res) {
    try {
        await reviewService.remove(req.params.id)
        res.send({ msg: 'Deleted successfully' })
    } catch (err) {
        logger.error('Failed to delete review', err)
        res.status(500).send({ err: 'Failed to delete review' })
    }
}


async function addReview(req, res) {
    console.log(' in add review ')
    try {
        var review = req.body
        console.log('controller review', review)
        review.userId = req.session.user._id
        review = await reviewService.add(review)

        // prepare the updated review for sending out
        const user = await userService.getById(review.userId)
        const toy = await toyService.getById(review.toyId)
        review.user = {
            _id: user._id,
            username: user.username
        }
        review.toy = {
            _id: toy._id,
            name: toy.name,
            price: toy.price
        }
        delete review.userId
        delete review.toyId
        // console.log('CTRL SessionId:', req.sessionID);
        // socketService.broadcast({type: 'review-added', data: review})
        // socketService.emitToAll({type: 'user-updated', data: review.byUser, room: req.session.user._id})
        res.send(review)

    } catch (err) {
      
        logger.error('Failed to add review', err)
        res.status(500).send({ err: 'Failed to add review' })
    }
}

module.exports = {
    getReviews,
    deleteReview,
    addReview
}