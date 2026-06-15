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

import { ICommandService, Injector, IResourceManagerService, IUniverInstanceService } from '@univerjs/core';
import { SheetInterceptorService } from '@univerjs/sheets';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { ConditionalFormattingRangeIndexModel } from '../../models/conditional-formatting-range-index-model';
import { ConditionalFormattingRuleModel } from '../../models/conditional-formatting-rule-model';
import { ConditionalFormattingViewModel } from '../../models/conditional-formatting-view-model';
import { ConditionalFormattingStyleComposer } from '../conditional-formatting-style-composer.service';
import { ConditionalFormattingService } from '../conditional-formatting.service';

describe('ConditionalFormattingService', () => {
    let service: ConditionalFormattingService;
    let composeStyle: ReturnType<typeof vi.fn>;

    beforeEach(() => {
        composeStyle = vi.fn(() => ({ style: { bg: { rgb: '#fff000' } } }));
        const injector = new Injector();
        injector.add([ConditionalFormattingRuleModel, { useValue: { getUnitRules: () => null, deleteUnitId: vi.fn() } as unknown as ConditionalFormattingRuleModel }]);
        injector.add([ConditionalFormattingRangeIndexModel, { useValue: { rebuild: vi.fn(), getCellRanges: () => [], remove: vi.fn(), add: vi.fn() } as unknown as ConditionalFormattingRangeIndexModel }]);
        injector.add([ConditionalFormattingStyleComposer, { useValue: { composeStyle } as unknown as ConditionalFormattingStyleComposer }]);
        injector.add([ConditionalFormattingViewModel, { useValue: { clearCache: vi.fn(), markCellDirty: vi.fn() } as unknown as ConditionalFormattingViewModel }]);
        injector.add([IUniverInstanceService, { useValue: {} as IUniverInstanceService }]);
        injector.add([IResourceManagerService, { useValue: { registerPluginResource: vi.fn(() => ({ dispose: vi.fn() })) } as unknown as IResourceManagerService }]);
        injector.add([SheetInterceptorService, { useValue: { interceptCommand: vi.fn(() => ({ dispose: vi.fn() })) } as unknown as SheetInterceptorService }]);
        injector.add([ICommandService, { useValue: { onCommandExecuted: vi.fn(() => ({ dispose: vi.fn() })) } as unknown as ICommandService }]);
        injector.add([ConditionalFormattingService]);
        service = injector.get(ConditionalFormattingService);
    });

    it('composes the conditional style for the requested cell through the style composer', () => {
        expect(service.composeStyle('book-1', 'sheet-1', 2, 3)).toEqual({ style: { bg: { rgb: '#fff000' } } });
        expect(composeStyle).toHaveBeenCalledWith('book-1', 'sheet-1', 2, 3);
    });
});
