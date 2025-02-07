/**
 * Copyright 2023-present DreamNum Inc.
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

/* eslint-disable no-console */
import { createWriteStream } from 'node:fs';
import { expect, test } from '@playwright/test';
import { getMetrics } from './util';

const MAX_UNIT_MEMORY_OVERFLOW = 1_000_000; // 1MB

// There are some compiled code and global cache, so we make some room
// for this. But we need to make sure that a Univer object cannot fit
// in this size.
const MAX_UNIVER_MEMORY_OVERFLOW = 6_000_000; // TODO@wzhudev: temporarily added 300KB
// there is a memory leak in the univer object, so we need to make sure that

const MAX_SECOND_INSTANCE_OVERFLOW = 100_000; // Only 100 KB

test('memory', async ({ page }) => {
    test.setTimeout(80_000);
    const client = await page.context().newCDPSession(page);

    async function takeHeapSnapshot(client, filename) {
        return new Promise((resolve, reject) => {
            const file = createWriteStream(filename);
            let isFinished = false;
            let error = null;
            let noChunkTimeout = null;

            // Handle file stream errors
            file.on('error', (err) => {
                error = err;
                reject(err);
            });

            // Handle successful completion
            file.on('finish', () => {
                if (!error && isFinished) {
                    console.log('file write finished', filename);
                    resolve(0);
                }
            });

            const scheduleEnd = () => {
                // Clear any existing timeout
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
            const chunkHandler = (params) => {
                try {
                    if (params.chunk) {
                        console.log('chunkHandler write chunk', filename, file.writableLength);
                        file.write(params.chunk);
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
            const progressHandler = (params) => {
                console.log('progressHandler params', filename, params);
                if (params.finished) {
                    isFinished = true;
                }
            };

            // Cleanup function to remove listeners
            const cleanup = () => {
                client.off('HeapProfiler.addHeapSnapshotChunk', chunkHandler);
                client.off('HeapProfiler.reportHeapSnapshotProgress', progressHandler);
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
                    cleanup();
                    file.end();
                    reject(err);
                });
        });
    }

    await page.goto('http://localhost:3000/sheets/');
    await page.waitForTimeout(5000);

    const memoryAfterFirstInstance = (await getMetrics(page)).JSHeapUsedSize;

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(1));
    await page.waitForTimeout(2000);
    const memoryAfterFirstLoad = (await getMetrics(page)).JSHeapUsedSize;

    await page.evaluate(() => window.E2EControllerAPI.loadAndRelease(2));
    await page.waitForTimeout(2000);
    const memoryAfterSecondLoad = (await getMetrics(page)).JSHeapUsedSize;
    expect(memoryAfterSecondLoad - memoryAfterFirstLoad)
        .toBeLessThanOrEqual(MAX_UNIT_MEMORY_OVERFLOW);

    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(2000);

    const firstSnapshot = await takeHeapSnapshot(client, 'memory-first.heapsnapshot');
    console.log('firstSnapshot', firstSnapshot);

    const memoryAfterDisposingFirstInstance = (await getMetrics(page)).JSHeapUsedSize;

    await page.evaluate(() => window.createNewInstance());
    await page.waitForTimeout(2000);
    await page.evaluate(() => window.univer.dispose());
    await page.waitForTimeout(2000);

    const secondSnapshot = await takeHeapSnapshot(client, 'memory-second.heapsnapshot');
    console.log('secondSnapshot', secondSnapshot);

    const memoryAfterDisposingSecondUniver = (await getMetrics(page)).JSHeapUsedSize;
    expect(memoryAfterDisposingSecondUniver - memoryAfterDisposingFirstInstance)
        .toBeLessThanOrEqual(MAX_SECOND_INSTANCE_OVERFLOW);

    expect(memoryAfterDisposingSecondUniver - memoryAfterFirstInstance)
        .toBeLessThanOrEqual(MAX_UNIVER_MEMORY_OVERFLOW);
});

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        createNewInstance: () => void;
    }
}
