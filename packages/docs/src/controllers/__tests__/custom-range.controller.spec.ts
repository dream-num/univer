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

import type { DocumentDataModel, IDocumentData } from '@univerjs/core';
import { CustomRangeType, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { afterEach, describe, expect, it } from 'vitest';
import { SetTextSelectionsOperation } from '../../commands/operations/text-selection.operation';
import { DocSelectionManagerService } from '../../services/doc-selection-manager.service';
import { DocCustomRangeController } from '../custom-range.controller';

let cleanup: (() => void) | undefined;
afterEach(() => cleanup?.());

describe('DocCustomRangeController', () => {
    it('normalizes whole entities in the active story while leaving editable fields unchanged', () => {
        const univer = new Univer();
        cleanup = () => univer.dispose();
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([DocCustomRangeController]);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'story-selection',
            body: { dataStream: 'Body\r\n', customRanges: [{ startIndex: 0, endIndex: 3, rangeId: 'body-entity', rangeType: CustomRangeType.CUSTOM, wholeEntity: true }] },
            headers: { header: { headerId: 'header', body: { dataStream: '\u001FAB\u001E \u001FCD\u001E\r\n', customRanges: [
                { startIndex: 0, endIndex: 3, rangeId: 'header-entity', rangeType: CustomRangeType.CUSTOM, wholeEntity: true },
                { startIndex: 5, endIndex: 8, rangeId: 'editable-field', rangeType: CustomRangeType.FIELD, wholeEntity: false },
            ] } } },
        });
        injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
        const selections = injector.get(DocSelectionManagerService);
        injector.get(DocCustomRangeController);
        const commands = injector.get(ICommandService);
        commands.registerCommand(SetTextSelectionsOperation);
        let transformed: unknown;
        const subscription = selections.refreshSelection$.subscribe((value) => transformed = value?.docRanges);
        commands.syncExecuteCommand(SetTextSelectionsOperation.id, {
            unitId: model.getUnitId(),
            segmentId: 'header',
            ranges: [{ startOffset: 2, endOffset: 2, collapsed: true }],
        });
        expect(transformed).toEqual([expect.objectContaining({ startOffset: 0, endOffset: 4, collapsed: false })]);
        transformed = undefined;
        commands.syncExecuteCommand(SetTextSelectionsOperation.id, {
            unitId: model.getUnitId(),
            segmentId: 'header',
            ranges: [{ startOffset: 6, endOffset: 6, collapsed: true }],
        });
        expect(transformed).toBeUndefined();
        commands.syncExecuteCommand(SetTextSelectionsOperation.id, {
            unitId: model.getUnitId(),
            segmentId: 'header',
            ranges: [{ startOffset: 6, endOffset: 8, collapsed: false }],
        });
        expect(transformed).toEqual([expect.objectContaining({ startOffset: 5, endOffset: 9, collapsed: false })]);
        subscription.unsubscribe();
    });
});
