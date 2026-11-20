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

import type { DocumentDataModel, IDocumentData, IParagraph } from '@univerjs/core';
import { DocStyleType, LocaleService, LocaleType, PresetListType, QuickListTypeMap, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { UniverRenderEnginePlugin } from '@univerjs/engine-render';
import { describe, expect, it, onTestFinished } from 'vitest';
import { AfterSpaceCommand, EnterCommand, TabCommand } from '../../commands/commands/auto-format.command';
import { BreakLineCommand } from '../../commands/commands/break-line.command';
import { ChangeListNestingLevelCommand, ChangeListNestingLevelType, ListOperationCommand, QuickListCommand } from '../../commands/commands/list.command';
import { QUICK_HEADING_MAP, QuickHeadingCommand } from '../../commands/commands/set-heading.command';
import { DocAutoFormatService } from '../../services/doc-auto-format.service';
import { DocAutoFormatController } from '../doc-auto-format.controller';

function createTestBed(dataStream: string, paragraphs: IParagraph[], offset: number) {
    const univer = new Univer();
    onTestFinished(() => univer.dispose());
    univer.registerPlugin(UniverRenderEnginePlugin);
    const injector = univer.__getInjector();
    injector.add([DocSelectionManagerService]);
    injector.add([DocAutoFormatService]);
    injector.add([DocAutoFormatController]);
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.get(LocaleService).setDirection('ltr');
    const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
        id: 'auto-format-doc',
        documentStyle: {},
        styles: { numbered: { name: 'Numbered', type: DocStyleType.paragraph, bullet: { listId: 'list', listType: PresetListType.ORDER_LIST } } },
        body: { dataStream, paragraphs, sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'section_body' }] },
    });
    const selections = injector.get(DocSelectionManagerService);
    selections.__TEST_ONLY_setCurrentSelection({ unitId: model.getUnitId(), subUnitId: model.getUnitId() });
    selections.__TEST_ONLY_add([{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true, segmentId: '', style: null }] as never);
    injector.get(DocAutoFormatController);
    return injector.get(DocAutoFormatService);
}

describe('doc auto format controller', () => {
    it.each([false, true])('indents inherited list items using real selection and document state (shift=%s)', (shift) => {
        const service = createTestBed('A\rB\r\n', [
            { startIndex: 1, paragraphId: 'para_first', styleId: 'numbered' },
            { startIndex: 3, paragraphId: 'para_second', styleId: 'numbered', bullet: { nestingLevel: 1 } },
        ], 2);
        expect(service.onAutoFormat(TabCommand.id, { shift })).toEqual([{
            id: ChangeListNestingLevelCommand.id,
            params: { type: shift ? ChangeListNestingLevelType.decrease : ChangeListNestingLevelType.increase },
        }]);
    });

    it('does not indent an explicitly suppressed inherited list', () => {
        const service = createTestBed('A\rB\r\n', [
            { startIndex: 1, paragraphId: 'para_first', styleId: 'numbered' },
            { startIndex: 3, paragraphId: 'para_second', styleId: 'numbered', bullet: null },
        ], 2);
        expect(service.onAutoFormat(TabCommand.id, null)).toEqual([]);
    });

    it.each([0, 1])('exits an empty inherited list at level %i', (nestingLevel) => {
        const service = createTestBed('\r\n', [{ startIndex: 0, paragraphId: 'para_empty', styleId: 'numbered', bullet: { nestingLevel } }], 0);
        expect(service.onAutoFormat(EnterCommand.id, null)).toEqual(nestingLevel > 0
            ? [{ id: ChangeListNestingLevelCommand.id, params: { type: ChangeListNestingLevelType.decrease } }]
            : [{ id: ListOperationCommand.id, params: { listType: PresetListType.ORDER_LIST } }]);
    });

    it('uses ordinary line breaks outside a list', () => {
        const service = createTestBed('Text\r\n', [{ startIndex: 4, paragraphId: 'para_text' }], 4);
        expect(service.onAutoFormat(EnterCommand.id, null)).toEqual([{ id: BreakLineCommand.id }]);
    });

    it('recognizes quick list input from the document body', () => {
        const text = Object.keys(QuickListTypeMap)[0];
        const service = createTestBed(`${text} \r\n`, [{ startIndex: text.length + 1, paragraphId: 'para_quick_list' }], text.length + 1);
        expect(service.onAutoFormat(AfterSpaceCommand.id, null)).toMatchObject([{
            id: QuickListCommand.id,
            params: { listType: QuickListTypeMap[text as keyof typeof QuickListTypeMap] },
        }]);
    });

    it('recognizes quick heading input from the document body', () => {
        const text = Object.keys(QUICK_HEADING_MAP)[0];
        const service = createTestBed(`${text} \r\n`, [{ startIndex: text.length + 1, paragraphId: 'para_quick_heading' }], text.length + 1);
        expect(service.onAutoFormat(AfterSpaceCommand.id, null)).toEqual([{
            id: QuickHeadingCommand.id,
            params: { value: QUICK_HEADING_MAP[text as keyof typeof QUICK_HEADING_MAP] },
        }]);
    });
});
