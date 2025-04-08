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
import { ICommandService, IUniverInstanceService, NamedStyleType, UniverInstanceType } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { DownSingle } from '@univerjs/icons';
import { ContextMenuPosition, DesktopMenu, ILayoutService, RectPopup, useDependency, useObservable } from '@univerjs/ui';
import { useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';
import { HEADING_ICON_MAP } from '../../controllers/menu/paragraph-menu';
import { DocEventManagerService } from '../../services/doc-event-manager.service';
import { DocParagraphMenuService } from '../../services/doc-paragraph-menu.service';

export const ParagraphMenu = ({ popup }: { popup: IPopup }) => {
    const [visible, setVisible] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const commandService = useDependency(ICommandService);
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
    const startIndex = (paragraph ?? paragraphLeft)?.startIndex;
    const paragraphObj = useMemo(() => doc?.getBody()?.paragraphs?.find((p) => p.startIndex === startIndex), [doc, startIndex]);
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

    return (
        <>
            <div
                ref={anchorRef}
                className={`
                  univer-mr-1 univer-inline-flex univer-h-7 univer-cursor-pointer univer-items-center univer-gap-1
                  univer-rounded-full univer-bg-[#EEEFF1] univer-px-2.5 univer-py-0
                `}
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
                    setVisible(true);
                    docParagraphMenuService?.setParagraphMenuActive(true);
                }}
            >
                <icon.component className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                <DownSingle className="univer-h-3 univer-w-3 univer-text-[#979DAC]" />
            </div>
            {visible && (
                <RectPopup
                    portal
                    mask
                    maskZIndex={100}
                    anchorRect$={anchorRect$}
                    direction="left-center"
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
                        <DesktopMenu
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
                    </section>
                </RectPopup>
            )}
        </>
    );
};
