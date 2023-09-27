import { describe, it, expect, vi } from 'vitest'
import { isCommonJsExtension, isESM, isTS } from '../src/validate'

const { isModuleFieldExistPkg } = vi.hoisted(() => {
  return {
    isModuleFieldExistPkg: { current: false },
  }
})
vi.mock('@cc-heart/utils-service', () => {
  return {
    getPackage: () => ({ type: isModuleFieldExistPkg.current ? 'module' : '' }),
  }
})

vi.mock('node:fs', () => {
  return {
    existsSync: (filePath: string) => {
      return filePath !== 'not-found.js'
    },
  }
})

vi.mock('node:fs/promises', () => {
  return {
    readFile: () => `module.exports = { type: 'module' }`,
  }
})

describe('isCommonJsExtension', () => {
  it('should return true when suffix is cjs | cts', () => {
    expect(isCommonJsExtension('route.cjs')).toBe(true)
    expect(isCommonJsExtension('route.cts')).toBe(true)
  })

  it('should return false when suffix is mts | mjs', () => {
    expect(isCommonJsExtension('route.js')).toBe(false)
    expect(isCommonJsExtension('route.mts')).toBe(false)
  })
})

describe('isESM', () => {
  it('should throw error when path file is not found', () => {
    expect(isESM('not-found.js')).rejects.toThrow('File not found')
  })

  it('should return true when suffix is cjs | cts', () => {
    expect(isESM('route.cts')).resolves.toBe(false)
    expect(isESM('route.cjs')).resolves.toBe(false)
  })

  it('should return false when file includes module.exports', () => {
    expect(isESM('route.js')).resolves.toBe(false)
  })

  it('should return false when package.json type is not module', () => {
    expect(isESM()).resolves.toBe(false)
  })

  it('should return true when package.json type exists module filed', () => {
    isModuleFieldExistPkg.current = true
    expect(isESM()).resolves.toBe(true)
  })
})

describe('isTS', () => {
  it('should return true when suffix is ts | mts | cts', () => {
    expect(isTS('route.ts')).toBe(true)
    expect(isTS('route.mts')).toBe(true)
    expect(isTS('route.cts')).toBe(true)
  })
})
