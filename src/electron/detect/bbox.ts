import * as tf from '@tensorflow/tfjs-node'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import fetch, { RequestInit } from 'node-fetch'
import { ipcMain as ipc } from 'electron-better-ipc'
import { fetchFile } from '../file-fetch'

// Mock fetch api to support file:// protocol
// @ts-ignore
globalThis.fetch = async (url: string, init?: RequestInit | undefined) =>
  url.startsWith('file://') ? fetchFile(url) : fetch(url, init)

const modelUrl = `file://${__static}/cocossd/model.json`

let model: cocoSsd.ObjectDetection | null = null

const detectObject = async (dataURL: string) => {
  const buffer = Buffer.from(dataURL.split(',')[1], 'base64')
  const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D

  if (!model) model = await cocoSsd.load({ modelUrl })
  const predictions = await model.detect(image)

  return predictions
}

ipc.answerRenderer('detect/bbox', async (dataUrl: string) => {
  const prediction = await detectObject(dataUrl)
  return prediction
})
