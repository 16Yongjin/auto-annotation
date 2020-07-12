import { readFile } from 'mz/fs'
import { Response } from 'node-fetch'

const removeProtocol = (url: string) => url.replace(/(^\w+:|^)\/\//, '')

export const fetchFile = async (url: string) => {
  const path = removeProtocol(url)
  const file = await readFile(path)
  const contentType =
    url.indexOf('.json') !== -1
      ? 'application/json'
      : 'application/octet-stream'
  const headers = { 'content-type': contentType }
  return new Response(file, { headers })
}
