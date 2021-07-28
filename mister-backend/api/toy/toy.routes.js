const express = require('express')
const {requireAuth, requireAdmin} = require('../../middlewares/requireAuth.middleware')
const {getToys, getToyById, saveToy, removeToy,addMsg} = require('./toy.controller')
const router = express.Router()

// middleware that is specific to this router
// router.use(requireAuth)

router.get('/', getToys)
router.get('/:toyId', getToyById)
router.put('/:toyId',  saveToy)
router.post('/',  saveToy)
router.delete('/:toyId',removeToy)
router.post('/:toyId/msg',addMsg)

// router.put('/:id',  requireAuth, updateUser)
// router.delete('/:id',  requireAuth, requireAdmin, deleteUser)

module.exports = router