import { readFile } from "node:fs/promises"
import { getFileExtension } from "./shard.js"
import { getPackage } from '@cc-heart/utils-service'

export function isCommonJsExtension(path: string) {
  return ['cts', 'cjs'].includes(getFileExtension(path))
}

export async function isESM(path?: string) {
  if (path) {
    if (isCommonJsExtension(path)) return false
    const file = await readFile(path, 'utf8')
    return !file.includes('module.exports')
  }
  return (await getPackage()).type === 'module'
}

export function isTS(path: string) {
  return ['mts', 'cts', 'ts'].includes(getFileExtension(path))
}
