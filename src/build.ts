import commonjs from '@rollup/plugin-commonjs'
import typescript from '@rollup/plugin-typescript'
import { rm, writeFile } from 'fs/promises'
import { resolve } from 'path'
import { type RollupOptions, type OutputOptions, rollup } from 'rollup'
import { getResolvePath } from './shard.js'
import { isESM, isTS } from './validate'

export async function loadRollupPlugins(path: string) {
  const plugins = []
  if (!(await isESM(path))) {
    plugins.push(commonjs())
  }

  return plugins
}

export async function transformTsToJs(
  filePath: string,
  inputOptions: RollupOptions,
  outputOptions: OutputOptions,
) {
  if (isTS(filePath)) {
    if (Array.isArray(inputOptions.plugins)) {
      inputOptions.plugins = [...inputOptions.plugins, typescript()]
    }

    const bundle = await rollup(inputOptions)
    const { output } = await bundle.generate(outputOptions)
    const { code } = output[0]

    const tsToJsPath = resolve(process.cwd(), './__config.__tsTransformJs.mjs')
    await writeFile(tsToJsPath, code, 'utf8')
    return tsToJsPath
  }
  return filePath
}

async function build(
  inputOptions: RollupOptions,
  outputOptions: OutputOptions,
) {
  const bundle = await rollup(inputOptions)
  await bundle.write(outputOptions)
}

export async function compileLoadConfig(loadFileList: string[]) {
  const resolvePath = getResolvePath(loadFileList)

  if (!resolvePath) {
    console.log('No found configuration file ')
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
