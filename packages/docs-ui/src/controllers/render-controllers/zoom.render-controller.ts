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

import type { DocumentDataModel, ICommandInfo } from '@univerjs/core';
import type { IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';

import type { ISetDocZoomRatioOperationParams } from '../../commands/operations/set-doc-zoom-ratio.operation';
import {
    Disposable,
    DocumentFlavor,
    FOCUSING_DOC,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { neoGetDocObject } from '../../basics/component-tools';
import { SetDocZoomRatioCommand } from '../../commands/commands/set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../../commands/commands/switch-doc-mode.command';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';
import { IEditorService } from '../../services/editor/editor-manager.service';

export class DocZoomRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IContextService private readonly _contextService: IContextService,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(DocSelectionManagerService) private readonly _textSelectionManagerService: DocSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService
    ) {
        super();

        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._initRenderRefresher();

        // TODO: do not use setTimeout.
        setTimeout(() => this.updateViewZoom(1, true), 20);

        if (!isInternalEditorID(this._context.unitId)) {
            this._initZoomEventListener();
        }
    }

    private _initRenderRefresher() {
        this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const { unitId, scene } = this._context;
            if (this._editorService.isEditor(unitId)) {
                return;
            }

            this.disposeWithMe(scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                if (!e.ctrlKey || !this._contextService.getContextValue(FOCUSING_DOC)) {
                    return;
                }

                const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
                if (!documentModel) {
                    return;
                }

                const { documentFlavor } = documentModel.getSnapshot().documentStyle;

                // Modern document does not support zooming.
                if (documentFlavor === DocumentFlavor.MODERN) {
                    return;
                }

                const deltaFactor = Math.abs(e.deltaX);
                let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                ratioDelta *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    ratioDelta /= 2;
                }

                const currentRatio = documentModel.zoomRatio;

                let nextRatio = +Number.parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
                nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

                this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                    zoomRatio: nextRatio,
                    unitId: documentModel.getUnitId(),
                });

                e.preventDefault();
            }));
        });
    }

    private _initSkeletonListener() {
        this.disposeWithMe(this._docSkeletonManagerService.currentSkeleton$.subscribe((param) => {
            if (param == null) {
                return;
            }

            const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
            if (!documentModel) return;

            const zoomRatio = documentModel.zoomRatio || 1;

            this.updateViewZoom(zoomRatio, false);
        }));
    }

    private _initCommandExecutedListener() {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id) && (command.params as ISetDocZoomRatioOperationParams).unitId === this._context.unitId) {
                const documentModel = this._context.unit;
                const zoomRatio = documentModel.zoomRatio || 1;
                this.updateViewZoom(zoomRatio);
            }
        }));

        this.disposeWithMe(
            this._commandService.beforeCommandExecuted((command: ICommandInfo) => {
                if (command.id === SwitchDocModeCommand.id) {
                    this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                        zoomRatio: 1,
                        unitId: this._context.unitId,
                    });
                }
            })
        );
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

        docObject.scene.getTransformer()?.clearSelectedObjects();
    }

    private _initZoomEventListener() {
        const scene = this._context.scene;

        this.disposeWithMe(
            // hold ctrl & mousewheel ---> zoom
            scene.onMouseWheel$.subscribeEvent((e: IWheelEvent) => {
                if (!e.ctrlKey) {
                    return;
                }

                const deltaFactor = Math.abs(e.deltaX);
                let ratioDelta = deltaFactor < 40 ? 0.2 : deltaFactor < 80 ? 0.4 : 0.2;
                ratioDelta *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    ratioDelta /= 2;
                }

                const currentRatio = this._context.unit.zoomRatio;
                let nextRatio = +Number.parseFloat(`${currentRatio + ratioDelta}`).toFixed(1);
                nextRatio = nextRatio >= 4 ? 4 : nextRatio <= 0.1 ? 0.1 : nextRatio;

                this._commandService.executeCommand(SetDocZoomRatioCommand.id, {
                    zoomRatio: Math.round(nextRatio * 10) / 10,
                    documentId: this._context.unitId,
                });

                e.preventDefault();
            })
        );
    }
}
