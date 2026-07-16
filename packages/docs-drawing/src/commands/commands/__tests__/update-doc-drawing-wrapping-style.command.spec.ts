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
import type { IUpdateDocDrawingWrappingStyleParams } from '@univerjs/docs-drawing';
import {
    BooleanNumber,
    ICommandService,
    ImageSourceType,
    IUniverInstanceService,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    UniverInstanceType,
} from '@univerjs/core';
import { TextWrappingStyle, UpdateDocDrawingWrappingStyleCommand } from '@univerjs/docs-drawing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { createFacadeTestBed } from '../../../facade/__tests__/create-test-bed';

class MockImage {
    width = 800;
    height = 400;
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;

    get src(): string {
        return '';
    }

    set src(_value: string) {
        queueMicrotask(() => this.onload?.());
    }
}

describe('UpdateDocDrawingWrappingStyleCommand', () => {
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        vi.stubGlobal('Image', MockImage);
        testBed = createFacadeTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
        vi.unstubAllGlobals();
    });

    it('updates the requested document without render services or current-unit dependence', async () => {
        const image = await testBed.document.insertImage({
            source: 'data:image/png;base64,image',
            imageSourceType: ImageSourceType.BASE64,
            width: 160,
            height: 90,
            textRange: {
                startOffset: 3,
                endOffset: 3,
                collapsed: true,
                segmentId: '',
            },
        });
        const positionH = { relativeFrom: ObjectRelativeFromH.MARGIN, posOffset: 80 };
        const positionV = { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 120 };
        const drawing = image!.getImageData()!;
        const otherDocument = testBed.univer.createUnit<IDocumentData, DocumentDataModel>(
            UniverInstanceType.UNIVER_DOC,
            {
                id: 'other-doc',
                documentStyle: {},
                body: { dataStream: '\r\n', paragraphs: [{ startIndex: 0, paragraphId: 'other-paragraph' }], customBlocks: [] },
                drawings: {},
                drawingsOrder: [],
            }
        );
        testBed.injector.get(IUniverInstanceService).focusUnit(otherDocument.getUnitId());

        const result = testBed.injector.get(ICommandService).syncExecuteCommand<IUpdateDocDrawingWrappingStyleParams>(
            UpdateDocDrawingWrappingStyleCommand.id,
            {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{
                    ...drawing,
                    docTransform: { ...drawing.docTransform, positionH, positionV },
                }],
                wrappingStyle: TextWrappingStyle.BEHIND_TEXT,
            }
        );

        expect(result).toBe(true);
        expect(testBed.document.getImage(image!.getId())?.getImageData()).toMatchObject({
            layoutType: PositionedObjectLayoutType.WRAP_NONE,
            behindDoc: BooleanNumber.TRUE,
            docTransform: { positionH, positionV },
        });
        expect(otherDocument.getSnapshot().drawings).toEqual({});
    });
});
