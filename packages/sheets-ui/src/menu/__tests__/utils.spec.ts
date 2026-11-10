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
import { DOCS_NORMAL_EDITOR_UNIT_ID_KEY, Univer, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService } from '@univerjs/docs';
import { EditorService, IEditorService } from '@univerjs/docs-ui';
import { IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { describe, expect, it, onTestFinished } from 'vitest';
import { getFontStyleAtCursor } from '../utils';

describe('getFontStyleAtCursor', () => {
    it.each([
        { collapsed: true, fontSize: undefined, expected: 24 },
        { collapsed: false, fontSize: undefined, expected: 24 },
        { collapsed: true, fontSize: 16, expected: 16 },
        { collapsed: false, fontSize: 16, expected: 16 },
    ])('resolves font size $expected with collapsed=$collapsed and inline font size $fontSize', ({ collapsed, fontSize, expected }) => {
        const univer = new Univer();
        onTestFinished(() => univer.dispose());
        const injector = univer.__getInjector();
        injector.add([DocSelectionManagerService]);
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([IEditorService, { useClass: EditorService }]);
        const selections = injector.get(DocSelectionManagerService);
        const document = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
            documentStyle: { textStyle: { fs: 24 } },
            body: {
                dataStream: 'a\r\n',
                textRuns: [{ st: 0, ed: 1, ts: { fs: fontSize, cl: { rgb: '#1B1C1F' } } }],
                paragraphs: [{ startIndex: 1, paragraphId: 'paragraph-1' }],
            },
        });
        selections.__TEST_ONLY_setCurrentSelection({
            unitId: document.getUnitId(),
            subUnitId: document.getUnitId(),
        });
        selections.__TEST_ONLY_add([{
            startOffset: collapsed ? 1 : 0,
            endOffset: 1,
            collapsed,
            isActive: true,
        }]);

        expect(getFontStyleAtCursor(injector)?.ts?.fs).toBe(expected);
        expect(document.getBody()?.textRuns?.[0].ts?.fs).toBe(fontSize);
    });
});
