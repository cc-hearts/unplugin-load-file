import type { DEFAULT_SUFFIX } from './constant.js'

export function parseLoadFile(
  filePath: string,
  suffixList: string[] | typeof DEFAULT_SUFFIX,
) {
  if (!filePath) {
    throw new Error('filePath is not empty')
  }
  if (!Array.isArray(suffixList)) {
    throw new Error('suffix must be array')
  }
  return suffixList.map((suffix) => `${filePath}.${suffix}`)
}
