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
import type { ISetTextSelectionsOperationParams } from '@univerjs/docs';
import type { RenderUnit } from '@univerjs/engine-render';
import { BooleanNumber, CustomRangeType, DocumentFlavor, ICommandService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService, SetTextSelectionsOperation } from '@univerjs/docs';
import { DocCanvasPopManagerService } from '@univerjs/docs-ui';
import { CanvasColorService, Documents, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { CanvasPopupService, ICanvasPopupService } from '@univerjs/ui';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DocHyperLinkPopupService } from '../../services/hyper-link-popup.service';
import { DocHyperLinkSelectionController } from '../doc-hyper-link-selection.controller';

describe.each([1, 3])('DocHyperLinkSelectionController with a %i-character link', (length) => {
    let univer: Univer;
    let commands: ICommandService;
    let popup: DocHyperLinkPopupService;
    const startIndex = 1;
    const endIndex = startIndex + length - 1;

    beforeEach(() => {
        // Only Canvas is a platform stub; commands, selection, document data
        // and popup lifecycle use their real services.
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
        univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([ICanvasPopupService, { useClass: CanvasPopupService }]);
        injector.add([DocLayoutExecutorService]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocCanvasPopManagerService]);
        injector.add([DocHyperLinkPopupService]);
        injector.add([DocHyperLinkSelectionController]);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'doc-unit',
            body: {
                dataStream: 'A目CDZ\r\n',
                paragraphs: [{ startIndex: 5, paragraphId: 'paragraph-1' }],
                sectionBreaks: [{ startIndex: 6, sectionId: 'body' }],
                customRanges: [
                    { rangeId: 'link-1', rangeType: CustomRangeType.HYPERLINK, startIndex, endIndex },
                    { rangeId: 'link-2', rangeType: CustomRangeType.HYPERLINK, startIndex: endIndex + 1, endIndex: endIndex + 1 },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                autoHyphenation: BooleanNumber.FALSE,
                pageSize: { width: 300, height: 400 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
        render.deactivate();
        render.engine.resizeBySize(300, 400);
        vi.spyOn(render.engine.getCanvasElement()!, 'getBoundingClientRect').mockReturnValue(new DOMRect(0, 0, 300, 400));
        render.addRenderDependencies([[DocSkeletonManagerService]]);
        const documents = new Documents('link-selection-document', render.with(DocSkeletonManagerService).getSkeleton());
        render.mainComponent = documents;
        render.scene.addObject(documents);
        commands = injector.get(ICommandService);
        commands.registerCommand(SetTextSelectionsOperation);
        popup = injector.get(DocHyperLinkPopupService);
        injector.get(DocHyperLinkSelectionController);
    });

    afterEach(() => {
        univer.dispose();
        vi.restoreAllMocks();
    });

    async function select(startOffset: number, endOffset = startOffset): Promise<void> {
        const params: ISetTextSelectionsOperationParams = {
            unitId: 'doc-unit',
            subUnitId: 'doc-unit',
            segmentId: '',
            isEditing: false,
            style: { fill: '', stroke: '', strokeActive: '', strokeWidth: 0 },
            ranges: [{ startOffset, endOffset, collapsed: startOffset === endOffset, segmentPage: 0 }],
        };
        expect(await commands.executeCommand(SetTextSelectionsOperation.id, params)).toBe(true);
    }

    it.each(['first', 'last', 'trailing'] as const)('keeps details visible at the %s caret boundary', async (boundary) => {
        const offsets = { first: startIndex, last: endIndex, trailing: endIndex + 1 };
        const info = { unitId: 'doc-unit', linkId: 'link-1', segmentId: '', segmentPage: 0, startIndex, endIndex };
        // Pointer events open details before the asynchronous selection operation
        // completes. Repeated clicks must not close that same popup.
        for (let attempt = 0; attempt < 3; attempt++) {
            popup.showInfoPopup(info);
            await select(offsets[boundary]);
            expect(popup.showing).toEqual(info);
        }
    });

    it.each(['before', 'after'] as const)('closes details for a caret %s the link', async (boundary) => {
        await select(startIndex);
        expect(popup.showing?.linkId).toBe('link-1');
        await select(boundary === 'before' ? startIndex - 1 : endIndex + 2);
        expect(popup.showing).toBeNull();
    });

    it('keeps the clicked adjacent link instead of switching to the preceding link', async () => {
        const info = {
            unitId: 'doc-unit',
            linkId: 'link-2',
            segmentId: '',
            segmentPage: 0,
            startIndex: endIndex + 1,
            endIndex: endIndex + 1,
        };
        popup.showInfoPopup(info);
        await select(endIndex + 1);
        expect(popup.showing).toEqual(info);
    });

    it('resolves a fresh caret at an adjacent link using the character at that offset', async () => {
        await select(endIndex + 1);
        expect(popup.showing?.linkId).toBe('link-2');
    });

    it('closes details for an expanded selection', async () => {
        await select(startIndex);
        expect(popup.showing?.linkId).toBe('link-1');
        await select(startIndex, endIndex + 1);
        expect(popup.showing).toBeNull();
    });
});
