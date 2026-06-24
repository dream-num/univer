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

import { EventState, EventSubject, Injector, PresetListType } from '@univerjs/core';
import { DocSkeletonManagerService } from '@univerjs/docs';
import { setDocsTableRenderViewportProvider, TRANSFORM_CHANGE_OBSERVABLE_TYPE } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import {
    DocEventManagerService,
    getListMarkerFallbackBound,
    getListMarkerFallbackHit,
    getListParagraphContextMenuHit,
    getPreferredParagraphBoundsInRange,
    getTableBlockMenuHoverRect,
    getTableHorizontalViewportGeometry,
    isChecklistListType,
} from '../doc-event-manager.service';

class TestDocSkeletonManagerService {
    readonly dirty$ = new EventSubject();
    bodyLineTop = 30;

    getSkeleton() {
        return {
            dirty$: this.dirty$,
            getSkeletonData: () => ({
                pages: [{
                    pageHeight: 300,
                    pageWidth: 240,
                    marginLeft: 0,
                    marginRight: 0,
                    marginTop: 10,
                    sections: [{
                        top: 0,
                        colCount: 1,
                        columns: [{
                            left: 20,
                            lines: [{
                                paragraphStart: true,
                                paragraphIndex: 12,
                                st: 12,
                                top: this.bodyLineTop,
                                lineHeight: 20,
                                marginTop: 2,
                                paddingTop: 3,
                                contentHeight: 10,
                                divides: [],
                            }, {
                                paragraphStart: true,
                                paragraphIndex: 60,
                                st: 40,
                                top: 140,
                                lineHeight: 72,
                                marginTop: 0,
                                paddingTop: 0,
                                contentHeight: 72,
                                divides: [],
                            }],
                        }],
                    }],
                    skeTables: new Map([[
                        'table-1',
                        {
                            tableId: 'table-1',
                            left: 40,
                            top: 80,
                            width: 120,
                            height: 60,
                            rows: [{
                                top: 0,
                                cells: [{
                                    left: 0,
                                    marginTop: 0,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginBottom: 0,
                                    pageWidth: 120,
                                    pageHeight: 60,
                                    sections: [{
                                        top: 0,
                                        colCount: 1,
                                        columns: [{
                                            left: 0,
                                            lines: [{
                                                paragraphStart: true,
                                                paragraphIndex: 30,
                                                st: 30,
                                                top: 4,
                                                lineHeight: 16,
                                                marginTop: 1,
                                                paddingTop: 1,
                                                contentHeight: 8,
                                                divides: [],
                                            }],
                                        }],
                                    }],
                                }],
                            }],
                        },
                    ]]),
                    skeColumnGroups: new Map([[
                        'column-group-1',
                        {
                            columnGroupId: 'column-group-1',
                            left: 20,
                            top: 140,
                            width: 200,
                            height: 72,
                            columns: [{
                                columnId: 'column-1',
                                left: 0,
                                top: 0,
                                width: 94,
                                height: 72,
                                page: {
                                    pageWidth: 94,
                                    pageHeight: 72,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    sections: [{
                                        top: 0,
                                        colCount: 1,
                                        columns: [{
                                            left: 0,
                                            lines: [{
                                                paragraphStart: true,
                                                paragraphIndex: 44,
                                                st: 40,
                                                top: 4,
                                                lineHeight: 16,
                                                marginTop: 1,
                                                paddingTop: 1,
                                                contentHeight: 8,
                                                divides: [],
                                            }],
                                        }],
                                    }],
                                },
                            }, {
                                columnId: 'column-2',
                                left: 106,
                                top: 0,
                                width: 94,
                                height: 72,
                                page: {
                                    pageWidth: 94,
                                    pageHeight: 72,
                                    marginLeft: 0,
                                    marginRight: 0,
                                    marginTop: 0,
                                    marginBottom: 0,
                                    sections: [{
                                        top: 0,
                                        colCount: 1,
                                        columns: [{
                                            left: 0,
                                            lines: [{
                                                paragraphStart: true,
                                                paragraphIndex: 52,
                                                st: 48,
                                                top: 4,
                                                lineHeight: 16,
                                                marginTop: 1,
                                                paddingTop: 1,
                                                contentHeight: 8,
                                                divides: [],
                                            }],
                                        }],
                                    }],
                                    skeTables: new Map([[
                                        'table-in-column',
                                        {
                                            tableId: 'table-in-column',
                                            left: 4,
                                            top: 20,
                                            width: 80,
                                            height: 30,
                                            rows: [{
                                                index: 0,
                                                top: 0,
                                                cells: [{
                                                    left: 0,
                                                    marginTop: 2,
                                                    marginLeft: 0,
                                                    marginRight: 0,
                                                    marginBottom: 2,
                                                    pageWidth: 80,
                                                    pageHeight: 30,
                                                    sections: [{
                                                        top: 0,
                                                        colCount: 1,
                                                        columns: [{
                                                            left: 0,
                                                            lines: [{
                                                                paragraphStart: true,
                                                                paragraphIndex: 70,
                                                                st: 70,
                                                                top: 4,
                                                                lineHeight: 16,
                                                                marginTop: 1,
                                                                paddingTop: 1,
                                                                contentHeight: 8,
                                                                divides: [],
                                                            }],
                                                        }],
                                                    }],
                                                }],
                                            }],
                                        },
                                    ]]),
                                },
                            }],
                        },
                    ]]),
                }],
                skeHeaders: new Map(),
                skeFooters: new Map(),
            }),
        };
    }
}

class TestDocuments {
    readonly onPointerDown$ = new EventSubject();

    getOffsetConfig() {
        return {
            docsLeft: 0,
            docsTop: 0,
            pageMarginTop: 0,
        };
    }
}

function createDocEventManagerService() {
    const injector = new Injector();
    injector.add([DocSkeletonManagerService, { useClass: TestDocSkeletonManagerService as never }]);
    const body = {
        paragraphs: [{
            startIndex: 12,
            bullet: {
                listId: 'list-1',
                listType: PresetListType.BULLET_LIST,
                nestingLevel: 0,
            },
        }, {
            startIndex: 30,
        }, {
            startIndex: 44,
        }, {
            startIndex: 52,
        }, {
            startIndex: 70,
        }],
        customRanges: [],
    };
    const documents = new TestDocuments();
    let cursor = 'text';
    const context = {
        unitId: 'doc-event',
        unit: {
            getSelfOrHeaderFooterModel: () => ({
                getBody: () => body,
            }),
        },
        engine: {
            onTransformChange$: new EventSubject(),
        },
        scene: {
            onTransformChange$: new EventSubject(),
            onPointerMove$: new EventSubject(),
            onPointerEnter$: new EventSubject(),
            onPointerUp$: new EventSubject(),
            getAncestorScale: () => ({ scaleX: 1, scaleY: 1 }),
            getViewport: () => undefined,
            getCursor: () => cursor,
            setCursor: (value: string) => {
                cursor = value;
            },
        },
        mainComponent: documents,
    };

    const service = injector.createInstance(DocEventManagerService, context as never);
    const skeletonManager = injector.get(DocSkeletonManagerService) as never as TestDocSkeletonManagerService;

    return {
        service,
        context,
        documents,
        skeletonManager,
        getCursor: () => cursor,
    };
}

describe('DocEventManagerService list marker helpers', () => {
    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
    });

    it('detects list marker fallback hits without treating body text as marker', () => {
        const paragraph = {
            startIndex: 12,
            bullet: {
                listId: 'list-1',
                listType: PresetListType.BULLET_LIST,
                nestingLevel: 0,
            },
        };
        const paragraphBound = {
            firstLine: { bottom: 124, left: 160, right: 460, top: 104 },
            pageIndex: 0,
            rect: { bottom: 128, left: 160, right: 460, top: 100 },
        };

        expect(getListMarkerFallbackBound(paragraphBound, paragraph)).toMatchObject({
            rect: { bottom: 124, left: 160, right: 196, top: 104 },
            segmentPageIndex: 0,
        });
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 168, y: 112 })).not.toBeNull();
        expect(getListMarkerFallbackHit(paragraphBound, paragraph, { x: 240, y: 112 })).toBeNull();
        expect(getListParagraphContextMenuHit(paragraphBound, paragraph, { x: 260, y: 112 })).toBeNull();
    });

    it('identifies checklist list types', () => {
        expect(isChecklistListType(PresetListType.CHECK_LIST)).toBe(true);
        expect(isChecklistListType(PresetListType.CHECK_LIST_CHECKED)).toBe(true);
        expect(isChecklistListType(PresetListType.BULLET_LIST)).toBe(false);
    });

    it('prefers table paragraph bounds when a text range overlaps table content', () => {
        const bodyParagraph = {
            rect: { bottom: 120, left: 80, right: 420, top: 90 },
            paragraphStart: 10,
            paragraphEnd: 60,
            startIndex: 10,
            rects: [{ bottom: 120, left: 80, right: 420, top: 90 }],
            pageIndex: 0,
            firstLine: { bottom: 110, left: 80, right: 420, top: 90 },
        };
        const tableParagraph = {
            rect: { bottom: 180, left: 120, right: 360, top: 150 },
            paragraphStart: 22,
            paragraphEnd: 36,
            startIndex: 22,
            rects: [{ bottom: 180, left: 120, right: 360, top: 150 }],
            pageIndex: 0,
            firstLine: { bottom: 170, left: 120, right: 360, top: 150 },
        };

        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [tableParagraph], 24, 30)).toEqual([tableParagraph]);
        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [], 24, 30)).toEqual([bodyParagraph]);
        expect(getPreferredParagraphBoundsInRange([bodyParagraph], [tableParagraph], 61, 70)).toEqual([]);
    });

    it('calculates table hover and horizontal viewport geometry for clipped tables', () => {
        expect(getTableBlockMenuHoverRect({ bottom: 320, left: 120, right: 520, top: 160 })).toEqual({
            bottom: 320,
            left: 48,
            right: 520,
            top: 118,
        });

        expect(getTableHorizontalViewportGeometry(100, 400, {
            contentWidth: 800,
            leadingInsetLeft: 24,
            scrollLeft: 72,
            trailingInsetRight: 24,
            viewportWidth: 360,
        })).toEqual({
            scrollLeft: 72,
            visibleLeft: 76,
            visibleRight: 436,
        });

        expect(getTableHorizontalViewportGeometry(100, 400, null)).toEqual({
            scrollLeft: 0,
            visibleLeft: 100,
            visibleRight: 500,
        });
    });

    it('finds paragraph and table bounds from a rendered document skeleton', () => {
        const { service } = createDocEventManagerService();

        expect(service.paragraphBounds.get(12)?.rect).toEqual({
            bottom: 60,
            left: 20,
            right: 260,
            top: 40,
        });
        expect(service.findParagraphBoundByIndex(12)?.startIndex).toBe(12);
        expect(service.findParagraphBoundsInRange(12, 12)[0].startIndex).toBe(12);

        expect(service.tableBounds.get('table-1')?.rect).toEqual({
            bottom: 150,
            left: 40,
            right: 160,
            top: 90,
        });
        expect(service.findTableCellBound('table-1', 0, 0)?.rect).toEqual({
            bottom: 150,
            left: 40,
            right: 160,
            top: 90,
        });
        expect(service.findParagraphBoundByIndex(30)?.startIndex).toBe(30);
        expect(service.findParagraphBoundsInRange(30, 30)[0].startIndex).toBe(30);

        service.dispose();
    });

    it('finds paragraph bounds inside column group columns for paragraph menus', () => {
        const { service } = createDocEventManagerService();

        expect(service.paragraphBounds.get(44)?.rect).toEqual({
            bottom: 222,
            left: 20,
            right: 114,
            top: 154,
        });
        expect(service.paragraphBounds.get(52)?.rect).toEqual({
            bottom: 222,
            left: 126,
            right: 220,
            top: 154,
        });
        expect(service.findParagraphBoundByIndex(44)?.startIndex).toBe(44);
        expect(service.findParagraphBoundsInRange(44, 44)[0].startIndex).toBe(44);

        service.dispose();
    });

    it('finds table cell and paragraph bounds inside column group tables', () => {
        const { service } = createDocEventManagerService();

        expect(service.tableBounds.get('table-in-column')?.rect).toEqual({
            bottom: 200,
            left: 130,
            right: 210,
            top: 170,
        });
        expect(service.findTableCellBound('table-in-column', 0, 0)?.rect).toEqual({
            bottom: 198,
            left: 130,
            right: 210,
            top: 172,
        });
        expect(service.findParagraphBoundByIndex(70)?.rect).toEqual({
            bottom: 192,
            left: 130,
            right: 210,
            top: 176,
        });

        service.dispose();
    });

    it('rebuilds column nested table bounds when its horizontal viewport changes', () => {
        const { service } = createDocEventManagerService();

        expect(service.tableBounds.get('table-in-column')?.rect.right).toBe(210);

        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'doc-event' || tableId !== 'table-in-column') {
                return null;
            }

            return {
                contentWidth: 160,
                scrollLeft: 0,
                viewportWidth: 40,
            };
        });

        expect(service.tableBounds.get('table-in-column')?.rect.right).toBe(170);

        service.dispose();
    });

    it('recalculates paragraph bounds after document layout invalidation events', () => {
        const { context, service, skeletonManager } = createDocEventManagerService();

        expect(service.paragraphBounds.get(12)?.rect.top).toBe(40);

        skeletonManager.bodyLineTop = 44;
        skeletonManager.dirty$.next([undefined, new EventState()]);
        expect(service.paragraphBounds.get(12)?.rect.top).toBe(54);

        skeletonManager.bodyLineTop = 50;
        context.engine.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.resize,
        });
        expect(service.paragraphBounds.get(12)?.rect.top).toBe(60);

        skeletonManager.bodyLineTop = 56;
        context.scene.onTransformChange$.emitEvent({
            type: TRANSFORM_CHANGE_OBSERVABLE_TYPE.scale,
        });
        expect(service.paragraphBounds.get(12)?.rect.top).toBe(66);

        service.dispose();
    });

    it('uses paragraph fallback bounds for list marker interactions', () => {
        const { service } = createDocEventManagerService();

        expect(service.isPointerOnBullet(25, 45)).toBe(true);
        expect(service.isPointerOnNonChecklistBullet(25, 45)).toBe(true);
        expect(service.getListContextMenuBulletByOffset(25, 45)?.paragraph.startIndex).toBe(12);
        expect(service.isPointerOnBullet(25, 50)).toBe(false);

        service.dispose();
    });

    it('emits bullet click and context-menu events from pointer up gestures', () => {
        const { context, documents, service } = createDocEventManagerService();
        const clickedBullets: number[] = [];
        const contextMenuBullets: Array<{ startIndex: number; x: number; y: number }> = [];
        const target = {};

        const clickSub = service.clickBullets$.subscribe((bullet) => {
            clickedBullets.push(bullet.paragraph.startIndex);
        });
        const contextMenuSub = service.contextMenuBullets$.subscribe((bullet) => {
            contextMenuBullets.push({
                startIndex: bullet.paragraph.startIndex,
                x: bullet.x,
                y: bullet.y,
            });
        });

        documents.onPointerDown$.emitEvent({
            button: 0,
            offsetX: 25,
            offsetY: 45,
            target,
            timeStamp: 100,
        });
        context.scene.onPointerUp$.emitEvent({
            button: 0,
            offsetX: 25,
            offsetY: 45,
            target,
            timeStamp: 180,
        });

        documents.onPointerDown$.emitEvent({
            button: 2,
            offsetX: 25,
            offsetY: 45,
            target,
            timeStamp: 300,
        });
        context.scene.onPointerUp$.emitEvent({
            button: 2,
            offsetX: 25,
            offsetY: 45,
            target,
            timeStamp: 1200,
        });

        expect(clickedBullets).toEqual([12]);
        expect(contextMenuBullets).toEqual([{ startIndex: 12, x: 25, y: 45 }]);

        clickSub.unsubscribe();
        contextMenuSub.unsubscribe();
        service.dispose();
    });

    it('publishes paragraph and table hover state from pointer movement', async () => {
        const { context, service } = createDocEventManagerService();
        const hoveredParagraphs: Array<number | null> = [];
        const hoveredLeftParagraphs: Array<number | null> = [];
        const hoveredTables: Array<string | null> = [];
        const hoveredCells: Array<string | null> = [];
        const distinctHoveredParagraphs: Array<number | null> = [];
        const distinctHoveredLeftParagraphs: Array<number | null> = [];
        const distinctHoveredTables: Array<string | null> = [];
        const distinctHoveredCells: Array<string | null> = [];

        const paragraphSub = service.hoverParagraphRealTime$.subscribe((bound) => {
            hoveredParagraphs.push(bound?.startIndex ?? null);
        });
        const distinctParagraphSub = service.hoverParagraph$.subscribe((bound) => {
            distinctHoveredParagraphs.push(bound?.startIndex ?? null);
        });
        const paragraphLeftSub = service.hoverParagraphLeftRealTime$.subscribe((bound) => {
            hoveredLeftParagraphs.push(bound?.startIndex ?? null);
        });
        const distinctParagraphLeftSub = service.hoverParagraphLeft$.subscribe((bound) => {
            distinctHoveredLeftParagraphs.push(bound?.startIndex ?? null);
        });
        const tableSub = service.hoverTableRealTime$.subscribe((bound) => {
            hoveredTables.push(bound?.tableId ?? null);
        });
        const distinctTableSub = service.hoverTable$.subscribe((bound) => {
            distinctHoveredTables.push(bound?.tableId ?? null);
        });
        const cellSub = service.hoverTableCellRealTime$.subscribe((bound) => {
            hoveredCells.push(bound ? `${bound.tableId}:${bound.rowIndex}:${bound.colIndex}` : null);
        });
        const distinctCellSub = service.hoverTableCell$.subscribe((bound) => {
            distinctHoveredCells.push(bound ? `${bound.tableId}:${bound.rowIndex}:${bound.colIndex}` : null);
        });

        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 50,
            offsetY: 100,
        });

        expect(hoveredParagraphs.at(-1)).toBe(30);
        expect(distinctHoveredParagraphs.at(-1)).toBe(30);
        expect(hoveredTables.at(-1)).toBe('table-1');
        expect(distinctHoveredTables.at(-1)).toBe('table-1');
        expect(hoveredCells.at(-1)).toBe('table-1:0:0');
        expect(distinctHoveredCells.at(-1)).toBe('table-1:0:0');

        await new Promise((resolve) => setTimeout(resolve, 35));
        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 10,
            offsetY: 50,
        });

        expect(hoveredLeftParagraphs.at(-1)).toBe(12);
        expect(distinctHoveredLeftParagraphs.at(-1)).toBe(12);

        paragraphSub.unsubscribe();
        distinctParagraphSub.unsubscribe();
        paragraphLeftSub.unsubscribe();
        distinctParagraphLeftSub.unsubscribe();
        tableSub.unsubscribe();
        distinctTableSub.unsubscribe();
        cellSub.unsubscribe();
        distinctCellSub.unsubscribe();
        service.dispose();
    });

    it('publishes paragraph hover state from pointer movement inside a column group', async () => {
        const { context, service } = createDocEventManagerService();
        const hoveredParagraphs: Array<number | null> = [];
        const hoveredLeftParagraphs: Array<number | null> = [];

        const paragraphSub = service.hoverParagraphRealTime$.subscribe((bound) => {
            hoveredParagraphs.push(bound?.startIndex ?? null);
        });
        const paragraphLeftSub = service.hoverParagraphLeftRealTime$.subscribe((bound) => {
            hoveredLeftParagraphs.push(bound?.startIndex ?? null);
        });

        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 50,
            offsetY: 160,
        });

        expect(service.paragraphBounds.get(60)?.rect).toEqual({
            bottom: 222,
            left: 20,
            right: 260,
            top: 150,
        });
        expect(hoveredParagraphs.at(-1)).toBe(44);

        await new Promise((resolve) => setTimeout(resolve, 35));
        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 50,
            offsetY: 210,
        });

        expect(hoveredParagraphs.at(-1)).toBe(44);

        await new Promise((resolve) => setTimeout(resolve, 35));
        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 10,
            offsetY: 210,
        });

        expect(hoveredLeftParagraphs.at(-1)).toBe(44);

        paragraphSub.unsubscribe();
        paragraphLeftSub.unsubscribe();
        service.dispose();
    });

    it('clears hover state while dragging across the document', async () => {
        const { context, service } = createDocEventManagerService();
        const hoveredParagraphs: Array<number | null> = [];
        const hoveredTables: Array<string | null> = [];

        const paragraphSub = service.hoverParagraphRealTime$.subscribe((bound) => {
            hoveredParagraphs.push(bound?.startIndex ?? null);
        });
        const tableSub = service.hoverTableRealTime$.subscribe((bound) => {
            hoveredTables.push(bound?.tableId ?? null);
        });

        context.scene.onPointerMove$.emitEvent({
            buttons: 0,
            offsetX: 50,
            offsetY: 100,
        });
        await new Promise((resolve) => setTimeout(resolve, 35));
        context.scene.onPointerMove$.emitEvent({
            buttons: 1,
            offsetX: 50,
            offsetY: 100,
        });

        expect(hoveredParagraphs.at(-1)).toBeNull();
        expect(hoveredTables.at(-1)).toBeNull();

        paragraphSub.unsubscribe();
        tableSub.unsubscribe();
        service.dispose();
    });
});
