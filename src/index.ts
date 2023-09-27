import { compileLoadConfig } from './build'
import { parseLoadFile } from './load'

interface LoadConfig {
  filetPath: string
  suffixList?: string[]
}

export async function loadConfig<T = any>(
  config: LoadConfig,
): Promise<T | null> {
  const { filetPath, suffixList } = config
  const loadFileList = parseLoadFile(filetPath, suffixList)
  return await compileLoadConfig(loadFileList)
}
