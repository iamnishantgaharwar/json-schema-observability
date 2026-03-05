export interface INpmDownloadStats {
    downloads: number;
    day: string;
}

export interface INpmDownloadStatsResponse {
    downloads: INpmDownloadStats[];
    start: string;
    end: string;
    package: string;
}

export interface IBowtieResult {
    implementation: string
    name: string
    language: string
    version: string
    dialect: string
    passed: number
    failed: number
    errored: number
    total: number
    compliance: number
}

export interface IBowtieReport {
    generatedAt: string;
    results: IBowtieResult[];
}