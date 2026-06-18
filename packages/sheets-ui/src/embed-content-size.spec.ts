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

import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { createSheetsContentSizeProvider } from './embed-content-size';

describe('createSheetsContentSizeProvider', () => {
    it('measures active worksheet height from visible row heights', () => {
        const provider = createSheetsContentSizeProvider();

        expect(provider.measureContentSize({
            childType: UniverInstanceType.UNIVER_SHEET,
            childUnitId: 'sheet-1',
            childUnit: {
                getActiveSheet: () => ({
                    getConfig: () => ({ columnHeader: { height: 30 } }),
                    getRowCount: () => 4,
                    getRowHeight: (row: number) => [24, 40, 100, 32][row] ?? 24,
                    getRowVisible: (row: number) => row !== 2,
                }),
            },
        })).toEqual({ height: 126 });
    });
});
