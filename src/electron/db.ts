import { Dataset } from '@/models/user/annotation'
import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { DBProject } from '@/models/db'
import { serializeDataset } from '@/utils'

const adapter = new FileSync(`${__static}/db.json`, {
  defaultValue: {
    projects: [] as DBProject[]
  }
})

export const db = low(adapter)

export function saveDataset(id: string, dataset: Dataset) {
  return db
    .get('projects')
    .find({ info: { id } })
    .get('datasets')
    .find({ path: dataset.path })
    .assign(serializeDataset(dataset))
    .write()
}
