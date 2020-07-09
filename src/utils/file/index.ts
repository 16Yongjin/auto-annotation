import path from 'path'
import { remote } from 'electron'
import { readdir } from 'mz/fs'

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
