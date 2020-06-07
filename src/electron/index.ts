import * as tf from '@tensorflow/tfjs-node'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { ipcMain } from 'electron'
import fetch, { Response, RequestInit } from 'node-fetch'
import fs from 'fs'
import { promisify } from 'util'
declare const __static: string

const readFile = promisify(fs.readFile)

const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '')

// Mock fetch api to support file:// protocol
// @ts-ignore
globalThis.fetch = async (url: string, init?: RequestInit | undefined) => {
  if (!url.startsWith('file://')) {
    return fetch(url, init)
  }

  const path = removeProtocol(url)
  const file = await readFile(path)
  const contentType =
    url.indexOf('.json') !== -1
      ? 'application/json'
      : 'application/octet-stream'
  const headers = { 'content-type': contentType }
  return new Response(file, { headers })
}

const modelUrl = `file://${__static}/cocossd/model.json`

let model: cocoSsd.ObjectDetection | null = null

export const detectObject = async (dataURL: string) => {
  const buffer = Buffer.from(dataURL.split(',')[1], 'base64')
  const image = tf.node.decodeImage(buffer, 3) as tf.Tensor3D

  if (!model) model = await cocoSsd.load({ modelUrl })
  const predictions = await model.detect(image)
  return predictions
}

export const setup = () => {
  console.log('setup')

  ipcMain.on('detect', async (event, arg) => {
    const predictions = await detectObject(arg)
    event.reply('detect', predictions)
  })

  ipcMain.on('test', (event, args) => {
    console.log('from args', args)
    event.reply('test', 'Hello!')
  })
}
