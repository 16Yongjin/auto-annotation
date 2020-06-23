import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { DBProject } from '@/models/db'

const adapter = new FileSync(`${__static}/db.json`, {
  defaultValue: {
    projects: [] as DBProject[]
  }
})

export const db = low(adapter)
