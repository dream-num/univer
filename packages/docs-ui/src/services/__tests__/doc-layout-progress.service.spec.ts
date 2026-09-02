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

import type { DocumentDataModel } from '@univerjs/core';
import { BehaviorSubject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { DocLayoutProgressService } from '../doc-layout-progress.service';

describe('DocLayoutProgressService', () => {
    it('tracks only the active document, suppresses duplicates, and completes on disposal', () => {
        const document$ = new BehaviorSubject<DocumentDataModel | null>(null);
        const service = new DocLayoutProgressService({
            getCurrentTypeOfUnit$: vi.fn(() => document$),
        } as never);
        const values: Array<{ progress: number; unitId: string } | null> = [];
        let complete = false;
        service.currentProgress$.subscribe({
            complete: () => complete = true,
            next: (value) => values.push(value),
        });
        const firstDocument = { getUnitId: () => 'doc-1' } as DocumentDataModel;
        const secondDocument = { getUnitId: () => 'doc-2' } as DocumentDataModel;

        document$.next(firstDocument);
        service.setProgress('doc-1', 20);
        service.setProgress('doc-1', 20);
        service.setProgress('doc-2', 40);
        document$.next(secondDocument);
        service.clearProgress('doc-1');
        service.clearProgress('doc-2');
        service.clearProgress('missing-doc');
        document$.next(null);

        expect(values).toEqual([
            null,
            { progress: 20, unitId: 'doc-1' },
            { progress: 40, unitId: 'doc-2' },
            null,
        ]);

        service.dispose();
        expect(complete).toBe(true);
    });
});
