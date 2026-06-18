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
import { DocumentFlavor, ICommandService, Inject, isInternalEditorID, IUniverInstanceService, RxDisposable, ThemeService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService, RichTextEditingMutation } from '@univerjs/docs';
import { DocBackground, Documents, IRenderManagerService, Layer, PageLayoutType, ScrollBar, Viewport } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';
import { DOCS_COMPONENT_BACKGROUND_LAYER_INDEX, DOCS_COMPONENT_DEFAULT_Z_INDEX, DOCS_COMPONENT_HEADER_LAYER_INDEX, DOCS_COMPONENT_MAIN_LAYER_INDEX, DOCS_VIEW_KEY, VIEWPORT_KEY } from '../../basics/docs-view-key';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { resolveDocRenderBackground } from '../../services/doc-render-background';
import { DocViewScaleService } from '../../services/doc-view-scale';
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
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();

        this._addNewRender();
        this._initRenderRefresh();
        this._initCommandListener();
        this._initThemeListener();
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
        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        if (editorRenderConfig && !editorRenderConfig.scrollBar) {
            this._context.mainComponent?.makeDirty();

            return;
        }

        this._recalculateSizeBySkeleton(skeleton);
        this._refreshPagePositionAndSelection();
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
            const currentDocUnit = this._univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
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
        new ScrollBar(viewMain, {
            enableHorizontal: this._shouldEnableHorizontalScrollBar(),
        });
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

    private _shouldEnableHorizontalScrollBar(): boolean {
        const options = this._docViewScaleService.getOptions();
        return !(options.mode === 'fit-width' && options.target === 'container' && options.align === 'start');
    }

    private _addComponent() {
        const { scene, unit: documentModel, components } = this._context;
        const DEFAULT_PAGE_MARGIN_LEFT = 20;
        const DEFAULT_PAGE_MARGIN_TOP = 20;
        const config = {
            pageMarginLeft: DEFAULT_PAGE_MARGIN_LEFT,
            pageMarginTop: DEFAULT_PAGE_MARGIN_TOP,
            ...this._getEditorBackgroundConfig(),
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

        if (!this._isEditorRenderUnit(documentModel.getUnitId())) {
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
        this._syncCanvasBackground();

        const { unitId } = this._context;

        // REFACTOR: @Jocs, should not use scroll bar to indicate a Zen Editor. refactor after support modern doc.
        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);
        if (editorRenderConfig && !editorRenderConfig.scrollBar) {
            this._context.mainComponent?.makeDirty();

            return;
        }

        this._recalculateSizeBySkeleton(skeleton);
        this._refreshPagePositionAndSelection();
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

    private _initThemeListener() {
        this.disposeWithMe(this._themeService.darkMode$.pipe(takeUntil(this.dispose$)).subscribe(() => {
            this._syncCanvasBackground();
            this._context.mainComponent?.makeDirty(true);
            this._context.components.get(DOCS_VIEW_KEY.BACKGROUND)?.makeDirty(true);
        }));
    }

    private _refreshPagePositionAndSelection() {
        if (this._isEditorRenderUnit()) {
            return;
        }

        this._docPageLayoutService.calculatePagePosition();
        this._textSelectionManagerService.refreshSelection();
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
        this._syncCanvasBackground(documentFlavor);

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

        const editorRenderConfig = this._editorService.getEditorRenderConfig(unitId);

        // REFACTOR: @JOCS show not use scrollBar to indicate it's a Zen Editor.
        if (!editorRenderConfig || editorRenderConfig.scrollBar) {
            scene.resize(width, height);
        }
    }

    private _syncCanvasBackground(documentFlavor = this._context.unit.getSnapshot().documentStyle.documentFlavor) {
        const editorRenderConfig = this._editorService.getEditorRenderConfig(this._context.unitId);
        const editorBackgroundColor = editorRenderConfig?.canvasStyle.backgroundColor;
        const resolvedBackground = resolveDocRenderBackground({
            documentFlavor,
            canvasColorService: this._context.engine.canvasColorService,
            editorBackgroundColor,
            isEditor: this._isEditorRenderUnit(),
        });
        this._context.engine.getCanvas().getCanvasEle().style.backgroundColor = resolvedBackground.canvasElementBackgroundColor;
        const docBackground = this._context.components.get(DOCS_VIEW_KEY.BACKGROUND) as DocBackground | undefined;
        docBackground?.setFillColors?.(
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor,
            resolvedBackground.docBackgroundFillColor
        );
    }

    private _getEditorBackgroundConfig() {
        if (!this._isEditorRenderUnit()) {
            return {};
        }

        const editorBackgroundColor = 'transparent';
        return {
            backgroundFillColor: editorBackgroundColor,
            pageFillColor: editorBackgroundColor,
            pageStrokeColor: editorBackgroundColor,
            marginStrokeColor: editorBackgroundColor,
        };
    }

    private _isEditorRenderUnit(unitId = this._context.unitId) {
        return this._editorService.isEditor(unitId) || isInternalEditorID(unitId);
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
        // Keep the modern document page anchored to its configured width. Tables
        // may render beyond the text column, but they should not widen the whole
        // document and recenter the page during column resize.
        pageHeight = Math.max(pageHeight, table.top + table.height + marginTop + marginBottom);
    }

    return { pageWidth, pageHeight };
}
