const DEFAULT_SUFFIX = ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts']
export function parseLoadFile(
  fileName: string,
  suffixList: string[] = DEFAULT_SUFFIX,
) {
  if (!fileName) {
    throw new Error('fileName is not empty')
  }
  if (!Array.isArray(suffixList)) {
    throw new Error('suffix must be array')
  }
  return suffixList.map((suffix) => `${fileName}.${suffix}`)
}
