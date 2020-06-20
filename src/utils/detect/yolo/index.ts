import { Tensor, InferenceSession } from 'onnxjs'
import ndarray from 'ndarray'
import ops from 'ndarray-ops-typed'
import { runModelUtils, yolo, yoloTransforms } from './utils/index'

const modelUrl = `http://localhost:8000/file?filename=${__static}/tiny-yolov3-11.onnx`
let session: InferenceSession | null = null

const warmupModel = (session: InferenceSession) => {
  return runModelUtils.warmupModel(session, [1, 3, 416, 416])
}

const preprocess = (ctx: CanvasRenderingContext2D): Tensor => {
  const imageData = ctx.getImageData(0, 0, ctx.canvas.width, ctx.canvas.height)
  const { data, width, height } = imageData
  // data processing
  const dataTensor = ndarray(new Float32Array(data), [width, height, 4])
  const dataProcessedTensor = ndarray(new Float32Array(width * height * 3), [
    1,
    3,
    width,
    height
  ])
  ops.assign(
    dataProcessedTensor.pick(0, 0, null, null),
    dataTensor.pick(null, null, 0)
  )
  ops.assign(
    dataProcessedTensor.pick(0, 1, null, null),
    dataTensor.pick(null, null, 1)
  )
  ops.assign(
    dataProcessedTensor.pick(0, 2, null, null),
    dataTensor.pick(null, null, 2)
  )
  const tensor = new Tensor(new Float32Array(width * height * 3), 'float32', [
    1,
    3,
    width,
    height
  ])
  ;(tensor.data as Float32Array).set(dataProcessedTensor.data)
  return tensor
}

const postprocess = async (tensor: Tensor, inferenceTime: number) => {
  try {
    const originalOutput = new Tensor(tensor.data as Float32Array, 'float32', [
      1,
      125,
      13,
      13
    ])
    const outputTensor = yoloTransforms.transpose(originalOutput, [0, 2, 3, 1])
    // postprocessing
    const boxes = await yolo.postprocess(outputTensor, 20)
    boxes.forEach(box => {
      const { top, left, bottom, right, classProb, className } = box
      console.log(box, inferenceTime)
    })
  } catch (e) {
    alert('Model is not valid!')
  }
}

export const runModel = async (ctx: CanvasRenderingContext2D) => {
  if (!session) {
    session = new InferenceSession({ backendHint: 'webgl' })
    await session.loadModel(modelUrl)
    await warmupModel(session)
  }
  const data = preprocess(ctx)
  const [outputTensor, inferenceTime] = await runModelUtils.runModel(
    session,
    data
  )

  postprocess(outputTensor, inferenceTime)
}
