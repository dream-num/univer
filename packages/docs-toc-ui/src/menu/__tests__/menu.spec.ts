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

import type { IDocumentData } from '@univerjs/core';
import { CustomRangeType, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, UniverDocsPlugin } from '@univerjs/docs';
import { MenuItemType } from '@univerjs/ui';
import { firstValueFrom } from 'rxjs';
import { afterEach, describe, expect, it } from 'vitest';
import { DeleteTableOfContentsMenuFactory, InsertTableOfContentsMenuFactory, UpdateTableOfContentsMenuFactory } from '../menu';

describe('table of contents menu factories', () => {
    let univer: Univer;
    afterEach(() => univer?.dispose());

    it('switches insert and manage actions at a TOC boundary', async () => {
        univer = new Univer();
        univer.registerPlugin(UniverDocsPlugin);
        const accessor = univer.__getInjector();
        univer.createUnit<IDocumentData>(UniverInstanceType.UNIVER_DOC, {
            id: 'doc-1',
            body: {
                dataStream: '\u001FContents\u001E\rBody\r\n',
                paragraphs: [{ startIndex: 10, paragraphId: 'toc-p' }, { startIndex: 15, paragraphId: 'body-p' }],
                sectionBreaks: [{ startIndex: 16, sectionId: 's-1' }],
                customRanges: [{
                    rangeId: 'toc',
                    rangeType: CustomRangeType.FIELD,
                    startIndex: 0,
                    endIndex: 9,
                    properties: { fieldType: 'TOC' },
                }],
            },
            documentStyle: {},
        });
        accessor.get(IUniverInstanceService).focusUnit('doc-1');
        const selection = accessor.get(DocSelectionManagerService);
        selection.__TEST_ONLY_add([{ startOffset: 5, endOffset: 5, collapsed: true, isActive: true }]);
        const select = (startOffset: number, endOffset = startOffset) => selection.__replaceTextRangesWithNoRefresh({
            ...selection.getSelectionInfo()!,
            textRanges: [{ startOffset, endOffset, collapsed: startOffset === endOffset, isActive: true }],
        }, { unitId: 'doc-1', subUnitId: 'doc-1' });
        const manageHidden = [
            UpdateTableOfContentsMenuFactory(accessor).hidden$,
            DeleteTableOfContentsMenuFactory(accessor).hidden$,
        ];
        const insertMenu = InsertTableOfContentsMenuFactory(accessor);
        expect(insertMenu.icon).toBe('UnorderIcon');
        expect(insertMenu.type).toBe(MenuItemType.SUBITEMS);
        expect(Array.isArray(insertMenu.selections) ? insertMenu.selections.map((selection) => selection.value) : []).toEqual(['automatic', 'custom']);
        expect(UpdateTableOfContentsMenuFactory(accessor).icon).toBe('UnorderIcon');
        if (manageHidden.some((state) => !state)) throw new Error('TOC menus must expose hidden state.');
        expect(await Promise.all(manageHidden.map((state) => firstValueFrom(state!)))).toEqual([false, false]);
        expect(await firstValueFrom(insertMenu.hidden$!)).toBe(false);
        expect(await firstValueFrom(insertMenu.disabled$!)).toBe(true);

        select(11);
        expect(await Promise.all(manageHidden.map((state) => firstValueFrom(state!)))).toEqual([true, true]);
        expect(await firstValueFrom(insertMenu.hidden$!)).toBe(false);
        expect(await firstValueFrom(insertMenu.disabled$!)).toBe(false);

        select(11, 12);
        expect(await firstValueFrom(insertMenu.hidden$!)).toBe(false);
        expect(await firstValueFrom(insertMenu.disabled$!)).toBe(true);
    });
});
