import {
  BBoxDataset,
  AnnotationType,
  Dataset as DBDataset,
  DBProjectType,
  SegmentationDataset
} from '@/models/db'
import { Dataset } from '@/models/user/annotation'
import { readImagePaths, createDatasets } from '@/utils/file/index'
import { createBBoxesFromDB, createSegmentationFromDB } from '@/utils/show'

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

export const importSegmentation = (datasets: SegmentationDataset[]) => {
  const bboxDatasets: Dataset[] = datasets.map(deserializeSegmentation)

  return bboxDatasets
}

// 디렉터리에 있는 이미지만 데이터셋에 넣어서 반환함
export const validateDatasets = async (
  project: DBProjectType
): Promise<DBDataset<AnnotationType>[]> => {
  const path = project.info.path
  const datasetsMap = project.datasets.reduce((acc, dataset) => {
    acc[dataset.path] = dataset
    return acc
  }, {} as Record<string, DBDataset<AnnotationType>>)

  const imagePaths = await readImagePaths(path)
  const datasets = createDatasets(imagePaths).map(
    dataset => datasetsMap[dataset.path] || dataset
  )

  return datasets
}
