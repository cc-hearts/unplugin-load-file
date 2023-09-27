import { existsSync } from 'node:fs'
import { resolve } from 'path'

export function getFileExtension(path: string) {
  return path.split('.').slice(-1)[0]
}

export function getResolvePath(loadFileList: string[]): string | undefined {
  let resolvePath: string | undefined
  for (const fileName of loadFileList) {
    const configPath = resolve(process.cwd(), fileName)
    if (existsSync(configPath)) {
      resolvePath = configPath
      break
    }
  }
  return resolvePath
}
