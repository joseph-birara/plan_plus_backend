const SubTask = require('../models/subTask')
const Task = require('../models/task')


const createSubTask = async (req, res) => {
    const task = Task.findOne({ user: req.user.userId, _id: req.params.id }).catch((err) => {
        console.log(err.message)
        return res.status(400).json({err:err.message})
    })
    if(!task){
        console.log( `there is no task with this id`)
        return res.status(400).json({err: `there is no task with this id`})
    }

    await SubTask.create({ task: req.params.id, ...req.body })
        .then((results) => {
            return res.status(201).json({ msg: "sub Task has been successfully created." })
        })
        .catch((err) => {
            return res.status(400).json({ err: err.errors })
        })
}

const deleteSubTask = async (req, res) => {

    const subTask = await SubTask.findById(req.params.id).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!subTask){
        return res.status(400).json({err:'there is no subTask with this id'})
    }
    const task = await Task.findOne({_id:subTask.task, user:req.user.userId}).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!task){
        return res.status(400).json({err:'there is no task with this id'})
    }
    await subTask.remove().then((result) => {
        return res.status(200).json({msg:`sub Task deleted successfully`})
    }).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    
} 


const updateSubTaskStatus = async (req, res) => {

    const subTask = await SubTask.findById(req.params.id).catch((err) => {
        console.log(err.message)
        return res.status(400).json({ err: err.message })
    })
    if (!subTask) {
        console.log(`there is no subTask with this id`)
        return res.status(400).json({ err: `there is no subTask with this id` })
    }
    const task = await Task.findOne({ _id:subTask.task, user:req.user.userId}).catch((error) => {
        return res.status(400).json({err:error.message})
    })  
    if(!task){
        return res.status(400).json({err:'there is no task with this id'})
    }
    await subTask.updateOne({ status:req.body.status }).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    return res.status(200).json({
        msg: "status changed successfully"
    })
}

const editSubTask = async (req, res) => {
    const subTask = await SubTask.findById(req.params.id).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!subTask){
        return res.status(400).json({err:'there is no subTask with this id'})
    }
    const task = await Task.findOne({_id:subTask.task, user:req.user.userId}).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!task){
        return res.status(400).json({err:'there is no task with this id'})
    }
    return res.status(200).json({ task: subTask })
   
}

const updateSubTask = async (req, res) => {
    const subTask = await SubTask.findById(req.params.id).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!subTask){
        return res.status(400).json({err:'there is no subTask with this id'})
    }
    const task = await Task.findOne({_id:subTask.task, user:req.user.userId}).catch((error) => {
        return res.status(400).json({err:error.message})
    })
    if(!task){
        return res.status(400).json({err:'there is no task with this id'})
    }
    await SubTask.updateOne({ ...req.body })
        .then((result) => {
            return res.status(200).json({ msg: "sub Task has been successfully updated." })
        })
        .catch((err) => {
            res.status(400).json({ err: err.errors })
        })
}


module.exports = {
    deleteSubTask,
    createSubTask,
    updateSubTaskStatus,
    editSubTask,
    updateSubTask,
}