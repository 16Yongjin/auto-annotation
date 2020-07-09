import { AnnotationType, Dataset, DBProjectType } from '@/models/db'
import { showFolderDialog, readImagePaths } from '@/utils/file'
export * from './bbox'
export * from './segmentation'

const pathToDataset = (path: string): Dataset<AnnotationType> => ({
  path,
  annotations: []
})

export const createDatasetsFromImagePaths = (
  imagePaths: string[]
): Dataset<AnnotationType>[] => {
  const datasets = imagePaths.map(pathToDataset)

  return datasets
}

export const createDatasetsFromDir = async (dirPath: string) => {
  const images = await readImagePaths(dirPath)
  const datasets = createDatasetsFromImagePaths(images)

  return datasets
}

export const loadDatasets = async (): Promise<Dataset<AnnotationType>[]> => {
  const dirPath = await showFolderDialog()
  const imagePaths = await readImagePaths(dirPath)
  const datasets = createDatasetsFromImagePaths(imagePaths)

  return datasets
}

// 디렉터리에 있는 이미지만 데이터셋에 넣어서 반환함
export const validateDatasets = async (
  project: DBProjectType
): Promise<Dataset<AnnotationType>[]> => {
  const path = project.info.path
  const datasetsMap = project.datasets.reduce((acc, dataset) => {
    acc[dataset.path] = dataset
    return acc
  }, {} as Record<string, Dataset<AnnotationType>>)

  const imagePaths = await readImagePaths(path)
  const datasets = createDatasetsFromImagePaths(imagePaths).map(
    dataset => datasetsMap[dataset.path] || dataset
  )

  return datasets
}
