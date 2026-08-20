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

import type { IDropdownMenuProps, IDropdownProps, ITooltipProps } from '@univerjs/design';
import type { ReactNode } from 'react';
import type { IMenuItem, IValueOption } from '../../../services/menu/menu';
import {
    clsx,
    ConfigContext,
    Dropdown,
    DropdownMenu,
    Tooltip,
} from '@univerjs/design';
import { CheckMarkIcon } from '@univerjs/icons';
import {
    createContext,
    forwardRef,
    useCallback,
    useContext,
    useEffect,
    useImperativeHandle,
    useMemo,
    useRef,
    useState,
} from 'react';
import { combineLatest, map, merge, of, scan, startWith } from 'rxjs';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
import { keepInteractionInsideSameEmbedBoundary } from '../../../utils/embed-boundary';
import { CustomLabel } from '../../custom-label/CustomLabel';

const TooltipWrapperContext = createContext({
    dropdownVisible: false,
    setDropdownVisible: (_visible: boolean) => {},
});

const ToolbarDropdownContext = createContext<{
    openDropdownKey: string | null;
    setOpenDropdownKey: (key: string | null) => void;
} | null>(null);

export interface ITooltipWrapperRef {
    el: HTMLSpanElement | null;
}

export interface IToolbarTooltipProps extends Omit<ITooltipProps, 'visible' | 'onVisibleChange'> {
    popupOpen: boolean;
}

/**
 * Keeps toolbar tooltips controlled while a related popup opens and closes.
 * The tooltip stays hidden after the popup closes until a new hover or focus interaction occurs.
 */
export function ToolbarTooltip(props: IToolbarTooltipProps) {
    const { popupOpen, ...tooltipProps } = props;
    const [tooltipVisible, setTooltipVisible] = useState(false);

    useEffect(() => {
        if (popupOpen) {
            setTooltipVisible(false);
        }
    }, [popupOpen]);

    return (
        <Tooltip
            {...tooltipProps}
            className={clsx('univer-fill-mode-backwards univer-delay-100', tooltipProps.className)}
            visible={!popupOpen && tooltipVisible}
            onVisibleChange={(visible) => {
                if (!popupOpen) {
                    setTooltipVisible(visible);
                }
            }}
        />
    );
}

export function ToolbarDropdownProvider(props: { children: ReactNode }) {
    const [openDropdownKey, setOpenDropdownKey] = useState<string | null>(null);
    const contextValue = useMemo(() => ({
        openDropdownKey,
        setOpenDropdownKey,
    }), [openDropdownKey]);

    return (
        <ToolbarDropdownContext.Provider value={contextValue}>
            {props.children}
        </ToolbarDropdownContext.Provider>
    );
}

export const TooltipWrapper = forwardRef<ITooltipWrapperRef, ITooltipProps & { dropdownKey?: string }>((props, ref) => {
    const { children, dropdownKey, ...tooltipProps } = props;

    const spanRef = useRef<HTMLSpanElement>(null);

    const [localDropdownVisible, setLocalDropdownVisible] = useState(false);
    const toolbarDropdownContext = useContext(ToolbarDropdownContext);
    const dropdownVisible = dropdownKey && toolbarDropdownContext
        ? toolbarDropdownContext.openDropdownKey === dropdownKey
        : localDropdownVisible;

    const handleChangeDropdownVisible = useCallback((visible: boolean) => {
        if (dropdownKey && toolbarDropdownContext) {
            toolbarDropdownContext.setOpenDropdownKey(visible ? dropdownKey : null);
        } else {
            setLocalDropdownVisible(visible);
        }
    }, [dropdownKey, toolbarDropdownContext]);

    const contextValue = useMemo(() => ({
        dropdownVisible,
        setDropdownVisible: handleChangeDropdownVisible,
    }), [dropdownVisible, handleChangeDropdownVisible]);

    useImperativeHandle(ref, () => ({
        el: spanRef.current,
    }));

    const content = (
        <span ref={spanRef}>
            <TooltipWrapperContext.Provider value={contextValue}>
                {children}
            </TooltipWrapperContext.Provider>
        </span>
    );

    return tooltipProps.title
        ? (
            <ToolbarTooltip
                popupOpen={dropdownVisible}
                {...tooltipProps}
            >
                {content}
            </ToolbarTooltip>
        )
        : content;
});

export function DropdownWrapper(props: Omit<Partial<IDropdownProps>, 'overlay'> & { overlay: ReactNode; align?: 'start' | 'end' | 'center' }) {
    const { children, overlay, disabled, align } = props;
    const { direction } = useContext(ConfigContext);
    const { dropdownVisible, setDropdownVisible } = useContext(TooltipWrapperContext);
    const triggerRef = useRef<HTMLDivElement>(null);
    const overlayRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (disabled) {
            setDropdownVisible(false);
        }
    }, [disabled, setDropdownVisible]);

    useEffect(() => {
        const ownerDocument = triggerRef.current?.ownerDocument;
        if (!dropdownVisible || !ownerDocument) return;

        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node | null;
            if (!target || triggerRef.current?.contains(target) || overlayRef.current?.contains(target)) return;

            setDropdownVisible(false);
        };

        ownerDocument.addEventListener('pointerdown', handlePointerDown, true);
        return () => ownerDocument.removeEventListener('pointerdown', handlePointerDown, true);
    }, [dropdownVisible, setDropdownVisible]);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    return (
        <Dropdown
            align={align ?? (direction === 'rtl' ? 'end' : 'start')}
            overlay={(
                <div ref={overlayRef} className="univer-grid univer-gap-2">
                    {overlay}
                </div>
            )}
            disabled={disabled}
            open={dropdownVisible}
            onOpenChange={handleVisibleChange}
        >
            <div ref={triggerRef} className="univer-h-full" onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </Dropdown>
    );
}

export function DropdownMenuLabel({ icon, value, option, preserveStrokeWidth, onOptionSelect }: {
    icon?: IMenuItem['icon'];
    value?: string | number;
    option: IValueOption;
    preserveStrokeWidth?: boolean;
    onOptionSelect?: (option: IValueOption) => void;
}) {
    const onChange = (v: string | number) => {
        onOptionSelect?.({ ...option, value: v });
    };

    const hasCheckMark = typeof option.label === 'string' || (typeof option.label === 'object' && option.label?.selectable !== false);
    const selected = hasCheckMark && String(value) === String(option.value);

    return (
        <div className="univer-flex univer-w-full univer-items-center univer-justify-between univer-gap-2">
            <div className="univer-flex univer-min-w-0 univer-items-center univer-gap-2">
                <CustomLabel
                    className="univer-text-sm"
                    icon={icon}
                    preserveStrokeWidth={preserveStrokeWidth}
                    value$={option.value$}
                    value={option.value}
                    label={option.label}
                    onChange={onChange}
                />
            </div>
            {hasCheckMark && (
                <span className="univer-ml-auto univer-flex univer-w-4 univer-flex-shrink-0 univer-justify-end">
                    {selected && (
                        <CheckMarkIcon
                            className="univer-text-primary-600"
                            preserveStrokeWidth={preserveStrokeWidth}
                        />
                    )}
                </span>
            )}
        </div>
    );
}

function getOptionKey(option: IValueOption) {
    return String(option.id ?? option.commandId ?? option.value ?? (typeof option.label === 'string' ? option.label : option.label?.name));
}

export function DropdownMenuWrapper({
    menuId,
    slot,
    value,
    options,
    children,
    disabled,
    preserveStrokeWidth,
    onOptionSelect,
}: {
    menuId: string;
    slot?: boolean;
    value?: string | number;
    options: IValueOption[];
    children: ReactNode;
    disabled?: boolean;
    preserveStrokeWidth?: boolean;
    onOptionSelect: (option: IValueOption) => void;
}) {
    const { dropdownVisible, setDropdownVisible } = useContext(TooltipWrapperContext);

    useEffect(() => {
        if (disabled) {
            setDropdownVisible(false);
        }
    }, [disabled, setDropdownVisible]);

    const menuManagerService = useDependency(IMenuManagerService);
    const resolveMenuItems = () => menuId ? menuManagerService.getMenuByPositionKey(menuId) : [];
    const menuItems = useObservable(
        () => menuManagerService.menuChanged$.pipe(map(resolveMenuItems), startWith(resolveMenuItems())),
        resolveMenuItems(),
        false,
        [menuId, menuManagerService]
    );
    const hiddenStates$ = useMemo(() => {
        const itemStates = menuItems.map((item) => {
            const hidden$ = item.children
                ? combineLatest(item.children.map((subItem) => subItem.item?.hidden$ ?? of(false))).pipe(
                    map((hiddenValues) => hiddenValues.every(Boolean))
                )
                : item.item?.hidden$ ?? of(false);
            return hidden$.pipe(map((hidden) => [String(item.key), hidden] as const));
        });
        return itemStates.length
            ? merge(...itemStates).pipe(
                scan((states, [key, hidden]) => ({ ...states, [key]: hidden }), {} as Record<string, boolean>),
                startWith({})
            )
            : of({});
    }, [menuItems]);
    const hiddenStates = useObservable<Record<string, boolean>>(hiddenStates$, {});

    const filteredMenuItems = useMemo(() => {
        return menuItems.filter((item) => {
            if (!item.children) {
                return !hiddenStates[item.key];
            }

            const itemKey = item.key?.toString() || '';
            return !hiddenStates[itemKey];
        });
    }, [menuItems, hiddenStates]);

    function handleVisibleChange(visible: boolean) {
        setDropdownVisible(visible);
    }

    function handleEmbedBoundaryFocusOutside(event: { currentTarget: EventTarget | null; target: EventTarget | null; preventDefault: () => void }) {
        keepInteractionInsideSameEmbedBoundary(event);
    }

    function handleOptionSelect(option: IValueOption) {
        onOptionSelect(option);
        setDropdownVisible(false);
    }

    if (slot) {
        return (
            <DropdownWrapper
                disabled={disabled}
                overlay={options.map((option) => (
                    <DropdownMenuLabel
                        key={getOptionKey(option)}
                        value={value}
                        option={option}
                        preserveStrokeWidth={preserveStrokeWidth}
                        onOptionSelect={handleOptionSelect}
                    />
                ))}
            >
                {children}
            </DropdownWrapper>
        );
    }

    // options menu
    if (options?.length) {
        const isSingleEmbeddedCustomPanel = filteredMenuItems.length === 0 &&
            options.length === 1 &&
            typeof options[0].label === 'object' &&
            options[0].label?.hoverable === false &&
            options[0].label.props?.embedded === true;
        const items: IDropdownMenuProps['items'] = options.map((option) => ({
            type: 'item',
            className: clsx({
                'focus:univer-bg-gray-0': typeof option.label !== 'string' && option.label?.hoverable === false,
                '!univer-p-0': isSingleEmbeddedCustomPanel,
            }),
            children: (
                <DropdownMenuLabel
                    icon={option.icon}
                    value={value}
                    option={option}
                    preserveStrokeWidth={preserveStrokeWidth}
                    onOptionSelect={handleOptionSelect}
                />
            ),
            disabled: option.disabled,
            onSelect: () => {
                if (typeof option.value === 'undefined') return;

                handleOptionSelect({
                    ...option,
                });
            },
        }));

        if (filteredMenuItems.length) {
            items.push({
                type: 'separator',
            });
        }

        for (const menuItem of filteredMenuItems) {
            if (!menuItem.item) continue;

            const { title, id, commandId, icon } = menuItem.item;

            if (!title) {
                throw new Error('Menu item title is required');
            }

            items.push({
                type: 'item',
                children: (
                    <DropdownMenuLabel
                        icon={icon}
                        value={value}
                        preserveStrokeWidth={preserveStrokeWidth}
                        option={{
                            label: {
                                name: title,
                                selectable: false,
                            },
                        }}
                    />
                ),
                onSelect: () => {
                    handleOptionSelect({
                        commandId,
                        id,
                    });
                },
            });
        }

        return (
            <DropdownMenu
                align="start"
                className={clsx({ '!univer-p-0': isSingleEmbeddedCustomPanel })}
                items={items}
                disabled={disabled}
                open={dropdownVisible}
                onOpenChange={handleVisibleChange}
                onFocusOutside={handleEmbedBoundaryFocusOutside}
                onInteractOutside={handleEmbedBoundaryFocusOutside}
            >
                {children}
            </DropdownMenu>
        );
    } else {
        const items: IDropdownMenuProps['items'] = [];

        for (const menuItem of filteredMenuItems) {
            if (menuItem.item) {
                const { title, id, commandId, icon } = menuItem.item;

                if (!title) {
                    throw new Error('Menu item title is required');
                }

                items.push({
                    type: 'item',
                    children: (
                        <DropdownMenuLabel
                            icon={icon}
                            value={value}
                            preserveStrokeWidth={preserveStrokeWidth}
                            option={{
                                label: {
                                    name: title,
                                    selectable: false,
                                },
                            }}
                        />
                    ),
                    onSelect: () => {
                        handleOptionSelect({
                            commandId,
                            id,
                        });
                    },
                });
            } else if (menuItem.children?.length) {
            // sub menu
            }
        }

        return (
            <DropdownMenu
                align="start"
                items={items}
                disabled={disabled}
                open={dropdownVisible}
                onOpenChange={handleVisibleChange}
                onFocusOutside={handleEmbedBoundaryFocusOutside}
                onInteractOutside={handleEmbedBoundaryFocusOutside}
            >
                {children}
            </DropdownMenu>
        );
    }
}
