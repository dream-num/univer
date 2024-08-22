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

import type { DocumentDataModel, ICustomRange, IParagraph, ITextRangeParam, Nullable } from '@univerjs/core';
import { Disposable, fromEventSubject, Inject } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import type { Documents, DocumentSkeleton, IBoundRectNoAngle, IDocumentSkeletonGlyph, IMouseEvent, IPointerEvent, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { CURSOR_TYPE, getLineBounding, NodePositionConvertToCursor, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { distinctUntilChanged, filter, map, mergeMap, Subject, take, throttleTime } from 'rxjs';
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
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, false, range.segmentId, pageIndex);
    const skeletonData = skeleton.getSkeletonData();
    let end = range.endOffset;
    if (range.segmentId) {
        const root = Array.from(skeletonData?.skeFooters.get(range.segmentId)?.values() ?? [])[0] ?? Array.from(skeletonData?.skeHeaders.get(range.segmentId)?.values() ?? [])[0];
        if (root) {
            end = Math.min(root.ed, end);
        }
    }
    const endPosition = skeleton.findNodePositionByCharIndex(end, false, range.segmentId, pageIndex);
    if (!endPosition || !startPosition) {
        return;
    }

    const documentOffsetConfig = documents.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);

    return bounds.map((rect) => ({
        top: rect.top + documentOffsetConfig.docsTop,
        bottom: rect.bottom + documentOffsetConfig.docsTop,
        left: rect.left + documentOffsetConfig.docsLeft,
        right: rect.right + documentOffsetConfig.docsLeft,
    }));
};
export const calcDocGlyphPosition = (glyph: IDocumentSkeletonGlyph, documents: Documents, skeleton: DocumentSkeleton, pageIndex = -1): IBoundRectNoAngle | undefined => {
    const start = skeleton.findPositionByGlyph(glyph, pageIndex);
    if (!start) {
        return;
    }

    const documentOffsetConfig = documents.getOffsetConfig();
    const startPosition = { ...start, isBack: true };
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, startPosition);
    const bounds = getLineBounding(borderBoxPointGroup);
    const rect = bounds[0];

    return {
        top: rect.top + documentOffsetConfig.docsTop,
        bottom: rect.bottom + documentOffsetConfig.docsTop,
        left: rect.left + documentOffsetConfig.docsLeft,
        right: rect.left + documentOffsetConfig.docsLeft + glyph.width,
    };
};

interface ICustomRangeActive {
    range: ICustomRange; segmentId?: string; segmentPageIndex: number;
}

interface IBulletActive {
    paragraph: IParagraph; segmentId?: string; segmentPageIndex: number;
}

export class DocEventManagerService extends Disposable implements IRenderModule {
    private readonly _hoverCustomRanges$ = new Subject<ICustomRangeActive[]>();
    readonly hoverCustomRanges$ = this._hoverCustomRanges$.pipe(distinctUntilChanged((pre, aft) => pre.length === aft.length && pre.every((item, i) => aft[i].range.rangeId === item.range.rangeId && aft[i].segmentId === item.segmentId && aft[i].segmentPageIndex === item.segmentPageIndex)));

    private readonly _clickCustomRanges$ = new Subject<ICustomRangeActive>();
    readonly clickCustomRanges$ = this._clickCustomRanges$.asObservable();

    private readonly _hoverBullet$ = new Subject<Nullable<IBulletActive>>();
    readonly hoverBullet$ = this._hoverBullet$.pipe(distinctUntilChanged((pre, aft) => pre?.paragraph.startIndex === aft?.paragraph.startIndex && pre?.segmentId === aft?.segmentId && pre?.segmentPageIndex === aft?.segmentPageIndex));

    private readonly _clickBullet$ = new Subject<IBulletActive>();
    readonly clickBullets$ = this._clickBullet$.asObservable();

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
        this._initEvents();
        this._initPointer();
    }

    override dispose() {
        this._hoverCustomRanges$.complete();
        this._clickCustomRanges$.complete();
        super.dispose();
    }

    private _initPointer() {
        let preCursor = CURSOR_TYPE.TEXT;
        this.disposeWithMe(this.hoverCustomRanges$.subscribe((ranges) => {
            if (ranges.length) {
                preCursor = this._context.scene.getCursor();
                this._context.scene.setCursor(CURSOR_TYPE.POINTER);
            } else {
                this._context.scene.setCursor(preCursor);
            }
        }));
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

    private _initEvents() {
        this.disposeWithMe(fromEventSubject(this._context.scene.onPointerMove$).pipe(throttleTime(30)).subscribe((evt) => {
            this._hoverCustomRanges$.next(
                this._calcActiveRanges(evt)
            );
            this._hoverBullet$.next(
                this._calcActiveBullet(evt)
            );
        }));

        const onPointerDown$ = fromEventSubject(this._context.mainComponent!.onPointerDown$);
        const onPointerUp$ = fromEventSubject(this._context.scene!.onPointerUp$);
        this.disposeWithMe(onPointerDown$.pipe(
            mergeMap((down) => onPointerUp$.pipe(take(1), map((up) => ({ down, up })))),
            filter(({ down, up }) => down.target === up.target && up.timeStamp - down.timeStamp < 300)
            // filter(({ down, up }) => down.offsetX === up.offsetX && down.offsetY === up.offsetY)
        ).subscribe(({ down }) => {
            if (down.button === 2) {
                return;
            }
            const ranges = this._calcActiveRanges(down);
            if (ranges.length) {
                this._clickCustomRanges$.next(ranges.pop()!);
            }

            const bullet = this._calcActiveBullet(down);
            if (bullet) {
                this._clickBullet$.next(bullet);
            }
        }));
    }

    private _buildCustomRangeBoundsBySegment(segmentId?: string, segmentPage = -1) {
        const customRanges = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges ?? [];
        const layouts: ICustomRangeBound[] = [];

        customRanges.forEach((range) => {
            const textRange: ITextRangeParam = {
                startOffset: range.startIndex,
                endOffset: range.endIndex,
                collapsed: false,
                segmentId,
            };

            const rects = calcDocRangePositions(textRange, this._documents, this._skeleton, segmentPage);
            if (!rects) {
                return null;
            }

            layouts.push({
                customRange: range,
                rects,
                segmentId,
                segmentPageIndex: segmentPage,
            });
        });

        return layouts;
    }

    private _buildCustomRangeBounds() {
        if (!this._customRangeDirty) {
            return;
        }
        this._customRangeDirty = false;
        const customRangeBounds: ICustomRangeBound[] = [];

        customRangeBounds.push(...this._buildCustomRangeBoundsBySegment());
        this._skeleton.getSkeletonData()?.pages.forEach((page, pageIndex) => {
            if (page.headerId) {
                customRangeBounds.push(...this._buildCustomRangeBoundsBySegment(page.headerId, pageIndex));
            }

            if (page.footerId) {
                customRangeBounds.push(...this._buildCustomRangeBoundsBySegment(page.footerId, pageIndex));
            }
        });

        this._customRangeBounds = customRangeBounds;
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
                segmentPageIndex: range.segmentPageIndex,
            })
        );
    }

    private _buildBulletBoundsBySegment(segmentId?: string, segmentPage = -1) {
        const body = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        const paragraphs = body?.paragraphs ?? [];
        const bounds: IBulletBound[] = [];

        paragraphs.forEach((paragraph) => {
            if (paragraph.bullet && paragraph.bullet.listType.indexOf('CHECK_LIST') === 0) {
                const calcRect = (pageIndex: number) => {
                    const node = this._skeleton.findNodeByCharIndex(paragraph.startIndex, segmentId, pageIndex);
                    const divide = node?.parent;
                    const line = divide?.parent;
                    const column = line?.parent;
                    const targetLine = column?.lines.find((l) => l.paragraphStart && l.paragraphIndex === paragraph.startIndex);
                    const bulletNode = targetLine?.divides?.[0]?.glyphGroup?.[0];

                    if (!bulletNode) {
                        return;
                    }

                    if (!bulletNode) {
                        return;
                    }

                    const rect = calcDocGlyphPosition(bulletNode, this._documents, this._skeleton, pageIndex);

                    if (!rect) {
                        return;
                    }

                    bounds.push({
                        rect,
                        segmentId,
                        segmentPageIndex: pageIndex,
                        paragraph,
                    });
                };

                calcRect(segmentPage);
            }
        });

        return bounds;
    }

    private _buildBulletBounds() {
        if (!this._bulletDirty) {
            return;
        }
        this._bulletDirty = false;

        this._bulletBounds = [];
        this._bulletBounds.push(...this._buildBulletBoundsBySegment());

        this._skeleton.getSkeletonData()?.pages.forEach((page, pageIndex) => {
            if (page.headerId) {
                this._bulletBounds.push(...this._buildBulletBoundsBySegment(page.headerId, pageIndex));
            }

            if (page.footerId) {
                this._bulletBounds.push(...this._buildBulletBoundsBySegment(page.footerId, pageIndex));
            }
        });
    }

    private _calcActiveBullet(evt: IPointerEvent | IMouseEvent) {
        this._buildBulletBounds();

        const { offsetX, offsetY } = evt;
        const { x, y } = transformOffset2Bound(offsetX, offsetY, this._context.scene);
        const bullet = this._bulletBounds.find((layout) => {
            const { left, right, top, bottom } = layout.rect;
            if (x >= left && x <= right && y >= top && y <= bottom) {
                return true;
            }
            return false;
        });
        return bullet;
    }
}
