import { resolve } from 'path'
import { isESM, isTS } from './validate'
import commonjs from '@rollup/plugin-commonjs'
import * as Rollup from 'rollup'
import typescript from '@rollup/plugin-typescript'
import { rm, writeFile } from 'fs/promises'
import { getResolvePath } from './shard.js'

async function loadRollupPlugins(path: string) {
  const plugins = []
  if (!(await isESM(path))) {
    plugins.push(commonjs())
  }

  return plugins
}
async function transformTsToJs(
  filePath: string,
  inputOptions: Rollup.RollupOptions,
  outputOptions: Rollup.OutputOptions,
) {
  if (isTS(filePath)) {
    inputOptions.plugins || (inputOptions.plugins = [])
    if (Array.isArray(inputOptions.plugins)) {
      inputOptions.plugins = [...inputOptions.plugins, typescript()]
    }
    const bundle = await Rollup.rollup(inputOptions)
    const { output } = await bundle.generate(outputOptions)
    const { code } = output[0]

    const tsToJsPath = resolve(process.cwd(), './__config.__tsTransformJs.mjs')
    await writeFile(tsToJsPath, code, 'utf8')
    return tsToJsPath
  }
  return filePath
}

async function build(
  inputOptions: Rollup.RollupOptions,
  outputOptions: Rollup.OutputOptions,
) {
  const bundle = await Rollup.rollup(inputOptions)
  await bundle.write(outputOptions)
}

export async function compileLoadConfig(loadFileList: string[]) {
  const resolvePath = getResolvePath(loadFileList)

  if (!resolvePath) {
    console.log('No configuration file found')
    return null
  }

  const plugins = await loadRollupPlugins(resolvePath)
  const rollupConfig = {
    input: resolvePath,
    plugins,
  }
  const outputFilePath = resolve(process.cwd(), './__config__.mjs')
  const rmPathList: string[] = [outputFilePath]

  const outputOptions = {
    file: outputFilePath,
    format: 'esm' as const,
  }

  const bundlePath = await transformTsToJs(
    outputFilePath,
    rollupConfig,
    outputOptions,
  )

  if (bundlePath !== outputFilePath) {
    rmPathList.push(bundlePath)
    rollupConfig.input = bundlePath
  }

  await build(rollupConfig, outputOptions)

  try {
    const { default: config } = await import(outputOptions.file)
    return config
  } catch (e) {
  } finally {
    rmPathList.forEach((path) => rm(path))
  }
  return null
}
