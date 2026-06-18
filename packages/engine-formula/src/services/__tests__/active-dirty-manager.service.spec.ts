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
import { beforeEach, describe, expect, it } from 'vitest';
import { ActiveDirtyManagerService, IActiveDirtyManagerService } from '../active-dirty-manager.service';

describe('ActiveDirtyManagerService', () => {
    let service: IActiveDirtyManagerService;

    beforeEach(() => {
        const injector = new Injector();
        injector.add([IActiveDirtyManagerService, { useClass: ActiveDirtyManagerService }]);
        service = injector.get(IActiveDirtyManagerService);
    });

    it('registers command dirty converters used by recalculation', () => {
        const converter = {
            commandId: 'sheet.command.set-range-values',
            getDirtyData: () => ({ forceCalculation: true }),
        };

        service.register(converter.commandId, converter);

        expect(service.has(converter.commandId)).toBe(true);
        expect(service.get(converter.commandId)?.getDirtyData({ id: converter.commandId } as never)).toEqual({
            forceCalculation: true,
        });

        service.remove(converter.commandId);
        expect(service.has(converter.commandId)).toBe(false);
    });

    it('exposes and clears the registered converter map on dispose', () => {
        const converter = {
            commandId: 'sheet.command.insert-row',
            getDirtyData: () => ({
                dirtyRanges: [{
                    unitId: 'book-1',
                    sheetId: 'sheet-1',
                    range: { startRow: 1, endRow: 3, startColumn: 0, endColumn: 9 },
                }],
            }),
        };

        expect(service.get('missing')).toBeUndefined();
        service.register(converter.commandId, converter);

        expect(service.getDirtyConversionMap().get(converter.commandId)).toBe(converter);

        service.dispose();
        expect(service.getDirtyConversionMap().size).toBe(0);
        expect(service.has(converter.commandId)).toBe(false);
    });
});
