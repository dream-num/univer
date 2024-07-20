/**
 * Copyright 2023-present DreamNum Inc.
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
import {
    Disposable,
    ICommandService,
    Inject,
    IUniverInstanceService,
} from '@univerjs/core';
import { DocSkeletonManagerService, neoGetDocObject, SetDocZoomRatioCommand, SetDocZoomRatioOperation, TextSelectionManagerService } from '@univerjs/docs';
import type { IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import { IEditorService } from '@univerjs/ui';
import { DocPageLayoutService } from '../../services/doc-page-layout.service';

interface ISetDocMutationParams {
    unitId: string;
}

export class DocZoomRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(TextSelectionManagerService) private readonly _textSelectionManagerService: TextSelectionManagerService,
        @IEditorService private readonly _editorService: IEditorService,
        @Inject(DocPageLayoutService) private readonly _docPageLayoutService: DocPageLayoutService
    ) {
        super();

        this._init();
    }

    private _init() {
        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._initRenderRefresher();

        setTimeout(() => this.updateViewZoom(1, true), 20);
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
                if (!e.ctrlKey) {
                    return;
                }

                const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
                if (!documentModel) {
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
            if (updateCommandList.includes(command.id)) {
                const documentModel = this._univerInstanceService.getCurrentUniverDocInstance();
                if (!documentModel) return;

                const params = command.params;
                const { unitId } = params as ISetDocMutationParams;
                if (!(unitId === documentModel.getUnitId())) {
                    return;
                }

                const zoomRatio = documentModel.zoomRatio || 1;

                this.updateViewZoom(zoomRatio);
            }
        }));
    }

    updateViewZoom(zoomRatio: number, needRefreshSelection = true) {
        const docObject = neoGetDocObject(this._context);
        docObject.scene.scale(zoomRatio, zoomRatio);

        this._docPageLayoutService.calculatePagePosition();

        if (needRefreshSelection) {
            this._textSelectionManagerService.refreshSelection();
        }

        docObject.scene.getTransformer()?.clearSelectedObjects();
    }
}
