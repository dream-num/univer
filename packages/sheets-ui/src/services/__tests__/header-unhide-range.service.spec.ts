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

import { Injector } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { HeaderUnhideRangeAxis, HeaderUnhideRangeService } from '../header-unhide-range.service';

function createService(): HeaderUnhideRangeService {
    const injector = new Injector();
    injector.add([HeaderUnhideRangeService]);
    return injector.get(HeaderUnhideRangeService);
}

describe('HeaderUnhideRangeService', () => {
    it('lets registered visibility policies decide whether hidden row or column hints render', () => {
        const service = createService();
        const payload = {
            axis: HeaderUnhideRangeAxis.ROW,
            range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 0 },
            workbook: {} as never,
            worksheet: {} as never,
        };

        const blockRows = service.registerRangeVisibleHandler((visible, check) => (
            check.axis === HeaderUnhideRangeAxis.ROW ? false : visible
        ));
        const allowExplicitVisible = service.registerRangeVisibleHandler((visible) => visible);

        expect(service.shouldRenderRange(true, payload)).toBe(false);

        blockRows.dispose();
        expect(service.shouldRenderRange(true, payload)).toBe(true);

        allowExplicitVisible.dispose();
    });
});
