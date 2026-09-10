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

import type { DocumentDataModel } from '@univerjs/core';
import type { Documents, IPoint, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { ColorKit, generateRandomId, Inject, IUniverInstanceService, RxDisposable, ThemeService, UniverInstanceType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { findTableOfContentsAtOffset } from '@univerjs/docs-toc';
import { NodePositionConvertToCursor, TEXT_RANGE_LAYER_INDEX } from '@univerjs/docs-ui';
import { Rect, RegularPolygon } from '@univerjs/engine-render';
import { takeUntil } from 'rxjs';

const RANGE_PADDING = 4;

export class TableOfContentsHighlightRenderController extends RxDisposable implements IRenderModule {
    private _range: RegularPolygon | null = null;
    private _outline: Rect | null = null;
    private _rangeId: string | null = null;

    constructor(
        private readonly _context: IRenderContext<DocumentDataModel>,
        @IUniverInstanceService private readonly _instanceService: IUniverInstanceService,
        @Inject(DocSelectionManagerService) private readonly _selectionManager: DocSelectionManagerService,
        @Inject(DocSkeletonManagerService) private readonly _skeletonManager: DocSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService
    ) {
        super();
        this._selectionManager.textSelection$.pipe(takeUntil(this.dispose$)).subscribe(() => this._update());
        this._skeletonManager.currentSkeleton$.pipe(takeUntil(this.dispose$)).subscribe(() => this._update(true));
        this._instanceService.getCurrentTypeOfUnit$<DocumentDataModel>(UniverInstanceType.UNIVER_DOC)
            .pipe(takeUntil(this.dispose$))
            .subscribe(() => this._update());
        this._update();
    }

    private _update(force = false): void {
        const currentDoc = this._instanceService.getCurrentUnitOfType<DocumentDataModel>(UniverInstanceType.UNIVER_DOC);
        const selection = this._selectionManager.getActiveTextRange();
        const toc = currentDoc?.getUnitId() === this._context.unitId && !selection?.segmentId
            ? findTableOfContentsAtOffset(this._context.unit.getBody(), selection?.startOffset)
            : undefined;
        if (!toc) {
            this._clear();
            return;
        }
        if (!force && toc.rangeId === this._rangeId) {
            return;
        }

        this._clear();
        const document = this._context.mainComponent as Documents | undefined;
        const endOffset = Math.max(toc.startIndex + 1, toc.endIndex - 1);
        if (!document) {
            return;
        }
        const primary = this._themeService.getColorFromTheme('primary.600');
        const skeleton = this._skeletonManager.getSkeleton();
        const startPosition = skeleton.findNodePositionByCharIndex(toc.startIndex + 1, true, '', -1);
        const endPosition = skeleton.findNodePositionByCharIndex(endOffset, true, '', -1);
        if (!startPosition || !endPosition) {
            return;
        }
        const offsetConfig = document.getOffsetConfig();
        const { borderBoxPointGroup } = new NodePositionConvertToCursor(offsetConfig, skeleton)
            .getRangePointData(startPosition, endPosition);
        const bounds = getPointGroupBounds(borderBoxPointGroup);
        if (!bounds) {
            return;
        }

        const range = new RegularPolygon(`__DocTocFill__${generateRandomId()}`, {
            pointsGroup: borderBoxPointGroup,
            left: offsetConfig.docsLeft,
            top: offsetConfig.docsTop,
            fill: new ColorKit(primary).setAlpha(0.08).toRgbString(),
            evented: false,
            debounceParentDirty: false,
        });
        const outline = new Rect(`__DocTocRange__${toc.rangeId}`, {
            left: bounds.left + offsetConfig.docsLeft - RANGE_PADDING,
            top: bounds.top + offsetConfig.docsTop - RANGE_PADDING,
            width: bounds.width + RANGE_PADDING * 2,
            height: bounds.height + RANGE_PADDING * 2,
            radius: 2,
            fill: 'rgba(0, 0, 0, 0)',
            stroke: new ColorKit(primary).setAlpha(0.8).toRgbString(),
            strokeWidth: 1,
            evented: false,
            debounceParentDirty: false,
        });
        this._context.scene.addObject(range, TEXT_RANGE_LAYER_INDEX);
        this._context.scene.addObject(outline, TEXT_RANGE_LAYER_INDEX);
        this._range = range;
        this._outline = outline;
        this._rangeId = toc.rangeId;
        this._context.scene.makeDirty();
    }

    private _clear(): void {
        if (!this._range && !this._outline) {
            this._rangeId = null;
            return;
        }
        this._range?.dispose();
        this._outline?.dispose();
        this._range = null;
        this._outline = null;
        this._rangeId = null;
        this._context.scene.makeDirty();
    }

    override dispose(): void {
        this._clear();
        super.dispose();
    }
}

function getPointGroupBounds(pointsGroup: IPoint[][]): { left: number; top: number; width: number; height: number } | null {
    const points = pointsGroup.flat();
    if (!points.length) {
        return null;
    }
    const left = Math.min(...points.map((point) => point.x));
    const top = Math.min(...points.map((point) => point.y));
    const right = Math.max(...points.map((point) => point.x));
    const bottom = Math.max(...points.map((point) => point.y));
    return { left, top, width: right - left, height: bottom - top };
}
