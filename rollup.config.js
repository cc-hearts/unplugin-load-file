import typescript from '@rollup/plugin-typescript'
import resolve from '@rollup/plugin-node-resolve'
import commonjs from '@rollup/plugin-commonjs'
import json from '@rollup/plugin-json'
export default {
  input: './src/index.ts',
  output: [
    {
      file: './dist/index.mjs',
      format: 'esm',
    },
    {
      file: './dist/index.cjs',
      format: 'cjs',
    },
  ],
  external: ['rollup', '@rollup/plugin-commonjs', '@rollup/plugin-typescript'],
  plugins: [json(),resolve(),commonjs(),typescript()],
}
