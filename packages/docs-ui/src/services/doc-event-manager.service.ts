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

import type { DocumentDataModel, ICustomRange, IParagraph, ITextRangeParam } from '@univerjs/core';
import { Disposable, fromEventSubject, Inject } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import type { Documents, DocumentSkeleton, IBoundRectNoAngle, IMouseEvent, IPointerEvent, IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { getLineBounding, NodePositionConvertToCursor, pxToNum, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { distinctUntilChanged, filter, Subject, throttleTime } from 'rxjs';
import { transformOffset2Bound } from './doc-popup-manager.service';

interface ICustomRangeBound {
    customRange: ICustomRange;
    rects: IBoundRectNoAngle[];
    segmentId?: string;
    segmentPageIndex: number;
}

interface IBulletBound {
    rect: IBoundRectNoAngle;
    segmentId?: string;
    segmentPageIndex: number;
    paragraph: IParagraph;
}

const calcDocRangePositions = (range: ITextRangeParam, documents: Documents, skeleton: DocumentSkeleton, pageIndex: number): IBoundRectNoAngle[] | undefined => {
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, true, range.segmentId, pageIndex);
    const endPosition = skeleton.findNodePositionByCharIndex(range.endOffset, true, range.segmentId, pageIndex);
    // console.log('===startPosition', range, startPosition, endPosition);
    if (!endPosition || !startPosition) {
        return;
    }

    const documentOffsetConfig = documents.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);

    return bounds;
};

export class DocEventManagerService extends Disposable implements IRenderModule {
    private _hoverCustomRanges$ = new Subject<{ range: ICustomRange; segmentId?: string }[]>();
    readonly hoverCustomRanges$ = this._hoverCustomRanges$.pipe(distinctUntilChanged((pre, aft) => pre.length === aft.length && pre.every((item, i) => aft[i].range.rangeId === item.range.rangeId && aft[i].segmentId === item.segmentId)));

    private _clickCustomRanges$ = new Subject<{ range: ICustomRange; segmentId?: string }>();
    readonly clickCustomRanges$ = this._clickCustomRanges$.asObservable();

    private _customRangeDirty = true;
    private _bulletDirty = true;

    /**
     * cache the bounding of custom ranges,
     * it will be updated when the doc-skeleton is recalculated
     */
    private _customRangeBounds: ICustomRangeBound[] = [];
    /**
     * cache the bounding of bullets,
     * it will be updated when the doc-skeleton is recalculated
     */
    private _bulletBounds: IBulletBound[] = [];

    private get _skeleton() {
        return this._docSkeletonManagerService.getSkeleton();
    }

    private get _documents() {
        return this._context.mainComponent as Documents;
    }

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService
    ) {
        super();

        this._initResetDirty();
        this._initCustomRanges();
    }

    private _initResetDirty() {
        this.disposeWithMe(this._skeleton.dirty$.subscribe(() => {
            this._customRangeDirty = true;
            this._bulletDirty = true;
        }));

        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize)
            ).subscribe(() => {
                this._customRangeDirty = true;
                this._bulletDirty = true;
            })
        );
    }

    private _initCustomRanges() {
        this.disposeWithMe(fromEventSubject(this._context.scene.onPointerMove$).pipe(throttleTime(16)).subscribe((evt) => {
            this._hoverCustomRanges$.next(
                this._calcActiveRanges(evt)
            );
        }));

        this.disposeWithMe(this._context.scene.onPointerUp$.subscribeEvent((evt) => {
            const ranges = this._calcActiveRanges(evt);
            if (ranges.length) {
                this._clickCustomRanges$.next(ranges.pop()!);
            }
        }));
    }

    private _buildCustomRangeBoundsBySegment(segmentId?: string) {
        const customRanges = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges ?? [];
        const layouts: ICustomRangeBound[] = [];

        customRanges.forEach((range) => {
            const textRange: ITextRangeParam = {
                startOffset: range.startIndex,
                endOffset: range.endIndex,
                collapsed: false,
                segmentId,
            };

            const calcRect = (pageIndex: number) => {
                const rects = calcDocRangePositions(textRange, this._documents, this._skeleton, pageIndex);
                if (!rects) {
                    return null;
                }
                const documentOffsetConfig = this._documents.getOffsetConfig();

                layouts.push({
                    customRange: range,
                    rects: rects.map((rect) => ({
                        top: rect.top + documentOffsetConfig.docsTop,
                        bottom: rect.bottom + documentOffsetConfig.docsTop,
                        left: rect.left + documentOffsetConfig.docsLeft,
                        right: rect.right + documentOffsetConfig.docsLeft,
                    })),
                    segmentId,
                    segmentPageIndex: pageIndex,
                });
            };

            if (segmentId) {
                const pageSize = (this._skeleton.getSkeletonData()?.pages.length ?? 0);
                for (let i = 0; i < pageSize; i++) {
                    calcRect(i);
                }
            } else {
                calcRect(-1);
            }
        });

        return layouts;
    }

    private _buildCustomRangeBounds() {
        if (!this._customRangeDirty) {
            return;
        }
        this._customRangeDirty = false;

        const headerKeys = Array.from(this._context.unit.headerModelMap.keys());
        const footerKeys = Array.from(this._context.unit.footerModelMap.keys());

        this._customRangeBounds = [
            ...this._buildCustomRangeBoundsBySegment(),
            ...(headerKeys.map((key) => this._buildCustomRangeBoundsBySegment(key)).flat()),
            ...(footerKeys.map((key) => this._buildCustomRangeBoundsBySegment(key)).flat()),
        ];
    }

    private _calcActiveRanges(evt: IPointerEvent | IMouseEvent) {
        this._buildCustomRangeBounds();

        const { offsetX, offsetY } = evt;
        const { x, y } = transformOffset2Bound(offsetX, offsetY, this._context.scene);
        const matchedRanges = this._customRangeBounds.filter((layout) => {
            return layout.rects.some((rect) => {
                const { left, right, top, bottom } = rect;
                if (x >= left && x <= right && y >= top && y <= bottom) {
                    return true;
                }
                return false;
            });
        });

        return matchedRanges.map(
            (range) => ({
                segmentId: range.segmentId,
                range: range.customRange,
            })
        );
    }
}
