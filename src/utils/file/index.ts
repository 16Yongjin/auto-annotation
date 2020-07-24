import path from 'path'
import { remote } from 'electron'
import { readdir, writeFile } from 'mz/fs'

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

interface SaveFileInterface {
  defaultPath: string
  file: string
}

export const saveFile = async ({ defaultPath, file }: SaveFileInterface) => {
  const win = remote.getCurrentWindow()
  try {
    const dialogOptions = {
      title: 'Save Annotation json',
      defaultPath: `${defaultPath}/output.json`,
      filters: [{ name: 'JSON', extensions: ['json'] }]
    }

    const { canceled, filePath } = await remote.dialog.showSaveDialog(
      win,
      dialogOptions
    )

    if (canceled || !filePath) return

    await writeFile(filePath, file)
  } catch (e) {
    remote.dialog.showErrorBox('Failed to save annotation file', e.toString())
  }
}
