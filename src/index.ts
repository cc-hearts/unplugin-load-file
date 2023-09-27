import { compileLoadConfig } from "./build";
import { parseLoadFile } from "./load";

interface LoadConfig {
  configName: string;
  suffixList?: string[]
}

export async function loadConfig<T = any>(config: LoadConfig): Promise<T | null> {
  const { configName, suffixList } = config
  const loadFileList = parseLoadFile(configName, suffixList)
  return await compileLoadConfig(loadFileList)
}