

const toyService = require('./toy.service')


// *********************** toy CRUDL - Create, Read, Update, Delete, List
// LIST

async function getToys(req, res) {
    try {
        console.log(req.query , 'req.query ')
        const filterBy = {
            name: req.query.name || '',
            stock: req.query.stock || 'all',
            ctg: req.query.ctg || 'all',
        }
        const toys = await toyService.query(filterBy)
        console.log('toys in controller',toys)
        res.send(toys)
    } catch (err) {
        console.log('failed to get toys', err)
        res.status(500).send({ err: 'Failed to get toys' })
    }
}

// READ
async function getToyById(req, res) {
    try {
        const { toyId } = req.params
        const toy = await toyService.getById(toyId)
        console.log('req.params', req.params)
        res.send(toy)
    } catch (err) {
        console.log('failed to get toy', err)
        res.status(500).send({ err: 'Failed to get toy with Id:', toyId })
    }

}

// CREATE

async function saveToy(req, res) {
    try {
        const toy = req.body;
        const savedToy = await toyService.save(toy)
        res.send(savedToy)
    } catch (err) {
        console.log('failed to save toy', err)
        res.status(500).send({ err: 'Failed to save toy ' })
    }
}


// DELETE

async function removeToy(req, res) {
    try {
        const { toyId } = req.params
        await toyService.remove(toyId)
        res.send('Deleted!')
    } catch (err) {
        console.log('Cannot delete toy', err);
        res.status(401).send(err)
    }
}

async function addMsg(req,res){
    console.log('in addMsg Controller, req is', req.body)
    try{
        const{toyId}=req.params
        const msg= req.body
       const  msgToAdd = await toyService.addMsg(toyId,msg)
       console.log('added msg,', msgToAdd)
        res.send(msgToAdd)
    }catch (err){
        console.log('Cannot send message', err);
        res.status(405).send(err)
    }
}



    // app.get('/api/toy/stats',(req,res)=>{
    //     console.log('in stats request')
    //     toyService.getStats().then(stats=>{
    //         res.send(stats)
    //     })
    // })


    module.exports = {
        getToys,
        getToyById,
        saveToy,
        removeToy,
        addMsg
    }