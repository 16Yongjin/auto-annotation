import * as cocoSsd from '@tensorflow-models/coco-ssd'

let model: cocoSsd.ObjectDetection | null = null

export const detectObject = async (image: HTMLImageElement) => {
  if (!model) model = await cocoSsd.load()
  const predictions = await model.detect(image)
  return predictions
}
