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

import {
    CommandService,
    ConfigService,
    ContextService,
    DesktopLogService,
    ICommandService,
    IConfigService,
    IContextService,
    ILogService,
    Injector,
    IUniverInstanceService,
    UniverInstanceService,
} from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { SetTextSelectionsOperation } from '../../commands/operations/text-selection.operation';
import { DocSelectionManagerService } from '../doc-selection-manager.service';

function createService() {
    const injector = new Injector();
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([IConfigService, { useClass: ConfigService }]);
    injector.add([IContextService, { useClass: ContextService }]);
    injector.add([ICommandService, { useClass: CommandService }]);
    injector.add([IUniverInstanceService, { useClass: UniverInstanceService }]);
    injector.add([DocSelectionManagerService]);
    injector.get(ICommandService).registerCommand(SetTextSelectionsOperation);
    return injector.get(DocSelectionManagerService);
}

describe('DocSelectionManagerService', () => {
    it('stores document text selections and exposes active/doc range ordering', () => {
        const service = createService();
        service.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });

        service.__TEST_ONLY_add([{
            startOffset: 5,
            endOffset: 8,
            collapsed: false,
            isActive: false,
        }, {
            startOffset: 1,
            endOffset: 2,
            collapsed: false,
            isActive: true,
        }] as never);

        expect(service.getTextRanges()?.length).toBe(2);
        expect(service.getActiveTextRange()?.startOffset).toBe(1);
        expect(service.getDocRanges().map((range) => range.startOffset)).toEqual([1, 5]);
    });

    it('keeps empty selections inert until a document selection is current', () => {
        const service = createService();

        service.__TEST_ONLY_add([{ startOffset: 1, endOffset: 1, collapsed: true }] as never);
        service.refreshSelection();
        service.replaceTextRanges([{ startOffset: 2, endOffset: 2 }]);

        expect(service.__getCurrentSelection()).toBeNull();
        expect(service.getSelectionInfo()).toBeUndefined();
        expect(service.getTextRanges()).toBeUndefined();
        expect(service.getRectRanges()).toBeUndefined();
        expect(service.getActiveTextRange()).toBeUndefined();
        expect(service.getActiveRectRange()).toBeUndefined();
        expect(service.getDocRanges()).toEqual([]);
    });

    it('publishes refresh selection requests for current document ranges', () => {
        const service = createService();
        const refreshes: unknown[] = [];
        const sub = service.refreshSelection$.subscribe((value) => refreshes.push(value));
        service.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });

        service.replaceTextRanges([{ startOffset: 2, endOffset: 4 }], false, { keepVisible: true });

        expect(refreshes.at(-1)).toEqual({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            docRanges: [{ startOffset: 2, endOffset: 4 }],
            isEditing: false,
            options: { keepVisible: true },
        });
        sub.unsubscribe();
    });

    it('replaces render selections, publishes them, and sorts text and rect ranges together', async () => {
        const service = createService();
        const selections: unknown[] = [];
        const sub = service.textSelection$.subscribe((value) => selections.push(value));
        service.__TEST_ONLY_setCurrentSelection({ unitId: 'doc-1', subUnitId: 'doc-1' });

        service.__replaceTextRangesWithNoRefresh({
            textRanges: [{ startOffset: 8, endOffset: 9, collapsed: false, isActive: false }],
            rectRanges: [{ startOffset: 2, endOffset: 4, isActive: true }],
            segmentId: 'header-1',
            segmentPage: 0,
            isEditing: true,
            style: { stroke: 'red' },
        } as never, { unitId: 'doc-1', subUnitId: 'doc-1' });

        expect(service.getTextRanges()?.map((range) => range.startOffset)).toEqual([8]);
        expect(service.getRectRanges()?.map((range) => range.startOffset)).toEqual([2]);
        expect(service.getActiveRectRange()?.startOffset).toBe(2);
        expect(service.getDocRanges().map((range) => range.startOffset)).toEqual([2, 8]);
        expect(selections.at(-1)).toMatchObject({
            unitId: 'doc-1',
            subUnitId: 'doc-1',
            segmentId: 'header-1',
            isEditing: true,
        });

        sub.unsubscribe();
    });
});
