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

import type { FUniver } from '@univerjs/core/facade';
import { LifecycleStages } from '@univerjs/core';
import { beforeEach, describe, expect, it } from 'vitest';
import { createFacadeTestBed } from './create-test-bed';

describe('Test FRange', () => {
    let univerAPI: FUniver;

    beforeEach(() => {
        const testBed = createFacadeTestBed();

        univerAPI = testBed.univerAPI;
    });

    it('Range setNumberFormat', () => {
        univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
            if (stage === LifecycleStages.Rendered) {
                const activeSheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
                const range = activeSheet.getRange(0, 0, 1, 1);
                range.setValue(1234.5678);
                range.setNumberFormat('#,###');
                expect(range.getValue()).toBe('1,234.5678');
            }
        });
    });
});
