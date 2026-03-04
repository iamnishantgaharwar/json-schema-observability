import https from 'https'

export function fetchJson<T>(url: string): Promise<T> {
    return new Promise((resolve, reject) => {
        https.get(url, { 
            headers: { "user-agent": "json-schema-observability/1.0"} 
        }, (res) => {
            let data = ''
            res.on("data", (chunk) => data += chunk);

            res.on("end", () => {
                if(res.statusCode && res.statusCode >= 400) {
                    reject(new Error(`HTTP ${res.statusCode} for ${url}`))
                    return
                }

                try {
                    resolve(JSON.parse(data) as T)
                } catch (e) {
                    reject(new Error(`Failed to parse JSON from ${url}: ${e instanceof Error ? e.message : String(e)}`))
                }
            })
        }).on("error", reject)
    })
}

export function fetchText(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
        https.get(url, {
            headers: { "user-agent": "json-schema-observability/1.0"}
        }, (res) => {
            if(res.statusCode && res.statusCode >= 400) {
                reject(new Error(`HTTP ${res.statusCode} for ${url}`))
                return
            }
            let raw = '';
            res.on("data", (chunk) => raw += chunk);
            res.on("end", () => resolve(raw))
        }).on("error", reject)
    })
}