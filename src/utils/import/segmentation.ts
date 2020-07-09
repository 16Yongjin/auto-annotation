import { createSegmentationFromDB } from '@/utils/show'
import { Dataset } from '@/models/user/annotation'
import { SegmentationDataset } from '@/models/db'

export const deserializeSegmentation = ({
  annotations,
  path
}: SegmentationDataset): Dataset => {
  const segmentations = createSegmentationFromDB(annotations)

  return {
    annotations: segmentations,
    path
  }
}

export const importSegmentation = (datasets: SegmentationDataset[]) => {
  const bboxDatasets: Dataset[] = datasets.map(deserializeSegmentation)

  return bboxDatasets
}
