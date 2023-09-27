interface LoadConfig {
    configName: string;
    suffixList?: string[];
}
export declare function loadConfig<T = any>(config: LoadConfig): Promise<T | null>;
export {};
