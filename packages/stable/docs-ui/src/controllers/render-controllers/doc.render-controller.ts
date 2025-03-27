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

import type { DocumentDataModel, EventState, ICommandInfo, Nullable } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { DocumentSkeleton, IDocumentSkeletonPage, IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import { DocumentFlavor, ICommandService, Inject, IUniverInstanceService, RxDisposable, UniverInstanceType } from '@univerjs/core';
import { DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocBackground, Documents, IRenderManagerService, Layer, PageLayoutType, ScrollBar, Viewport } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { DOCS_COMPONENT_BACKGROUND_LAYER_INDEX, DOCS_COMPONENT_DEFAULT_Z_INDEX, DOCS_COMPONENT_HEADER_LAYER_INDEX, DOCS_COMPONENT_MAIN_LAYER_INDEX, DOCS_VIEW_KEY, VIEWPORT_KEY } from '../../basics/docs-view-key';
import { IEditorService } from '../../services/editor/editor-manager.service';
import { DocSelectionRenderService } from '../../services/selection/doc-selection-render.service';

export class DocRenderController extends RxDisposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionRenderService) private readonly _docSelectionRenderService: DocSelectionRenderService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService
    ) {
        super();

        this._addNewRender();
        this._initRenderRefresh();
        this._initCommandListener();
    }

    reRender(unitId: string) {
        const docSkeletonManagerService = this._renderManagerService.getRenderById(unitId)?.with(DocSkeletonManagerService);
        const skeleton = docSkeletonManagerService?.getSkeleton();
        if (!skeleton) {
            return;
        }

        // TODO: `disabled` is only used for read only demo, and will be removed in the future.
        const disabled = !!skeleton.getViewModel().getDataModel().getSnapshot().disabled;
        if (disabled) {
            return;
        }

        skeleton.calculate();

        // REFACTOR: @Jocs, should not use scroll bar to indicate a Zen Editor. refactor after support modern doc.
        const editor = this._editorService.getEditor(unitId);
        if (this._editorService.isEditor(unitId) && !editor?.params.scrollBar) {
            this._context.mainComponent?.makeDirty();

            return;
        }

        this._recalculateSizeBySkeleton(skeleton);
    }

    private _addNewRender() {
        const { scene, engine } = this._context;

        const viewMain = new Viewport(VIEWPORT_KEY.VIEW_MAIN, scene, {
            left: 0,
            top: 0,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });

        scene.attachControl();

        scene.onMouseWheel$.subscribeEvent((evt: unknown, state: EventState) => {
            const currentDocUnit = this._univerInstanceService.getCurrentUnitForType(UniverInstanceType.UNIVER_DOC);
            if (currentDocUnit?.getUnitId() !== this._context.unitId) {
                return;
            }

            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    // const value = e.deltaY > 0 ? 0.1 : -0.1;
                    // scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        // TODO@wzhudev: this shouldn't be a config, because we may render different units at the same time.
        // @jikkai: hasScroll has never been set before, so I commented it out.
        // const hasScroll = this._configService.getConfig('hasScroll') as Nullable<boolean>;
        // if (hasScroll !== false) {
        // eslint-disable-next-line no-new
        new ScrollBar(viewMain);
        // }

        scene.addLayer(
            new Layer(scene, [], DOCS_COMPONENT_MAIN_LAYER_INDEX),
            new Layer(scene, [], DOCS_COMPONENT_HEADER_LAYER_INDEX)
        );

        this._addComponent();

        const frameFn = () => scene.render();
        this.disposeWithMe(this._context.activated$.subscribe((activated) => {
            if (activated) {
                // TODO: we should attach the context object to the RenderContext object on scene.canvas.
                engine.runRenderLoop(frameFn);
            } else {
                // Stop the render loop when the render unit is deactivated.
                engine.stopRenderLoop(frameFn);
            }
        }));

        // Attach scroll event after main viewport created.
        this._docSelectionRenderService.__attachScrollEvent();
    }

    private _addComponent() {
        const { scene, unit: documentModel, components } = this._context;
        const DEFAULT_PAGE_MARGIN_LEFT = 20;
        const DEFAULT_PAGE_MARGIN_TOP = 20;
        const config = {
            pageMarginLeft: DEFAULT_PAGE_MARGIN_LEFT,
            pageMarginTop: DEFAULT_PAGE_MARGIN_TOP,
        };

        const documents = new Documents(DOCS_VIEW_KEY.MAIN, undefined, config);
        documents.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;
        const docBackground = new DocBackground(DOCS_VIEW_KEY.BACKGROUND, undefined, config);
        docBackground.zIndex = DOCS_COMPONENT_DEFAULT_Z_INDEX;

        this._context.mainComponent = documents;
        components.set(DOCS_VIEW_KEY.MAIN, documents);
        components.set(DOCS_VIEW_KEY.BACKGROUND, docBackground);

        scene.addObjects([documents], DOCS_COMPONENT_MAIN_LAYER_INDEX);
        scene.addObjects([docBackground], DOCS_COMPONENT_BACKGROUND_LAYER_INDEX);

        if (this._editorService.getEditor(documentModel.getUnitId()) == null) {
            scene.enableLayerCache(DOCS_COMPONENT_MAIN_LAYER_INDEX);
        }
    }

    private _initRenderRefresh() {
        this._docSkeletonManagerService.currentSkeletonBefore$.pipe(takeUntil(this.dispose$)).subscribe((param) => {
            this._create(param);
        });
    }

    private _create(skeleton: Nullable<DocumentSkeleton>) {
        if (!skeleton) {
            return;
        }

        const { mainComponent, components } = this._context;

        const docsComponent = mainComponent as Documents;
        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        docsComponent.changeSkeleton(skeleton);
        docBackground.changeSkeleton(skeleton);

        const { unitId } = this._context;

        // REFACTOR: @Jocs, should not use scroll bar to indicate a Zen Editor. refactor after support modern doc.
        const editor = this._editorService.getEditor(unitId);
        if (this._editorService.isEditor(unitId) && !editor?.params.scrollBar) {
            this._context.mainComponent?.makeDirty();

            return;
        }

        this._recalculateSizeBySkeleton(skeleton);
    }

    private _initCommandListener() {
        const updateCommandList = [RichTextEditingMutation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            // TODO@Jocs: performance, only update the skeleton when the command is related to the current unit.
            if (updateCommandList.includes(command.id)) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;

                this.reRender(unitId);
            }
        }));
    }

    private _recalculateSizeBySkeleton(skeleton: DocumentSkeleton) {
        const { mainComponent, scene, unitId, components } = this._context;

        const docsComponent = mainComponent as Documents;

        const docBackground = components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground;

        const pages = skeleton.getSkeletonData()?.pages;
        if (pages == null) {
            return;
        }

        let width = 0;
        let height = 0;

        const docDataModel = this._context.unit;

        const documentFlavor = docDataModel.getSnapshot().documentStyle.documentFlavor;

        for (let i = 0, len = pages.length; i < len; i++) {
            const page = pages[i];
            let { pageWidth, pageHeight } = page;

            // Mainly for modern mode, because pageHeight will be INFINITY in modern mode.
            if (documentFlavor === DocumentFlavor.MODERN) {
                const modernPageSize = getPageSizeInModernMode(page);

                pageWidth = modernPageSize.pageWidth;
                pageHeight = modernPageSize.pageHeight;
            }

            if (docsComponent.pageLayoutType === PageLayoutType.VERTICAL) {
                height += pageHeight;

                height += docsComponent.pageMarginTop;

                if (i === len - 1) {
                    height += docsComponent.pageMarginTop;
                }

                width = Math.max(width, pageWidth);
            } else if (docsComponent.pageLayoutType === PageLayoutType.HORIZONTAL) {
                width += pageWidth;

                if (i !== len - 1) {
                    width += docsComponent.pageMarginLeft;
                }
                height = Math.max(height, pageHeight);
            }
        }

        docsComponent.resize(width, height);
        docBackground.resize(width, height);

        const editor = this._editorService.getEditor(unitId);

        // REFACTOR: @JOCS show not use scrollBar to indicate it's a Zen Editor.
        if (!this._editorService.isEditor(unitId) || editor?.params.scrollBar) {
            scene.resize(width, height);
        }
    }
}

function getPageSizeInModernMode(page: IDocumentSkeletonPage) {
    let { pageWidth, pageHeight } = page;
    const { marginLeft, marginRight, marginTop, marginBottom, skeDrawings, skeTables } = page;

    if (pageWidth === Number.POSITIVE_INFINITY) {
        pageWidth = page.width + marginLeft + marginRight;
    }

    if (pageHeight === Number.POSITIVE_INFINITY) {
        pageHeight = page.height + marginTop + marginBottom;
    }

    for (const drawing of skeDrawings.values()) {
        pageWidth = Math.max(pageWidth, drawing.aLeft + drawing.width + marginLeft + marginRight);
        pageHeight = Math.max(pageHeight, drawing.aTop + drawing.height + marginTop + marginBottom);
    }

    for (const table of skeTables.values()) {
        pageWidth = Math.max(pageWidth, table.left + table.width + marginLeft + marginRight);
        pageHeight = Math.max(pageHeight, table.top + table.height + marginTop + marginBottom);
    }

    return { pageWidth, pageHeight };
}
