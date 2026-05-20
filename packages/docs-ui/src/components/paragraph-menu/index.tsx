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
import type { IPopup } from '@univerjs/ui';
import type { IMutiPageParagraphBound } from '../../services/doc-event-manager.service';
import { ICommandService, IUniverInstanceService, LocaleService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DownIcon, OrderIcon, ReduceIcon, TodoListDoubleIcon, UnorderIcon } from '@univerjs/icons';
import { ContextMenuPanel, ContextMenuPosition, ILayoutService, RectPopup, useDependency, useObservable } from '@univerjs/ui';
import { useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { HorizontalLineCommand } from '../../commands/commands/doc-horizontal-line.command';
import { BulletListCommand, CheckListCommand, OrderListCommand } from '../../commands/commands/list.command';
import { H1HeadingCommand, H2HeadingCommand, H3HeadingCommand, H4HeadingCommand, H5HeadingCommand, NormalTextHeadingCommand } from '../../commands/commands/set-heading.command';
import { HEADING_ICON_MAP } from '../../menu/paragraph-menu';
import { DocEventManagerService } from '../../services/doc-event-manager.service';
import { DocParagraphMenuService } from '../../services/doc-paragraph-menu.service';

export function getParagraphMenuIconSizeClass(iconKey: string): string {
    return iconKey === 'TextTypeIcon' ? 'univer-size-3' : 'univer-size-4';
}

export function isEmptyParagraphMenuTarget(dataStream: string, paragraph?: IMutiPageParagraphBound | null | void): boolean {
    if (!paragraph) {
        return false;
    }

    return dataStream.slice(paragraph.paragraphStart, paragraph.paragraphEnd) === '';
}

export const EMPTY_PARAGRAPH_MENU_ACTIONS = [
    { id: H1HeadingCommand.id, title: 'toolbar.heading.1', icon: HEADING_ICON_MAP[NamedStyleType.HEADING_1].component },
    { id: H2HeadingCommand.id, title: 'toolbar.heading.2', icon: HEADING_ICON_MAP[NamedStyleType.HEADING_2].component },
    { id: H3HeadingCommand.id, title: 'toolbar.heading.3', icon: HEADING_ICON_MAP[NamedStyleType.HEADING_3].component },
    { id: H4HeadingCommand.id, title: 'toolbar.heading.4', icon: HEADING_ICON_MAP[NamedStyleType.HEADING_4].component },
    { id: H5HeadingCommand.id, title: 'toolbar.heading.5', icon: HEADING_ICON_MAP[NamedStyleType.HEADING_5].component },
    { id: NormalTextHeadingCommand.id, title: 'toolbar.heading.normal', icon: HEADING_ICON_MAP[NamedStyleType.NORMAL_TEXT].component },
    { id: OrderListCommand.id, title: 'rightClick.orderList', icon: OrderIcon },
    { id: BulletListCommand.id, title: 'rightClick.bulletList', icon: UnorderIcon },
    { id: CheckListCommand.id, title: 'rightClick.checkList', icon: TodoListDoubleIcon },
    { id: HorizontalLineCommand.id, title: 'toolbar.horizontalLine', icon: ReduceIcon },
];

export const ParagraphMenu = ({ popup }: { popup: IPopup }) => {
    const [visible, setVisible] = useState(false);
    const [emptyMode, setEmptyMode] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
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
    const icon = HEADING_ICON_MAP[namedStyleType ?? NamedStyleType.NORMAL_TEXT];
    const anchorRect$ = useMemo(() => new BehaviorSubject({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }), []);

    const handleHideMenu = () => {
        setVisible(false);
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
                    const boundingRect = anchorRef.current?.getBoundingClientRect();
                    anchorRect$.next({
                        left: (boundingRect?.left ?? 0) - 4,
                        right: boundingRect?.right ?? 0,
                        top: boundingRect?.top ?? 0,
                        bottom: boundingRect?.bottom ?? 0,
                    });
                }}
                onMouseLeave={() => {
                    isMouseOver.current = false;
                }}
                onClick={() => {
                    docParagraphMenuService?.setParagraphMenuActive(true);
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
                        {emptyMode
                            ? (
                                <div
                                    className={`
                                      univer-box-border univer-grid univer-min-w-52 univer-gap-1 univer-rounded-md
                                      univer-border univer-border-gray-200 univer-bg-white univer-px-2 univer-py-1
                                      univer-text-sm univer-text-gray-900 univer-shadow-md
                                      dark:!univer-border-gray-600 dark:!univer-bg-gray-700 dark:!univer-text-white
                                    `}
                                >
                                    {EMPTY_PARAGRAPH_MENU_ACTIONS.map((action) => {
                                        const Icon = action.icon;

                                        return (
                                            <button
                                                key={action.id}
                                                type="button"
                                                className={`
                                                  univer-flex univer-h-8 univer-w-full univer-items-center univer-gap-2
                                                  univer-rounded univer-px-2 univer-text-left univer-transition-colors
                                                  hover:univer-bg-gray-100
                                                  dark:hover:!univer-bg-gray-600
                                                `}
                                                onClick={() => {
                                                    commandService.executeCommand(action.id);
                                                    layoutService.focus();
                                                    handleHideMenu();
                                                }}
                                            >
                                                <Icon
                                                    className="
                                                      univer-size-4 univer-shrink-0 univer-text-gray-700
                                                      dark:!univer-text-white
                                                    "
                                                />
                                                <span className="univer-truncate">{localeService.t(action.title)}</span>
                                            </button>
                                        );
                                    })}
                                </div>
                            )
                            : (
                                <ContextMenuPanel
                                    className="univer-w-[212px]"
                                    menuType={ContextMenuPosition.PARAGRAPH}
                                    onOptionSelect={(params) => {
                                        const { label: id, commandId, value } = params;

                                        if (commandService) {
                                            commandService.executeCommand(commandId ?? id as string, { value });
                                        }

                                        layoutService.focus();
                                        handleHideMenu();
                                    }}
                                />
                            )}
                    </section>
                </RectPopup>
            )}
        </>
    );
};
