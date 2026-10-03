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
import type { ISuccinctDocRangeParam, RenderUnit } from '@univerjs/engine-render';
import { DocumentFlavor, ICommandService, IUniverInstanceService, Univer, UniverInstanceType } from '@univerjs/core';
import { DocLayoutExecutorService, DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { CanvasColorService, DocumentEditArea, ICanvasColorService, IRenderManagerService, RenderManagerService } from '@univerjs/engine-render';
import { DesktopLayoutService, DesktopRibbonService, ILayoutService, IMenuManagerService, IRibbonService, MenuManagerService } from '@univerjs/ui';
import { describe, expect, it, vi } from 'vitest';
import { headerFooterRibbonSchema } from '../../../menu/header-footer-ribbon';
import { DocSelectionRenderService } from '../../../services/selection/doc-selection-render.service';
import { DocHeaderFooterRibbonOperation } from '../../operations/doc-header-footer-ribbon.operation';
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

    it('moves the caret from the body into an existing header when opening the ribbon', async () => {
        const univer = new Univer();
        const injector = univer.__getInjector();
        injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
        injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
        injector.add([ILayoutService, { useClass: DesktopLayoutService }]);
        injector.add([IMenuManagerService, { useClass: MenuManagerService }]);
        injector.add([IRibbonService, { useClass: DesktopRibbonService }]);
        injector.add([DocSelectionManagerService]);
        injector.add([DocLayoutExecutorService]);
        injector.get(IMenuManagerService).mergeMenu(headerFooterRibbonSchema);
        const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
            id: 'open-header-doc',
            body: { dataStream: 'Body\r\n', paragraphs: [{ paragraphId: 'body', startIndex: 4 }] },
            headers: { header: { headerId: 'header', body: { dataStream: 'Page \r\n', paragraphs: [{ paragraphId: 'header-p', startIndex: 5 }] } } },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, defaultHeaderId: 'header', pageSize: { width: 300, height: 400 }, marginTop: 40 },
        });
        injector.get(IUniverInstanceService).focusUnit(model.getUnitId());
        const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
        render.deactivate();
        render.addRenderDependencies([[DocSkeletonManagerService], [DocSelectionRenderService]]);
        const skeletonManager = render.with(DocSkeletonManagerService);
        skeletonManager.getSkeleton().calculate();
        const selection = injector.get(DocSelectionManagerService);
        let ranges: ISuccinctDocRangeParam[] = [];
        const subscription = selection.refreshSelection$.subscribe((event) => {
            if (event) {
                ranges = event.docRanges;
            }
        });
        const commands = injector.get(ICommandService);
        commands.registerCommand(OpenHeaderFooterPanelCommand);
        commands.registerCommand(DocHeaderFooterRibbonOperation);
        try {
            expect(await commands.executeCommand(OpenHeaderFooterPanelCommand.id)).toBe(true);
            expect(render.with(DocSelectionRenderService).getSegment()).toBe('header');
            expect(skeletonManager.getViewModel().getEditArea()).toBe(DocumentEditArea.HEADER);
            expect(ranges).toEqual([expect.objectContaining({ startOffset: 0, endOffset: 0, segmentId: 'header', segmentPage: 0 })]);
        } finally {
            subscription.unsubscribe();
            univer.dispose();
        }
    });
});
