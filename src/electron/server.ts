import { app, BrowserWindow, ipcMain, nativeImage } from 'electron'
import path from 'path'
import express from 'express'
import cors from 'cors'
let fileFolder: string

const port = 8000

const expressApp = express()
const router = express.Router()
expressApp.use(cors())

ipcMain.on('folder', (event, folder) => {
  fileFolder = folder
})

router.get('/file/:name', function(req, res) {
  let filename = fileFolder + path.sep + req.params.name
  console.log('Serving file:', filename)
  res.sendFile(filename)
})

expressApp.use('/', router)

expressApp.listen(port, () => {
  console.log('server running on port', 8000)
})
