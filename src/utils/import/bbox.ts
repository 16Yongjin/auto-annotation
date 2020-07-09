import { createBBoxesFromDB } from '@/utils/show'
import { Dataset } from '@/models/user/annotation'
import { BBoxDataset } from '@/models/db'

export const deserializeBBox = ({
  annotations,
  path
}: BBoxDataset): Dataset => {
  const bboxes = createBBoxesFromDB(annotations)

  return {
    annotations: bboxes,
    path
  }
}

export const importBBox = (datasets: BBoxDataset[]) => {
  const bboxDatasets: Dataset[] = datasets.map(deserializeBBox)

  return bboxDatasets
}
