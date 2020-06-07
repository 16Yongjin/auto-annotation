import * as tf from '@tensorflow/tfjs'
import * as tfnode from '@tensorflow/tfjs-node'
import * as cocoSsd from '@tensorflow-models/coco-ssd'
import { ipcMain } from 'electron'
import fetch, { Response, RequestInit } from 'node-fetch'
import fs from 'fs'
import { promisify } from 'util'
const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)

const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '')

const modelUrl = `file://C:/Users/yongj/dev/vue/auto-annotation/src/electron/cocossd/model.json`
// https://storage.googleapis.com/tfjs-models/savedmodel/ssdlite_mobilenet_v2/group1-shard1of5

// @ts-ignore
globalThis.fetch = async (url: string, init: RequestInit | undefined) => {
  console.log(url, init)

  console.log(await readdir('.'))

  if (!url.startsWith('file://')) {
    return fetch(url, init)
  }

  const path = removeProtocol(url)
  const file = await readFile(path)
  const contentType =
    url.indexOf('.json') !== -1
      ? 'application/json'
      : 'application/octet-stream'

  return new Response(file, {
    headers: {
      'content-type': contentType
    }
  })
}

let model: cocoSsd.ObjectDetection | null = null

export const detectObject = async (dataURL: string) => {
  const buffer = Buffer.from(dataURL.split(',')[1], 'base64')
  const image = tfnode.node.decodeImage(buffer, 3) as tf.Tensor3D

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
