import { DBProject, BBoxDataset, BBox } from '@/models/db'
import { Dataset } from '@/models/user/annotation'
import { readImagePaths, createDBDatasets } from '@/utils/file/index'
import { createBBoxesFromDB } from '@/utils/show/bbox'

export const deserializeSegmentation = ({
  annotations,
  path
}: BBoxDataset): Dataset => {
  const bboxes = createBBoxesFromDB(annotations)

  return {
    annotations: bboxes,
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

export const importBBox = (bboxDatasets: BBoxDataset[]) => {
  const datasets: Dataset[] = bboxDatasets.map(deserializeBBox)

  return datasets
}

// 디렉터리에 있는 이미지만 데이터셋에 넣어서 반환함
export const validateBBoxDatasets = async (
  project: DBProject<BBox>
): Promise<BBoxDataset[]> => {
  const path = project.info.path
  const datasetsMap = project.datasets.reduce((acc, dataset) => {
    acc[dataset.path] = dataset
    return acc
  }, {} as Record<string, BBoxDataset>)

  const imagePaths = await readImagePaths(path)
  const datasets = createDBDatasets(imagePaths).map(
    dataset => datasetsMap[dataset.path] || dataset
  )

  return datasets
}
