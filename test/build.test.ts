import { describe, expect, it } from 'vitest'

import { compileLoadConfig } from '../src/build'

describe('compile load config', () => {
  it('should throw an error when resolvePath is not found', () => {
    expect(compileLoadConfig(['config.js'])).resolves.toBe(null)
  })
})
