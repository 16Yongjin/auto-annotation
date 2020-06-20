import * as tf from '@tensorflow/tfjs-node'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { ipcMain as ipc } from 'electron'
import fetch, { Response, RequestInit } from 'node-fetch'
import { readFile } from 'mz/fs'

const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '')

const fetchFile = async (url: string) => {
  const path = removeProtocol(url)
  const file = await readFile(path)
  const contentType =
    url.indexOf('.json') !== -1
      ? 'application/json'
      : 'application/octet-stream'
  const headers = { 'content-type': contentType }
  return new Response(file, { headers })
}

// Mock fetch api to support file:// protocol
// @ts-ignore
globalThis.fetch = async (url: string, init?: RequestInit | undefined) =>
  url.startsWith('file://') ? fetchFile(url) : fetch(url, init)

const modelUrl = `file://${__static}/cocossd/model.json`

let model: cocoSsd.ObjectDetection | null = null

export const detectObject = async (dataURL: string) => {
  const buffer = Buffer.from(dataURL.split(',')[1], 'base64')
  const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D

  if (!model) model = await cocoSsd.load({ modelUrl })
  const predictions = await model.detect(image)

  return predictions
}

ipc.on('detect', async (event, dataUrl) => {
  const prediction = await detectObject(dataUrl)
  event.reply('detect', prediction)
})
