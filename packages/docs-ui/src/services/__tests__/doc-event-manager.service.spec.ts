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

import type { DocumentDataModel, ICustomRange, IDocumentData } from '@univerjs/core';
import type { IPointerEvent, RenderUnit } from '@univerjs/engine-render';
import {
    BooleanNumber,
    CustomRangeType,
    DocumentFlavor,
    EventState,
    EventSubject,
    Injector,
    JSONX,
    PresetListType,
    TextX,
    TextXActionType,
    Univer,
    UniverInstanceType,
} from '@univerjs/core';
import { DocLayoutExecutorService, DocSkeletonManagerService } from '@univerjs/docs';
import {
    CanvasColorService,
    CURSOR_TYPE,
    Documents,
    ICanvasColorService,
    IRenderManagerService,
    RenderManagerService,
    ScrollBar,
    setDocsTableRenderViewportProvider,
    TRANSFORM_CHANGE_OBSERVABLE_TYPE,
    Viewport,
} from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { VIEWPORT_KEY } from '../../basics/docs-view-key';
import { genEmptyTable, genTableSource } from '../../commands/commands/table/table';
import {
    calcDocGlyphPosition,
    DocEventManagerService,
    getListMarkerFallbackBound,
    getListMarkerFallbackHit,
    getListParagraphContextMenuHit,
    getPreferredParagraphBoundsInRange,
    getTableBlockMenuHoverRect,
    getTableHorizontalViewportGeometry,
    isChecklistListType,
} from '../doc-event-manager.service';

describe('custom-range hit testing with real document layout', () => {
    beforeEach(() => {
        const context = new Proxy({
            font: '',
            webkitBackingStorePixelRatio: 1,
            measureText: (text: string) => ({
                width: text.length * 8,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 2,
                fontBoundingBoxAscent: 8,
                fontBoundingBoxDescent: 2,
            }),
        }, { get: (target, key) => key in target ? Reflect.get(target, key) : () => {} });
        vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(context as never);
    });

    afterEach(() => vi.restoreAllMocks());

    it.each([
        { length: 1, nested: false },
        { length: 3, nested: false },
        { length: 1, nested: true },
        { length: 3, nested: true },
        { length: 3, nested: false, bookmark: true },
        { length: 3, nested: false, bookmarkedLink: true },
        { length: 3, nested: false, overlappingField: true },
        ...['checkbox', 'date', 'dropDownList', 'comboBox', 'text', 'richText', 'picture', 'group', 'repeatingSection'].map((kind) => ({ length: 1, nested: false, kind })),
    ])('hits the innermost range including its final glyph: %j', (testCase) => {
        const { length, nested } = testCase;
        const kind = 'kind' in testCase ? testCase.kind : undefined;
        const bookmark = 'bookmark' in testCase;
        const bookmarkedLink = 'bookmarkedLink' in testCase;
        const overlappingField = 'overlappingField' in testCase;
        const rangeType = bookmark ? CustomRangeType.BOOKMARK : CustomRangeType.HYPERLINK;
        const interactive = !nested && !bookmark && kind !== 'group' && kind !== 'repeatingSection';
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([DocLayoutExecutorService]);
            const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, {
                id: 'custom-range-hit-test',
                body: {
                    dataStream: 'A目CDZ\r\n',
                    paragraphs: [{ startIndex: 5, paragraphId: 'paragraph-1' }],
                    sectionBreaks: [{ startIndex: 6, sectionId: 'body' }],
                    customRanges: nested
                        ? [
                            { startIndex: 1, endIndex: length, rangeId: 'link', rangeType: CustomRangeType.SDT, properties: { kind: 'repeatingSectionItem', placement: 'block' } },
                            { startIndex: 1, endIndex: length, rangeId: 'parent', rangeType: CustomRangeType.SDT, properties: { kind: 'repeatingSection', placement: 'block' } },
                        ]
                        : [
                            ...(overlappingField ? [{ startIndex: 1, endIndex: length, rangeId: 'field', rangeType: CustomRangeType.FIELD }] : []),
                            { startIndex: 1, endIndex: length, rangeId: 'link', rangeType: kind ? CustomRangeType.SDT : rangeType, ...(kind ? { properties: { kind } } : {}), ...(bookmark ? { properties: { bookmarkId: 'heading-target' } } : {}) },
                            ...(bookmarkedLink ? [{ startIndex: 1, endIndex: length, rangeId: 'bookmark', rangeType: CustomRangeType.BOOKMARK, properties: { bookmarkId: 'heading-target' } }] : []),
                        ],
                },
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                    autoHyphenation: BooleanNumber.FALSE,
                    pageSize: { width: 300, height: 400 },
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 20,
                    marginRight: 20,
                },
            });
            const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
            render.deactivate();
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const skeleton = render.with(DocSkeletonManagerService).getSkeleton();
            const documents = injector.createInstance(Documents, 'custom-range-document', skeleton);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            const viewport = injector.createInstance(Viewport, VIEWPORT_KEY.VIEW_MAIN, render.scene);
            render.addRenderDependencies([[DocEventManagerService]]);
            const service = render.with(DocEventManagerService);
            const clicks: unknown[] = [];
            const pointerDowns: string[][] = [];
            const subscription = service.clickCustomRanges$.subscribe((event) => clicks.push(event));
            const pointerDownSubscription = service.pointerDownCustomRanges$.subscribe((ranges) =>
                pointerDowns.push(ranges.map(({ range }) => range.rangeId))
            );
            const glyph = skeleton.findNodeByCharIndex(length)!;
            const bounds = calcDocGlyphPosition(glyph, documents, skeleton)!;
            expect(bounds.right - bounds.left).toBeGreaterThan(0);
            expect(service.isPointerOnInteractiveRange(
                bounds.left + (bounds.right - bounds.left) * 0.75,
                (bounds.top + bounds.bottom) / 2
            )).toBe(interactive);
            expect(service.isPointerOnInteractiveRange(bounds.right + 1, (bounds.top + bounds.bottom) / 2)).toBe(false);
            render.scene.setCursor(CURSOR_TYPE.TEXT);
            render.scene.onPointerMove$.emitEvent({
                buttons: 0,
                offsetX: bounds.left + (bounds.right - bounds.left) * 0.75,
                offsetY: (bounds.top + bounds.bottom) / 2,
                target: documents,
            } as unknown as IPointerEvent);
            expect(render.scene.getCursor()).toBe(bookmark ? CURSOR_TYPE.TEXT : CURSOR_TYPE.POINTER);
            const click = (x: number): void => {
                const event = {
                    button: 0,
                    ctrlKey: false,
                    metaKey: true,
                    offsetX: x,
                    offsetY: (bounds.top + bounds.bottom) / 2,
                    target: documents,
                    timeStamp: 100,
                } as unknown as IPointerEvent;
                documents.onPointerDown$.emitEvent(event);
                render.scene.onPointerUp$.emitEvent({ ...event, timeStamp: 180 });
            };
            click(bounds.left + (bounds.right - bounds.left) * 0.75);
            if (overlappingField) {
                expect(pointerDowns).toEqual([['field', 'link']]);
            }
            const expectedClick = expect.objectContaining({
                ctrlKey: false,
                metaKey: true,
                range: expect.objectContaining({ rangeId: 'link' }),
            });
            expect(clicks).toEqual([expectedClick]);
            click(bounds.right + 1);
            expect(clicks).toEqual([expectedClick]);

            const before = service.getCustomRangeBounds()[0].rects[0];
            render.scene.scale(0.7, 0.7);
            service.getCustomRangeBounds();
            documents.translate(240, 35);
            const after = service.getCustomRangeBounds()[0].rects[0];
            expect(after.left).toBeCloseTo(before.left + 240);
            expect(after.right).toBeCloseTo(before.right + 240);
            expect(after.top).toBeCloseTo(before.top + 35);
            expect(after.bottom).toBeCloseTo(before.bottom + 35);
            expect(service.isPointerOnInteractiveRange(
                ((after.left + after.right) / 2 - viewport.viewportScrollX) * 0.7,
                ((after.top + after.bottom) / 2 - viewport.viewportScrollY) * 0.7
            )).toBe(interactive);
            subscription.unsubscribe();
            pointerDownSubscription.unsubscribe();
        } finally {
            univer.dispose();
        }
    });

    it('keeps hover rectangles while scrolling within the buffer and rebuilds after a jump or layout change', () => {
        vi.useFakeTimers();
        const paragraphs = Array.from({ length: 24 }, (_, index) => `Link ${index} example text\r`);
        const dataStream = `${paragraphs.join('')}\n`;
        const customRanges: ICustomRange[] = [];
        let startIndex = 0;
        for (const [index, paragraph] of paragraphs.entries()) {
            customRanges.push({ startIndex, endIndex: startIndex + 'Link'.length - 1, rangeId: `link-${index}`, rangeType: CustomRangeType.HYPERLINK });
            startIndex += paragraph.length;
        }
        const snapshot: IDocumentData = {
            id: 'hover-scroll-window',
            body: {
                dataStream,
                paragraphs: Array.from(dataStream.matchAll(/\r/g), (match, index) => ({ startIndex: match.index, paragraphId: `p-${index}` })),
                sectionBreaks: [{ startIndex: dataStream.length - 1, sectionId: 'body' }],
                customRanges,
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 320, height: Number.POSITIVE_INFINITY },
                marginTop: 8,
                marginLeft: 12,
            },
        };

        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([DocLayoutExecutorService]);
            const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, snapshot);
            const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
            render.deactivate();
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const manager = render.with(DocSkeletonManagerService);
            const skeleton = manager.recalculate();
            const documents = injector.createInstance(Documents, 'hover-document', skeleton);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.scene.transformByState({ width: 320, height: 3200 });
            const viewport = injector.createInstance(Viewport, VIEWPORT_KEY.VIEW_MAIN, render.scene, { width: 240, height: 100 });
            const scrollBar = new ScrollBar(viewport);
            render.addRenderDependencies([[DocEventManagerService]]);
            const service = render.with(DocEventManagerService);
            let hovered: Array<{ range: { rangeId: string }; rects: unknown }> = [];
            const clicks: string[] = [];
            service.clickCustomRanges$.subscribe(({ range }) => clicks.push(range.rangeId));
            service.hoverCustomRangesRealTime$.subscribe((value) => hovered = value);
            const expected = service.getCustomRangeBounds();
            skeleton.makeDirty(true);
            manager.recalculate();
            const lookup = vi.spyOn(skeleton, 'findNodePositionByCharIndex');
            const hover = (index: number, scrollTop: number, bounds = expected) => {
                viewport.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: scrollTop });
                expect(Math.abs(viewport.viewportScrollY - scrollTop)).toBeLessThan(1);
                const range = bounds[index];
                const rect = range.rects[0];
                const event = {
                    buttons: 0,
                    button: 0,
                    offsetX: (rect.left + rect.right) / 2,
                    offsetY: (rect.top + rect.bottom) / 2 - viewport.viewportScrollY,
                    target: documents,
                    timeStamp: 100,
                } as unknown as IPointerEvent;
                render.scene.onPointerMove$.emitEvent(event);
                vi.advanceTimersByTime(31);
                expect(hovered.map(({ range, rects }) => ({ rangeId: range.rangeId, rects }))).toEqual([
                    { rangeId: range.customRange.rangeId, rects: range.rects },
                ]);
                return event;
            };
            const click = (event: IPointerEvent) => {
                documents.onPointerDown$.emitEvent(event);
                render.scene.onPointerUp$.emitEvent({ ...event, timeStamp: 180 });
            };

            hover(0, 0);
            expect(lookup.mock.calls.length).toBeGreaterThan(0);
            expect(lookup.mock.calls.some(([offset]) => offset >= customRanges[20].startIndex)).toBe(false);

            lookup.mockClear();
            hover(1, 20);
            hover(0, 0);
            expect(lookup).not.toHaveBeenCalled();

            const scrollTop = expected[20].rects[0].top - 16;
            hover(20, scrollTop);
            expect(lookup.mock.calls.some(([offset]) => offset >= customRanges[20].startIndex)).toBe(true);

            const inserted = 'Inserted paragraph\r';
            const edit = new TextX();
            edit.push({
                t: TextXActionType.INSERT,
                len: inserted.length,
                body: { dataStream: inserted, paragraphs: [{ startIndex: inserted.length - 1, paragraphId: 'inserted' }] },
            });
            model.apply(JSONX.getInstance().editOp(edit.serialize(), ['body']));
            manager.getViewModel().reset(model);
            manager.recalculate();
            lookup.mockClear();
            const updatedBounds = service.getCustomRangeBounds();
            expect(updatedBounds[20].rects[0].top).toBeGreaterThan(expected[20].rects[0].top);
            expect(lookup.mock.calls.some(([offset]) => offset >= customRanges[20].startIndex)).toBe(true);
            lookup.mockClear();
            click(hover(20, updatedBounds[20].rects[0].top - 16, updatedBounds));
            expect(clicks).toEqual(['link-20']);
            expect(lookup).not.toHaveBeenCalled();

            model.updateDocumentDataPageSize(170, Number.POSITIVE_INFINITY);
            manager.getViewModel().reset(model);
            skeleton.makeDirty(true);
            manager.recalculate();
            const reflowedBounds = service.getCustomRangeBounds();
            expect(reflowedBounds[20].rects[0].top).toBeGreaterThan(updatedBounds[20].rects[0].top);
            lookup.mockClear();
            click(hover(20, reflowedBounds[20].rects[0].top - 16, reflowedBounds));
            expect(clicks).toEqual(['link-20', 'link-20']);
            expect(lookup).not.toHaveBeenCalled();
            scrollBar.dispose();
        } finally {
            univer.dispose();
            vi.useRealTimers();
        }
    });

    it('reuses link rectangles across five scroll jumps in a 1,200-row vertical table', () => {
        vi.useFakeTimers();
        const count = 1_200;
        let rowIndex = 0;
        const tableStream = genEmptyTable(count, 1).dataStream.replace(/\r/g, () => `Link ${rowIndex++}\r`);
        const dataStream = `${tableStream}\r\n`;
        const table = { ...genTableSource(count, 1, 160), tableId: 'table' };
        for (const row of table.tableRows) {
            row.tableCells[0].textDirection = 'tbRlV';
        }
        const snapshot: IDocumentData = {
            id: 'vertical-table-link-cache',
            body: {
                dataStream,
                paragraphs: Array.from(dataStream.matchAll(/\r/g), (match, index) => ({ startIndex: match.index, paragraphId: `p-${index}` })),
                sectionBreaks: Array.from(dataStream.matchAll(/\n/g), (match, index) => ({ startIndex: match.index, sectionId: `s-${index}` })),
                tables: [{ tableId: 'table', startIndex: 0, endIndex: tableStream.length }],
                customRanges: Array.from(dataStream.matchAll(/Link \d+/g), (match, index) => ({
                    startIndex: match.index,
                    endIndex: match.index + match[0].length - 1,
                    rangeId: `link-${index}`,
                    rangeType: CustomRangeType.HYPERLINK,
                })),
            },
            tableSource: { table },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 320, height: Number.POSITIVE_INFINITY },
                marginTop: 8,
                marginLeft: 12,
            },
        };
        const univer = new Univer();
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([DocLayoutExecutorService]);
            const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, snapshot);
            const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
            render.deactivate();
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const skeleton = render.with(DocSkeletonManagerService).recalculate();
            const documents = injector.createInstance(Documents, 'vertical-table-document', skeleton);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.scene.transformByState({ width: 320, height: 100_000 });
            const viewport = injector.createInstance(Viewport, VIEWPORT_KEY.VIEW_MAIN, render.scene, { width: 240, height: 100 });
            const scrollBar = new ScrollBar(viewport);
            try {
                render.addRenderDependencies([[DocEventManagerService]]);
                const service = render.with(DocEventManagerService);
                const bounds = service.getCustomRangeBounds();
                expect(bounds.length).toBe(count);
                const lookup = vi.spyOn(skeleton, 'findNodePositionByCharIndex');
                let hovered: string[] = [];
                const clicks: string[] = [];
                service.hoverCustomRangesRealTime$.subscribe((ranges) => hovered = ranges.map(({ range }) => range.rangeId));
                service.clickCustomRanges$.subscribe(({ range }) => clicks.push(range.rangeId));
                const hover = (index: number, scrollTop: number) => {
                    viewport.scrollToViewportPos({ viewportScrollX: 0, viewportScrollY: scrollTop });
                    expect(viewport.viewportScrollY).toBeCloseTo(scrollTop, 0);
                    const { customRange, rects: [rect] } = bounds[index];
                    const event = {
                        buttons: 0,
                        button: 0,
                        offsetX: (rect.left + rect.right) / 2,
                        offsetY: (rect.top + rect.bottom) / 2 - viewport.viewportScrollY,
                        target: documents,
                        timeStamp: 100,
                    } as unknown as IPointerEvent;
                    render.scene.onPointerMove$.emitEvent(event);
                    vi.advanceTimersByTime(31);
                    expect(hovered).toEqual([customRange.rangeId]);
                    return event;
                };
                hover(0, 0);
                const positions = [1170, 953, 736, 519, 302];
                const lookupCounts = [];
                for (const index of positions) {
                    lookup.mockClear();
                    const event = hover(index, bounds[index].rects[0].top - 16);
                    lookupCounts.push(lookup.mock.calls.length);
                    lookup.mockClear();
                    documents.onPointerDown$.emitEvent(event);
                    render.scene.onPointerUp$.emitEvent({ ...event, timeStamp: 180 });
                    expect(lookup).not.toHaveBeenCalled();
                }
                expect(clicks).toEqual(positions.map((index) => `link-${index}`));
                expect(lookupCounts).toEqual(positions.map(() => 0));
            } finally {
                scrollBar.dispose();
            }
        } finally {
            univer.dispose();
            vi.useRealTimers();
        }
    });

    it.each([undefined, 'tbRlV'] as const)('keeps hover and clicks aligned after horizontal table scrolling (direction: %s)', (textDirection) => {
        vi.useFakeTimers();
        const stream = genEmptyTable(1, 2).dataStream.replace('\r', 'First link\r');
        const rowEnd = stream.lastIndexOf('\r');
        const tableStream = `${stream.slice(0, rowEnd)}Second link${stream.slice(rowEnd)}`;
        const bodyLink = 'Body link';
        const dataStream = `${tableStream}\r${bodyLink}\r\n`;
        const table = { ...genTableSource(1, 2, 160), tableId: 'table' };
        for (const cell of table.tableRows[0].tableCells) {
            cell.textDirection = textDirection;
        }
        const snapshot: IDocumentData = {
            id: 'hover-table-viewport',
            body: {
                dataStream,
                paragraphs: Array.from(dataStream.matchAll(/\r/g), (match, index) => ({ startIndex: match.index, paragraphId: `p-${index}` })),
                sectionBreaks: Array.from(dataStream.matchAll(/\n/g), (match, index) => ({ startIndex: match.index, sectionId: `s-${index}` })),
                tables: [{ startIndex: 0, endIndex: tableStream.length, tableId: 'table' }],
                customRanges: ['First link', 'Second link', bodyLink].map((label) => ({
                    startIndex: dataStream.indexOf(label),
                    endIndex: dataStream.indexOf(label) + label.length - 1,
                    rangeId: label,
                    rangeType: CustomRangeType.HYPERLINK,
                })),
            },
            tableSource: { table },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 300, height: Number.POSITIVE_INFINITY },
            },
        };
        const univer = new Univer();
        let tableViewport: { contentWidth: number; scrollLeft: number; viewportWidth: number } | null = null;
        setDocsTableRenderViewportProvider((_unitId, tableId) => tableId === 'table' ? tableViewport : null);
        try {
            const injector = univer.__getInjector();
            injector.add([IRenderManagerService, { useClass: RenderManagerService }]);
            injector.add([ICanvasColorService, { useClass: CanvasColorService }]);
            injector.add([DocLayoutExecutorService]);
            const model = univer.createUnit<IDocumentData, DocumentDataModel>(UniverInstanceType.UNIVER_DOC, snapshot);
            const render = injector.get(IRenderManagerService).createRender(model.getUnitId()) as RenderUnit;
            render.deactivate();
            render.addRenderDependencies([[DocSkeletonManagerService]]);
            const skeleton = render.with(DocSkeletonManagerService).recalculate();
            const documents = injector.createInstance(Documents, 'hover-table-document', skeleton);
            render.mainComponent = documents;
            render.scene.addObject(documents);
            render.scene.transformByState({ width: 320, height: 200 });
            injector.createInstance(Viewport, VIEWPORT_KEY.VIEW_MAIN, render.scene, { width: 300, height: 150 });
            render.addRenderDependencies([[DocEventManagerService]]);
            const service = render.with(DocEventManagerService);
            const [first, second] = service.getCustomRangeBounds().map(({ rects }) => rects[0]);
            const cellDistance = second.left - first.left;
            expect(cellDistance).toBeGreaterThan(0);
            tableViewport = { contentWidth: cellDistance * 2, scrollLeft: 0, viewportWidth: cellDistance };
            let hovered: string[] = [];
            service.hoverCustomRangesRealTime$.subscribe((value) => hovered = value.map(({ range }) => range.rangeId));
            const lookup = vi.spyOn(skeleton, 'findNodePositionByCharIndex');
            const clicks: string[] = [];
            service.clickCustomRanges$.subscribe(({ range }) => clicks.push(range.rangeId));
            const event = {
                buttons: 0,
                button: 0,
                offsetX: first.left + 4,
                offsetY: (first.top + first.bottom) / 2,
                target: documents,
                timeStamp: 100,
            } as unknown as IPointerEvent;
            const hover = () => {
                render.scene.onPointerMove$.emitEvent(event);
                vi.advanceTimersByTime(31);
            };
            const click = () => {
                documents.onPointerDown$.emitEvent(event);
                render.scene.onPointerUp$.emitEvent({ ...event, timeStamp: 180 });
            };
            hover();
            expect(hovered).toEqual(['First link']);
            click();
            expect(clicks).toEqual(['First link']);

            tableViewport.scrollLeft = cellDistance;
            lookup.mockClear();
            hover();
            expect(hovered).toEqual(['Second link']);
            expect(lookup).toHaveBeenCalled();
            expect(lookup.mock.calls.every(([offset]) => offset < dataStream.indexOf(bodyLink))).toBe(true);
            lookup.mockClear();
            click();
            expect(clicks).toEqual(['First link', 'Second link']);
            expect(lookup).not.toHaveBeenCalled();

            tableViewport.scrollLeft = 0;
            click();
            expect(clicks).toEqual(['First link', 'Second link', 'First link']);
            lookup.mockClear();
            hover();
            expect(hovered).toEqual(['First link']);
            expect(lookup).not.toHaveBeenCalled();
        } finally {
            univer.dispose();
            setDocsTableRenderViewportProvider(null);
            vi.useRealTimers();
        }
    });
});

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
    readonly onTransformChange$ = new EventSubject();

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
            getSnapshot: () => ({ body, documentStyle: {} }),
            getBody: () => body,
            getMutationRevision: () => 0,
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
