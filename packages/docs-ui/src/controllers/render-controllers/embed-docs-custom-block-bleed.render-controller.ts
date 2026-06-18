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

import type { DocumentDataModel, Nullable } from '@univerjs/core';
import type { IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, ICommandService, Inject, IUniverInstanceService, Optional, UniverInstanceType } from '@univerjs/core';
import { EmbedContentSizeRegistryService } from '@univerjs/embed-ui';
import { setDocsCustomBlockRenderViewportProvider } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { collectDocsTableLikeEmbedChildUnitIds, createDocsCustomBlockSizeRefreshScheduler, shouldRefreshDocsCustomBlockSizeForCommand } from '../../embed-docs-custom-block-refresh';
import { resolveDocsCustomBlockRenderViewport } from '../../embed-host-anchor';

export class EmbedDocsCustomBlockBleedRenderController extends Disposable implements IRenderModule {
    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Optional(EmbedContentSizeRegistryService) private readonly _contentSizeRegistry?: EmbedContentSizeRegistryService
    ) {
        super();

        setDocsCustomBlockRenderViewportProvider((unitId, blockId, input) => {
            if (unitId !== this._context.unitId) {
                return null;
            }

            const drawing = this._context.unit.getSnapshot().drawings?.[blockId] as Nullable<{
                data?: { childType?: UniverInstanceType; childUnitId?: string };
            }>;
            const childType = drawing?.data?.childType;
            if (childType !== UniverInstanceType.UNIVER_SHEET && childType !== UniverInstanceType.UNIVER_BASE) {
                return null;
            }

            const visibleCanvas = this._getVisibleCanvasDocumentRect();
            const childUnit = drawing?.data?.childUnitId
                ? this._univerInstanceService.getUnit(drawing.data.childUnitId, childType)
                : undefined;
            const contentSize = drawing?.data?.childUnitId
                ? this._contentSizeRegistry?.measureContentSize({
                    childType,
                    childUnit,
                    childUnitId: drawing.data.childUnitId,
                    viewportWidth: input.fallbackWidth,
                })
                : undefined;

            return resolveDocsCustomBlockRenderViewport({
                childType,
                contentHeight: contentSize?.height ?? input.fallbackHeight,
                contentWidth: contentSize?.width,
                docsLeft: this._getDocsLeft(),
                documentFlavor: this._context.unit.getSnapshot().documentStyle?.documentFlavor,
                fallbackHeight: input.fallbackHeight,
                fallbackWidth: input.fallbackWidth,
                pageMarginLeft: input.pageMarginLeft,
                pageMarginRight: input.pageMarginRight,
                pageWidth: input.pageWidth,
                scale: this._context.scene.getAncestorScale().scaleX || 1,
                visibleCanvasHeight: visibleCanvas?.height,
                visibleCanvasLeft: visibleCanvas?.left,
                visibleCanvasWidth: visibleCanvas?.width,
            });
        });

        this.disposeWithMe({
            dispose: () => setDocsCustomBlockRenderViewportProvider(null),
        });

        const refreshScheduler = createDocsCustomBlockSizeRefreshScheduler(() => {
            const zoomRatio = this._context.unit.zoomRatio;
            if (typeof zoomRatio !== 'number') {
                return;
            }

            this._commandService.syncExecuteCommand(SetDocZoomRatioOperation.id, {
                unitId: this._context.unitId,
                zoomRatio,
            });
        });
        this.disposeWithMe(refreshScheduler);

        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (command.id === SetDocZoomRatioOperation.id) {
                return;
            }

            const childUnitIds = collectDocsTableLikeEmbedChildUnitIds(this._context.unit.getSnapshot().drawings);
            if (!shouldRefreshDocsCustomBlockSizeForCommand({
                childUnitIds,
                commandParams: command.params,
                hostUnitId: this._context.unitId,
            })) {
                return;
            }

            refreshScheduler.schedule();
        }));
    }

    private _getDocsLeft(): number {
        return (this._context.mainComponent as Nullable<{ getOffsetConfig?: () => { docsLeft?: number } }>)
            ?.getOffsetConfig?.()
            ?.docsLeft ?? 0;
    }

    private _getVisibleCanvasDocumentRect(): Nullable<{ height: number; left: number; width: number }> {
        const scaleX = this._context.scene.getAncestorScale().scaleX || 1;
        const scaleY = this._context.scene.getAncestorScale().scaleY || 1;
        const viewportLeft = this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)?.viewportScrollX ?? 0;
        const canvasRect = this._context.engine.getCanvasElement?.()?.getBoundingClientRect?.();
        const canvasWidth = canvasRect?.width;
        const canvasHeight = canvasRect?.height;
        const fallbackWidth = (this._context.mainComponent as Nullable<{ width?: number }>)?.width ?? this._context.scene.width;
        const visibleWidth = (canvasWidth ?? fallbackWidth ?? 0) / scaleX;
        const fallbackHeight = (this._context.mainComponent as Nullable<{ height?: number }>)?.height ?? this._context.scene.height;
        const visibleHeight = (canvasHeight ?? fallbackHeight ?? 0) / scaleY;

        if (!visibleWidth || !Number.isFinite(visibleWidth) || visibleWidth <= 0 || !visibleHeight || !Number.isFinite(visibleHeight) || visibleHeight <= 0) {
            return null;
        }

        return {
            height: visibleHeight,
            left: viewportLeft,
            width: visibleWidth,
        };
    }
}
