import { Dataset } from '@/models/user/annotation'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { DBProjectType } from '@/models/db'
import { serializeBBoxDataset } from '@/utils'
import { serializeSegmentationDataset } from '@/utils/export'

const adapter = new FileSync(`${__static}/db.json`, {
  defaultValue: {
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

  console.log('projectType', projectType)

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
