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

import type { FC } from 'react';
import { debounce, ICommandService } from '@univerjs/core';
import { DownSingle, H1Single } from '@univerjs/icons';
import { ContextMenuPosition, DesktopMenu, ILayoutService, RectPopup, useDependency } from '@univerjs/ui';
import { useMemo, useRef, useState } from 'react';
import { BehaviorSubject } from 'rxjs';

export const ParagraphButton: FC = () => {
    const [visible, setVisible] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);
    const commandService = useDependency(ICommandService);
    const layoutService = useDependency(ILayoutService);
    const anchorRef = useRef<HTMLDivElement>(null);
    const isMouseOver = useRef(false);
    const anchorRect$ = useMemo(() => new BehaviorSubject({
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
    }), []);
    const hidePopup = useMemo(() => debounce(() => {
        if (!isMouseOver.current) {
            setVisible(false);
        }
    }, 300), []);

    return (
        <>
            <div
                ref={anchorRef}
                className={`
                  univer-mr-2 univer-inline-flex univer-h-7 univer-cursor-pointer univer-items-center univer-gap-1
                  univer-rounded-full univer-bg-[#EEEFF1] univer-px-2.5 univer-py-0
                `}
                onMouseEnter={() => {
                    isMouseOver.current = true;
                    setVisible(true);
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
                    hidePopup();
                }}
            >
                <H1Single className="univer-h-4 univer-w-4 univer-text-[#181C2A]" />
                <DownSingle className="univer-h-3 univer-w-3 univer-text-[#979DAC]" />
            </div>
            {visible && (
                <RectPopup anchorRect$={anchorRect$} direction="left">
                    <section
                        ref={contentRef}
                        onMouseEnter={() => {
                            isMouseOver.current = true;
                        }}
                        onMouseLeave={() => {
                            isMouseOver.current = false;
                            hidePopup();
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

                                setVisible(false);
                            }}
                        />
                    </section>
                </RectPopup>
            )}
        </>
    );
};
