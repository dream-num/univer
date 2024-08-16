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

import type { CustomRangeType, DocumentDataModel, ICustomRange, ITextRange } from '@univerjs/core';
import { Disposable, fromEventSubject, ILogService, Inject } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import type { Documents, DocumentSkeleton, IBoundRectNoAngle, IMouseEvent, IPointerEvent, IRender, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { getLineBounding, NodePositionConvertToCursor, pxToNum, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { distinctUntilChanged, filter, Subject, throttleTime } from 'rxjs';
import { transformOffset2Bound } from './doc-popup-manager.service';

interface ICustomRangeLayout {
    customRange: ICustomRange;
    rects: IBoundRectNoAngle[];
    segmentId?: string;
}

const calcDocRangePositions = (range: ITextRange, documents: Documents, skeleton: DocumentSkeleton): IBoundRectNoAngle[] | undefined => {
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset);
    const endPosition = skeleton.findNodePositionByCharIndex(range.endOffset);

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

    private _clickCustomRanges$ = new Subject<{ range: ICustomRange; segmentId?: string }[]>();
    readonly clickCustomRanges$ = this._clickCustomRanges$.asObservable();

    private _dirty = true;
    private _customRangeLayouts: ICustomRangeLayout[] = [];

    private get _skeleton() {
        return this._docSkeletonManagerService.getSkeleton();
    }

    private get _documents() {
        return this._context.mainComponent as Documents;
    }

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSkeletonManagerService) private readonly _docSkeletonManagerService: DocSkeletonManagerService,
        @ILogService private readonly _logService: ILogService
    ) {
        super();

        this._initCustomRanges();
    }

    private _initCustomRanges() {
        this.disposeWithMe(this._skeleton.dirty$.subscribe(() => {
            this._dirty = true;
        }));

        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize)
            ).subscribe(() => {
                this._dirty = true;
            })
        );

        this.disposeWithMe(fromEventSubject(this._context.scene.onPointerMove$).pipe(throttleTime(16)).subscribe((evt) => {
            this._hoverCustomRanges$.next(
                this._calcActiveRanges(evt)
            );
        }));

        this.disposeWithMe(this._context.scene.onPointerUp$.subscribeEvent((evt) => {
            const ranges = this._calcActiveRanges(evt);
            if (ranges.length) {
                this._clickCustomRanges$.next(ranges);
            }
        }));
    }

    private _buildCustomRangeLayoutsBySegment(segmentId?: string) {
        const customRanges = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody()?.customRanges ?? [];
        const layouts: ICustomRangeLayout[] = [];
        customRanges.forEach((range) => {
            const textRange = {
                startOffset: range.startIndex,
                endOffset: range.endIndex,
                collapsed: false,
            };
            const rects = calcDocRangePositions(textRange, this._documents, this._skeleton);
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
            });
        });

        return layouts;
    }

    private _buildCustomRangeLayouts() {
        if (!this._dirty) {
            return;
        }

        const headerKeys = this._context.unit.headerModelMap.keys();
        const footerKeys = this._context.unit.footerModelMap.keys();

        this._customRangeLayouts = [
            ...this._buildCustomRangeLayoutsBySegment(),
            ...Array.from(headerKeys).flatMap((key) => this._buildCustomRangeLayoutsBySegment(key)),
            ...Array.from(footerKeys).flatMap((key) => this._buildCustomRangeLayoutsBySegment(key)),
        ];
    }

    private _calcActiveRanges(evt: IPointerEvent | IMouseEvent) {
        this._buildCustomRangeLayouts();

        const { offsetX, offsetY } = evt;
        const { x, y } = transformOffset2Bound(offsetX, offsetY, this._context.scene);
        const matchedRanges = this._customRangeLayouts.filter((layout) => {
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
