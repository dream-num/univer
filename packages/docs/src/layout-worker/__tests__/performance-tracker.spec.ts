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

import { describe, expect, it } from 'vitest';
import { DocsLayoutWorkerPerformanceTracker } from '../performance-tracker';

describe('DocsLayoutWorkerPerformanceTracker', () => {
    it('separates snapshot, mutation, and published patch transfer samples by unit', () => {
        const tracker = new DocsLayoutWorkerPerformanceTracker();

        tracker.recordRequest({
            method: 'createSession',
            args: [{ unitId: 'doc-1', snapshot: { id: 'doc-1' } }],
        }, 4);
        tracker.recordRequest({
            method: 'startLayout',
            args: [{ unitId: 'doc-1', mutations: [] }],
        }, 5);
        tracker.recordRequest({
            method: 'startLayout',
            args: [{ unitId: 'doc-1', mutations: [{ modelRevision: 1 }] }],
        }, 6);
        tracker.recordResponse({
            data: {
                unitId: 'doc-1',
                publication: { pages: [] },
            },
        }, 7);
        tracker.recordResponse({
            data: {
                status: 'accepted',
                step: {
                    unitId: 'doc-1',
                    publication: { pages: [] },
                },
            },
        }, 8);
        tracker.recordResponse({
            data: {
                unitId: 'doc-2',
                publication: { pages: [] },
            },
        }, 9);

        expect(tracker.getMetrics('doc-1')).toEqual({
            mutationTransferMs: [6],
            patchTransferMs: [7, 8],
            snapshotTransferMs: [4],
        });
        expect(tracker.getMetrics('doc-2').patchTransferMs).toEqual([9]);

        tracker.reset('doc-1');
        expect(tracker.getMetrics('doc-1')).toEqual({
            mutationTransferMs: [],
            patchTransferMs: [],
            snapshotTransferMs: [],
        });

        tracker.resetAll();
        expect(tracker.getMetrics('doc-2')).toEqual({
            mutationTransferMs: [],
            patchTransferMs: [],
            snapshotTransferMs: [],
        });
    });
});
