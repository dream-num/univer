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
import { CloseHeaderFooterCommand, CoreHeaderFooterCommand, OpenHeaderFooterPanelCommand } from '../doc-header-footer.command';

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

describe('OpenHeaderFooterPanelCommand', () => {
    function createOpenCommandTestBed(defaultHeaderId?: string) {
        let editArea = DocumentEditArea.BODY;
        const viewModel = {
            getDataModel: () => ({
                getSnapshot: () => ({ id: 'doc-1', documentStyle: { defaultHeaderId } }),
            }),
            setEditArea: vi.fn((next: DocumentEditArea) => {
                editArea = next;
            }),
        };
        const skeletonManager = {
            getViewModel: () => viewModel,
            getSkeleton: () => ({
                getSkeletonData: () => ({ pages: [{ pageNumber: 1, pageNumberStart: 1 }] }),
            }),
        };
        const selectionRenderService = {
            getSegmentPage: vi.fn(() => 0),
            setSegment: vi.fn(),
            setSegmentPage: vi.fn(),
        };
        let dependencyIndex = 0;
        const renderObject = {
            with: vi.fn(() => dependencyIndex++ === 0 ? skeletonManager : selectionRenderService),
        };
        const commandService = { executeCommand: vi.fn() };
        const instanceService = {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'doc-1' })),
        };
        const renderManagerService = { getRenderUnitById: vi.fn(() => renderObject) };
        const dependencies = [commandService, instanceService, renderManagerService];
        const accessor = { get: vi.fn(() => dependencies.shift()) };

        return { accessor, commandService, selectionRenderService, viewModel, getEditArea: () => editArea };
    }

    it('rolls back header editing when creating the missing header fails', async () => {
        const testBed = createOpenCommandTestBed();
        testBed.commandService.executeCommand.mockResolvedValueOnce(false);

        await expect(OpenHeaderFooterPanelCommand.handler(testBed.accessor as never, {})).resolves.toBe(false);

        expect(testBed.commandService.executeCommand).toHaveBeenCalledWith(
            CoreHeaderFooterCommand.id,
            expect.objectContaining({ unitId: 'doc-1' })
        );
        expect(testBed.selectionRenderService.setSegment).toHaveBeenLastCalledWith('');
        expect(testBed.selectionRenderService.setSegmentPage).toHaveBeenLastCalledWith(-1);
        expect(testBed.getEditArea()).toBe(DocumentEditArea.BODY);
    });

    it('selects an existing header before opening the sidebar', async () => {
        const testBed = createOpenCommandTestBed('existing-header');
        testBed.commandService.executeCommand.mockResolvedValueOnce(true);

        await expect(OpenHeaderFooterPanelCommand.handler(testBed.accessor as never, {})).resolves.toBe(true);

        expect(testBed.selectionRenderService.setSegment).toHaveBeenCalledWith('existing-header');
        expect(testBed.commandService.executeCommand).toHaveBeenCalledTimes(1);
        expect(testBed.getEditArea()).toBe(DocumentEditArea.HEADER);
    });
});
