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
import { IEditorService } from '../../services/editor/editor-manager.service';

export function shouldHandleDocWheelZoom(
    event: Pick<IWheelEvent, 'ctrlKey' | 'metaKey'>,
    focusingDoc: boolean,
    _documentFlavor?: DocumentFlavor
): boolean {
    return focusingDoc && (event.ctrlKey || event.metaKey);
}

export function getDefaultDocZoomRatio(documentFlavor?: DocumentFlavor): number {
    return documentFlavor === DocumentFlavor.MODERN ? 1.2 : 1;
}

export function getRuntimeDocZoomRatio(savedZoomRatio?: number, documentFlavor?: DocumentFlavor): number {
    return savedZoomRatio ?? getDefaultDocZoomRatio(documentFlavor);
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
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._isSheetEditor = this._context.unitId === DOCS_NORMAL_EDITOR_UNIT_ID_KEY;
        const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
        const sheetRenderer = currentSheet && this._renderManagerService.getRenderById(currentSheet.getUnitId());
        // TODO: do not use setTimeout.
        this._initTimer = window.setTimeout(() => {
            const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
            const zoomRatio = sheetRenderer && this._isSheetEditor
                ? sheetRenderer.scene.scaleX
                : documentModel
                    ? this._getRuntimeZoomRatio(documentModel)
                    : 1;
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

            const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
            if (!documentModel) return;

            this._updateTimer = window.setTimeout(() => {
                const currentSheet = this._univerInstanceService.getCurrentUnitOfType<Workbook>(UniverInstanceType.UNIVER_SHEET);
                const sheetRenderer = currentSheet && this._renderManagerService.getRenderById(currentSheet.getUnitId());
                const zoomRatio = !this._isSheetEditor
                    ? this._getRuntimeZoomRatio(documentModel)
                    : sheetRenderer?.scene.scaleX || 1;

                this.updateViewZoom(zoomRatio, false);
            });
        }));
    }

    private _initCommandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id, SwitchDocModeCommand.id, DocPageSetupCommand.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (!updateCommandList.includes(command.id)) {
                return;
            }

            const unitId = (command.params as { unitId?: string; documentId?: string } | undefined)?.unitId
                ?? (command.params as { unitId?: string; documentId?: string } | undefined)?.documentId
                ?? this._context.unitId;

            if (unitId !== this._context.unitId) {
                return;
            }

            const documentModel = this._context.unit;

            if (command.id === SetDocZoomRatioOperation.id) {
                const zoomRatio = documentModel.zoomRatio || 1;
                this.updateViewZoom(zoomRatio);
                return;
            }

            if (documentModel.getSettings()?.zoomRatio != null) {
                return;
            }

            this.updateViewZoom(this._getRuntimeZoomRatio(documentModel));
        }));
    }

    updateViewZoom(zoomRatio: number, needRefreshSelection = true) {
        const docObject = neoGetDocObject(this._context);
        docObject.scene.scale(zoomRatio, zoomRatio);

        if (!this._editorService.isEditor(this._context.unitId)) {
            this._docPageLayoutService.calculatePagePosition();
        }

        if (needRefreshSelection && !this._editorService.isEditor(this._context.unitId)) {
            this._textSelectionManagerService.refreshSelection();
        }

        if (isInternalEditorID(this._context.unitId)) {
            return;
        }
        docObject.scene.getTransformer()?.clearSelectedObjects();
    }

    private _initZoomEventListener() {
        const scene = this._context.scene;

        this.disposeWithMe(
            // hold ctrl & mousewheel ---> zoom
            scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
                if (!documentModel) {
                    return;
                }

                const { documentFlavor } = documentModel.getSnapshot().documentStyle;
                if (!shouldHandleDocWheelZoom(e, Boolean(this._contextService.getContextValue(FOCUSING_DOC)), documentFlavor)) {
                    return;
                }

                const currentRatio = this._getRuntimeZoomRatio(documentModel);
                const nextRatio = getNextWheelZoomRatio(currentRatio, e);

                this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                    zoomRatio: nextRatio,
                    documentId: documentModel.getUnitId(),
                });

                e.preventDefault();
            })
        );
    }

    private _getRuntimeZoomRatio(documentModel: DocumentDataModel): number {
        return getRuntimeDocZoomRatio(
            documentModel.getSettings()?.zoomRatio,
            documentModel.getSnapshot().documentStyle?.documentFlavor
        );
    }
}
