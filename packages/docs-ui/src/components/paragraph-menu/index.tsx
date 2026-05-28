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
import type { ITextRangeWithStyle } from '@univerjs/engine-render';
import type { IPopup, IValueOption } from '@univerjs/ui';
import type { IMutiPageParagraphBound } from '../../services/doc-event-manager.service';
import type { IDocBlockMenuTarget } from '../../services/doc-paragraph-menu.service';
import { ICommandService, IUniverInstanceService, NamedStyleType, SliceBodyType, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { ComponentManager, ContextMenuPanel, ContextMenuPosition, IClipboardInterfaceService, ILayoutService, RectPopup, useDependency, useObservable } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { DocCopyCommand, DocPasteCommand } from '../../commands/commands/clipboard.command';
import { MoveDocBlockCommand } from '../../commands/commands/doc-block-move.command';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand, SubtitleHeadingCommand, TitleHeadingCommand } from '../../commands/commands/set-heading.command';
import { DocTableDeleteTableCommand } from '../../commands/commands/table/doc-table-delete.command';
import { DocParagraphSettingPanelOperation } from '../../commands/operations/doc-paragraph-setting-panel.operation';
import { DOC_TABLE_BLOCK_MENU_ID, EMPTY_PARAGRAPH_MENU_ID, HEADING_ICON_MAP, INSERT_BELLOW_MENU_ID } from '../../menu/paragraph-menu';
import { IDocClipboardService } from '../../services/clipboard/clipboard.service';
import { DocContentInsertService } from '../../services/doc-content-insert.service';
import { DocEventManagerService } from '../../services/doc-event-manager.service';
import { DocParagraphMenuService } from '../../services/doc-paragraph-menu.service';

export function getParagraphMenuIconSizeClass(iconKey: string): string {
    return iconKey === 'TextTypeIcon' ? 'univer-size-3' : 'univer-size-4';
}

export function getParagraphMenuPopupDirection(anchorLeft: number, menuWidth = 212, viewportPadding = 8): 'left' | 'right' {
    return anchorLeft - menuWidth < viewportPadding ? 'right' : 'left';
}

export const PARAGRAPH_MENU_HOVER_OPEN_DELAY = 260;

export function createParagraphMenuHoverOpenScheduler(openMenu: () => void, delay = PARAGRAPH_MENU_HOVER_OPEN_DELAY) {
    let openTimer: number | null = null;

    const cancel = () => {
        if (openTimer != null) {
            window.clearTimeout(openTimer);
            openTimer = null;
        }
    };

    return {
        schedule() {
            cancel();
            openTimer = window.setTimeout(() => {
                openTimer = null;
                openMenu();
            }, delay);
        },
        cancel,
        openNow() {
            cancel();
            openMenu();
        },
    };
}

export function isEmptyParagraphMenuTarget(dataStream: string, paragraph?: IMutiPageParagraphBound | null | void): boolean {
    if (!paragraph) {
        return false;
    }

    return dataStream.slice(paragraph.paragraphStart, paragraph.paragraphEnd).replace(/[\r\n]/g, '') === '';
}

export function getParagraphMenuTargetRange(paragraph?: IMutiPageParagraphBound | null | void): ITextRangeWithStyle | null {
    if (!paragraph) {
        return null;
    }

    const blockRange = (paragraph as IMutiPageParagraphBound & { blockRange?: { endIndex: number; startIndex: number } }).blockRange;
    if (blockRange) {
        return {
            startOffset: blockRange.startIndex,
            endOffset: blockRange.endIndex + 1,
            collapsed: false,
            segmentId: paragraph.segmentId,
        };
    }

    return {
        startOffset: paragraph.paragraphStart,
        endOffset: paragraph.paragraphStart,
        collapsed: true,
        segmentId: paragraph.segmentId,
    };
}

const HEADING_COMMAND_VALUES: Record<string, NamedStyleType> = {
    [H1HeadingCommand.id]: NamedStyleType.HEADING_1,
    [H2HeadingCommand.id]: NamedStyleType.HEADING_2,
    [H3HeadingCommand.id]: NamedStyleType.HEADING_3,
    [H4HeadingCommand.id]: NamedStyleType.HEADING_4,
    [H5HeadingCommand.id]: NamedStyleType.HEADING_5,
    [NormalTextHeadingCommand.id]: NamedStyleType.NORMAL_TEXT,
    [TitleHeadingCommand.id]: NamedStyleType.TITLE,
    [SubtitleHeadingCommand.id]: NamedStyleType.SUBTITLE,
};

const NAMED_STYLE_HEADING_COMMAND_IDS: Partial<Record<NamedStyleType, string>> = {
    [NamedStyleType.HEADING_1]: H1HeadingCommand.id,
    [NamedStyleType.HEADING_2]: H2HeadingCommand.id,
    [NamedStyleType.HEADING_3]: H3HeadingCommand.id,
    [NamedStyleType.HEADING_4]: H4HeadingCommand.id,
    [NamedStyleType.HEADING_5]: H5HeadingCommand.id,
    [NamedStyleType.NORMAL_TEXT]: NormalTextHeadingCommand.id,
    [NamedStyleType.TITLE]: TitleHeadingCommand.id,
    [NamedStyleType.SUBTITLE]: SubtitleHeadingCommand.id,
};

export function getParagraphMenuActiveHeadingCommandId(namedStyleType?: NamedStyleType): string {
    return NAMED_STYLE_HEADING_COMMAND_IDS[namedStyleType ?? NamedStyleType.NORMAL_TEXT] ?? NormalTextHeadingCommand.id;
}

export function getParagraphMenuHiddenHeadingCommandIds(namedStyleType?: NamedStyleType): string[] {
    if (namedStyleType === NamedStyleType.TITLE) {
        return [H5HeadingCommand.id, SubtitleHeadingCommand.id];
    }

    if (namedStyleType === NamedStyleType.SUBTITLE) {
        return [H5HeadingCommand.id, TitleHeadingCommand.id];
    }

    return [TitleHeadingCommand.id, SubtitleHeadingCommand.id];
}

export function getParagraphMenuCommand(params: IValueOption, targetRange?: ITextRangeWithStyle | null): { commandId?: string; params?: object } {
    const commandId = params.commandId ?? params.id ?? (typeof params.label === 'string' ? params.label : undefined);
    if (commandId && targetRange && commandId in HEADING_COMMAND_VALUES) {
        return {
            commandId: SetParagraphNamedStyleCommand.id,
            params: {
                value: HEADING_COMMAND_VALUES[commandId],
                textRanges: [targetRange],
            },
        };
    }

    if (commandId && targetRange && (commandId === BulletListCommand.id || commandId === OrderListCommand.id || commandId === CheckListCommand.id)) {
        return {
            commandId,
            params: {
                docRange: [targetRange],
            },
        };
    }

    if (commandId === HorizontalLineCommand.id && targetRange) {
        return {
            commandId,
            params: {
                insertRange: targetRange,
            },
        };
    }

    const fallbackParams = typeof params.params === 'function' ? params.params() : params.params;
    const commandParams = typeof params.value === 'undefined'
        ? fallbackParams
        : { value: params.value };

    return {
        commandId,
        params: commandParams && typeof commandParams === 'object' ? commandParams : undefined,
    };
}

function getParagraphMenuType(target: IDocBlockMenuTarget | null | undefined, emptyMode: boolean): string {
    if (target?.kind === 'table') {
        return DOC_TABLE_BLOCK_MENU_ID;
    }

    return emptyMode ? EMPTY_PARAGRAPH_MENU_ID : ContextMenuPosition.PARAGRAPH;
}

export function shouldShowParagraphSettingMenu(target: IDocBlockMenuTarget | null | undefined): boolean {
    return !target || target.kind === 'paragraph';
}

export const ParagraphMenu = ({ popup }: { popup: IPopup }) => {
    const [visible, setVisible] = useState(false);
    const [emptyMode, setEmptyMode] = useState(false);
    const [dropRect, setDropRect] = useState<{ left: number; right: number; top: number; bottom: number } | null>(null);
    const [menuDirection, setMenuDirection] = useState<'left' | 'right'>('left');
    const contentRef = useRef<HTMLDivElement>(null);
    const targetRangeRef = useRef<ITextRangeWithStyle | null>(null);
    const dragTargetOffsetRef = useRef<number | null>(null);
    const dragRangeRef = useRef<{ startOffset: number; endOffset: number } | null>(null);
    const isDraggingRef = useRef(false);
    const openMenuRef = useRef<() => void>(() => undefined);
    const hoverOpenSchedulerRef = useRef(createParagraphMenuHoverOpenScheduler(() => openMenuRef.current()));
    const commandService = useDependency(ICommandService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const docClipboardService = useDependency(IDocClipboardService);
    const docContentInsertService = useDependency(DocContentInsertService);
    const clipboardInterfaceService = useDependency(IClipboardInterfaceService);
    const layoutService = useDependency(ILayoutService);
    const componentManager = useDependency(ComponentManager);
    const anchorRef = useRef<HTMLDivElement>(null);
    const isMouseOver = useRef(false);
    const hideTimerRef = useRef<number | null>(null);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderUnit = renderManagerService.getRenderById(popup.unitId);
    const doc = univerInstanceService.getUnit<DocumentDataModel>(popup.unitId, UniverInstanceType.UNIVER_DOC);
    const docParagraphMenuService = renderUnit?.with(DocParagraphMenuService);
    const docEventManagerService = renderUnit?.with(DocEventManagerService);
    const activeTarget = useObservable(docParagraphMenuService?.activeTarget$);
    const paragraph = useObservable(docEventManagerService?.hoverParagraph$);
    const paragraphLeft = useObservable(docEventManagerService?.hoverParagraphLeft$);
    const currentActiveTarget = activeTarget ?? docParagraphMenuService?.activeTarget;
    const activeParagraphBound = currentActiveTarget?.paragraph ?? docParagraphMenuService?.activeParagraph ?? paragraph ?? paragraphLeft;
    const startIndex = activeParagraphBound?.startIndex;
    const dataStream = doc?.getBody()?.dataStream ?? '';
    const paragraphObj = useMemo(() => doc?.getBody()?.paragraphs?.find((p) => p.startIndex === startIndex), [doc, startIndex]);
    const isEmptyParagraph = currentActiveTarget?.emptyMode ?? isEmptyParagraphMenuTarget(dataStream, activeParagraphBound);
    const namedStyleType = paragraphObj?.paragraphStyle?.namedStyleType;
    const activeHeadingCommandId = getParagraphMenuActiveHeadingCommandId(namedStyleType);
    const hiddenHeadingCommandIds = useMemo(() => getParagraphMenuHiddenHeadingCommandIds(namedStyleType), [namedStyleType]);
    const hiddenItemIds = useMemo(() => {
        if (!shouldShowParagraphSettingMenu(currentActiveTarget)) {
            return [...hiddenHeadingCommandIds, DocParagraphSettingPanelOperation.id];
        }

        return hiddenHeadingCommandIds;
    }, [currentActiveTarget, hiddenHeadingCommandIds]);
    const icon = HEADING_ICON_MAP[namedStyleType ?? NamedStyleType.NORMAL_TEXT];
    const targetIconKey = currentActiveTarget?.icon ?? icon.key;
    const TargetIcon = componentManager.get(targetIconKey) ?? icon.component;
    const anchorRect$ = useMemo(() => new BehaviorSubject({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }), []);

    const updateAnchorRect = () => {
        const boundingRect = anchorRef.current?.getBoundingClientRect();
        const left = (boundingRect?.left ?? 0) - 4;
        setMenuDirection(getParagraphMenuPopupDirection(left));
        anchorRect$.next({
            left,
            right: boundingRect?.right ?? 0,
            top: boundingRect?.top ?? 0,
            bottom: boundingRect?.bottom ?? 0,
        });
    };

    const handleHideMenu = () => {
        setVisible(false);
        targetRangeRef.current = null;
    };

    const clearHideTimer = () => {
        if (hideTimerRef.current != null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
    };

    const scheduleHideMenu = () => {
        clearHideTimer();
        hideTimerRef.current = window.setTimeout(() => {
            if (!isMouseOver.current && !isDraggingRef.current) {
                handleHideMenu();
            }
        }, 180);
    };

    const handleOpenMenu = () => {
        clearHideTimer();
        const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
        const targetRange = latestTarget
            ? {
                ...latestTarget.menuRange,
                segmentId: activeParagraphBound?.segmentId,
            }
            : getParagraphMenuTargetRange(activeParagraphBound);
        targetRangeRef.current = targetRange;
        updateAnchorRect();
        setEmptyMode(isEmptyParagraph);
        setVisible(true);
    };
    openMenuRef.current = handleOpenMenu;

    const scheduleOpenMenu = () => {
        clearHideTimer();
        hoverOpenSchedulerRef.current.schedule();
    };

    const cancelOpenMenu = () => {
        hoverOpenSchedulerRef.current.cancel();
    };

    useEffect(() => () => {
        if (hideTimerRef.current != null) {
            window.clearTimeout(hideTimerRef.current);
            hideTimerRef.current = null;
        }
        hoverOpenSchedulerRef.current.cancel();
    }, []);

    return (
        <>
            <div
                data-u-comp="paragraph-menu"
                ref={anchorRef}
                className={clsx(`
                  univer-mr-1 univer-inline-flex univer-h-8 univer-cursor-pointer univer-items-center univer-gap-1.5
                  univer-rounded-lg univer-border univer-border-gray-200 univer-bg-white univer-px-2.5 univer-py-0
                  univer-shadow-sm univer-transition-colors
                  hover:univer-bg-gray-50 hover:univer-shadow-md
                  dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                  dark:hover:!univer-bg-gray-800
                `, {
                    'univer-bg-gray-100 univer-shadow-md dark:!univer-bg-gray-800': visible,
                })}
                onMouseEnter={(e) => {
                    popup.onPointerEnter?.(e);
                    isMouseOver.current = true;
                    scheduleOpenMenu();
                }}
                onMouseLeave={() => {
                    isMouseOver.current = false;
                    cancelOpenMenu();
                    scheduleHideMenu();
                }}
                onClick={(event) => {
                    event.preventDefault();
                    event.stopPropagation();
                    isMouseOver.current = true;
                    hoverOpenSchedulerRef.current.openNow();
                }}
            >
                <TargetIcon
                    className={clsx(
                        getParagraphMenuIconSizeClass(targetIconKey),
                        `
                          univer-text-gray-700
                          dark:!univer-text-white
                        `
                    )}
                />
                {currentActiveTarget?.draggable && (
                    <button
                        type="button"
                        className={`
                          univer-group univer-flex univer-h-4 univer-w-2.5 univer-cursor-grab univer-items-center
                          univer-justify-center univer-border-none univer-bg-transparent univer-p-0
                          active:univer-cursor-grabbing
                        `}
                        aria-label="Drag block"
                        title="Drag block"
                        onPointerDown={(event) => {
                            const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;
                            const moveRange = latestTarget?.moveRange;
                            if (!moveRange || !latestTarget?.draggable) {
                                return;
                            }

                            event.preventDefault();
                            event.stopPropagation();
                            event.currentTarget.setPointerCapture?.(event.pointerId);
                            clearHideTimer();
                            isMouseOver.current = true;
                            isDraggingRef.current = true;
                            docParagraphMenuService?.setBlockMenuDragging(true);
                            dragRangeRef.current = moveRange;
                            dragTargetOffsetRef.current = null;
                            setDropRect(null);
                            const pointerId = event.pointerId;

                            const handlePointerMove = (moveEvent: PointerEvent) => {
                                if (moveEvent.pointerId !== pointerId) {
                                    return;
                                }

                                moveEvent.preventDefault();
                                const range = dragRangeRef.current;
                                if (!range) {
                                    return;
                                }

                                const target = docParagraphMenuService?.getDropTargetFromClientPoint(moveEvent.clientX, moveEvent.clientY, range);
                                dragTargetOffsetRef.current = target?.targetOffset ?? null;
                                setDropRect(target?.rect ?? null);
                            };
                            const finishDrag = (shouldDrop: boolean) => {
                                window.removeEventListener('pointermove', handlePointerMove);
                                window.removeEventListener('pointerup', handlePointerUp);
                                window.removeEventListener('pointercancel', handlePointerCancel);
                                window.removeEventListener('blur', handleWindowBlur);
                                const range = dragRangeRef.current;
                                const targetOffset = dragTargetOffsetRef.current;
                                dragRangeRef.current = null;
                                dragTargetOffsetRef.current = null;
                                isDraggingRef.current = false;
                                docParagraphMenuService?.setBlockMenuDragging(false);
                                setDropRect(null);

                                if (shouldDrop && range && targetOffset != null) {
                                    commandService.executeCommand(MoveDocBlockCommand.id, {
                                        unitId: popup.unitId,
                                        sourceRange: range,
                                        targetOffset,
                                    });
                                }
                            };
                            const handlePointerUp = (upEvent: PointerEvent) => {
                                if (upEvent.pointerId !== pointerId) {
                                    return;
                                }

                                upEvent.preventDefault();
                                finishDrag(true);
                            };
                            const handlePointerCancel = (cancelEvent: PointerEvent) => {
                                if (cancelEvent.pointerId !== pointerId) {
                                    return;
                                }

                                finishDrag(false);
                            };
                            const handleWindowBlur = () => {
                                finishDrag(false);
                            };

                            window.addEventListener('pointermove', handlePointerMove);
                            window.addEventListener('pointerup', handlePointerUp);
                            window.addEventListener('pointercancel', handlePointerCancel);
                            window.addEventListener('blur', handleWindowBlur, { once: true });
                        }}
                    >
                        <DragHandleDotsIcon />
                    </button>
                )}
            </div>
            {visible && (
                <RectPopup
                    portal
                    anchorRect$={anchorRect$}
                    direction={menuDirection}
                >
                    <section
                        ref={contentRef}
                        onMouseEnter={(e) => {
                            popup.onPointerEnter?.(e);
                            isMouseOver.current = true;
                            clearHideTimer();
                        }}
                        onMouseLeave={() => {
                            isMouseOver.current = false;
                            scheduleHideMenu();
                        }}
                    >
                        <ContextMenuPanel
                            className="univer-w-[212px]"
                            menuType={getParagraphMenuType(currentActiveTarget, emptyMode)}
                            activeItemIds={[activeHeadingCommandId]}
                            hiddenItemIds={hiddenItemIds}
                            onOptionSelect={async (params) => {
                                const targetRange = targetRangeRef.current ?? getParagraphMenuTargetRange(activeParagraphBound);
                                const { commandId, params: commandParams } = getParagraphMenuCommand(params, targetRange);
                                const latestTarget = docParagraphMenuService?.activeTarget ?? activeTarget;

                                if (commandId && shouldUseInsertBelowRange(commandId, params) && latestTarget?.moveRange) {
                                    docContentInsertService.setInsertRange({
                                        unitId: popup.unitId,
                                        startOffset: latestTarget.moveRange.endOffset,
                                        endOffset: latestTarget.moveRange.endOffset,
                                        segmentId: targetRange?.segmentId ?? '',
                                    });
                                }

                                if (latestTarget?.kind === 'table' && commandId && targetRange) {
                                    const tableRange = {
                                        ...targetRange,
                                        segmentId: targetRange.segmentId ?? '',
                                        collapsed: false,
                                    };
                                    const afterTableRange = {
                                        startOffset: latestTarget.moveRange.endOffset,
                                        endOffset: latestTarget.moveRange.endOffset,
                                        collapsed: true,
                                        segmentId: targetRange.segmentId ?? '',
                                    };

                                    if (commandId === DocCopyCommand.id || commandId === DocCopyCommand.name) {
                                        await docClipboardService.copy(SliceBodyType.copy, [tableRange]);
                                        layoutService.focus();
                                        handleHideMenu();
                                        return;
                                    }

                                    if (commandId === DocPasteCommand.id) {
                                        docSelectionManagerService.replaceTextRanges([afterTableRange], false);
                                        const clipboardItems = await clipboardInterfaceService.read();
                                        await docClipboardService.paste(clipboardItems);
                                        layoutService.focus();
                                        handleHideMenu();
                                        return;
                                    }

                                    if (commandId === DocTableDeleteTableCommand.id) {
                                        docSelectionManagerService.replaceTextRanges([tableRange], false);
                                    } else if (params.id === INSERT_BELLOW_MENU_ID || commandId !== INSERT_BELLOW_MENU_ID) {
                                        docSelectionManagerService.replaceTextRanges([afterTableRange], false);
                                    }
                                }

                                if (commandService && commandId) {
                                    const blockRangeParams = latestTarget?.kind === 'blockRange' && latestTarget.blockRange && commandParams && typeof commandParams === 'object'
                                        ? {
                                            ...commandParams,
                                            unitId: popup.unitId,
                                            blockId: latestTarget.blockRange.blockId,
                                        }
                                        : commandParams;
                                    commandService.executeCommand(commandId, blockRangeParams);
                                }

                                layoutService.focus();
                                handleHideMenu();
                            }}
                        />
                    </section>
                </RectPopup>
            )}
            {dropRect && (
                <div
                    className="
                      univer-pointer-events-none univer-fixed univer-z-[10000] univer-h-0.5 univer-rounded-full
                      univer-bg-primary-600
                    "
                    style={{
                        left: dropRect.left,
                        top: dropRect.top,
                        width: Math.max(60, dropRect.right - dropRect.left),
                    }}
                />
            )}
        </>
    );
};

export function shouldUseInsertBelowRange(commandId: string, params: IValueOption): boolean {
    if (params.id === INSERT_BELLOW_MENU_ID) {
        return true;
    }

    const normalized = commandId.toLowerCase();

    if (normalized.includes('insert') && (normalized.includes('below') || normalized.includes('bellow'))) {
        return true;
    }

    if (normalized.includes('insert') && normalized.includes('image')) {
        return true;
    }

    return normalized === 'doc.command.create-table' || normalized === 'doc.operation.create-table';
}

function DragHandleDotsIcon() {
    return (
        <span
            className={`
              univer-grid univer-h-3.5 univer-w-2 univer-grid-cols-2 univer-place-items-center univer-gap-x-0.5
              univer-gap-y-px
            `}
            aria-hidden="true"
        >
            {Array.from({ length: 6 }).map((_, index) => (
                <span
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    className={`
                      univer-size-0.5 univer-rounded-full univer-bg-gray-400 univer-transition-colors
                      group-hover:univer-bg-gray-500
                      dark:!univer-bg-gray-500
                      dark:group-hover:!univer-bg-gray-300
                    `}
                />
            ))}
        </span>
    );
}
