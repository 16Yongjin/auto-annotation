import { createDatasetsFromPath } from '@/utils/file/index'
import { ProjectInfo } from './../models/user/project/index'
import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { v4 as uuidv4 } from 'uuid'
import { db } from './db'
import { Project } from '@/models/user/project'

const port = 8000

const expressApp = express()
const router = express.Router()
expressApp.use(cors())
expressApp.use(bodyParser.json())

router.get('/file', (req, res) => {
  const { filename } = req.query
  console.log('Serving file:', filename)
  res.sendFile(filename as string)
})

router.post('/projects', async (req, res) => {
  const projectInfo = req.body as ProjectInfo
  projectInfo.createdAt = new Date().toString()
  projectInfo.id = uuidv4()

  const datasets = await createDatasetsFromPath(projectInfo.path)
  const project: Project = { info: projectInfo, datasets }

  db.get('projects')
    .push(project)
    .write()

  res.status(201).send(project)
})

router.get('/projects', (req, res) => {
  const projectInfo = db
    .get('projects')
    .map('info')
    .value()

  res.send(projectInfo)
})

router.get('/projects/:id', (req, res) => {
  const id = req.params.id

  const project = db
    .get('projects')
    .find({ info: { id } })
    .value()

  res.send(project)
})

expressApp.use('/', router)

const appServer = expressApp.listen(port, () => {
  console.log('server running on port', port)
})

export default { appServer }
