import express from 'express'
import cors from 'cors'

const port = 8000

const expressApp = express()
const router = express.Router()
expressApp.use(cors())

router.get('/file', (req, res) => {
  const { filename } = req.query

  console.log('Serving file:', filename)
  res.sendFile(filename as string)
})

expressApp.use('/', router)

const appServer = expressApp.listen(port, () => {
  console.log('server running on port', port)
})

export default { appServer }
