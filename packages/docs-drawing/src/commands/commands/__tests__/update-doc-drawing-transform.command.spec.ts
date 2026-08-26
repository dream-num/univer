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

import type { IUpdateDrawingDocTransformCommandParams } from '@univerjs/docs-drawing';
import { ICommandService, ImageSourceType } from '@univerjs/core';
import { DocHistoryAction, RichTextEditingMutation } from '@univerjs/docs';
import { UpdateDrawingDocTransformCommand } from '@univerjs/docs-drawing';
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

describe('UpdateDrawingDocTransformCommand', () => {
    let testBed: ReturnType<typeof createFacadeTestBed>;

    beforeEach(() => {
        vi.stubGlobal('Image', MockImage);
        testBed = createFacadeTestBed();
    });

    afterEach(() => {
        testBed.univer.dispose();
        vi.unstubAllGlobals();
    });

    it('marks image transforms for history action summaries', async () => {
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
        const commandService = testBed.injector.get(ICommandService);
        const mutationSpy = vi.spyOn(commandService, 'syncExecuteCommand');

        const result = commandService.syncExecuteCommand<IUpdateDrawingDocTransformCommandParams>(
            UpdateDrawingDocTransformCommand.id,
            {
                unitId: 'test-doc',
                subUnitId: 'test-doc',
                drawings: [{ drawingId: image!.getId(), key: 'angle', value: 15 }],
            }
        );

        expect(result).toBe(true);
        expect(mutationSpy).toHaveBeenCalledWith(
            RichTextEditingMutation.id,
            expect.objectContaining({ historyAction: DocHistoryAction.UpdateImage })
        );
    });
});
