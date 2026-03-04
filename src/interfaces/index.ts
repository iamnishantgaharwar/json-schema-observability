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
    implementation: string;
    language: string;
    passed: number;
    failed: number;
    errored: number;
    skipped: number;
    total: number;
    compliance: number;
}

export interface IBowtieReport {
    generatedAt: string;
    results: IBowtieResult[];
}