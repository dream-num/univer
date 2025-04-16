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

import type { DocumentDataModel, ICustomRange, IParagraph, ITextRangeParam, Nullable } from '@univerjs/core';
import type { Documents, DocumentSkeleton, IBoundRectNoAngle, IDocumentSkeletonGlyph, IDocumentSkeletonPage, IDocumentSkeletonSection, IRenderContext, IRenderModule } from '@univerjs/engine-render';
import { Disposable, fromEventSubject, Inject } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { CURSOR_TYPE, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { BehaviorSubject, distinctUntilChanged, filter, map, Subject, switchMap, take, throttleTime } from 'rxjs';
import { DOC_VERTICAL_PADDING } from '../types/const/padding';
import { transformOffset2Bound } from './doc-popup-manager.service';
import { NodePositionConvertToCursor } from './selection/convert-text-range';
import { getLineBounding } from './selection/text-range';

export interface ICustomRangeBound {
    customRange: ICustomRange;
    rects: IBoundRectNoAngle[];
    segmentId?: string;
    segmentPageIndex: number;
}

export interface IBulletBound {
    rect: IBoundRectNoAngle;
    segmentId?: string;
    segmentPageIndex: number;
    paragraph: IParagraph;
}

const calcDocRangePositions = (range: ITextRangeParam, documents: Documents, skeleton: DocumentSkeleton, pageIndex: number): IBoundRectNoAngle[] | undefined => {
    const startPosition = skeleton.findNodePositionByCharIndex(range.startOffset, true, range.segmentId, pageIndex);
    const skeletonData = skeleton.getSkeletonData();
    let end = range.collapsed ? range.startOffset : range.endOffset - 1;
    if (range.segmentId) {
        const root = Array.from(skeletonData?.skeFooters.get(range.segmentId)?.values() ?? [])[0] ?? Array.from(skeletonData?.skeHeaders.get(range.segmentId)?.values() ?? [])[0];
        if (root) {
            end = Math.min(root.ed, end);
        }
    }
    const endPosition = skeleton.findNodePositionByCharIndex(end, true, range.segmentId, pageIndex);
    if (!endPosition || !startPosition) {
        return;
    }

    const documentOffsetConfig = documents.getOffsetConfig();
    const convertor = new NodePositionConvertToCursor(documentOffsetConfig, skeleton);
    const { borderBoxPointGroup } = convertor.getRangePointData(startPosition, endPosition);
    const bounds = getLineBounding(borderBoxPointGroup);

    return bounds.map((rect) => ({
        top: rect.top + documentOffsetConfig.docsTop - DOC_VERTICAL_PADDING,
        bottom: rect.bottom + documentOffsetConfig.docsTop + DOC_VERTICAL_PADDING,
        left: rect.left + documentOffsetConfig.docsLeft,
        right: rect.right + documentOffsetConfig.docsLeft,
    }));
};

interface ICustomRangeBoundBase {
    paragraphStart: number;
    paragraphEnd: number;
    startIndex: number;
    rect: IBoundRectNoAngle;
    fisrtLine: IBoundRectNoAngle;
}

const calcDocParagraphPositions = (sections: IDocumentSkeletonSection[], top: number, left: number, pageWidth: number): ICustomRangeBoundBase[] => {
    const paragraphBounds: ICustomRangeBoundBase[] = [];
    for (const section of sections) {
        const sectionTop = section.top;
        for (const column of section.columns) {
            const columnLeft = column.left;
            const width = section.colCount === 1 ? pageWidth : column.width;
            let currentParagraph: ICustomRangeBoundBase | null = null;
            for (const line of column.lines) {
                const startIndex = line.paragraphIndex;
                if (line.paragraphStart) {
                    if (currentParagraph) {
                        paragraphBounds.push(currentParagraph);
                        currentParagraph = null;
                    }
                    const lineRect = {
                        top: top + sectionTop + line.top,
                        left: left + columnLeft,
                        right: left + columnLeft + width,
                        bottom: top + sectionTop + line.top + line.lineHeight,
                    };
                    currentParagraph = {
                        paragraphStart: line.st,
                        paragraphEnd: startIndex,
                        startIndex,
                        rect: lineRect,
                        fisrtLine: {
                            top: top + sectionTop + line.top + line.marginTop + line.paddingTop,
                            left: left + columnLeft,
                            right: left + columnLeft + width,
                            bottom: top + sectionTop + line.top + line.marginTop + line.paddingTop + line.contentHeight,
                        },
                    };
                } else {
                    if (currentParagraph && currentParagraph.startIndex === startIndex) {
                        currentParagraph.rect.bottom = top + sectionTop + line.top + line.lineHeight;
                    }
                }
            }

            if (currentParagraph) {
                paragraphBounds.push(currentParagraph);
            }
        }
    }

    return paragraphBounds;
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
    range: ICustomRange;
    segmentId?: string;
    segmentPageIndex: number;
    rects: IBoundRectNoAngle[];
}

interface IBulletActive {
    paragraph: IParagraph;
    segmentId?: string;
    segmentPageIndex: number;
    rect: IBoundRectNoAngle;
}

export interface IMutiPageParagraphBound {
    rect: IBoundRectNoAngle;
    paragraphStart: number;
    paragraphEnd: number;
    startIndex: number;
    rects: IBoundRectNoAngle[];
    pageIndex: number;
    segmentId?: string;
    firstLine: IBoundRectNoAngle;
}

export interface ITableParagraphBound {
    rect: IBoundRectNoAngle;
    paragraphStart: number;
    paragraphEnd: number;
    startIndex: number;
    pageIndex: number;
    segmentId?: string;
    rowIndex: number;
    colIndex: number;
    firstLine: IBoundRectNoAngle;
    tableId: string;
}

export interface ITableBound {
    rect: IBoundRectNoAngle;
    pageIndex: number;
    tableId: string;
}

export interface ITableCellBound {
    rect: IBoundRectNoAngle;
    pageIndex: number;
    rowIndex: number;
    colIndex: number;
    tableId: string;
}

function isPointInRect(x: number, y: number, rect: IBoundRectNoAngle) {
    const { left, right, top, bottom } = rect;
    if (x >= left && x <= right && y >= top && y <= bottom) {
        return true;
    }
    return false;
}

export class DocEventManagerService extends Disposable implements IRenderModule {
    private readonly _hoverCustomRanges$ = new BehaviorSubject<ICustomRangeActive[]>([]);
    readonly hoverCustomRanges$ = this._hoverCustomRanges$.pipe(distinctUntilChanged((pre, aft) => pre.length === aft.length && pre.every((item, i) => aft[i].range.rangeId === item.range.rangeId && aft[i].segmentId === item.segmentId && aft[i].segmentPageIndex === item.segmentPageIndex && aft[i].range.startIndex === item.range.startIndex)));

    private readonly _clickCustomRanges$ = new Subject<ICustomRangeActive>();
    readonly clickCustomRanges$ = this._clickCustomRanges$.asObservable();

    private readonly _hoverBullet$ = new Subject<Nullable<IBulletActive>>();
    readonly hoverBullet$ = this._hoverBullet$.pipe(distinctUntilChanged((pre, aft) => pre?.paragraph.startIndex === aft?.paragraph.startIndex && pre?.segmentId === aft?.segmentId && pre?.segmentPageIndex === aft?.segmentPageIndex));

    private readonly _clickBullet$ = new Subject<IBulletActive>();
    readonly clickBullets$ = this._clickBullet$.asObservable();

    private readonly _hoverParagraph$ = new BehaviorSubject<Nullable<IMutiPageParagraphBound>>(null);
    readonly hoverParagraph$ = this._hoverParagraph$.pipe(distinctUntilChanged((pre, aft) => pre?.startIndex === aft?.startIndex && pre?.segmentId === aft?.segmentId && pre?.pageIndex === aft?.pageIndex));
    readonly hoverParagraphRealTime$ = this._hoverParagraph$.asObservable();

    get hoverParagraph() {
        return this._hoverParagraph$.value;
    }

    private readonly _hoverParagraphLeft$ = new BehaviorSubject<Nullable<IMutiPageParagraphBound>>(null);
    readonly hoverParagraphLeft$ = this._hoverParagraphLeft$.pipe(distinctUntilChanged((pre, aft) => pre?.startIndex === aft?.startIndex && pre?.segmentId === aft?.segmentId && pre?.pageIndex === aft?.pageIndex));
    readonly hoverParagraphLeftRealTime$ = this._hoverParagraphLeft$.asObservable();

    get hoverParagraphLeft() {
        return this._hoverParagraphLeft$.value;
    }

    private readonly _hoverTableCell$ = new Subject<Nullable<ITableCellBound>>();
    readonly hoverTableCell$ = this._hoverTableCell$.pipe(distinctUntilChanged((pre, aft) => pre?.rowIndex === aft?.rowIndex && pre?.colIndex === aft?.colIndex && pre?.tableId === aft?.tableId && pre?.pageIndex === aft?.pageIndex));
    readonly hoverTableCellRealTime$ = this._hoverTableCell$.asObservable();

    private readonly _hoverTable$ = new Subject<Nullable<ITableBound>>();
    readonly hoverTable$ = this._hoverTable$.pipe(distinctUntilChanged((pre, aft) => pre?.tableId === aft?.tableId && pre?.pageIndex === aft?.pageIndex));
    readonly hoverTableRealTime$ = this._hoverTable$.asObservable();

    private _customRangeDirty = true;
    private _bulletDirty = true;
    private _paragraphDirty = true;

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
    /**
     * cache the bounding of paragraphs,
     * it will be updated when the doc-skeleton is recalculated
     */
    private _paragraphBounds: Map<number, IMutiPageParagraphBound> = new Map();
    private _paragraphLeftBounds: IMutiPageParagraphBound[] = [];
    private _tableParagraphBounds: Map<string, ITableParagraphBound[]> = new Map();
    private _segmentParagraphBounds: Map<string, Map<number, IMutiPageParagraphBound[]>> = new Map();

    private _tableCellBounds: Map<string, ITableCellBound[]> = new Map();
    private _tableBounds: Map<string, ITableBound> = new Map();

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
            this._paragraphDirty = true;
        }));

        this.disposeWithMe(
            fromEventSubject(this._context.engine.onTransformChange$).pipe(
                filter((evt) => evt.type === TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize)
            ).subscribe(() => {
                this._customRangeDirty = true;
                this._bulletDirty = true;
                this._paragraphDirty = true;
            })
        );
    }

    private _initEvents() {
        this.disposeWithMe(fromEventSubject(this._context.scene.onPointerMove$).pipe(throttleTime(30)).subscribe((evt) => {
            if (evt.buttons > 0) {
                this._hoverBullet$.next(null);
                this._hoverCustomRanges$.next([]);
                this._hoverParagraph$.next(null);
                this._hoverParagraphLeft$.next(null);
                this._hoverTableCell$.next(null);
                this._hoverTable$.next(null);

                return;
            }

            const { x, y } = transformOffset2Bound(evt.offsetX, evt.offsetY, this._context.scene);
            this._hoverCustomRanges$.next(
                this._calcActiveRanges({ x, y })
            );
            this._hoverParagraph$.next(
                this._calcActiveParagraph({ x, y })
            );
            this._hoverParagraphLeft$.next(
                this._calcActiveParagraphLeft({ x, y })
            );
            this._hoverBullet$.next(
                this._calcActiveBullet({ x, y })
            );
        }));
        this.disposeWithMe(this._context.scene.onPointerEnter$.subscribeEvent(() => {
            this._hoverBullet$.next(null);
            this._hoverCustomRanges$.next([]);
        }));

        const onPointerDown$ = fromEventSubject(this._context.mainComponent!.onPointerDown$);
        const onPointerUp$ = fromEventSubject(this._context.scene!.onPointerUp$);
        this.disposeWithMe(onPointerDown$.pipe(
            switchMap((down) => onPointerUp$.pipe(take(1), map((up) => ({ down, up })))),
            filter(({ down, up }) => down.target === up.target && up.timeStamp - down.timeStamp < 300)
        ).subscribe(({ down }) => {
            if (down.button === 2) {
                return;
            }
            const point = transformOffset2Bound(down.offsetX, down.offsetY, this._context.scene);
            const ranges = this._calcActiveRanges(point);
            if (ranges.length) {
                this._clickCustomRanges$.next(ranges.pop()!);
            }

            const bullet = this._calcActiveBullet(point);
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
                endOffset: range.endIndex + 1,
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

    private _calcActiveRanges(evt: { x: number; y: number }) {
        this._buildCustomRangeBounds();

        const { x, y } = evt;
        const matchedRanges = this._customRangeBounds.filter((layout) => {
            return layout.rects.some((rect) => isPointInRect(x, y, rect));
        });
        return matchedRanges.map(
            (range) => ({
                segmentId: range.segmentId,
                range: range.customRange,
                segmentPageIndex: range.segmentPageIndex,
                rects: range.rects,
            })
        );
    }

    private _buildBulletBoundsBySegment(segmentId?: string, segmentPage = -1): IBulletBound[] {
        const body = this._context.unit.getSelfOrHeaderFooterModel(segmentId)?.getBody();
        const paragraphs = (body?.paragraphs ?? []).filter((p) => p.bullet && p.bullet.listType.indexOf('CHECK_LIST') === 0);
        const bounds: IBulletBound[] = [];
        const skeletonData = this._skeleton.getSkeletonData();
        if (!skeletonData) {
            return bounds;
        }

        const calc = (pages: IDocumentSkeletonPage[]) => {
            for (const page of pages) {
                const sections = [...page.sections];
                if (page.skeTables) {
                    const tables = Array.from(page.skeTables.values());
                    sections.push(...tables.map((i) => i.rows.map((i) => i.cells.map((i) => i.sections))).flat(4));
                }

                for (const selection of sections) {
                    for (const column of selection.columns) {
                        for (const line of column.lines) {
                            if (line.paragraphStart) {
                                const paragraph: Nullable<IParagraph> = paragraphs.find((p) => p.startIndex === line.paragraphIndex);
                                if (paragraph) {
                                    const targetLine = line;
                                    const bulletNode = targetLine?.divides?.[0]?.glyphGroup?.[0];

                                    if (!bulletNode) {
                                        continue;
                                    }

                                    const rect = calcDocGlyphPosition(bulletNode, this._documents, this._skeleton, segmentPage);

                                    if (!rect) {
                                        continue;
                                    }

                                    bounds.push({
                                        rect,
                                        segmentId,
                                        segmentPageIndex: segmentPage,
                                        paragraph,
                                    });
                                }
                            }
                        }
                    }
                }
            }
            return bounds;
        };

        if (segmentId) {
            const page = skeletonData.skeFooters.get(segmentId)?.values() ?? skeletonData.skeHeaders.get(segmentId)?.values();
            if (!page) {
                return bounds;
            }
            return calc(Array.from(page));
        }

        return calc(skeletonData.pages);
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

    private _calcActiveBullet(evt: { x: number; y: number }) {
        this._buildBulletBounds();

        const { x, y } = evt;
        const bullet = this._bulletBounds.find((layout) => isPointInRect(x, y, layout.rect));
        return bullet;
    }

    // eslint-disable-next-line max-lines-per-function
    private _buildParagraphBoundsBySegment(segmentId?: string) {
        const skeletonData = this._skeleton.getSkeletonData();
        const documents = this._documents;
        const documentOffsetConfig = documents.getOffsetConfig();
        if (!skeletonData) {
            return null;
        }

        // eslint-disable-next-line max-lines-per-function
        const calc = (pages: IDocumentSkeletonPage[]) => {
            const paragraphMap: Map<number, IMutiPageParagraphBound> = new Map();
            const handlePage = (page: IDocumentSkeletonPage, pageIndex: number, top: number, left: number) => {
                const bounds = calcDocParagraphPositions(page.sections, top, left, page.pageWidth - page.marginLeft - page.marginRight);

                bounds.forEach((bound) => {
                    if (!paragraphMap.has(bound.startIndex)) {
                        paragraphMap.set(bound.startIndex, {
                            rect: bound.rect,
                            paragraphStart: bound.paragraphStart,
                            paragraphEnd: bound.paragraphEnd,
                            startIndex: bound.startIndex,
                            rects: [bound.rect],
                            pageIndex,
                            segmentId,
                            firstLine: bound.fisrtLine,
                        });
                    } else {
                        const current = paragraphMap.get(bound.startIndex);
                        if (current) {
                            current.rect.bottom = bound.rect.bottom;
                            current.rects.push(bound.rect);
                        }
                    }
                });
            };

            for (let i = 0; i < pages.length; i++) {
                const page = pages[i];
                const top = ((page.pageHeight === Infinity ? 0 : page.pageHeight) + documentOffsetConfig.pageMarginTop) * i + page.marginTop + documentOffsetConfig.docsTop;
                const left = page.marginLeft + documentOffsetConfig.docsLeft;
                if (page.skeTables) {
                    Array.from(page.skeTables.values()).forEach((table) => {
                        const tableLeft = table.left + left;
                        const tableTop = table.top + top;
                        const tableRight = tableLeft + table.width;
                        const tableBottom = tableTop + table.height;
                        const tableId = table.tableId;
                        this._tableBounds.set(tableId, {
                            rect: {
                                left: tableLeft,
                                top: tableTop,
                                right: tableRight,
                                bottom: tableBottom,
                            },
                            pageIndex: i,
                            tableId,
                        });

                        table.rows.forEach((row, rowIndex) => {
                            row.cells.forEach((cell, colIndex) => {
                                const top = (((page.pageHeight === Infinity ? 0 : page.pageHeight) + documentOffsetConfig.pageMarginTop) * i) + table.top + documentOffsetConfig.docsTop + page.marginTop + row.top + cell.marginTop;
                                const left = table.left + documentOffsetConfig.docsLeft + page.marginLeft + cell.left + cell.marginLeft;
                                const bounds = calcDocParagraphPositions(cell.sections, top, left, cell.pageWidth - cell.marginLeft - cell.marginRight);
                                let arr = this._tableParagraphBounds.get(tableId);
                                if (!arr) {
                                    arr = [];
                                    this._tableParagraphBounds.set(tableId, arr);
                                }

                                arr.push(...bounds.map((bound) => ({
                                    rect: bound.rect,
                                    paragraphStart: bound.paragraphStart,
                                    paragraphEnd: bound.paragraphEnd,
                                    startIndex: bound.startIndex,
                                    pageIndex: i,
                                    segmentId,
                                    rowIndex,
                                    colIndex,
                                    firstLine: bound.fisrtLine,
                                    tableId,
                                }))
                                );

                                let cellBounds = this._tableCellBounds.get(tableId);

                                if (!cellBounds) {
                                    cellBounds = [];
                                    this._tableCellBounds.set(tableId, cellBounds);
                                }

                                cellBounds.push({
                                    rect: {
                                        top,
                                        left,
                                        right: left + cell.pageWidth - cell.marginLeft - cell.marginRight,
                                        bottom: top + cell.pageHeight - cell.marginBottom - cell.marginTop,
                                    },
                                    pageIndex: i,
                                    rowIndex,
                                    colIndex,
                                    tableId,
                                });
                            });
                        });
                    });
                }

                handlePage(page, i, top, left);
            }

            return paragraphMap;
        };

        if (segmentId) {
            const page = skeletonData.skeFooters.get(segmentId)?.values() ?? skeletonData.skeHeaders.get(segmentId)?.values();
            if (!page) {
                return null;
            }
            return calc(Array.from(page));
        }

        return calc(skeletonData.pages);
    }

    private _buildParagraphBounds() {
        if (!this._paragraphDirty) {
            return;
        }
        this._paragraphDirty = false;
        this._tableParagraphBounds = new Map();
        this._tableCellBounds = new Map();
        this._tableBounds = new Map();
        this._paragraphBounds = this._buildParagraphBoundsBySegment() ?? new Map();
        this._paragraphLeftBounds = Array.from(this._paragraphBounds.values()).map((bound) => ({
            ...bound,
            rect: {
                left: bound.rect.left - 60,
                right: bound.rect.left,
                top: bound.rect.top,
                bottom: bound.rect.bottom,
            },
        }));
        const handleSegment = (segmentId: string) => {
            this._segmentParagraphBounds.set(segmentId, this._buildParagraphBoundsBySegment(segmentId) ?? new Map());
        };

        this._skeleton.getSkeletonData()?.pages.forEach((page) => {
            if (page.headerId) {
                handleSegment(page.headerId);
            }

            if (page.footerId) {
                handleSegment(page.footerId);
            }
        });
    }

    private _calcActiveParagraph(evt: { x: number; y: number }): Nullable<IMutiPageParagraphBound> {
        this._buildParagraphBounds();

        const { x, y } = evt;

        const table = Array.from(this._tableBounds.values()).find((bound) => isPointInRect(x, y, bound.rect));
        this._hoverTable$.next(table);

        if (table) {
            const tableCell = this._tableCellBounds.get(table.tableId)?.find((bound) => isPointInRect(x, y, bound.rect));
            this._hoverTableCell$.next(tableCell);
            if (!tableCell) {
                return null;
            }

            const paragraphs = this._tableParagraphBounds.get(tableCell.tableId)
                ?.filter((bound) => bound.colIndex === tableCell.colIndex && bound.rowIndex === tableCell.rowIndex);
            const paragraph = paragraphs?.find((bound) => isPointInRect(x, y, bound.rect));
            return paragraph && {
                ...paragraph,
                rects: [paragraph.rect],
            };
        }

        const paragraph = this._paragraphBounds.values().find((bounds) => {
            return bounds.rects.some((rect) => isPointInRect(x, y, rect));
        });

        return paragraph;
    }

    private _calcActiveParagraphLeft(evt: { x: number; y: number }): Nullable<IMutiPageParagraphBound> {
        this._buildParagraphBounds();
        const { x, y } = evt;

        const paragraph = this._paragraphLeftBounds.find((bound) => isPointInRect(x, y, bound.rect));
        return paragraph;
    }

    get paragraphBounds() {
        this._buildParagraphBounds();
        return this._paragraphBounds;
    }

    findParagraphBoundByIndex(index: number) {
        this._buildParagraphBounds();
        const paragraph = this._paragraphBounds.get(index);
        if (paragraph) {
            return paragraph;
        }

        const tableParagraph = Array.from(this._tableParagraphBounds.values()).flat().find((bound) => bound.startIndex === index);
        return tableParagraph;
    }
}
