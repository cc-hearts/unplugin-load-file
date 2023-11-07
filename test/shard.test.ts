import { describe, vi, it, expect } from 'vitest'
import { getResolvePath } from '../src/shard'

const { existsSyncResult } = vi.hoisted(() => {
  return {
    existsSyncResult: { current: false },
  }
})

vi.mock('node:fs', () => {
  return {
    existsSync: () => existsSyncResult.current,
  }
})

describe('getResolvePath func', () => {
  it('should return undefined when resolvePath is not found', () => {
    expect(getResolvePath(['config.js'])).toBe(undefined)
  })

  it('should return resolvePath when resolvePath is found', () => {
    existsSyncResult.current = true
    expect(getResolvePath(['config.js'])).toBe('config.js')
  })
})
