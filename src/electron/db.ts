import low from 'lowdb'
import FileSync from 'lowdb/adapters/FileSync'
import { Project } from '@/models/user/project'

const adapter = new FileSync(`${__static}/db.json`, {
  defaultValue: {
    projects: [] as Project[]
  }
})

export const db = low(adapter)
