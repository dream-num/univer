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

import type { DocumentDataModel, ICustomBlock, ICustomTable, IDocumentBlockRange, INeedCheckDisposable, Nullable } from '@univerjs/core';
import type { IBoundRectNoAngle, IRenderContext, IRenderModule, ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IMutiPageParagraphBound, ITableBound, ITableParagraphBound } from './doc-event-manager.service';
import type { IEditorInputConfig } from './selection/doc-selection-render.service';
import { BlockType, DataStreamTreeTokenType, Disposable, DOC_RANGE_TYPE, DocumentBlockType, getParagraphContentStartOffset, Inject, isInternalEditorID, PresetListType } from '@univerjs/core';
import { DocSelectionManagerService, DocSkeletonManagerService } from '@univerjs/docs';
import { DocumentEditArea } from '@univerjs/engine-render';
import { BehaviorSubject, combineLatest, first, throttleTime } from 'rxjs';
import { VIEWPORT_KEY } from '../basics/docs-view-key';
import {
    DOC_PARAGRAPH_MENU_COMPONENT_KEY,
    DOC_TABLE_BLOCK_MENU_COMPONENT_KEY,
} from '../views/paragraph-menu/component-keys';
import { DocEventManagerService } from './doc-event-manager.service';
import {
    calcDocRangePositions,
    DocCanvasPopManagerService,
    transformBound2OffsetBound,
    transformOffset2Bound,
} from './doc-popup-manager.service';
import { DocFloatMenuService } from './float-menu.service';
import { DocSelectionRenderService } from './selection/doc-selection-render.service';

export interface IDocBlockMenuTarget {
    kind: Exclude<DocumentBlockType, DocumentBlockType.COLUMN_GROUP>;
    key: string;
    paragraph?: IMutiPageParagraphBound;
    blockRange?: IDocumentBlockRange;
    table?: ICustomTable;
    customBlock?: ICustomBlock;
    icon?: string;
    cellRange?: {
        startOffset: number;
        endOffset: number;
    };
    menuRange: {
        startOffset: number;
        endOffset: number;
        collapsed: boolean;
    };
    moveRange: {
        startOffset: number;
        endOffset: number;
    };
    emptyMode: boolean;
    draggable: boolean;
}

export interface IDocBlockDropTarget {
    targetOffset: number;
    rect: {
        left: number;
        right: number;
        top: number;
        bottom: number;
    };
}

export interface IDocSlashMenuRequest {
    anchorRect: IBoundRectNoAngle;
    nonce: number;
    target: IDocBlockMenuTarget;
}

const BLOCK_RANGE_ICON_MAP: Record<string, string> = {
    code: 'CodeBlockIcon',
    quote: 'QuoteIcon',
    callout: 'CalloutIcon',
};

const LIST_ICON_MAP: Partial<Record<PresetListType, string>> = {
    [PresetListType.ORDER_LIST]: 'OrderIcon',
    [PresetListType.ORDER_LIST_1]: 'OrderIcon',
    [PresetListType.ORDER_LIST_2]: 'OrderIcon',
    [PresetListType.ORDER_LIST_3]: 'OrderIcon',
    [PresetListType.ORDER_LIST_4]: 'OrderIcon',
    [PresetListType.ORDER_LIST_5]: 'OrderIcon',
    [PresetListType.ORDER_LIST_QUICK_2]: 'OrderIcon',
    [PresetListType.ORDER_LIST_QUICK_3]: 'OrderIcon',
    [PresetListType.ORDER_LIST_QUICK_4]: 'OrderIcon',
    [PresetListType.ORDER_LIST_QUICK_5]: 'OrderIcon',
    [PresetListType.ORDER_LIST_QUICK_6]: 'OrderIcon',
    [PresetListType.BULLET_LIST]: 'UnorderIcon',
    [PresetListType.BULLET_LIST_1]: 'UnorderIcon',
    [PresetListType.BULLET_LIST_2]: 'UnorderIcon',
    [PresetListType.BULLET_LIST_3]: 'UnorderIcon',
    [PresetListType.BULLET_LIST_4]: 'UnorderIcon',
    [PresetListType.BULLET_LIST_5]: 'UnorderIcon',
    [PresetListType.CHECK_LIST]: 'TodoListDoubleIcon',
    [PresetListType.CHECK_LIST_CHECKED]: 'TodoListDoubleIcon',
};

interface IDocExpandedSelectionState {
    hasExpandedTextRange: boolean;
    hasRectRange: boolean;
}

export class DocParagraphMenuService extends Disposable implements IRenderModule {
    private _paragraphMenu: {
        paragraph: IMutiPageParagraphBound;
        target: IDocBlockMenuTarget;
        blockRange?: IDocumentBlockRange;
        disposable: INeedCheckDisposable;
        active: boolean;
    } | null = null;

    private readonly _activeTarget$ = new BehaviorSubject<IDocBlockMenuTarget | null>(null);
    readonly activeTarget$ = this._activeTarget$.asObservable();
    private readonly _slashMenuRequest$ = new BehaviorSubject<IDocSlashMenuRequest | null>(null);
    readonly slashMenuRequest$ = this._slashMenuRequest$.asObservable();
    private _isBlockMenuDragging = false;
    private _isSlashMenuActive = false;
    private _slashMenuRequestNonce = 0;

    get activeParagraph() {
        return this._paragraphMenu?.paragraph;
    }

    get activeTarget() {
        return this._paragraphMenu?.target ?? null;
    }

    setBlockMenuDragging(isDragging: boolean) {
        this._isBlockMenuDragging = isDragging;
    }

    get isBlockMenuDragging() {
        return this._isBlockMenuDragging;
    }

    constructor(
        private _context: IRenderContext<DocumentDataModel>,
        @Inject(DocSelectionManagerService) private _docSelectionManagerService: DocSelectionManagerService,
        @Inject(DocEventManagerService) private _docEventManagerService: DocEventManagerService,
        @Inject(DocCanvasPopManagerService) private _docPopupManagerService: DocCanvasPopManagerService,
        @Inject(DocSkeletonManagerService) private _docSkeletonManagerService: DocSkeletonManagerService,
        @Inject(DocFloatMenuService) private _floatMenuService: DocFloatMenuService,
        @Inject(DocSelectionRenderService) private _docSelectionRenderService: DocSelectionRenderService
    ) {
        super();

        if (isInternalEditorID(this._context.unitId)) {
            return;
        }

        this._init();
    }

    private _isCursorInActiveParagraph() {
        if (!this._paragraphMenu) {
            return false;
        }

        const activeTextRange = this._docSelectionManagerService.getActiveTextRange();
        if (!activeTextRange?.collapsed) {
            return false;
        }

        if (
            !activeTextRange?.collapsed ||
            activeTextRange.startOffset < this._paragraphMenu.paragraph.paragraphStart ||
            activeTextRange.startOffset > this._paragraphMenu.paragraph.paragraphEnd
        ) {
            return false;
        }

        return true;
    }

    private _getExpandedSelectionState(ranges: readonly ITextRangeWithStyle[]): IDocExpandedSelectionState {
        return ranges.reduce<IDocExpandedSelectionState>((state, range) => {
            if (range.rangeType === DOC_RANGE_TYPE.RECT) {
                state.hasRectRange = true;
                return state;
            }

            if (range.collapsed === false) {
                state.hasExpandedTextRange = true;
                return state;
            }

            if (typeof range.startOffset === 'number' &&
                typeof range.endOffset === 'number' &&
                range.endOffset > range.startOffset &&
                range.collapsed !== true) {
                state.hasExpandedTextRange = true;
            }

            return state;
        }, {
            hasExpandedTextRange: false,
            hasRectRange: false,
        });
    }

    private _hasExpandedSelectionRanges(ranges: readonly ITextRangeWithStyle[]) {
        const state = this._getExpandedSelectionState(ranges);
        return state.hasExpandedTextRange || state.hasRectRange;
    }

    private _hasExpandedTextSelection() {
        return this._getExpandedSelectionState(this._docSelectionManagerService.getDocRanges()).hasExpandedTextRange;
    }

    private _hasExpandedSelection() {
        return this._hasExpandedSelectionRanges(this._docSelectionManagerService.getDocRanges());
    }

    setParagraphMenuActive(active: boolean) {
        if (this._paragraphMenu) {
            this._paragraphMenu.active = active;
        }
    }

    private _init() {
        const handleHoverTarget = (paragraph: Nullable<IMutiPageParagraphBound>, tableBound: Nullable<ITableBound>) => {
            if (this._isBlockMenuDragging) {
                return;
            }

            if (this._docSelectionRenderService.isOnPointerEvent) {
                this.hideParagraphMenu(true);
                return;
            }

            const selectionState = this._getExpandedSelectionState(this._docSelectionManagerService.getDocRanges());
            if (selectionState.hasExpandedTextRange) {
                this.hideParagraphMenu(true);
                return;
            }

            if (selectionState.hasRectRange) {
                if (tableBound) {
                    this.showTableMenu(tableBound);
                    return;
                }

                if (this._paragraphMenu?.target.kind === DocumentBlockType.TABLE) {
                    return;
                }

                this.hideParagraphMenu(true);
                return;
            }

            const viewModel = this._docSkeletonManagerService.getViewModel();
            if (
                viewModel.getEditArea() === DocumentEditArea.BODY &&
                !this._floatMenuService.floatMenu &&
                !this._context.unit.getDisabled()
            ) {
                if (this._paragraphMenu?.active) {
                    return;
                }

                if (paragraph) {
                    this.showParagraphMenu(paragraph);
                    return;
                }

                if (tableBound) {
                    this.showTableMenu(tableBound);
                    return;
                }
            }

            this.hideParagraphMenu(true);
        };

        this.disposeWithMe(
            combineLatest([
                this._docEventManagerService.hoverParagraphRealTime$,
                this._docEventManagerService.hoverParagraphLeft$,
                this._docEventManagerService.hoverTableRealTime$ ?? new BehaviorSubject<Nullable<ITableBound>>(null),
            ])
                .pipe(throttleTime(16, undefined, { leading: true, trailing: true }))
                .subscribe(([p, left, table]) => {
                    const paragraph = p ?? left;
                    handleHoverTarget(paragraph, table);
                })
        );

        this.disposeWithMe(this._docSelectionRenderService.onSelectionStart$.subscribe(() => {
            this.hideParagraphMenu(true);
        }));

        this.disposeWithMe(this._docSelectionManagerService.textSelection$.subscribe(({ textRanges, rectRanges }) => {
            const selectionState = this._getExpandedSelectionState([...textRanges, ...rectRanges]);
            if (selectionState.hasExpandedTextRange || (selectionState.hasRectRange && this._paragraphMenu?.target.kind !== DocumentBlockType.TABLE)) {
                this.hideParagraphMenu(true);
            }
        }));

        let lastScrollY = 0;
        this.disposeWithMe(this._context.scene.getViewport(VIEWPORT_KEY.VIEW_MAIN)!.onScrollAfter$.subscribeEvent((e) => {
            if (lastScrollY === e.scrollY) {
                return;
            }

            lastScrollY = e.scrollY;
            if (this._paragraphMenu?.blockRange) {
                return;
            }
            if (this._isBlockMenuDragging) {
                return;
            }
            this.hideParagraphMenu(true);
        }));

        this.disposeWithMe(this._docEventManagerService.clickCustomRanges$.subscribe(() => {
            if (this._isBlockMenuDragging) {
                return;
            }
            this.hideParagraphMenu(true);
        }));

        this.disposeWithMe(this._docSelectionRenderService.onKeydown$.subscribe((config) => {
            if (this._isBlockMenuDragging) {
                return;
            }

            if (this._handleSlashMenuKeydown(config)) {
                return;
            }

            this.hideParagraphMenu(true);
        }));

        this.disposeWithMe(this._docSelectionRenderService.onInputBefore$.subscribe((config) => {
            if (!config || this._isBlockMenuDragging) {
                return;
            }

            this._handleSlashMenuInputBefore(config);
        }));
    }

    private _handleSlashMenuKeydown(config: IEditorInputConfig): boolean {
        if (!this._shouldOpenSlashMenu(config)) {
            return false;
        }

        return this._openSlashMenu(config);
    }

    private _handleSlashMenuInputBefore(config: IEditorInputConfig): boolean {
        if (!this._shouldOpenSlashMenuFromInput(config)) {
            return false;
        }

        return this._openSlashMenu(config);
    }

    private _openSlashMenu(config: IEditorInputConfig): boolean {
        config.event.preventDefault();
        config.event.stopPropagation();

        const paragraph = this._getSlashMenuParagraph(config);
        if (!paragraph) {
            return true;
        }

        this.showParagraphMenu(paragraph);
        const target = this.activeTarget;
        if (!target) {
            return true;
        }

        this._slashMenuRequest$.next({
            anchorRect: this._getSlashMenuAnchorRect(config, paragraph),
            nonce: ++this._slashMenuRequestNonce,
            target,
        });
        this._isSlashMenuActive = true;
        return true;
    }

    private _shouldOpenSlashMenu(config: IEditorInputConfig): boolean {
        const event = config.event as KeyboardEvent;
        if (event.key !== '/' || event.altKey || event.ctrlKey || event.metaKey) {
            return false;
        }

        return this._getCollapsedTextRange(config) != null;
    }

    private _shouldOpenSlashMenuFromInput(config: IEditorInputConfig): boolean {
        const event = config.event as InputEvent;
        const content = config.content ?? event.data ?? '';
        if (content !== '/') {
            return false;
        }

        return this._getCollapsedTextRange(config) != null;
    }

    private _getCollapsedTextRange(config: IEditorInputConfig): ITextRangeWithStyle | null {
        const activeRange = config.activeRange ?? this._docSelectionManagerService.getActiveTextRange();
        if (!activeRange) {
            return null;
        }

        if (activeRange.collapsed || activeRange.startOffset === activeRange.endOffset) {
            return {
                ...activeRange,
                collapsed: true,
            };
        }

        return null;
    }

    private _getSlashMenuParagraph(config: IEditorInputConfig): IMutiPageParagraphBound | null {
        const activeRange = this._getCollapsedTextRange(config);
        const offset = activeRange?.startOffset;
        const activeParagraph = this._paragraphMenu?.paragraph ?? null;

        if (activeParagraph && offset != null && offset >= activeParagraph.paragraphStart && offset <= activeParagraph.paragraphEnd) {
            return activeParagraph;
        }

        if (activeParagraph && offset == null) {
            return activeParagraph;
        }

        if (offset == null) {
            return null;
        }

        return [...this._docEventManagerService.paragraphBounds.values()]
            .find((paragraph) => offset >= paragraph.paragraphStart && offset <= paragraph.paragraphEnd)
            ?? null;
    }

    private _getSlashMenuAnchorRect(config: IEditorInputConfig, paragraph: IMutiPageParagraphBound): IBoundRectNoAngle {
        const activeRange = this._getCollapsedTextRange(config);
        if (!activeRange) {
            return paragraph.firstLine;
        }

        try {
            return calcDocRangePositions({
                ...activeRange,
                collapsed: true,
                endOffset: activeRange.startOffset,
            }, this._context as never)?.[0] ?? paragraph.firstLine;
        } catch {
            // Unit tests and lightweight render contexts may not include the full skeleton/render stack.
            return paragraph.firstLine;
        }
    }

    showParagraphMenu(paragraph: IMutiPageParagraphBound) {
        if (this._hasExpandedSelection()) {
            this.hideParagraphMenu(true);
            return;
        }

        const target = this._buildParagraphMenuTarget(paragraph);
        if (!target) {
            this.hideParagraphMenu(true);
            return;
        }

        if (this._paragraphMenu?.target.key === target.key) {
            return;
        }

        this.hideParagraphMenu(true);
        const targetParagraph = target.paragraph ?? paragraph;
        const blockRange = target.blockRange;

        const getFirstLine = () => {
            const latestParagraphBound = this._docEventManagerService.findParagraphBoundByIndex(targetParagraph.startIndex) ?? targetParagraph;
            const baseAnchor = blockRange
                ? getBlockRangeAnchorRect(this._docEventManagerService, blockRange, paragraph)
                : latestParagraphBound.firstLine ?? paragraph.firstLine;

            if (!target.cellRange) {
                return baseAnchor;
            }

            return getTableCellParagraphAnchorRect(this._docEventManagerService, latestParagraphBound, baseAnchor);
        };

        const disposable = this._docPopupManagerService.attachPopupToRect(
            getFirstLine,
            {
                componentKey: DOC_PARAGRAPH_MENU_COMPONENT_KEY,
                direction: 'left-center',
                onClickOutside: () => {
                    if (this._isSlashMenuActive) {
                        this.hideParagraphMenu(true);
                        return;
                    }

                    this._docSelectionManagerService.textSelection$.pipe(first()).subscribe(() => {
                        if (!this._isCursorInActiveParagraph()) {
                            this.hideParagraphMenu(true);
                        }
                    });
                },
                zIndex: 101,
            },
            this._context.unitId
        );

        this._paragraphMenu = {
            paragraph: targetParagraph,
            target,
            blockRange,
            disposable,
            active: false,
        };
        this._activeTarget$.next(target);
    }

    showTableMenu(tableBound: ITableBound) {
        if (this._hasExpandedTextSelection()) {
            this.hideParagraphMenu(true);
            return;
        }

        const body = this._context.unit.getBody();
        const table = body?.tables?.find((item) => item.tableId === tableBound.tableId);
        if (!table) {
            return;
        }

        const target: IDocBlockMenuTarget = {
            kind: DocumentBlockType.TABLE,
            key: `${DocumentBlockType.TABLE}:${table.tableId}`,
            table,
            icon: 'GridIcon',
            menuRange: {
                startOffset: table.startIndex,
                endOffset: table.endIndex,
                collapsed: false,
            },
            moveRange: {
                startOffset: table.startIndex,
                endOffset: table.endIndex,
            },
            emptyMode: false,
            draggable: true,
        };

        if (this._shouldKeepCurrentCellMenuForTable(table)) {
            return;
        }

        if (this._paragraphMenu?.target.key === target.key) {
            return;
        }

        const anchorRect = getTableAnchorRect(tableBound);
        const paragraph: IMutiPageParagraphBound = {
            rect: tableBound.rect,
            rects: [tableBound.rect],
            paragraphStart: table.startIndex,
            paragraphEnd: table.endIndex,
            startIndex: table.startIndex,
            pageIndex: tableBound.pageIndex,
            firstLine: anchorRect,
        };

        this.hideParagraphMenu(true);
        const getFirstLine = () => getTableAnchorRect(this._docEventManagerService.tableBounds.get(table.tableId) ?? tableBound);
        const disposable = this._docPopupManagerService.attachPopupToRect(
            getFirstLine,
            {
                componentKey: DOC_TABLE_BLOCK_MENU_COMPONENT_KEY,
                direction: 'top-right',
                onClickOutside: () => {
                    this.hideParagraphMenu(true);
                },
                zIndex: 101,
            },
            this._context.unitId
        );

        this._paragraphMenu = {
            paragraph,
            target,
            disposable,
            active: false,
        };
        this._activeTarget$.next(target);
    }

    private _shouldKeepCurrentCellMenuForTable(table: ICustomTable): boolean {
        const target = this._paragraphMenu?.target;
        if (!target || target.kind === DocumentBlockType.TABLE || !target.cellRange) {
            return false;
        }

        return target.cellRange.startOffset >= table.startIndex &&
            target.cellRange.startOffset <= table.endIndex;
    }

    getDropTargetFromClientPoint(clientX: number, clientY: number, sourceRange: { startOffset: number; endOffset: number }): IDocBlockDropTarget | null {
        const canvasRect = this._context.engine.getCanvasElement().getBoundingClientRect();
        const point = transformOffset2Bound(clientX - canvasRect.left, clientY - canvasRect.top, this._context.scene);
        const body = this._context.unit.getBody();
        const sourceCellRange = body?.dataStream ? getContainingTableCellRange(body.dataStream, sourceRange.startOffset) : null;
        const blocks = (sourceCellRange ? this._getCellBlockTargets(sourceCellRange) : this._getBodyBlockTargets())
            .filter((block) => block.moveRange.startOffset !== sourceRange.startOffset || block.moveRange.endOffset !== sourceRange.endOffset)
            .filter((block) => block.moveRange.endOffset <= sourceRange.startOffset || block.moveRange.startOffset >= sourceRange.endOffset)
            .sort((left, right) => left.rect.top - right.rect.top || left.rect.left - right.rect.left);

        if (!blocks.length) {
            return null;
        }

        let nearest = blocks[0];
        let nearestDistance = Number.POSITIVE_INFINITY;
        for (const block of blocks) {
            const middle = (block.rect.top + block.rect.bottom) / 2;
            const distance = Math.abs(point.y - middle);
            if (distance < nearestDistance) {
                nearestDistance = distance;
                nearest = block;
            }
        }

        const before = point.y < (nearest.rect.top + nearest.rect.bottom) / 2;
        const targetOffset = before ? nearest.moveRange.startOffset : nearest.moveRange.endOffset;
        const docRect: IBoundRectNoAngle = {
            left: nearest.rect.left,
            right: nearest.rect.right,
            top: before ? nearest.rect.top : nearest.rect.bottom,
            bottom: before ? nearest.rect.top : nearest.rect.bottom,
        };
        const screenRect = transformBound2OffsetBound(docRect, this._context.scene);

        return {
            targetOffset,
            rect: {
                left: canvasRect.left + screenRect.left,
                right: canvasRect.left + screenRect.right,
                top: canvasRect.top + screenRect.top,
                bottom: canvasRect.top + screenRect.bottom,
            },
        };
    }

    hideParagraphMenu(force = false) {
        if (this._isBlockMenuDragging) {
            return;
        }

        if (this._paragraphMenu && ((this._paragraphMenu.disposable.canDispose() || force))) {
            this._paragraphMenu.disposable.dispose();
            this._paragraphMenu = null;
            this._isSlashMenuActive = false;
            this._slashMenuRequest$.next(null);
            this._activeTarget$.next(null);
        }
    }

    private _buildParagraphMenuTarget(paragraph: IMutiPageParagraphBound): IDocBlockMenuTarget | null {
        const body = this._context.unit.getBody();
        const dataStream = body?.dataStream ?? '';
        const cellRange = getContainingTableCellRange(dataStream, paragraph.paragraphStart);
        const inTable = cellRange != null || isParagraphInTable(this._context.unit, paragraph.paragraphStart);
        const blockRange = getParagraphBlockRange(this._context.unit, paragraph);
        if (blockRange) {
            const targetParagraph = {
                ...paragraph,
                paragraphStart: blockRange.startIndex,
                paragraphEnd: blockRange.endIndex + 1,
                startIndex: blockRange.startIndex,
                blockRange,
            } as IMutiPageParagraphBound;
            return {
                kind: DocumentBlockType.BLOCK_RANGE,
                key: `${DocumentBlockType.BLOCK_RANGE}:${blockRange.blockId}`,
                paragraph: targetParagraph,
                blockRange,
                icon: BLOCK_RANGE_ICON_MAP[blockRange.blockType],
                cellRange: cellRange ?? undefined,
                menuRange: {
                    startOffset: blockRange.startIndex,
                    endOffset: blockRange.endIndex + 1,
                    collapsed: false,
                },
                moveRange: {
                    startOffset: blockRange.startIndex,
                    endOffset: blockRange.endIndex + 1,
                },
                emptyMode: false,
                draggable: cellRange != null || !inTable,
            };
        }

        const paragraphDataStream = dataStream.slice(paragraph.paragraphStart, paragraph.paragraphEnd);
        const paragraphModel = body?.paragraphs?.find((item) => item.startIndex === paragraph.startIndex);
        const listIcon = getListIcon(paragraphModel?.bullet?.listType);
        const isHorizontalRuleParagraph = paragraphDataStream.replace(/[\r\n]/g, '') === '' && !!paragraphModel?.paragraphStyle?.borderBottom;
        const customBlock = body?.customBlocks?.find((item) => item.startIndex >= paragraph.paragraphStart && item.startIndex <= paragraph.paragraphEnd);
        const isCustomBlockOnly = customBlock?.blockType === BlockType.CUSTOM && paragraphDataStream.replace(/[\b\r\n]/g, '') === '';
        if (customBlock && customBlock.blockType === BlockType.CUSTOM && isCustomBlockOnly) {
            return {
                kind: DocumentBlockType.CUSTOM_BLOCK,
                key: `${DocumentBlockType.CUSTOM_BLOCK}:${customBlock.blockId}`,
                paragraph,
                customBlock,
                icon: 'TextTypeIcon',
                cellRange: cellRange ?? undefined,
                menuRange: {
                    startOffset: customBlock.startIndex,
                    endOffset: customBlock.startIndex,
                    collapsed: true,
                },
                moveRange: getParagraphMoveRange(this._context.unit, paragraph, cellRange),
                emptyMode: false,
                draggable: cellRange != null || !inTable,
            };
        }

        if (paragraphDataStream === '\b') {
            return null;
        }

        return {
            kind: DocumentBlockType.PARAGRAPH,
            key: `${DocumentBlockType.PARAGRAPH}:${paragraph.startIndex}`,
            paragraph,
            icon: isHorizontalRuleParagraph ? 'ReduceIcon' : listIcon,
            cellRange: cellRange ?? undefined,
            menuRange: {
                startOffset: paragraph.paragraphStart,
                endOffset: paragraph.paragraphStart,
                collapsed: true,
            },
            moveRange: getParagraphMoveRange(this._context.unit, paragraph, cellRange),
            emptyMode: isHorizontalRuleParagraph ? false : paragraphDataStream.replace(/[\r\n]/g, '') === '',
            draggable: cellRange != null || !inTable,
        };
    }

    private _getBodyBlockTargets(): Array<IDocBlockMenuTarget & { rect: IBoundRectNoAngle }> {
        const body = this._context.unit.getBody();
        if (!body) {
            return [];
        }

        const tableRanges = body.tables ?? [];
        const blockRanges = body.blockRanges ?? [];
        const paragraphBounds = [...this._docEventManagerService.paragraphBounds.values()];
        const targets: Array<IDocBlockMenuTarget & { rect: IBoundRectNoAngle }> = [];

        for (const table of tableRanges) {
            const tableBound = this._docEventManagerService.tableBounds.get(table.tableId);
            if (!tableBound) {
                continue;
            }

            targets.push({
                kind: DocumentBlockType.TABLE,
                key: `${DocumentBlockType.TABLE}:${table.tableId}`,
                table,
                icon: 'GridIcon',
                menuRange: { startOffset: table.startIndex, endOffset: table.endIndex, collapsed: false },
                moveRange: { startOffset: table.startIndex, endOffset: table.endIndex },
                emptyMode: false,
                draggable: true,
                rect: tableBound.rect,
            });
        }

        for (const blockRange of blockRanges) {
            const bounds = paragraphBounds.filter((bound) => Math.max(bound.paragraphStart, blockRange.startIndex) <= Math.min(bound.paragraphEnd, blockRange.endIndex));
            const rect = unionRects(bounds.map((bound) => bound.rect));
            if (!rect) {
                continue;
            }

            targets.push({
                kind: DocumentBlockType.BLOCK_RANGE,
                key: `${DocumentBlockType.BLOCK_RANGE}:${blockRange.blockId}`,
                blockRange,
                icon: BLOCK_RANGE_ICON_MAP[blockRange.blockType],
                menuRange: { startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1, collapsed: false },
                moveRange: { startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1 },
                emptyMode: false,
                draggable: true,
                rect,
            });
        }

        for (const paragraph of paragraphBounds) {
            if (tableRanges.some((table) => paragraph.paragraphStart > table.startIndex && paragraph.paragraphStart < table.endIndex)) {
                continue;
            }

            if (blockRanges.some((range) => Math.max(paragraph.paragraphStart, range.startIndex) <= Math.min(paragraph.paragraphEnd, range.endIndex))) {
                continue;
            }

            const target = this._buildParagraphMenuTarget(paragraph);
            if (!target) {
                continue;
            }

            targets.push({
                ...target,
                rect: paragraph.rect,
            });
        }

        return targets;
    }

    private _getCellBlockTargets(cellRange: { startOffset: number; endOffset: number }): Array<IDocBlockMenuTarget & { rect: IBoundRectNoAngle }> {
        const body = this._context.unit.getBody();
        if (!body) {
            return [];
        }

        const blockRanges = body.blockRanges ?? [];
        const paragraphBounds = [...this._docEventManagerService.paragraphBounds.values()]
            .filter((paragraph) => paragraph.paragraphStart > cellRange.startOffset && paragraph.paragraphStart < cellRange.endOffset);
        const targets: Array<IDocBlockMenuTarget & { rect: IBoundRectNoAngle }> = [];

        for (const blockRange of blockRanges) {
            if (blockRange.startIndex <= cellRange.startOffset || blockRange.endIndex >= cellRange.endOffset) {
                continue;
            }

            const bounds = paragraphBounds.filter((bound) => Math.max(bound.paragraphStart, blockRange.startIndex) <= Math.min(bound.paragraphEnd, blockRange.endIndex));
            const rect = unionRects(bounds.map((bound) => bound.rect));
            if (!rect) {
                continue;
            }

            targets.push({
                kind: DocumentBlockType.BLOCK_RANGE,
                key: `${DocumentBlockType.BLOCK_RANGE}:${blockRange.blockId}`,
                blockRange,
                icon: BLOCK_RANGE_ICON_MAP[blockRange.blockType],
                cellRange,
                menuRange: { startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1, collapsed: false },
                moveRange: { startOffset: blockRange.startIndex, endOffset: blockRange.endIndex + 1 },
                emptyMode: false,
                draggable: true,
                rect,
            });
        }

        for (const paragraph of paragraphBounds) {
            if (blockRanges.some((range) => Math.max(paragraph.paragraphStart, range.startIndex) <= Math.min(paragraph.paragraphEnd, range.endIndex))) {
                continue;
            }

            const target = this._buildParagraphMenuTarget(paragraph);
            if (!target) {
                continue;
            }

            targets.push({
                ...target,
                rect: paragraph.rect,
            });
        }

        return targets;
    }
}

function isParagraphInTable(documentDataModel: DocumentDataModel, paragraphStart: number): boolean {
    const tables = documentDataModel.getBody()?.tables ?? [];

    return tables.some((table) => paragraphStart > table.startIndex && paragraphStart < table.endIndex);
}

function getParagraphMoveRange(documentDataModel: DocumentDataModel, paragraph: IMutiPageParagraphBound, cellRange?: { startOffset: number; endOffset: number } | null) {
    const body = documentDataModel.getBody();
    const paragraphStartOffset = body
        ? getParagraphContentStartOffset(body, paragraph)
        : 0;

    return {
        startOffset: cellRange
            ? Math.max(paragraphStartOffset, cellRange.startOffset + 1)
            : paragraphStartOffset,
        endOffset: paragraph.startIndex + 1,
    };
}

function getListIcon(listType?: PresetListType | string): string | undefined {
    if (!listType) {
        return undefined;
    }

    return LIST_ICON_MAP[listType as PresetListType];
}

function getContainingTableCellRange(dataStream: string, offset: number): { startOffset: number; endOffset: number } | null {
    const startOffset = dataStream.lastIndexOf(DataStreamTreeTokenType.TABLE_CELL_START, Math.max(0, offset));
    if (startOffset < 0) {
        return null;
    }

    const previousCellEnd = dataStream.lastIndexOf(DataStreamTreeTokenType.TABLE_CELL_END, Math.max(0, offset));
    if (previousCellEnd > startOffset) {
        return null;
    }

    const endOffset = dataStream.indexOf(DataStreamTreeTokenType.TABLE_CELL_END, startOffset + 1);
    if (endOffset < 0 || offset > endOffset) {
        return null;
    }

    return { startOffset, endOffset };
}

function getTableAnchorRect(tableBound: ITableBound) {
    const gap = 4;
    const left = tableBound.rect.left - gap;
    const top = tableBound.rect.top - gap;

    return {
        left,
        right: left,
        top,
        bottom: top,
    };
}

const TABLE_CELL_PARAGRAPH_MENU_GAP = 4;
const TABLE_CELL_PARAGRAPH_MENU_RESIZE_SAFE_GAP = 10;
const TABLE_CELL_PARAGRAPH_MENU_FIRST_COLUMN_EXTRA_OFFSET = 16;

function getTableCellParagraphAnchorRect(
    docEventManagerService: DocEventManagerService,
    paragraph: IMutiPageParagraphBound | ITableParagraphBound,
    baseAnchor: IBoundRectNoAngle
) {
    const tableParagraph = paragraph as IMutiPageParagraphBound & Partial<ITableParagraphBound>;
    if (!tableParagraph.tableId || tableParagraph.rowIndex == null || tableParagraph.colIndex == null) {
        return baseAnchor;
    }

    const cellBound = docEventManagerService.findTableCellBound(
        tableParagraph.tableId,
        tableParagraph.rowIndex,
        tableParagraph.colIndex,
        tableParagraph.pageIndex
    );

    if (!cellBound) {
        return baseAnchor;
    }

    const gap = tableParagraph.colIndex === 0
        ? TABLE_CELL_PARAGRAPH_MENU_GAP + TABLE_CELL_PARAGRAPH_MENU_FIRST_COLUMN_EXTRA_OFFSET
        : TABLE_CELL_PARAGRAPH_MENU_RESIZE_SAFE_GAP;
    const left = cellBound.rect.left - gap;
    return {
        ...baseAnchor,
        left,
        right: left,
    };
}

function unionRects(rects: IBoundRectNoAngle[]): IBoundRectNoAngle | null {
    if (!rects.length) {
        return null;
    }

    return rects.reduce((acc, rect) => ({
        left: Math.min(acc.left, rect.left),
        right: Math.max(acc.right, rect.right),
        top: Math.min(acc.top, rect.top),
        bottom: Math.max(acc.bottom, rect.bottom),
    }));
}

function getParagraphBlockRange(documentDataModel: DocumentDataModel, paragraph: IMutiPageParagraphBound): IDocumentBlockRange | undefined {
    const blockRanges = documentDataModel.getBody()?.blockRanges ?? [];

    return blockRanges.find((range) => (
        Math.max(paragraph.paragraphStart, range.startIndex) <= Math.min(paragraph.paragraphEnd, range.endIndex)
    ));
}

function getBlockRangeAnchorRect(
    docEventManagerService: DocEventManagerService,
    blockRange: IDocumentBlockRange,
    fallbackParagraph: IMutiPageParagraphBound
) {
    const bounds = docEventManagerService
        .findParagraphBoundsInRange(blockRange.startIndex, blockRange.endIndex)
        .sort((left, right) => left.firstLine.top - right.firstLine.top || left.firstLine.left - right.firstLine.left);
    const anchor = bounds[0]?.firstLine ?? fallbackParagraph.firstLine;
    const left = Math.min(...(bounds.length ? bounds : [fallbackParagraph]).map((bound) => bound.firstLine.left));
    const top = anchor.top;

    return {
        ...anchor,
        left,
        right: left,
        top,
        bottom: top,
    };
}
