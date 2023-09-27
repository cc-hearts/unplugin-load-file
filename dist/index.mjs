import { resolve } from 'path';
import { readFile as readFile$1 } from 'node:fs/promises';
import { existsSync } from 'fs';
import { readFile, rm, writeFile } from 'fs/promises';
import 'url';
import commonjs from '@rollup/plugin-commonjs';
import * as Rollup from 'rollup';
import typescript from '@rollup/plugin-typescript';

function getFileExtension(path) {
    return path.split('.').slice(-1)[0];
}

/**
 * Retrieves the contents of a package.json file.
 *
 * @param {string=} path - The path to the package.json file. If not provided, the current working directory will be used.
 * @return {Promise<object>} A promise that resolves to the parsed contents of the package.json file.
 */
async function getPackage(path) {
    path = path || resolve(process.cwd(), 'package.json');
    const packages = await readFile(path, { encoding: 'utf-8' });
    return JSON.parse(packages);
}

function isCommonJsExtension(path) {
    return ['cts', 'cjs'].includes(getFileExtension(path));
}
async function isESM(path) {
    if (path) {
        if (isCommonJsExtension(path))
            return false;
        const file = await readFile$1(path, 'utf8');
        return !file.includes('module.exports');
    }
    return (await getPackage()).type === 'module';
}
function isTS(path) {
    return ['mts', 'cts', 'ts'].includes(getFileExtension(path));
}

async function loadRollupPlugins(path) {
    const plugins = [];
    if (!(await isESM(path))) {
        plugins.push(commonjs());
    }
    return plugins;
}
async function transformTsToJs(filePath, inputOptions, outputOptions) {
    if (isTS(filePath)) {
        (inputOptions.plugins || (inputOptions.plugins = []));
        if (Array.isArray(inputOptions.plugins)) {
            inputOptions.plugins = [...inputOptions.plugins, typescript()];
        }
        const bundle = await Rollup.rollup(inputOptions);
        const { output } = await bundle.generate(outputOptions);
        const { code } = output[0];
        const tsToJsPath = resolve(process.cwd(), './__config.__tsTransformJs.mjs');
        await writeFile(tsToJsPath, code, 'utf8');
        return tsToJsPath;
    }
    return filePath;
}
async function build(inputOptions, outputOptions) {
    const bundle = await Rollup.rollup(inputOptions);
    await bundle.write(outputOptions);
}
async function compileLoadConfig(loadFileList) {
    const resolvePath = getResolvePath(loadFileList);
    if (!resolvePath) {
        console.log('No configuration file found');
        return null;
    }
    const plugins = await loadRollupPlugins(resolvePath);
    const rollupConfig = {
        input: resolvePath,
        plugins
    };
    const outputFilePath = resolve(process.cwd(), './__config__.mjs');
    const rmPathList = [outputFilePath];
    const outputOptions = {
        file: outputFilePath,
        format: 'esm'
    };
    const bundlePath = await transformTsToJs(outputFilePath, rollupConfig, outputOptions);
    if (bundlePath !== outputFilePath) {
        rmPathList.push(bundlePath);
        rollupConfig.input = bundlePath;
    }
    await build(rollupConfig, outputOptions);
    try {
        const { default: config } = await import(outputOptions.file);
        return config;
    }
    catch (e) { }
    finally {
        rmPathList.forEach(path => rm(path));
    }
    return null;
}
function getResolvePath(loadFileList) {
    let resolvePath;
    for (const fileName of loadFileList) {
        const configPath = resolve(process.cwd(), fileName);
        if (existsSync(configPath)) {
            resolvePath = configPath;
            break;
        }
    }
    return resolvePath;
}

const DEFAULT_SUFFIX = ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts'];
function parseLoadFile(fileName, suffixList = DEFAULT_SUFFIX) {
    if (!Array.isArray(suffixList)) {
        throw new Error('suffix must be array');
    }
    return suffixList.map(suffix => `${fileName}.${suffix}`);
}

async function loadConfig(config) {
    const { configName, suffixList } = config;
    const loadFileList = parseLoadFile(configName, suffixList);
    return await compileLoadConfig(loadFileList);
}

export { loadConfig };
