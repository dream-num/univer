import type { CDPSession } from '@playwright/test';

interface IMetrics {
    JSHeapUsedSize: number;
}

/**
 * Return a performance metric from the chrome cdp session.
 * Chrome only.
 * @param {Page} page page to attach cdpClient
 * @return {IMetrics}
 * @see {@link https://github.com/microsoft/playwright/issues/18071}
 */
export async function getMetrics(client: CDPSession): Promise<IMetrics> {
    await client.send('Performance.enable');

    let metricObject: Record<string, number> = {};
    let previousHeapSize = Infinity;

    // Run GC repeatedly until the heap size stabilizes (stops decreasing).
    // This compensates for non-deterministic GC behavior in Chromium.
    const MAX_GC_ITERATIONS = 3;
    for (let i = 0; i < MAX_GC_ITERATIONS; i++) {
        await client.send('HeapProfiler.collectGarbage');
        const perfMetricObject = await client.send('Performance.getMetrics');
        const extractedMetric = perfMetricObject?.metrics;
        metricObject = extractedMetric.reduce((acc, { name, value }) => {
            acc[name] = value;
            return acc;
        }, {} as Record<string, number>);

        const currentHeapSize = metricObject.JSHeapUsedSize ?? Infinity;
        if (currentHeapSize >= previousHeapSize) {
            break;
        }
        previousHeapSize = currentHeapSize;
    }

    return metricObject as unknown as IMetrics;
}
