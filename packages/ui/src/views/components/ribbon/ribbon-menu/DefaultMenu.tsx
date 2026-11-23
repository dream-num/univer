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

import { LocaleService } from '@univerjs/core';
import { borderClassName, Button, clsx, Dropdown } from '@univerjs/design';
import {
    DatabaseIcon,
    EyeIcon,
    FunctionIcon,
    HomeIcon,
    InsertIcon,
    MoreDownIcon,
    MoreVerticalIcon,
} from '@univerjs/icons';
import { useEffect, useRef, useState } from 'react';
import type { IMenuSchema } from '../../../../services/menu/menu-manager.service';
import { RibbonPosition } from '../../../../services/menu/types';
import { useDependency } from '../../../../utils/di';

const iconMap = {
    [RibbonPosition.START]: HomeIcon,
    [RibbonPosition.INSERT]: InsertIcon,
    [RibbonPosition.FORMULAS]: FunctionIcon,
    [RibbonPosition.DATA]: DatabaseIcon,
    [RibbonPosition.VIEW]: EyeIcon,
    [RibbonPosition.OTHERS]: MoreVerticalIcon,
};

export function DefaultMenu({
    ribbon,
    activatedTab,
    onSelectTab,
}: {
    ribbon: IMenuSchema[];
    activatedTab: string;
    onSelectTab: (tab: IMenuSchema) => void;
}) {
    const localeService = useDependency(LocaleService);
    const activatedTabTitle = ribbon.find((group) => group.key === activatedTab)?.title || activatedTab;

    const [groupSelectorVisible, setGroupSelectorVisible] = useState(false);

    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
    const hoverPreviewRef = useRef(false);
    const triggerRef = useRef<HTMLButtonElement>(null);
    const selectedButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => () => clearTimeout(hoverTimerRef.current), []);

    function handleOpenChange(open: boolean) {
        clearTimeout(hoverTimerRef.current);
        if (open) {
            hoverPreviewRef.current = false;
        }
        setGroupSelectorVisible(open);
    }

    return (
        <div
            className="univer-flex univer-items-center"
            onPointerEnter={(event) => {
                if (event.pointerType !== 'mouse') {
                    return;
                }
                clearTimeout(hoverTimerRef.current);
                if (!groupSelectorVisible) {
                    hoverTimerRef.current = setTimeout(() => {
                        hoverPreviewRef.current = true;
                        setGroupSelectorVisible(true);
                    }, 200);
                }
            }}
            onPointerLeave={() => {
                clearTimeout(hoverTimerRef.current);
                if (hoverPreviewRef.current) {
                    hoverTimerRef.current = setTimeout(() => setGroupSelectorVisible(false), 300);
                }
            }}
        >
            <Dropdown
                align="start"
                aria-label={localeService.t(activatedTabTitle)}
                className="
                  univer-box-border univer-grid univer-w-64 univer-max-w-[calc(100vw-1rem)] univer-gap-1 univer-p-1.5
                "
                open={groupSelectorVisible}
                onOpenChange={handleOpenChange}
                onOpenAutoFocus={(event) => {
                    if (hoverPreviewRef.current || selectedButtonRef.current) {
                        event.preventDefault();
                        if (!hoverPreviewRef.current) {
                            selectedButtonRef.current?.focus();
                        }
                    }
                }}
                onInteractOutside={(event) => {
                    // Pinning a hover preview is an interaction with the chooser. Escape should still refocus its trigger.
                    if (event.target instanceof Node && triggerRef.current?.contains(event.target)) {
                        event.preventDefault();
                    }
                }}
                onCloseAutoFocus={(event) => {
                    if (hoverPreviewRef.current) {
                        event.preventDefault();
                    }
                }}
                overlay={ribbon.map((group) => {
                    const Icon = iconMap[group.key as RibbonPosition] ?? MoreVerticalIcon;
                    const active = group.key === activatedTab;
                    return (
                        <Button
                            key={group.key}
                            ref={active ? selectedButtonRef : undefined}
                            type="button"
                            variant="text"
                            aria-current={active || undefined}
                            data-u-comp="ribbon-group-btn"
                            className="
                              univer-h-auto univer-w-full univer-justify-start univer-gap-2.5 univer-whitespace-normal
                              univer-rounded univer-border-0 univer-px-2 univer-py-1.5 univer-text-start
                              aria-[current=true]:univer-bg-gray-100
                              dark:aria-[current=true]:!univer-bg-gray-600
                            "
                            onClick={() => {
                                hoverPreviewRef.current = false;
                                onSelectTab(group);
                                handleOpenChange(false);
                            }}
                        >
                            <span
                                className={clsx(`
                                  univer-box-border univer-grid univer-size-9 univer-shrink-0 univer-place-items-center
                                  univer-rounded-md
                                `, borderClassName)}
                            >
                                <Icon aria-hidden="true" preserveStrokeWidth />
                            </span>
                            <span className="univer-flex univer-min-w-0 univer-flex-col">
                                <strong className="univer-text-sm univer-font-semibold">{localeService.t(group.title || group.key)}</strong>
                                <span
                                    className="
                                      univer-text-xs univer-text-gray-500
                                      dark:!univer-text-gray-300
                                    "
                                >
                                    {localeService.t(`${group.title || group.key}Desc`)}
                                </span>
                            </span>
                        </Button>
                    );
                })}
            >
                <Button
                    ref={triggerRef}
                    type="button"
                    className="
                      univer-me-2 univer-h-7 univer-gap-1.5 univer-rounded-full univer-border-transparent
                      univer-bg-gray-700 univer-px-3 univer-text-gray-0
                      hover:univer-bg-gray-600
                      dark:!univer-bg-gray-200 dark:!univer-text-gray-800
                    "
                    onClick={(event) => {
                        if (groupSelectorVisible && hoverPreviewRef.current) {
                            event.preventDefault();
                            clearTimeout(hoverTimerRef.current);
                            hoverPreviewRef.current = false;
                            selectedButtonRef.current?.focus();
                        }
                    }}
                >
                    {localeService.t(activatedTabTitle)}
                    <MoreDownIcon aria-hidden="true" preserveStrokeWidth />
                </Button>
            </Dropdown>
        </div>
    );
}
