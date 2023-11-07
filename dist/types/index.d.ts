interface LoadConfig {
    filename: string;
    suffixList?: string[];
    dirPath?: string;
}
export declare function loadConfig<T = any>(config: LoadConfig): Promise<T | null>;
export {};
