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
import { DesktopRibbonService, IMenuManagerService, IRibbonService, MenuManagerService } from '@univerjs/ui';
import { afterEach, describe, expect, it } from 'vitest';
import { DOC_TABLE_OF_CONTENTS_RIBBON_TAB, tableOfContentsRibbonMenuSchema } from '../../menu/schema';
import { TableOfContentsRibbonController } from '../table-of-contents-ribbon.controller';

describe('TableOfContentsRibbonController', () => {
    let univer: Univer;

    afterEach(() => univer?.dispose());

    function setup() {
        univer = new Univer();
        univer.registerPlugin(UniverDocsPlugin);
        const injector = univer.__getInjector();
        injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
        injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
        injector.add([TableOfContentsRibbonController]);
        univer.createUnit<IDocumentData>(UniverInstanceType.UNIVER_DOC, {
            id: 'doc-1',
            body: {
                dataStream: 'Before\r\u001FContents\u001E\rAfter\r\n',
                paragraphs: [6, 17, 23].map((startIndex) => ({ startIndex, paragraphId: `p-${startIndex}` })),
                sectionBreaks: [{ startIndex: 24, sectionId: 's-1' }],
                customRanges: [{
                    rangeId: 'toc-1',
                    rangeType: CustomRangeType.FIELD,
                    startIndex: 7,
                    endIndex: 16,
                    properties: { fieldType: 'TOC' },
                }],
            },
            documentStyle: {},
        });
        injector.get(IUniverInstanceService).focusUnit('doc-1');
        const selection = injector.get(DocSelectionManagerService);
        selection.__TEST_ONLY_add([{ startOffset: 0, endOffset: 0, collapsed: true, isActive: true }]);
        const select = (offset: number) => selection.__replaceTextRangesWithNoRefresh({
            ...selection.getSelectionInfo()!,
            textRanges: [{ startOffset: offset, endOffset: offset, collapsed: true, isActive: true }],
        }, { unitId: 'doc-1', subUnitId: 'doc-1' });
        const ribbon = injector.get(IRibbonService);
        injector.get(IMenuManagerService).appendRootMenu(tableOfContentsRibbonMenuSchema);
        const tabs: string[][] = [];
        const active: string[] = [];
        const tabSubscription = ribbon.ribbon$.subscribe((items) => tabs.push(items.map((item) => item.key)));
        const activeSubscription = ribbon.activatedTab$.subscribe((tab) => active.push(tab));
        const controller = injector.get(TableOfContentsRibbonController);
        controller.disposeWithMe(tabSubscription);
        controller.disposeWithMe(activeSubscription);
        return { controller, select, tabs, active };
    }

    it('activates the contextual tab once on entry and hides it on exit', () => {
        const { controller, select, tabs, active } = setup();
        select(8);
        select(10);
        expect(active.filter((tab) => tab === DOC_TABLE_OF_CONTENTS_RIBBON_TAB)).toHaveLength(1);
        expect(tabs[tabs.length - 1]).toContain(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
        select(20);
        expect(tabs[tabs.length - 1]).not.toContain(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
        controller.dispose();
    });

    it('hides an active contextual tab when disposed', () => {
        const { controller, select, tabs } = setup();
        select(8);
        expect(tabs[tabs.length - 1]).toContain(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
        controller.dispose();
        expect(tabs[tabs.length - 1]).not.toContain(DOC_TABLE_OF_CONTENTS_RIBBON_TAB);
    });
});
