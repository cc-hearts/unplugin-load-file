import { resolve } from 'path'
import { compileLoadConfig } from './build'
import { DEFAULT_SUFFIX } from './constant.js'
import { parseLoadFile } from './load'
interface LoadConfig {
  filename: string
  suffixList?: string[]
  dirPath?: string
}

export async function loadConfig<T = any>(
  config: LoadConfig,
): Promise<T | null> {
  const {
    filename,
    suffixList = DEFAULT_SUFFIX,
    dirPath = process.cwd(),
  } = config
  if (!filename) {
    throw new Error('filename is not empty')
  }
  const filePath = resolve(dirPath, filename)
  const loadFileList = parseLoadFile(filePath, suffixList)
  return await compileLoadConfig(loadFileList)
}
