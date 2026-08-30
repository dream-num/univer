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

import { DocumentEditArea } from '@univerjs/engine-render';
import { describe, expect, it, vi } from 'vitest';
import { CloseHeaderFooterCommand } from '../doc-header-footer.command';

describe('CloseHeaderFooterCommand large document regression', () => {
    it('reuses already-published body pages when leaving header/footer editing', async () => {
        const calculate = vi.fn();
        let editArea = DocumentEditArea.HEADER;
        const skeleton = {
            getSkeletonData: () => ({ pages: [{}] }),
            calculate,
        };
        const skeletonManager = {
            getViewModel: () => ({
                getEditArea: () => editArea,
                setEditArea: (next: DocumentEditArea) => {
                    editArea = next;
                },
            }),
            getSkeleton: () => skeleton,
        };
        const selectionRenderService = {
            setSegment: vi.fn(),
            setSegmentPage: vi.fn(),
        };
        let renderDependency = 0;
        const renderObject = {
            with: vi.fn(() => renderDependency++ === 0 ? skeletonManager : selectionRenderService),
            scene: {
                getTransformerByCreate: () => ({ clearSelectedObjects: vi.fn() }),
            },
            mainComponent: { makeDirty: vi.fn() },
        };
        const commandService = { executeCommand: vi.fn(() => true) };
        const renderManagerService = { getRenderUnitById: vi.fn(() => renderObject) };
        const selectionManagerService = { replaceDocRanges: vi.fn() };
        const instanceService = {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
            getUnit: vi.fn(() => ({
                getSnapshot: () => ({ body: { dataStream: 'body\r\n', paragraphs: [{ startIndex: 4 }] } }),
            })),
        };
        const dependencies = [
            commandService,
            renderManagerService,
            selectionManagerService,
            instanceService,
        ];
        const accessor = { get: vi.fn(() => dependencies.shift()) };

        const result = await CloseHeaderFooterCommand.handler(accessor as never, { unitId: 'doc-1' });
        await Promise.resolve();

        expect(result).toBe(true);
        expect(editArea).toBe(DocumentEditArea.BODY);
        expect(calculate).not.toHaveBeenCalled();
        expect(renderObject.mainComponent.makeDirty).toHaveBeenCalledWith(true);
    });
});
