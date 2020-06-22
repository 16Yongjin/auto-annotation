import path from 'path'
import { remote } from 'electron'
import { readdir } from 'mz/fs'
import { Dataset } from '@/models/user/annotation'

export const showFolderDialog = async () => {
  const { filePaths, canceled } = await remote.dialog.showOpenDialog({
    properties: ['openDirectory']
  })

  const [dirPath] = filePaths

  if (!dirPath || canceled) return ''
  else return dirPath
}

export const readImagePaths = async (dirPath: string) => {
  if (!dirPath) return []

  const fileNames = await readdir(dirPath)

  const filterJPEG = (filename: string) => filename.match(/\.jpe?g/)
  const toFullPath = (name: string) =>
    encodeURIComponent(`${dirPath}${path.sep}${name}`)

  const imagePaths = fileNames.filter(filterJPEG).map(toFullPath)

  return imagePaths
}

export const createDatasets = (imagePaths: string[]) => {
  const datasets = imagePaths.map(path => ({
    path,
    annotations: [],
    labeled: false
  }))

  return datasets
}

export const createDatasetsFromPath = async (path: string) => {
  const images = await readImagePaths(path)
  const datasets = createDatasets(images)

  return datasets
}

export const loadDatasets = async (): Promise<Dataset[]> => {
  const dirPath = await showFolderDialog()
  const imagePaths = await readImagePaths(dirPath)
  const datasets = createDatasets(imagePaths)

  return datasets
}
