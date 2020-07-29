import * as tf from '@tensorflow/tfjs-node'
import * as deeplab from '@tensorflow-models/deeplab'
import { ipcMain as ipc } from 'electron-better-ipc'

const modelName = 'pascal' // set to your preferred model, either `pascal`, `cityscapes` or `ade20k`
const quantizationBytes = 2 // either 1, 2 or 4

let model: deeplab.SemanticSegmentation | null = null

const detect = async (dataUrl: string) => {
  const buffer = Buffer.from(dataUrl.split(',')[1], 'base64')
  const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D

  if (!model) model = await deeplab.load({ base: modelName, quantizationBytes })
  const segments = await model.segment(image)

  return segments
}

ipc.answerRenderer('detect/segmentation', async (dataUrl: string) => {
  const prediction = await detect(dataUrl)
  return prediction
})
