import { Dataset } from '@/models/user/annotation'
import { BBoxDataset } from '@/models/db'
import { createBBoxesFromDB } from '../show/bbox'

export const deserializeAnnotation = ({
  annotations,
  path
}: BBoxDataset): Dataset => {
  const bboxes = createBBoxesFromDB(annotations)

  return {
    annotations: bboxes,
    path
  }
}

export const importAnnotation = (bboxDatasets: BBoxDataset[]) => {
  const datasets: Dataset[] = bboxDatasets.map(deserializeAnnotation)

  return datasets
}
