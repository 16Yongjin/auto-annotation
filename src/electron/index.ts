import '@tensorflow/tfjs'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { ipcMain } from 'electron'

const modelPath = 'file://cocossd/model.json'

let model: cocoSsd.ObjectDetection | null = new cocoSsd.ObjectDetection(
  'lite_mobilenet_v2',
  modelPath
)

export const detectObject = async (image: HTMLImageElement) => {
  console.log('iamge', image)

  console.log('start detection')

  console.log('loading model...')
  if (!model) model = await cocoSsd.load({ modelUrl: modelPath })
  console.log('loaded model!!')
  const predictions = await model.detect(image)
  return predictions
}

export const setup = () => {
  console.log('setup')

  ipcMain.on('detect', async (event, arg) => {
    console.log(arg)

    const predictions = await detectObject(arg)
    event.reply('detect', predictions)
  })

  ipcMain.on('test', (event, args) => {
    console.log('from args', args)
    event.reply('test', 'Hello!')
  })
}
