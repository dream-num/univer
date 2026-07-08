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

import type { DocumentDataModel, ICommandInfo, Workbook } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import type { IDocPageSetupCommandParams } from '../../commands/commands/doc-page-setup.command';
import type { ISetDocZoomRatioOperationParams } from '../../commands/operations/set-doc-zoom-ratio.operation';
import {
    Disposable,
    DOCS_NORMAL_EDITOR_UNIT_ID_KEY,
    DocumentFlavor,
    FOCUSING_DOC,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    Optional,
    UniverInstanceType,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { getNextWheelZoomRatio, IRenderManagerService } from '@univerjs/engine-render';
import { neoGetDocObject } from '../../basics/component-tools';
import { DocPageSetupCommand } from '../../commands/commands/doc-page-setup.command';
import { SetDocZoomRatioCommand } from '../../commands/commands/set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { IDocEmbedInteractionBoundaryService } from '../../services/doc-embed-integration.service';
import { DocViewScaleService } from '../../services/doc-view-scale';
import { DEFAULT_MODERN_DOC_ZOOM_RATIO, getDocEffectiveZoomRatio } from '../../services/doc-zoom';
import { IEditorService } from '../../services/editor/editor-manager.service';

export function shouldHandleDocWheelZoom(
    event: Pick<IWheelEvent, 'ctrlKey' | 'metaKey'>,
    focusingDoc: boolean,
    _documentFlavor?: DocumentFlavor
): boolean {
    return focusingDoc && (event.ctrlKey || event.metaKey);
}

export class DocZoomRenderController extends Disposable implements IRenderModule {
    private _isSheetEditor = false;
    private _initTimer: number;
    private _updateTimer: number;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IContextService private readonly _contextService: IContextService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @Inject(DocViewScaleService) private readonly _docViewScaleService: DocViewScaleService,
        @Optional(IDocEmbedInteractionBoundaryService) private readonly _embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService
    ) {
        super();

        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._isSheetEditor = this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const sheetRenderer = currentSheet && this._renderManagerService.getRenderById(currentSheet.getUnitId());
        // TODO: do not use setTimeout.
        this._initTimer = window.setTimeout(() => {
            const zoomRatio = sheetRenderer && this._isSheetEditor
                ? sheetRenderer.scene.scaleX
                : getDocEffectiveZoomRatio(this._context.unit);

            this.updateViewZoom(zoomRatio, true);
        }, 20);

        if (!isInternalEditorID(this._context.unitId)) {
            this._initZoomEventListener();
        }
    }

    override dispose() {
        window.clearTimeout(this._initTimer);
        window.clearTimeout(this._updateTimer);
    }

    private _initSkeletonListener() {
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const documentModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
            if (!documentModel) return;

            this._updateTimer = window.setTimeout(() => {
                const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const sheetRenderer = currentSheet && this._renderManagerService.getRenderUnitById(currentSheet.getUnitId());
                const zoomRatio = !this._isSheetEditor ? getDocEffectiveZoomRatio(documentModel) : sheetRenderer?.scene.scaleX || 1;

                this.updateViewZoom(zoomRatio, false);
            });
        }));
    }

    private _initCommandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id) && (command.params as ISetDocZoomRatioOperationParams).unitId === this._context.unitId) {
                const documentModel = this._context.unit;
                const zoomRatio = getDocEffectiveZoomRatio(documentModel);
                this.updateViewZoom(zoomRatio);
            }
        }));

        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                const shouldResetZoom = command.id === SwitchDocModeCommand.id ||
                    (command.id === DocPageSetupCommand.id && (command.params as IDocPageSetupCommandParams | undefined)?.documentFlavor === DocumentFlavor.MODERN);

                if (shouldResetZoom) {
                    this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                        zoomRatio: DEFAULT_MODERN_DOC_ZOOM_RATIO,
                        documentId: this._context.unitId,
                    });
                }
            })
        );
    }

    updateViewZoom(zoomRatio: number, needRefreshSelection = true) {
        const docObject = neoGetDocObject(this._context);
        const viewScale = this._docViewScaleService.getViewScale(zoomRatio);
        docObject.scene.scale(viewScale, viewScale);

        if (!this._editorService.isEditor(this._context.unitId)) {
            this._docPageLayoutService.calculatePagePosition();
        }

        if (
            needRefreshSelection &&
            !this._editorService.isEditor(this._context.unitId) &&
            !this._embedInteractionBoundaryService?.hasRecentInteraction()
        ) {
            this._textSelectionManagerService.refreshSelection();
        }

        if (!isInternalEditorID(this._context.unitId)) {
            docObject.scene.getTransformer()?.clearSelectedObjects();
        }

        const createOptions = this._univerInstanceService.getUnitCreateOptions(this._context.unitId);
        if (createOptions?.embeddedRender === true || createOptions?.skipAutoRender === true) {
            this._context.scene.makeDirty();
            this._context.scene.render();
        }
    }

    private _initZoomEventListener() {
        const scene = this._context.scene;

        this.disposeWithMe(
            // hold ctrl & mousewheel ---> zoom
            scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                const documentModel = this._univerInstanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
                if (!documentModel) {
                    return;
                }

                const { documentFlavor } = documentModel.getSnapshot().documentStyle;
                if (!shouldHandleDocWheelZoom(e, Boolean(this._contextService.getContextValue(FOCUSING_DOC)), documentFlavor)) {
                    return;
                }

                const currentRatio = getDocEffectiveZoomRatio(documentModel);
                const nextRatio = getNextWheelZoomRatio(currentRatio, e);

                this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                    zoomRatio: nextRatio,
                    documentId: documentModel.getUnitId(),
                });

                e.preventDefault();
            })
        );
    }
}
