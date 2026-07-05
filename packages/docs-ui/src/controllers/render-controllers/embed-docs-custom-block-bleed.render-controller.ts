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
import { Disposable, ICommandService, Inject, IUniverInstanceService, Optional, toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedModelService, getResourceRefInputUnitSelector } from '@univerjs/embed';
import { EmbedContentSizeRegistryService } from '@univerjs/embed-ui';
import { setDocsCustomBlockRenderViewportProvider } from '@univerjs/engine-render';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { SetDocZoomRatioOperation } from '../../commands/operations/set-doc-zoom-ratio.operation';
import { collectDocsTableLikeEmbedChildUnitIds, createDocsCustomBlockSizeRefreshScheduler, shouldRefreshDocsCustomBlockSizeForCommand } from '../../embed-docs-custom-block-refresh';
import { resolveDocsCustomBlockRenderViewport, resolveDocsCustomBlockSize } from '../../embed-host-anchor';

export class EmbedDocsCustomBlockBleedRenderController extends Disposable implements IRenderModule {
    private readonly _resolvedChildUnits = new Map<string, unknown>();
    private readonly _pendingChildUnits = new Map<string, Promise<unknown>>();

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @Inject(IUniverInstanceService) private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(ICommandService) private readonly _commandService: ICommandService,
        @Optional(EmbedContentSizeRegistryService) private readonly _contentSizeRegistry?: EmbedContentSizeRegistryService,
        @Optional(EmbedModelService) private readonly _embedModelService?: EmbedModelService
    ) {
        super();

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
        this.disposeWithMe({
            dispose: () => {
                this._resolvedChildUnits.clear();
                this._pendingChildUnits.clear();
            },
        });
        const sheetUnitAddedSubscription = this._univerInstanceService.getTypeOfUnitAdded$(UniverInstanceType.UNIVER_SHEET).subscribe(() => {
            refreshScheduler.schedule();
        });
        const baseUnitAddedSubscription = this._univerInstanceService.getTypeOfUnitAdded$(UniverInstanceType.UNIVER_BASE).subscribe(() => {
            refreshScheduler.schedule();
        });
        this.disposeWithMe(toDisposable(() => sheetUnitAddedSubscription.unsubscribe()));
        this.disposeWithMe(toDisposable(() => baseUnitAddedSubscription.unsubscribe()));

        const unregisterRenderViewportProvider = setDocsCustomBlockRenderViewportProvider((unitId, blockId, input) => {
            if (unitId !== this._context.unitId) {
                return null;
            }

            const drawing = this._context.unit.getSnapshot().drawings?.[blockId] as Nullable<{
                data?: { childType?: UniverInstanceType; childUnitId?: string; embedId?: string };
            }>;
            const drawingData = drawing?.data;
            const childType = drawingData?.childType;
            if (childType !== UniverInstanceType.UNIVER_SHEET && childType !== UniverInstanceType.UNIVER_BASE) {
                return null;
            }

            const visibleCanvas = this._getVisibleCanvasDocumentRect();
            const childUnitId = this._resolveChildUnitId(drawingData, childType);
            const childUnit = childUnitId
                ? this._getChildUnitForMeasurement(childUnitId, childType, refreshScheduler.schedule)
                : undefined;
            const contentSize = childUnitId && childUnit != null
                ? this._contentSizeRegistry?.measureContentSize({
                    childType,
                    childUnit,
                    childUnitId,
                    viewportWidth: input.fallbackWidth,
                })
                : undefined;
            const fallbackSize = resolveDocsCustomBlockSize(childType);
            const fallbackHeight = normalizeFallbackSize(input.fallbackHeight, fallbackSize.height);
            const fallbackWidth = normalizeFallbackSize(input.fallbackWidth, fallbackSize.width);

            return resolveDocsCustomBlockRenderViewport({
                childType,
                contentHeight: contentSize?.height ?? fallbackHeight,
                contentWidth: contentSize?.width,
                docsLeft: this._getDocsLeft(),
                documentFlavor: this._context.unit.getSnapshot().documentStyle?.documentFlavor,
                fallbackHeight,
                fallbackWidth,
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
            dispose: unregisterRenderViewportProvider,
        });

        this.disposeWithMe(this._commandService.onCommandExecuted((command) => {
            if (command.id === SetDocZoomRatioOperation.id) {
                return;
            }

            const childUnitIds = collectDocsTableLikeEmbedChildUnitIds(
                this._context.unit.getSnapshot().drawings,
                (data) => this._resolveChildUnitId(data)
            );
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

    private _resolveChildUnitId(data: unknown, expectedChildType?: UniverInstanceType): string | undefined {
        if (!data || typeof data !== 'object') {
            return undefined;
        }

        const drawingData = data as { childType?: unknown; childUnitId?: unknown; embedId?: unknown; hostUnitId?: unknown };
        const childType = typeof drawingData.childType === 'number' ? drawingData.childType as UniverInstanceType : expectedChildType;
        if (childType !== UniverInstanceType.UNIVER_SHEET && childType !== UniverInstanceType.UNIVER_BASE) {
            return undefined;
        }

        if (typeof drawingData.childUnitId === 'string') {
            return drawingData.childUnitId;
        }

        if (typeof drawingData.embedId !== 'string') {
            return undefined;
        }

        const hostUnitId = typeof drawingData.hostUnitId === 'string' ? drawingData.hostUnitId : this._context.unitId;
        const descriptor = this._embedModelService?.getDescriptor(hostUnitId, drawingData.embedId);
        if (descriptor?.childType !== childType) {
            return undefined;
        }

        if (typeof descriptor.childUnitId === 'string') {
            return descriptor.childUnitId;
        }

        try {
            return getResourceRefInputUnitSelector(descriptor.source.ref);
        } catch {
            return undefined;
        }
    }

    private _getChildUnitForMeasurement(childUnitId: string, childType: UniverInstanceType, scheduleRefresh: () => void): unknown {
        const cacheKey = `${childType}:${childUnitId}`;
        if (this._resolvedChildUnits.has(cacheKey)) {
            return this._resolvedChildUnits.get(cacheKey);
        }

        const unitOrPromise = this._univerInstanceService.getUnit(childUnitId, childType) as unknown;
        if (unitOrPromise == null) {
            return undefined;
        }
        if (!isPromiseLike(unitOrPromise)) {
            this._resolvedChildUnits.set(cacheKey, unitOrPromise);
            return unitOrPromise;
        }

        if (!this._pendingChildUnits.has(cacheKey)) {
            const pending = Promise.resolve(unitOrPromise).then((unit) => {
                this._pendingChildUnits.delete(cacheKey);
                this._resolvedChildUnits.set(cacheKey, unit);
                if (!this._disposed) {
                    scheduleRefresh();
                }
                return unit;
            }, () => {
                this._pendingChildUnits.delete(cacheKey);
                return undefined;
            });
            this._pendingChildUnits.set(cacheKey, pending);
        }

        return undefined;
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

function isPromiseLike(value: unknown): value is PromiseLike<unknown> {
    return !!value && typeof (value as PromiseLike<unknown>).then === 'function';
}

function normalizeFallbackSize(value: unknown, fallback: number): number {
    return typeof value === 'number' && Number.isFinite(value) && value > 1 ? value : fallback;
}
