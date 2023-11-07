import { resolve } from 'path';
import commonjs from '@rollup/plugin-commonjs';
import typescript from '@rollup/plugin-typescript';
import { readFile, rm, writeFile } from 'fs/promises';
import { rollup } from 'rollup';
import { existsSync } from 'node:fs';
import 'fs';
import 'url';
import { readFile as readFile$1 } from 'node:fs/promises';

function getFileExtension(path) {
    return path.split('.').slice(-1)[0];
}
function getResolvePath(loadFileList) {
    let resolvePath;
    for (const configPath of loadFileList) {
        if (existsSync(configPath)) {
            resolvePath = configPath;
            break;
        }
    }
    return resolvePath;
}

/**
 * Retrieves the contents of a package.json file.
 *
 * @param {string=} path - The path to the package.json file. If not provided, the current working directory will be used.
 * @return {Promise<T = any>} A promise that resolves to the parsed contents of the package.json file.
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
        if (!existsSync(path)) {
            throw new Error('File not found');
        }
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
        if (Array.isArray(inputOptions.plugins)) {
            inputOptions.plugins = [...inputOptions.plugins, typescript()];
        }
        const bundle = await rollup(inputOptions);
        const { output } = await bundle.generate(outputOptions);
        const { code } = output[0];
        const tsToJsPath = resolve(process.cwd(), './__config.__tsTransformJs.mjs');
        await writeFile(tsToJsPath, code, 'utf8');
        return tsToJsPath;
    }
    return filePath;
}
async function build(inputOptions, outputOptions) {
    const bundle = await rollup(inputOptions);
    await bundle.write(outputOptions);
}
async function compileLoadConfig(loadFileList) {
    const resolvePath = getResolvePath(loadFileList);
    if (!resolvePath) {
        console.log('No found configuration file ');
        return null;
    }
    const plugins = await loadRollupPlugins(resolvePath);
    const rollupConfig = {
        input: resolvePath,
        plugins,
    };
    const outputFilePath = resolve(process.cwd(), './__config__.mjs');
    const rmPathList = [outputFilePath];
    const outputOptions = {
        file: outputFilePath,
        format: 'esm',
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
    catch (e) {
    }
    finally {
        rmPathList.forEach((path) => rm(path));
    }
    return null;
}

const DEFAULT_SUFFIX = ['js', 'ts', 'mjs', 'cjs', 'mts', 'cts'];

function parseLoadFile(filePath, suffixList) {
    if (!filePath) {
        throw new Error('filePath is not empty');
    }
    if (!Array.isArray(suffixList)) {
        throw new Error('suffix must be array');
    }
    return suffixList.map((suffix) => `${filePath}.${suffix}`);
}

async function loadConfig(config) {
    const { filename, suffixList = DEFAULT_SUFFIX, dirPath = process.cwd(), } = config;
    if (!filename) {
        throw new Error('filename is not empty');
    }
    const filePath = resolve(dirPath, filename);
    const loadFileList = parseLoadFile(filePath, suffixList);
    return await compileLoadConfig(loadFileList);
}

export { loadConfig };
