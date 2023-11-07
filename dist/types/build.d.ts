import { type RollupOptions, type OutputOptions } from 'rollup';
export declare function loadRollupPlugins(path: string): Promise<import("rollup").Plugin<any>[]>;
export declare function transformTsToJs(filePath: string, inputOptions: RollupOptions, outputOptions: OutputOptions): Promise<string>;
export declare function compileLoadConfig(loadFileList: string[]): Promise<any>;
