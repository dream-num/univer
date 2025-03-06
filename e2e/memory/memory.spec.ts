/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { CDPSession } from '@playwright/test';
import { createWriteStream } from 'node:fs';
import { expect, test } from '@playwright/test';
import { reportToPosthog, shutdownPosthog } from '../utils/report-performance';
import { getMetrics } from './util';

const MAX_UNIT_MEMORY_OVERFLOW = 1_000_000; // 1MB
const MAX_SECOND_INSTANCE_OVERFLOW = 200_000; // 200 KB

// There are some compiled code and global cache, so we make some room
// for this. But we need to make sure that a Univer object cannot fit
// in this size.
const MAX_UNIVER_MEMORY_OVERFLOW = 6_000_000;

interface IHeapSnapshotChunk {
    chunk: string;
}

interface IHeapSnapshotProgress {
    done: number;
    total: number;
    finished?: boolean;
}
async function takeHeapSnapshot(client: CDPSession, filename: string) {
    return new Promise((resolve, reject) => {
        const file = createWriteStream(`./test-results/${filename}`);
        let isFinished = false;
        let error = null;
        let noChunkTimeout = null;
        let chunkHandler = (_: IHeapSnapshotChunk) => {};
        let progressHandler = (_: IHeapSnapshotProgress) => {};

        // Cleanup function to remove listeners
        const cleanup = () => {
            client.off('HeapProfiler.addHeapSnapshotChunk', chunkHandler);
            client.off('HeapProfiler.reportHeapSnapshotProgress', progressHandler);
        };

        // Handle file stream errors
        file.on('error', (err) => {
            error = err;
            reject(err);
        });

        // Handle successful completion
        file.on('finish', () => {
            if (!error && isFinished) {
                resolve(0);
            }
        });

        const scheduleEnd = () => {
            if (noChunkTimeout) {
                clearTimeout(noChunkTimeout);
            }

            // Set new timeout
            noChunkTimeout = setTimeout(() => {
                cleanup();
                file.end();
            }, 1000); // Wait 1 second after last chunk
        };

        // Set up the chunk handler
        chunkHandler = (payload: IHeapSnapshotChunk) => {
            try {
                if (payload.chunk) {
                    file.write(payload.chunk);
                    scheduleEnd();
                }
            } catch (err) {
                error = err;
                console.error('chunkHandler error', err);
                cleanup();
                reject(err);
            }
        };

        // Set up the progress handler
        progressHandler = (params: IHeapSnapshotProgress) => {
            if (params.finished) {
                isFinished = true;
            }
        };

        // Add event listeners
        client.on('HeapProfiler.addHeapSnapshotChunk', chunkHandler);
        client.on('HeapProfiler.reportHeapSnapshotProgress', progressHandler);

        // Start the heap snapshot process
        client.send('HeapProfiler.enable')
            .then(() => client.send('HeapProfiler.takeHeapSnapshot', { reportProgress: true }))
            .catch((err) => {
                console.error('HeapProfiler.enable error', err);
                error = err;
                file.end();
                cleanup();
                reject(err);
            });
    });
}

// const isLocal = !process.env.CI;
test('memory', async ({ page }) => {
    test.setTimeout(60_000);
    const client = await page.context().newCDPSession(page);

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(5000);
    const memoryAfterFirstInstance = (await getMetrics(page)).JSHeapUsedSize;

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.waitForTimeout(5000);
    const memoryAfterFirstLoad = (await getMetrics(page)).JSHeapUsedSize;
    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));
    await page.waitForTimeout(5000);
    const memoryAfterSecondLoad = (await getMetrics(page)).JSHeapUsedSize;
    const unitMemoryOverflow = memoryAfterSecondLoad - memoryAfterFirstLoad;
    await reportToPosthog('unit_memory_overflow', { value: unitMemoryOverflow });

    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(5000);
    await takeHeapSnapshot(client, 'memory-first.heapsnapshot');
    const memoryAfterDisposingFirstInstance = (await getMetrics(page)).JSHeapUsedSize;
    await page.evaluate(() => window.createNewInstance());
    await page.waitForTimeout(5000);
    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(5000);
    await takeHeapSnapshot(client, 'memory-second.heapsnapshot');
    const memoryAfterDisposingSecondUniver = (await getMetrics(page)).JSHeapUsedSize;
    const instanceMemoryOverflow = memoryAfterDisposingSecondUniver - memoryAfterDisposingFirstInstance;
    const univerMemoryOverflow = memoryAfterDisposingSecondUniver - memoryAfterFirstInstance;
    await reportToPosthog('instance_memory_overflow', { value: instanceMemoryOverflow });
    await reportToPosthog('univer_memory_overflow', { value: univerMemoryOverflow });
    await shutdownPosthog();

    expect(unitMemoryOverflow).toBeLessThanOrEqual(MAX_UNIT_MEMORY_OVERFLOW);
    expect(instanceMemoryOverflow).toBeLessThanOrEqual(MAX_SECOND_INSTANCE_OVERFLOW);
    expect(univerMemoryOverflow).toBeLessThanOrEqual(MAX_UNIVER_MEMORY_OVERFLOW);
});

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        createNewInstance: () => void;
    }
}
