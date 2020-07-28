import { Dataset } from '@/models/user/annotation'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { DBProjectType, Settings } from '@/models/db'
import { serializeBBoxDataset, isSystemDarkMode } from '@/utils'
import { serializeSegmentationDataset } from '@/utils/export'

const adapter = new FileSync(`${__static}/db.json`, {
  defaultValue: {
    settings: { darkMode: isSystemDarkMode() } as Settings,
    projects: [] as DBProjectType[]
  }
})

export const db = low(adapter)

export function saveDataset(id: string, dataset: Dataset) {
  const projectType = db
    .get('projects')
    .find({ info: { id } })
    .get(['info', 'type'])
    .value()

  return db
    .get('projects')
    .find({ info: { id } })
    .get('datasets')
    .find({ path: dataset.path })
    .assign(
      projectType === 'BBox'
        ? serializeBBoxDataset(dataset)
        : serializeSegmentationDataset(dataset)
    )
    .write()
}

export const isDarkMode = () =>
  db
    .get('settings')
    .get('darkMode')
    .value()

export const setDarkMode = (mode: boolean) =>
  db
    .get('settings')
    .set('darkMode', mode)
    .write()
