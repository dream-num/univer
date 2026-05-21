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
import { ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { DocSelectionManagerService } from '@univerjs/docs';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DownIcon } from '@univerjs/icons';
import { ContextMenuPanel, ContextMenuPosition, ILayoutService, RectPopup, useDependency, useObservable } from '@univerjs/ui';
import { useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand, SetParagraphNamedStyleCommand } from '../../commands/commands/set-heading.command';
import { EMPTY_PARAGRAPH_MENU_ID, HEADING_ICON_MAP } from '../../menu/paragraph-menu';
import { DocEventManagerService } from '../../services/doc-event-manager.service';
import { DocParagraphMenuService } from '../../services/doc-paragraph-menu.service';

export function getParagraphMenuIconSizeClass(iconKey: string): string {
    return iconKey === 'TextTypeIcon' ? 'univer-size-3' : 'univer-size-4';
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
};

const NAMED_STYLE_HEADING_COMMAND_IDS: Partial<Record<NamedStyleType, string>> = {
    [NamedStyleType.HEADING_1]: H1HeadingCommand.id,
    [NamedStyleType.HEADING_2]: H2HeadingCommand.id,
    [NamedStyleType.HEADING_3]: H3HeadingCommand.id,
    [NamedStyleType.HEADING_4]: H4HeadingCommand.id,
    [NamedStyleType.HEADING_5]: H5HeadingCommand.id,
    [NamedStyleType.NORMAL_TEXT]: NormalTextHeadingCommand.id,
};

export function getParagraphMenuActiveHeadingCommandId(namedStyleType?: NamedStyleType): string {
    return NAMED_STYLE_HEADING_COMMAND_IDS[namedStyleType ?? NamedStyleType.NORMAL_TEXT] ?? NormalTextHeadingCommand.id;
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

export const ParagraphMenu = ({ popup }: { popup: IPopup }) => {
    const [visible, setVisible] = useState(false);
    const [emptyMode, setEmptyMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const targetRangeRef = useRef<ITextRangeWithStyle | null>(null);
    const commandService = useDependency(ICommandService);
    const docSelectionManagerService = useDependency(DocSelectionManagerService);
    const layoutService = useDependency(ILayoutService);
    const anchorRef = useRef<HTMLDivElement>(null);
    const isMouseOver = useRef(false);
    const renderManagerService = useDependency(IRenderManagerService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const renderUnit = renderManagerService.getRenderById(popup.unitId);
    const doc = univerInstanceService.getUnit<DocumentDataModel>(popup.unitId, UniverInstanceType.UNIVER_DOC);
    const docParagraphMenuService = renderUnit?.with(DocParagraphMenuService);
    const docEventManagerService = renderUnit?.with(DocEventManagerService);
    const paragraph = useObservable(docEventManagerService?.hoverParagraph$);
    const paragraphLeft = useObservable(docEventManagerService?.hoverParagraphLeft$);
    const activeParagraphBound = paragraph ?? paragraphLeft;
    const startIndex = activeParagraphBound?.startIndex;
    const dataStream = doc?.getBody()?.dataStream ?? '';
    const paragraphObj = useMemo(() => doc?.getBody()?.paragraphs?.find((p) => p.startIndex === startIndex), [doc, startIndex]);
    const isInTable = useMemo(() => doc?.getBody()?.tables?.some((table) => startIndex != null && startIndex > table.startIndex && startIndex < table.endIndex), [doc, startIndex]);
    const isEmptyParagraph = isEmptyParagraphMenuTarget(dataStream, activeParagraphBound);
    const namedStyleType = paragraphObj?.paragraphStyle?.namedStyleType;
    const activeHeadingCommandId = getParagraphMenuActiveHeadingCommandId(namedStyleType);
    const icon = HEADING_ICON_MAP[namedStyleType ?? NamedStyleType.NORMAL_TEXT];
    const anchorRect$ = useMemo(() => new BehaviorSubject({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }), []);

    const updateAnchorRect = () => {
        const boundingRect = anchorRef.current?.getBoundingClientRect();
        anchorRect$.next({
            left: (boundingRect?.left ?? 0) - 4,
            right: boundingRect?.right ?? 0,
            top: boundingRect?.top ?? 0,
            bottom: boundingRect?.bottom ?? 0,
        });
    };

    const handleHideMenu = () => {
        setVisible(false);
        targetRangeRef.current = null;
        docParagraphMenuService?.hideParagraphMenu(true);
    };

    if (isInTable) {
        return null;
    }

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
                    updateAnchorRect();
                }}
                onMouseLeave={() => {
                    isMouseOver.current = false;
                }}
                onClick={() => {
                    const targetRange = getParagraphMenuTargetRange(activeParagraphBound);
                    targetRangeRef.current = targetRange;
                    if (targetRange) {
                        docSelectionManagerService.replaceTextRanges([targetRange], false);
                    }
                    docParagraphMenuService?.setParagraphMenuActive(true);
                    updateAnchorRect();
                    setEmptyMode(isEmptyParagraph);
                    setVisible(true);
                }}
            >
                <icon.component
                    className={clsx(
                        getParagraphMenuIconSizeClass(icon.key),
                        `
                          univer-text-gray-700
                          dark:!univer-text-white
                        `
                    )}
                />
                <DownIcon
                    className={`
                      univer-size-3 univer-text-gray-500
                      dark:!univer-text-gray-200
                    `}
                />
            </div>
            {visible && (
                <RectPopup
                    portal
                    mask
                    maskZIndex={100}
                    anchorRect$={anchorRect$}
                    direction="left"
                    onMaskClick={handleHideMenu}
                >
                    <section
                        ref={contentRef}
                        onMouseEnter={(e) => {
                            popup.onPointerEnter?.(e);
                            isMouseOver.current = true;
                        }}
                        onMouseLeave={() => {
                            isMouseOver.current = false;
                        }}
                    >
                        <ContextMenuPanel
                            className="univer-w-[212px]"
                            menuType={emptyMode ? EMPTY_PARAGRAPH_MENU_ID : ContextMenuPosition.PARAGRAPH}
                            activeItemIds={[activeHeadingCommandId]}
                            onOptionSelect={(params) => {
                                const targetRange = targetRangeRef.current ?? getParagraphMenuTargetRange(activeParagraphBound);
                                const { commandId, params: commandParams } = getParagraphMenuCommand(params, targetRange);

                                if (commandService && commandId) {
                                    commandService.executeCommand(commandId, commandParams);
                                }

                                layoutService.focus();
                                handleHideMenu();
                            }}
                        />
                    </section>
                </RectPopup>
            )}
        </>
    );
};
