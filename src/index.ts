import { compileLoadConfig } from './build'
import { parseLoadFile } from './load'

interface LoadConfig {
  rootPath: string
  suffixList?: string[]
}

export async function loadConfig<T = any>(
  config: LoadConfig,
): Promise<T | null> {
  const { rootPath, suffixList } = config
  const loadFileList = parseLoadFile(rootPath, suffixList)
  return await compileLoadConfig(loadFileList)
}
