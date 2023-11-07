import { existsSync } from 'node:fs'

export function getFileExtension(path: string) {
  return path.split('.').slice(-1)[0]
}

export function getResolvePath(loadFileList: string[]): string | undefined {
  let resolvePath: string | undefined
  for (const configPath of loadFileList) {
    if (existsSync(configPath)) {
      resolvePath = configPath
      break
    }
  }
  return resolvePath
}
