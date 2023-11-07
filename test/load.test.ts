import { describe, it, expect } from 'vitest'
import { parseLoadFile } from '../src/load'

describe('parseLoadFileList', () => {
  it('should return configList when rootPath is not empty', () => {
    expect(parseLoadFile('loadFile', ['js', 'ts'])).toEqual([
      'loadFile.js',
      'loadFile.ts',
    ])
  })

  it('should throw an error when rootPath is empty', () => {
    expect(() => parseLoadFile('', ['js', 'ts'])).toThrowError(
      'filePath is not empty',
    )
  })

  it('should throw an error when suffixList is not array', () => {
    //@ts-ignore
    expect(() => parseLoadFile('loadFile', 'js')).toThrowError(
      'suffix must be array',
    )
  })
})
