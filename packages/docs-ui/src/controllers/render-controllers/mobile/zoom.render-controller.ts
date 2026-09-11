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
import type { IRenderContext } from '@univerjs/engine-render';
import type { IDocPageSetupCommandParams } from '../../../commands/commands/doc-page-setup.command';
import type { ISetDocZoomRatioOperationParams } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import {
    DocumentFlavor,
    ICommandService,
    IContextService,
    Inject,
    isInternalEditorID,
    IUniverInstanceService,
    Optional,
} from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '../../../basics/docs-view-key';
import { DocPageSetupCommand } from '../../../commands/commands/doc-page-setup.command';
import { SetDocZoomRatioCommand } from '../../../commands/commands/set-doc-zoom-ratio.command';
import { SwitchDocModeCommand } from '../../../commands/commands/switch-doc-mode.command';
import { SetDocZoomRatioOperation } from '../../../commands/operations/set-doc-zoom-ratio.operation';
import { MOBILE_DOC_PINCH_ZOOMING } from '../../../consts/mobile-context';
import { IDocEmbedInteractionBoundaryService } from '../../../services/doc-embed-integration.service';
import { DocPageLayoutService } from '../../../services/doc-page-layout.service';
import { DocViewScaleService } from '../../../services/doc-view-scale';
import { DEFAULT_MODERN_DOC_ZOOM_RATIO, getDocEffectiveZoomRatio } from '../../../services/doc-zoom';
import { IEditorService } from '../../../services/editor/editor-manager.service';
import { DocZoomRenderController } from '../zoom.render-controller';
import { MobileDocPinchZoomGesture } from './doc-pinch-zoom';

export class MobileDocZoomRenderController extends DocZoomRenderController {
    constructor(
        context: IRenderContext<DocumentDataModel>,
        @IContextService contextService: IContextService,
        @Inject(DocSkeletonManagerService) docSkeletonManagerService: DocSkeletonManagerService,
        @IUniverInstanceService univerInstanceService: IUniverInstanceService,
        @ICommandService commandService: ICommandService,
        @Inject(DocSelectionManagerService) textSelectionManagerService: DocSelectionManagerService,
        @IEditorService editorService: IEditorService,
        @Inject(DocPageLayoutService) docPageLayoutService: DocPageLayoutService,
        @IRenderManagerService renderManagerService: IRenderManagerService,
        @Inject(DocViewScaleService) docViewScaleService: DocViewScaleService,
        @Optional(IDocEmbedInteractionBoundaryService) embedInteractionBoundaryService?: IDocEmbedInteractionBoundaryService
    ) {
        super(
            context,
            contextService,
            docSkeletonManagerService,
            univerInstanceService,
            commandService,
            textSelectionManagerService,
            editorService,
            docPageLayoutService,
            renderManagerService,
            docViewScaleService,
            embedInteractionBoundaryService
        );

        if (!isInternalEditorID(context.unitId)) {
            this._initGestureZoom();
        }
    }

    protected override _initCommandExecutedListener(): void {
        const updateCommandList = [SetDocZoomRatioOperation.id];

        this.disposeWithMe(this._commandService.onCommandExecuted((command: ICommandInfo) => {
            if (updateCommandList.includes(command.id) && (command.params as ISetDocZoomRatioOperationParams).unitId === this._context.unitId) {
                const zoomRatio = getDocEffectiveZoomRatio(this._context.unit);
                this.updateViewZoom(
                    zoomRatio,
                    !this._contextService.getContextValue(MOBILE_DOC_PINCH_ZOOMING)
                );
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

    private _initGestureZoom(): void {
        if (
            this._context.unit.getSnapshot().documentStyle.documentFlavor !== DocumentFlavor.TRADITIONAL
        ) {
            return;
        }

        const scene = this._context.scene;
        const engine = scene.getEngine();
        const canvasElement = engine?.getCanvasElement();
        const viewport = scene.getViewport(VIEWPORT_KEY.VIEW_MAIN);
        if (engine == null || canvasElement == null || viewport == null) {
            return;
        }

        this.disposeWithMe(new MobileDocPinchZoomGesture({
            canvasElement,
            commandService: this._commandService,
            contextService: this._contextService,
            docViewScaleService: this._docViewScaleService,
            engine,
            scene,
            textSelectionManagerService: this._textSelectionManagerService,
            unitId: this._context.unitId,
            viewport,
        }));
    }
}
