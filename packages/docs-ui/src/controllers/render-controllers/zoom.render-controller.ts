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
import type { IDocObjectParam } from '@univerjs/docs';
import { DocSkeletonManagerService, neoGetDocObject, SetDocZoomRatioCommand, SetDocZoomRatioOperation, TextSelectionManagerService, VIEWPORT_KEY } from '@univerjs/docs';
import type { IRenderContext, IRenderModule, IWheelEvent } from '@univerjs/engine-render';
import { IEditorService } from '@univerjs/ui';

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
        @IEditorService private readonly _editorService: IEditorService
    ) {
        super();

        this._init();
    }

    private _init() {
        this._initSkeletonListener();
        this._initCommandExecutedListener();
        this._initRenderRefresher();

        setTimeout(() => this._updateViewZoom(1, true), 20);
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

            this._updateViewZoom(zoomRatio, false);
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

                this._updateViewZoom(zoomRatio);
            }
        }));
    }

    private _updateViewZoom(zoomRatio: number, needRefreshSelection = true) {
        const docObject = neoGetDocObject(this._context);
        docObject.scene.scale(zoomRatio, zoomRatio);

        this._calculatePagePosition(docObject, zoomRatio);

        if (needRefreshSelection && !this._editorService.isEditor(this._context.unitId)) {
            this._textSelectionManagerService.refreshSelection();
        }

        docObject.scene.getTransformer()?.clearSelectedObjects();
    }

    private _calculatePagePosition(currentRender: IDocObjectParam, zoomRatio: number) {
        const { document: docsComponent, scene, docBackground } = currentRender;

        const parent = scene?.getParent();

        const { width: docsWidth, height: docsHeight, pageMarginLeft, pageMarginTop } = docsComponent;
        if (parent == null || docsWidth === Number.POSITIVE_INFINITY || docsHeight === Number.POSITIVE_INFINITY) {
            return;
        }
        const { width: engineWidth, height: engineHeight } = parent;
        let docsLeft = 0;
        let docsTop = 0;

        let sceneWidth = 0;

        let sceneHeight = 0;

        let scrollToX = Number.POSITIVE_INFINITY;

        if (engineWidth > (docsWidth + pageMarginLeft * 2) * zoomRatio) {
            docsLeft = engineWidth / 2 - (docsWidth * zoomRatio) / 2;
            docsLeft /= zoomRatio;
            sceneWidth = (engineWidth - pageMarginLeft * 2) / zoomRatio;

            scrollToX = 0;
        } else {
            docsLeft = pageMarginLeft;
            sceneWidth = docsWidth + pageMarginLeft * 2;

            scrollToX = (sceneWidth - engineWidth / zoomRatio) / 2;
        }

        if (engineHeight > docsHeight) {
            docsTop = engineHeight / 2 - docsHeight / 2;
            sceneHeight = (engineHeight - pageMarginTop * 2) / zoomRatio;
        } else {
            docsTop = pageMarginTop;
            sceneHeight = docsHeight + pageMarginTop * 2;
        }

        // this.docsLeft = docsLeft;

        // this.docsTop = docsTop;

        scene.resize(sceneWidth, sceneHeight + 200);

        docsComponent.translate(docsLeft, docsTop);
        docBackground.translate(docsLeft, docsTop);

        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (scrollToX !== Number.POSITIVE_INFINITY && viewport != null) {
            viewport.scrollToViewportPos({
                viewportScrollX: scrollToX,
            });
        }

        return this;
    }
}
