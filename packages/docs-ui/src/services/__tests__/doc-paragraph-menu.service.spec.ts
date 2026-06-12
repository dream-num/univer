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

import type { IMutiPageParagraphBound } from '../doc-event-manager.service';
import { DataStreamTreeTokenType, DocumentBlockRangeType, PresetListType } from '@univerjs/core';
import { DocumentEditArea } from '@univerjs/engine-render';
import { BehaviorSubject, Subject } from 'rxjs';
import { describe, expect, it, vi } from 'vitest';
import { getPreferredParagraphBoundsInRange, getTableBlockMenuHoverRect, getTableHorizontalViewportGeometry } from '../doc-event-manager.service';
import { DocParagraphMenuService } from '../doc-paragraph-menu.service';

describe('DocParagraphMenuService', () => {
    it('shows the paragraph menu for empty paragraphs', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: '\r',
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 0,
            startIndex: 0,
        }));

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
    });

    it('keeps hiding the paragraph menu for image-only paragraphs', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: '\b\r',
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 1,
            startIndex: 1,
        }));

        expect(attachPopupToRect).not.toHaveBeenCalled();
    });

    it('anchors paragraph menu to the latest paragraph bound after layout changes', () => {
        const latestFirstLine = { bottom: 30, left: 20, right: 120, top: 10 };
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            findParagraphBoundByIndex: vi.fn(() => ({
                firstLine: latestFirstLine,
            })),
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        }));

        const [anchor] = attachPopupToRect.mock.calls[0] as unknown as [() => unknown];
        expect(typeof anchor).toBe('function');
        expect(anchor()).toBe(latestFirstLine);
    });

    it('uses one paragraph menu for paragraphs in the same block range', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const blockText = `${DataStreamTreeTokenType.BLOCK_START}A\rB\r${DataStreamTreeTokenType.BLOCK_END}`;
        const service = createService({
            attachPopupToRect,
            dataStream: blockText,
            blockRanges: [{ blockId: 'block-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: blockText.length - 1 }],
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 1,
            paragraphEnd: 3,
            startIndex: 2,
        }));
        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 3,
            paragraphEnd: 5,
            startIndex: 4,
        }));

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
    });

    it('anchors a block range menu to the block top-left instead of the visible paragraph', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const blockText = `${DataStreamTreeTokenType.BLOCK_START}A\rB\r${DataStreamTreeTokenType.BLOCK_END}`;
        const firstBlockParagraph = createParagraphBound({
            paragraphStart: 1,
            paragraphEnd: 3,
            startIndex: 2,
        });
        firstBlockParagraph.firstLine = { bottom: 20, left: 10, right: 100, top: 0 };
        const secondBlockParagraph = createParagraphBound({
            paragraphStart: 3,
            paragraphEnd: 5,
            startIndex: 4,
        });
        secondBlockParagraph.firstLine = { bottom: 90, left: 20, right: 100, top: 70 };
        const service = createService({
            attachPopupToRect,
            dataStream: blockText,
            blockRanges: [{ blockId: 'block-1', blockType: DocumentBlockRangeType.QUOTE, startIndex: 0, endIndex: blockText.length - 1 }],
            paragraphBounds: new Map([
                [2, firstBlockParagraph],
                [4, secondBlockParagraph],
            ]),
            viewportScrollY: 60,
        });

        service.showParagraphMenu(secondBlockParagraph);

        const [anchor] = attachPopupToRect.mock.calls[0] as unknown as [() => { bottom: number; left: number; right: number; top: number }];
        expect(anchor()).toMatchObject({
            bottom: 0,
            left: 10,
            right: 10,
            top: 0,
        });
    });

    it('anchors the table menu at the table top-left drag handle position', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: '',
            tables: [{ tableId: 'table-1', startIndex: 10, endIndex: 30 }],
        });

        service.showTableMenu({
            pageIndex: 0,
            rect: {
                bottom: 170,
                left: 100,
                right: 400,
                top: 80,
            },
            tableId: 'table-1',
        });

        const [anchor, options] = attachPopupToRect.mock.calls[0] as unknown as [() => { bottom: number; left: number; right: number; top: number }, { direction: string }];
        expect(options.direction).toBe('top-right');
        expect(anchor()).toEqual({
            bottom: 76,
            left: 96,
            right: 96,
            top: 76,
        });
    });

    it('shows a compact paragraph menu for content inside table cells', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}Cell\r${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`,
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 9 }],
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 3,
            paragraphEnd: 7,
            startIndex: 7,
        }));

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(service.activeTarget?.draggable).toBe(true);
        expect(service.activeTarget?.cellRange).toEqual({ startOffset: 2, endOffset: 8 });
    });

    it('does not let the same table hover target steal back a cell paragraph menu', () => {
        const disposeTableMenu = vi.fn();
        const disposeCellMenu = vi.fn();
        const attachPopupToRect = vi.fn()
            .mockReturnValueOnce({ canDispose: () => true, dispose: disposeTableMenu })
            .mockReturnValueOnce({ canDispose: () => true, dispose: disposeCellMenu });
        const service = createService({
            attachPopupToRect,
            dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}Cell\r${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`,
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 9 }],
        });
        const tableBound = {
            pageIndex: 0,
            rect: {
                bottom: 170,
                left: 100,
                right: 400,
                top: 80,
            },
            tableId: 'table-1',
        };

        service.showTableMenu(tableBound);
        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 3,
            paragraphEnd: 7,
            startIndex: 7,
        }));
        service.showTableMenu(tableBound);

        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(service.activeTarget?.key).toBe('paragraph:7');
        expect(disposeCellMenu).not.toHaveBeenCalled();
        expect(attachPopupToRect).toHaveBeenCalledTimes(2);
    });

    it('anchors first-column table-cell paragraph menus to the left of the row header lane', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = {
            ...createParagraphBound({
                paragraphStart: 3,
                paragraphEnd: 7,
                startIndex: 7,
            }),
            firstLine: { bottom: 140, left: 140, right: 240, top: 120 },
            rowIndex: 0,
            colIndex: 0,
            tableId: 'table-1',
        };
        const service = createService({
            attachPopupToRect,
            dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}Cell\r${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`,
            findParagraphBoundByIndex: vi.fn(() => paragraph),
            tableCellBounds: new Map([[
                'table-1',
                [{
                    rect: { bottom: 180, left: 100, right: 260, top: 100 },
                    pageIndex: 0,
                    rowIndex: 0,
                    colIndex: 0,
                    tableId: 'table-1',
                }],
            ]]),
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 9 }],
        });

        service.showParagraphMenu(paragraph as IMutiPageParagraphBound);

        const [anchor] = attachPopupToRect.mock.calls[0] as unknown as [() => { bottom: number; left: number; right: number; top: number }];
        expect(anchor()).toEqual({
            bottom: 140,
            left: 80,
            right: 80,
            top: 120,
        });
    });

    it('keeps non-first-column table-cell paragraph menus clear of the column resize edge', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = {
            ...createParagraphBound({
                paragraphStart: 3,
                paragraphEnd: 7,
                startIndex: 7,
            }),
            firstLine: { bottom: 140, left: 300, right: 400, top: 120 },
            rowIndex: 0,
            colIndex: 1,
            tableId: 'table-1',
        };
        const service = createService({
            attachPopupToRect,
            dataStream: `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}A${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_CELL_START}Cell\r${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`,
            findParagraphBoundByIndex: vi.fn(() => paragraph),
            tableCellBounds: new Map([[
                'table-1',
                [{
                    rect: { bottom: 180, left: 100, right: 260, top: 100 },
                    pageIndex: 0,
                    rowIndex: 0,
                    colIndex: 0,
                    tableId: 'table-1',
                }, {
                    rect: { bottom: 180, left: 280, right: 440, top: 100 },
                    pageIndex: 0,
                    rowIndex: 0,
                    colIndex: 1,
                    tableId: 'table-1',
                }],
            ]]),
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: 12 }],
        });

        service.showParagraphMenu(paragraph as IMutiPageParagraphBound);

        const [anchor] = attachPopupToRect.mock.calls[0] as unknown as [() => { bottom: number; left: number; right: number; top: number }];
        expect(anchor()).toEqual({
            bottom: 140,
            left: 270,
            right: 270,
            top: 120,
        });
    });

    it('uses list icons for list paragraph menus', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Item\r',
            paragraphs: [{
                startIndex: 4,
                bullet: {
                    listType: PresetListType.ORDER_LIST,
                },
            }],
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 4,
            startIndex: 4,
        }));

        expect(service.activeTarget?.icon).toBe('OrderIcon');
    });

    it('keeps cell paragraph move ranges inside the current table cell', () => {
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const dataStream = `${DataStreamTreeTokenType.TABLE_START}${DataStreamTreeTokenType.TABLE_ROW_START}${DataStreamTreeTokenType.TABLE_CELL_START}A\rB\r${DataStreamTreeTokenType.TABLE_CELL_END}${DataStreamTreeTokenType.TABLE_ROW_END}${DataStreamTreeTokenType.TABLE_END}`;
        const service = createService({
            attachPopupToRect,
            dataStream,
            paragraphs: [
                { startIndex: 4 },
                { startIndex: 6 },
            ],
            tables: [{ tableId: 'table-1', startIndex: 0, endIndex: dataStream.length - 1 }],
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 3,
            paragraphEnd: 4,
            startIndex: 4,
        }));

        expect(service.activeTarget?.moveRange).toEqual({
            startOffset: 3,
            endOffset: 5,
        });
    });

    it('keeps a hover bridge between the table and its top-left block menu', () => {
        expect(getTableBlockMenuHoverRect({
            bottom: 170,
            left: 100,
            right: 400,
            top: 80,
        })).toEqual({
            bottom: 170,
            left: 28,
            right: 400,
            top: 38,
        });
    });

    it('projects table cell block-menu geometry through the horizontal table viewport', () => {
        expect(getTableHorizontalViewportGeometry(100, 600, {
            contentWidth: 600,
            leadingInsetLeft: 80,
            scrollLeft: 160,
            viewportWidth: 240,
        })).toEqual({
            scrollLeft: 160,
            visibleLeft: 20,
            visibleRight: 260,
        });
    });

    it('prefers table paragraph bounds over body bounds for block range anchors', () => {
        const bodyBound = createParagraphBound({
            paragraphStart: 1,
            paragraphEnd: 3,
            startIndex: 2,
        });
        bodyBound.firstLine = { bottom: 20, left: 10, right: 100, top: 0 };
        const tableBound = createParagraphBound({
            paragraphStart: 1,
            paragraphEnd: 3,
            startIndex: 2,
        });
        tableBound.firstLine = { bottom: 20, left: 140, right: 240, top: 0 };

        expect(getPreferredParagraphBoundsInRange([bodyBound], [tableBound], 0, 4)).toEqual([tableBound]);
    });

    it('keeps the current menu mounted while block dragging is locked', () => {
        const dispose = vi.fn();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        }));

        service.setBlockMenuDragging(true);
        service.hideParagraphMenu(true);

        expect(dispose).not.toHaveBeenCalled();
        expect(service.activeTarget?.kind).toBe('paragraph');

        service.setBlockMenuDragging(false);
        service.hideParagraphMenu(true);

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(service.activeTarget).toBeNull();
    });

    it('hides the paragraph menu on keyboard input', () => {
        const dispose = vi.fn();
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            keydown$,
        });

        service.showParagraphMenu(createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        }));

        keydown$.next({ event: { key: 'a' } });

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(service.activeTarget).toBeNull();
    });

    it('intercepts slash keydown and requests the insert menu without inserting slash', () => {
        const dispose = vi.fn();
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose }));
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            keydown$,
        });
        const slashRequests: unknown[] = [];
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        });

        service.slashMenuRequest$.subscribe((request) => {
            if (request) {
                slashRequests.push(request);
            }
        });
        service.showParagraphMenu(paragraph);

        keydown$.next({
            activeRange: { startOffset: 2, endOffset: 2, collapsed: true },
            event: { key: '/', preventDefault, stopPropagation },
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(dispose).not.toHaveBeenCalled();
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(slashRequests).toHaveLength(1);
        expect(slashRequests[0]).toMatchObject({
            anchorRect: paragraph.firstLine,
        });
    });

    it('opens the slash insert menu from the current cursor paragraph when no menu is active', () => {
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            keydown$,
            paragraphBounds: new Map([[5, paragraph]]),
        });
        const slashRequests: unknown[] = [];

        service.slashMenuRequest$.subscribe((request) => {
            if (request) {
                slashRequests.push(request);
            }
        });

        keydown$.next({
            activeRange: { startOffset: 2, endOffset: 2, collapsed: true },
            event: { key: '/', preventDefault: vi.fn(), stopPropagation: vi.fn() },
        });

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(slashRequests).toHaveLength(1);
    });

    it('opens the slash insert menu inside a paragraph that already has text', () => {
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 11,
            startIndex: 11,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'Hello world\r',
            keydown$,
            paragraphBounds: new Map([[11, paragraph]]),
        });
        const slashRequests: unknown[] = [];

        service.slashMenuRequest$.subscribe((request) => {
            if (request) {
                slashRequests.push(request);
            }
        });

        keydown$.next({
            activeRange: { startOffset: 5, endOffset: 5, collapsed: true },
            event: { key: '/', preventDefault: vi.fn(), stopPropagation: vi.fn() },
        });

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(service.activeTarget?.emptyMode).toBe(false);
        expect(slashRequests).toHaveLength(1);
    });

    it('opens the slash insert menu inside an existing list paragraph', () => {
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 9,
            startIndex: 9,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'List item\r',
            keydown$,
            paragraphBounds: new Map([[9, paragraph]]),
            paragraphs: [{
                bullet: { listType: PresetListType.BULLET_LIST },
                startIndex: 9,
            }],
        });
        const slashRequests: unknown[] = [];

        service.slashMenuRequest$.subscribe((request) => {
            if (request) {
                slashRequests.push(request);
            }
        });

        keydown$.next({
            activeRange: { startOffset: 4, endOffset: 4, collapsed: true },
            event: { key: '/', preventDefault: vi.fn(), stopPropagation: vi.fn() },
        });

        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(service.activeTarget?.icon).toBe('UnorderIcon');
        expect(slashRequests).toHaveLength(1);
    });

    it('falls back to opening the slash insert menu from input-before without inserting slash', () => {
        const inputBefore$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const preventDefault = vi.fn();
        const stopPropagation = vi.fn();
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 11,
            startIndex: 11,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'Hello world\r',
            inputBefore$,
            paragraphBounds: new Map([[11, paragraph]]),
        });
        const slashRequests: unknown[] = [];

        service.slashMenuRequest$.subscribe((request) => {
            if (request) {
                slashRequests.push(request);
            }
        });

        inputBefore$.next({
            activeRange: { startOffset: 5, endOffset: 5, collapsed: true },
            content: '/',
            event: { data: '/', preventDefault, stopPropagation },
        });

        expect(preventDefault).toHaveBeenCalledTimes(1);
        expect(stopPropagation).toHaveBeenCalledTimes(1);
        expect(attachPopupToRect).toHaveBeenCalledTimes(1);
        expect(service.activeTarget?.kind).toBe('paragraph');
        expect(slashRequests).toHaveLength(1);
    });

    it('hides the slash insert menu immediately when clicking back into the document body', () => {
        const dispose = vi.fn();
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose }));
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            keydown$,
            paragraphBounds: new Map([[5, paragraph]]),
        });

        keydown$.next({
            activeRange: { startOffset: 2, endOffset: 2, collapsed: true },
            event: { key: '/', preventDefault: vi.fn(), stopPropagation: vi.fn() },
        });

        const [, popupOptions] = attachPopupToRect.mock.calls[0] as unknown as [unknown, { onClickOutside: () => void }];
        popupOptions.onClickOutside();

        expect(dispose).toHaveBeenCalledTimes(1);
        expect(service.activeTarget).toBeNull();
    });

    it('clears the slash insert menu request after hiding so hover does not reopen it', () => {
        const keydown$ = new Subject();
        const attachPopupToRect = vi.fn(() => ({ canDispose: () => true, dispose: vi.fn() }));
        const paragraph = createParagraphBound({
            paragraphStart: 0,
            paragraphEnd: 5,
            startIndex: 5,
        });
        const service = createService({
            attachPopupToRect,
            dataStream: 'Title\r',
            keydown$,
            paragraphBounds: new Map([[5, paragraph]]),
        });

        keydown$.next({
            activeRange: { startOffset: 2, endOffset: 2, collapsed: true },
            event: { key: '/', preventDefault: vi.fn(), stopPropagation: vi.fn() },
        });

        const [, popupOptions] = attachPopupToRect.mock.calls[0] as unknown as [unknown, { onClickOutside: () => void }];
        popupOptions.onClickOutside();

        const replayedRequests: unknown[] = [];
        const subscription = service.slashMenuRequest$.subscribe((request) => replayedRequests.push(request));
        subscription.unsubscribe();

        expect(replayedRequests).toEqual([null]);
    });
});

function createService(options: {
    attachPopupToRect: ReturnType<typeof vi.fn>;
    blockRanges?: Array<{ blockId: string; blockType: string; endIndex: number; startIndex: number }>;
    dataStream: string;
    findParagraphBoundByIndex?: (index: number) => unknown;
    paragraphs?: Array<{ bullet?: { listType?: PresetListType }; startIndex: number }>;
    paragraphBounds?: Map<number, IMutiPageParagraphBound>;
    inputBefore$?: Subject<unknown>;
    keydown$?: Subject<unknown>;
    tableCellBounds?: Map<string, Array<{ colIndex: number; pageIndex: number; rect: { bottom: number; left: number; right: number; top: number }; rowIndex: number; tableId: string }>>;
    tables?: Array<{ endIndex: number; startIndex: number; tableId: string }>;
    viewportScrollY?: number;
}) {
    return new DocParagraphMenuService(
        {
            unitId: 'doc-1',
            unit: {
                getBody: () => ({
                    blockRanges: options.blockRanges ?? [],
                    dataStream: options.dataStream,
                    paragraphs: options.paragraphs ?? [],
                    tables: options.tables ?? [],
                }),
                getDisabled: () => false,
            },
            engine: {
                getCanvasElement: () => ({
                    getBoundingClientRect: () => ({ left: 0, top: 0 }),
                }),
            },
            scene: {
                getViewport: () => ({
                    height: 300,
                    onScrollAfter$: {
                        subscribeEvent: vi.fn(() => ({ dispose: vi.fn() })),
                    },
                    viewportScrollY: options.viewportScrollY ?? 0,
                }),
            },
        } as never,
        {
            getActiveTextRange: () => null,
            replaceDocRanges: vi.fn(),
            textSelection$: new Subject(),
        } as never,
        {
            hoverParagraphRealTime$: new BehaviorSubject(null),
            hoverParagraphLeft$: new BehaviorSubject(null),
            clickCustomRanges$: new Subject(),
            findParagraphBoundByIndex: options.findParagraphBoundByIndex ?? vi.fn(() => null),
            findParagraphBoundsInRange: vi.fn((startIndex: number, endIndex: number) => [...(options.paragraphBounds ?? new Map()).values()]
                .filter((bound) => Math.max(bound.paragraphStart, startIndex) <= Math.min(bound.paragraphEnd, endIndex))),
            findTableCellBound: vi.fn((tableId: string, rowIndex: number, colIndex: number, pageIndex?: number) => options.tableCellBounds?.get(tableId)?.find((bound) =>
                bound.rowIndex === rowIndex &&
                bound.colIndex === colIndex &&
                (pageIndex == null || bound.pageIndex === pageIndex)
            )),
            paragraphBounds: options.paragraphBounds ?? new Map(),
            tableBounds: new Map(),
        } as never,
        {
            attachPopupToRect: options.attachPopupToRect,
        } as never,
        {
            getViewModel: () => ({
                getEditArea: () => DocumentEditArea.BODY,
            }),
        } as never,
        {
            floatMenu: null,
        } as never,
        {
            onInputBefore$: options.inputBefore$ ?? new Subject(),
            onKeydown$: options.keydown$ ?? new Subject(),
        } as never
    );
}

function createParagraphBound(partial: Pick<IMutiPageParagraphBound, 'paragraphEnd' | 'paragraphStart' | 'startIndex'>): IMutiPageParagraphBound {
    const rect = { bottom: 20, left: 10, right: 100, top: 0 };

    return {
        ...partial,
        firstLine: rect,
        pageIndex: 0,
        rect,
        rects: [rect],
    };
}
