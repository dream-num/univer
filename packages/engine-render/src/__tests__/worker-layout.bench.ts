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

import { arch, platform, stdout, version } from 'node:process';
import { LocaleService, LocaleType, Univer } from '@univerjs/core';
import { afterEach, expect, it, vi } from 'vitest';
import { DocumentLayoutSession } from '../worker-layout';
import { createPaginatedDocument, mockWorkerCanvas } from './worker-layout.fixture';

afterEach(() => {
    vi.unstubAllGlobals();
});

it('measures 1000-page incremental layout without a wall-clock CI gate', async ({ bench, onTestFinished }) => {
    mockWorkerCanvas();
    const univer = new Univer({ locale: LocaleType.EN_US });
    onTestFinished(() => univer.dispose());
    const localeService = univer.__getInjector().get(LocaleService);
    localeService.setLocale(LocaleType.EN_US);
    localeService.setDirection('ltr');
    const samples: { elapsedMs: number; maxBlockMs: number; stepCount: number }[] = [];
    let collecting = false;
    const result = await bench('1000-page incremental layout', {
        beforeEach(mode) {
            collecting = mode === 'run';
        },
    }, () => {
        const { dataModel, pageStarts } = createPaginatedDocument();
        const session = new DocumentLayoutSession(dataModel, localeService);
        try {
            const startedAt = performance.now();
            const generation = session.start({ reason: 'initial' });
            let layout = session.step(generation, 8);
            let stepCount = 1;
            while (!layout.progress.complete && stepCount < 20_000) {
                layout = session.step(generation, 8);
                stepCount++;
            }
            const elapsedMs = performance.now() - startedAt;
            expect(layout.progress.complete).toBe(true);
            expect(layout.progress.pageCount).toBe(1_000);
            expect(session.resolvePageByOffset(pageStarts[999])?.pageIndex).toBe(999);
            if (collecting) {
                samples.push({ elapsedMs, maxBlockMs: layout.progress.maxBlockDuration, stepCount });
            }
            // Measure the layout window, excluding fixture setup, assertions and disposal.
            return { overriddenDuration: elapsedMs };
        } finally {
            session.dispose();
            dataModel.dispose();
        }
    }).run({
        warmupIterations: 3,
        warmupTime: 0,
        iterations: 10,
        time: 0,
        throws: true,
    });
    expect(samples).toHaveLength(10);
    const blockMaxima = samples.map((sample) => sample.maxBlockMs).sort((a, b) => a - b);
    stdout.write(`1000-page-layout ${JSON.stringify({
        node: version,
        platform,
        arch,
        warmupRuns: 3,
        measuredRuns: samples.length,
        medianElapsedMs: result.latency.p50,
        medianMaxBlockMs: (blockMaxima[4] + blockMaxima[5]) / 2,
        slowestBlockMs: blockMaxima[9],
        targetBlockMs: 50,
        runsOverBlockTarget: samples.filter((sample) => sample.maxBlockMs >= 50).length,
        samples,
    })}\n`);
}, 60_000);
