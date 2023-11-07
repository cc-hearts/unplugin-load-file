import { describe, expect, it, vi } from 'vitest'
import {
  compileLoadConfig,
  loadRollupPlugins,
  transformTsToJs,
} from '../src/build'
import { basename, resolve } from 'path'

const { isESMResult, isTsResult, bundleCode, getResolvePathResult, rmFunc } =
  vi.hoisted(() => {
    return {
      isESMResult: { current: false },
      isTsResult: { current: false },
      bundleCode: { current: 'bundleCode' },
      getResolvePathResult: { current: '' },
      rmFunc: { current: () => {} },
    }
  })

vi.mock('../src/validate', () => {
  return {
    isESM: () => {
      return isESMResult.current
    },
    isTS: () => isTsResult.current,
  }
})

vi.mock('../src/shard.js', () => {
  return {
    getResolvePath: () => getResolvePathResult.current,
  }
})

vi.mock('fs/promises', () => {
  return {
    rm: () => {
      rmFunc.current()
    },
    writeFile: () => {},
  }
})

vi.mock('rollup', () => {
  return {
    rollup: async () => {
      return {
        generate: async () => {
          return {
            output: [
              {
                code: bundleCode.current,
              },
            ],
          }
        },
        write: async () => {},
      }
    },
  }
})

describe('compile load config', () => {
  it('should throw an error when resolvePath is not found', () => {
    expect(compileLoadConfig(['config.js'])).resolves.toBe(null)
  })

  it('should return __config__.mjs path module result when resolvePath is found', async () => {
    getResolvePathResult.current = 'config.js'
    vi.doMock(resolve(process.cwd(), '__config__.mjs'), () => ({
      __esModule: true,
      default: 'mockedModule',
    }))
    rmFunc.current = vi.fn()

    const bundle = await compileLoadConfig(['config.js'])
    expect(bundle).toBe('mockedModule')
    vi.doUnmock(resolve(process.cwd(), '__config__.mjs'))
    expect(rmFunc.current).toBeCalled()
  })

  it('should rm invoked twice when resolvePath is found and isTS is true', async () => {
    getResolvePathResult.current = 'config.ts'
    isTsResult.current = true
    vi.doMock(resolve(process.cwd(), '__config__.mjs'), () => ({
      __esModule: true,
      default: 'mockedModule',
    }))
    rmFunc.current = vi.fn()
    const bundle = await compileLoadConfig(['config.js'])
    expect(bundle).toBe('mockedModule')
    expect(rmFunc.current).toBeCalledTimes(2)
    vi.doUnmock(resolve(process.cwd(), '__config__.mjs'))
  })

  it('should return null when dynamic import error', async () => {
    getResolvePathResult.current = 'config.ts'
    isTsResult.current = true
    rmFunc.current = vi.fn()
    const bundle = await compileLoadConfig(['config.js'])
    expect(bundle).toBe(null)
    expect(rmFunc.current).toBeCalled()
  })
})

describe('loadRollupPlugins func', () => {
  it('should return empty array when isESM is true', () => {
    isESMResult.current = true
    expect(loadRollupPlugins('index.mjs')).resolves.toEqual([])
  })

  it('should return commonjs plugin when isESM is false', async () => {
    isESMResult.current = false
    const [{ name }] = await loadRollupPlugins('index.js')
    expect(name).toBe('commonjs')
  })
})

describe('transformTsToJs func', () => {
  it('should return empty array when isTS is false', () => {
    isTsResult.current = false
    expect(
      transformTsToJs(
        'index.js',
        { input: 'index.js', plugins: [] },
        { file: '', format: 'es' },
      ),
    ).resolves.toEqual('index.js')
  })

  it('should return __config.__tsTransformJs.mjs path when isTS is true', async () => {
    isTsResult.current = true
    const path = await transformTsToJs(
      'index.ts',
      { input: 'index.ts', plugins: [] },
      { file: '', format: 'es' },
    )
    expect(basename(path)).toEqual('__config.__tsTransformJs.mjs')
  })
})
