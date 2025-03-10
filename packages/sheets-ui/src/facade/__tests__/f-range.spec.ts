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

/* eslint-disable ts/no-non-null-asserted-optional-chain */

import type { FUniver } from '@univerjs/core/facade';
import { LifecycleStages } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

import '@univerjs/sheets/facade';

describe('Test FRange', () => {
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();

        univerAPI = testBed.univerAPI;
    });

    it('Range getCell', () => {
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
            if (stage === LifecycleStages.Steady) {
                const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
                const range = activeSheet?.getRange(2, 3);
                const cell = range?.getCell()!;
                expect(cell.actualColumn).toBe(3);
                expect(cell.actualRow).toBe(2);
            }
        });
    });

    it('Range getCellRect', () => {
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
            if (stage === LifecycleStages.Steady) {
                const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
                const range = activeSheet?.getRange(0, 0);
                const cell = range?.getCell()!;
                const rect = range?.getCellRect()!;
                expect(rect.x).toBe(cell.startX);
                expect(rect.y).toBe(cell.startY);
                expect(rect.width).toBe(cell.endX - cell.startX);
                expect(rect.height).toBe(cell.endY - cell.startY);
                expect(rect.toJSON()).toContain(rect.height);
            }
        });
    });
});
