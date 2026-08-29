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

import type { Observable } from 'rxjs';
import type { LocaleKey } from '../../../locale/types';
import type {
    IDisplayMenuItem,
    IMenuItem,
    IMenuSelectorItem,
    IValueOption,
    MenuItemDefaultValueType,
} from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import type { IBaseMenuProps } from '../types';
import { LocaleService } from '@univerjs/core';
import { borderBottomClassName, clsx } from '@univerjs/design';
import { CheckMarkIcon, MoreLeftIcon, MoreRightIcon } from '@univerjs/icons';
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { combineLatest, isObservable, map, merge, of } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import { ComponentManager } from '../../../common/component-manager';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label/index';

type MobileMenuView =
    | {
        kind: 'schema';
        title?: string;
        schemas: IMenuSchema[];
        disabled$?: Observable<boolean>;
    }
    | {
        kind: 'options';
        title?: string;
        options: IValueOption[];
        menuItem: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
        menuKey: string;
        currentValue: MenuItemDefaultValueType;
        disabled$?: Observable<boolean>;
    };

interface IMobileMenuProps extends IBaseMenuProps {
    schemas?: IMenuSchema[];
    menuManagerService?: IMenuManagerService;
    showHeader?: boolean;
    presentation?: 'drawer' | 'context-bar';
    onNavigationChange?: (navigation: { title?: string; onBack: () => void } | null) => void;
}

export function MobileMenu(props: IMobileMenuProps) {
    const {
        menuType,
        onOptionSelect,
        schemas: providedSchemas,
        menuManagerService: providedMenuManagerService,
        showHeader = true,
        presentation = 'drawer',
        onNavigationChange,
    } = props;
    const rootMenuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);
    const menuManagerService = providedMenuManagerService ?? rootMenuManagerService;
    const [viewStack, setViewStack] = useState<MobileMenuView[]>([]);
    const providedSchemaKey = providedSchemas?.map((schema) => schema.key).join('|');

    const menuSchemaVersion$ = useMemo(() => {
        return menuManagerService.menuChanged$.pipe(
            scan((version) => version + 1, 0),
            startWith(0)
        );
    }, [menuManagerService]);
    const menuSchemaVersion = useObservable(menuSchemaVersion$, 0);

    const menuSchemas = useMemo(() => {
        if (providedSchemas) {
            return providedSchemas;
        }

        if (!menuType) {
            return [];
        }

        return menuManagerService.getMenuByPositionKey(menuType);
    }, [providedSchemas, menuManagerService, menuSchemaVersion, menuType]);

    useEffect(() => {
        setViewStack([]);
    }, [menuType, providedSchemaKey]);

    const currentView = viewStack[viewStack.length - 1] ?? null;
    const closeView = useCallback(() => setViewStack((stack) => stack.slice(0, -1)), []);

    useEffect(() => {
        onNavigationChange?.(currentView
            ? { title: currentView.title, onBack: closeView }
            : null);
    }, [closeView, currentView, onNavigationChange]);

    if (!menuType && !providedSchemas) {
        return null;
    }

    const openView = (view: MobileMenuView) => setViewStack((stack) => [...stack, view]);

    if (presentation === 'context-bar') {
        return (
            <MobileContextMenuBar
                currentView={currentView}
                menuSchemas={menuSchemas}
                menuManagerService={menuManagerService}
                onExecute={onOptionSelect}
                onOpenView={openView}
                onBack={closeView}
            />
        );
    }

    return (
        <div className="univer-flex univer-flex-col">
            {showHeader && currentView && (
                <header
                    className="
                      univer-grid univer-grid-cols-[32px_minmax(0,1fr)_32px] univer-items-center univer-gap-3
                      univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-bg-gray-0
                      univer-px-4 univer-py-3
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-800
                    "
                >
                    <button
                        type="button"
                        aria-label={localeService.t<LocaleKey>('ui.navigation.back')}
                        className="
                          univer-flex univer-size-8 univer-appearance-none univer-items-center univer-justify-center
                          univer-rounded-full univer-border-0 univer-bg-transparent univer-p-0 univer-text-gray-700
                          hover:univer-bg-gray-100
                          active:univer-bg-gray-200
                          dark:!univer-text-gray-300
                          dark:hover:!univer-bg-gray-700
                          dark:active:!univer-bg-gray-600
                        "
                        onClick={closeView}
                    >
                        <MoreLeftIcon className="univer-text-base" />
                    </button>
                    <div
                        className="
                          univer-min-w-0 univer-truncate univer-text-center univer-text-sm univer-font-semibold
                          univer-text-gray-900
                          dark:!univer-text-gray-100
                        "
                    >
                        {currentView.title}
                    </div>
                    <div className="univer-size-8" aria-hidden="true" />
                </header>
            )}

            <div className="univer-pb-2 univer-pt-1">
                {currentView?.kind !== 'options' && (
                    <div
                        className="
                          univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                          dark:!univer-bg-gray-800
                        "
                    >
                        <MobileSchemaList
                            schemas={currentView?.kind === 'schema' ? currentView.schemas : menuSchemas}
                            menuManagerService={menuManagerService}
                            onExecute={onOptionSelect}
                            onOpenView={openView}
                            inheritedDisabled$={currentView?.disabled$}
                        />
                    </div>
                )}

                {currentView?.kind === 'options' && (
                    <div
                        className="
                          univer-overflow-hidden univer-rounded-xl univer-bg-gray-0
                          dark:!univer-bg-gray-800
                        "
                    >
                        <MobileSelectionOptionsView
                            menuKey={currentView.menuKey}
                            menuItem={currentView.menuItem}
                            options={currentView.options}
                            currentValue={currentView.currentValue}
                            inheritedDisabled$={currentView.disabled$}
                            onExecute={onOptionSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileContextMenuBar(props: {
    currentView: MobileMenuView | null;
    menuSchemas: IMenuSchema[];
    menuManagerService: IMenuManagerService;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
    onBack: () => void;
}) {
    const { currentView, menuSchemas, menuManagerService, onExecute, onOpenView, onBack } = props;
    const localeService = useDependency(LocaleService);
    const scrollerRef = useRef<HTMLDivElement>(null);
    const [scrollState, setScrollState] = useState({ left: false, right: false });
    const schemas = getContextBarSchemas(currentView?.kind === 'schema' ? currentView.schemas : menuSchemas);

    const updateScrollState = useCallback(() => {
        const scroller = scrollerRef.current;
        if (!scroller) {
            return;
        }

        setScrollState({
            left: scroller.scrollLeft > 1,
            right: scroller.scrollLeft + scroller.clientWidth < scroller.scrollWidth - 1,
        });
    }, []);

    useLayoutEffect(() => {
        const scroller = scrollerRef.current;
        if (scroller) {
            scroller.scrollLeft = 0;
        }
        const frame = requestAnimationFrame(updateScrollState);
        return () => cancelAnimationFrame(frame);
    }, [currentView, menuSchemas, updateScrollState]);

    const scroll = (direction: -1 | 1) => {
        const scroller = scrollerRef.current;
        scroller?.scrollBy({ left: direction * scroller.clientWidth * 0.8, behavior: 'smooth' });
    };

    const showLeft = Boolean(currentView) || scrollState.left;

    return (
        <div
            role="menu"
            data-u-comp="mobile-context-menu-bar"
            className="
              univer-flex univer-h-12 univer-max-w-full univer-items-stretch univer-overflow-hidden univer-rounded-lg
              univer-bg-gray-0 univer-text-sm univer-text-gray-900 univer-shadow-lg
              dark:!univer-bg-gray-700 dark:!univer-text-gray-0
            "
        >
            {showLeft && (
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('ui.navigation.back')}
                    className="
                      univer-flex univer-w-11 univer-shrink-0 univer-items-center univer-justify-center univer-border-0
                      univer-border-r univer-border-solid univer-border-gray-200 univer-bg-transparent univer-text-base
                      univer-text-gray-700 univer-outline-none
                      focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
                      active:univer-bg-gray-100
                      dark:!univer-border-gray-600 dark:!univer-text-gray-200
                      dark:active:!univer-bg-gray-600
                    "
                    onClick={() => scrollState.left ? scroll(-1) : onBack()}
                >
                    <MoreLeftIcon />
                </button>
            )}
            <div
                ref={scrollerRef}
                className="
                  univer-flex univer-min-w-0 univer-flex-1 univer-snap-x univer-snap-mandatory univer-overflow-x-auto
                  univer-overflow-y-hidden
                "
                style={{ scrollbarWidth: 'none' }}
                onScroll={updateScrollState}
            >
                {currentView?.kind === 'options'
                    ? currentView.options.map((option, index) => (
                        <MobileContextMenuOption
                            key={`${currentView.menuKey}-${String(option.value ?? index)}`}
                            option={option}
                            menuKey={currentView.menuKey}
                            menuItem={currentView.menuItem}
                            currentValue={currentView.currentValue}
                            inheritedDisabled$={currentView.disabled$}
                            onExecute={onExecute}
                        />
                    ))
                    : schemas.map((schema) => (
                        <MobileContextMenuItem
                            key={schema.key}
                            schema={schema}
                            menuManagerService={menuManagerService}
                            onExecute={onExecute}
                            onOpenView={onOpenView}
                            inheritedDisabled$={currentView?.disabled$}
                        />
                    ))}
            </div>
            {scrollState.right && (
                <button
                    type="button"
                    aria-label={localeService.t<LocaleKey>('ui.navigation.next')}
                    className="
                      univer-flex univer-w-11 univer-shrink-0 univer-items-center univer-justify-center univer-border-0
                      univer-border-l univer-border-solid univer-border-gray-200 univer-bg-transparent univer-text-base
                      univer-text-gray-700 univer-outline-none
                      focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
                      active:univer-bg-gray-100
                      dark:!univer-border-gray-600 dark:!univer-text-gray-200
                      dark:active:!univer-bg-gray-600
                    "
                    onClick={() => scroll(1)}
                >
                    <MoreRightIcon />
                </button>
            )}
        </div>
    );
}

function MobileContextMenuItem(props: {
    schema: IMenuSchema;
    menuManagerService: IMenuManagerService;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
    inheritedDisabled$?: Observable<boolean>;
}) {
    const { schema, menuManagerService, onExecute, onOpenView, inheritedDisabled$ } = props;
    const localeService = useDependency(LocaleService);
    const interaction = useMobileSchemaInteraction({ schema, menuManagerService, onOpenView, inheritedDisabled$ });

    if (!interaction || interaction.hidden) {
        return null;
    }

    return (
        <button
            type="button"
            role="menuitem"
            disabled={interaction.disabled}
            className="
              univer-flex univer-min-w-[72px] univer-shrink-0 univer-snap-start univer-items-center
              univer-justify-center univer-border-0 univer-border-r univer-border-solid univer-border-gray-200
              univer-bg-transparent univer-px-4 univer-text-sm univer-text-gray-900 univer-outline-none
              focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
              enabled:active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-border-gray-600 dark:!univer-text-gray-0
              dark:enabled:active:!univer-bg-gray-600
            "
            onClick={() => interaction.onPress(onExecute)}
        >
            <span className="univer-whitespace-nowrap">{getMenuSchemaTitle(schema, localeService)}</span>
        </button>
    );
}

function MobileContextMenuOption(props: {
    option: IValueOption;
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    currentValue: MenuItemDefaultValueType;
    inheritedDisabled$?: Observable<boolean>;
    onExecute?: IBaseMenuProps['onOptionSelect'];
}) {
    const { option, menuKey, menuItem, currentValue, inheritedDisabled$, onExecute } = props;
    const inheritedDisabled = useObservable<boolean>(inheritedDisabled$, false);
    const observableValue = useObservable(option.value$);
    const displayValue = option.value ?? observableValue;
    const disabled = inheritedDisabled || Boolean(option.disabled);

    return (
        <button
            type="button"
            role="menuitem"
            aria-pressed={displayValue === currentValue}
            disabled={disabled}
            className="
              univer-flex univer-min-w-[72px] univer-shrink-0 univer-snap-start univer-items-center
              univer-justify-center univer-border-0 univer-border-r univer-border-solid univer-border-gray-200
              univer-bg-transparent univer-px-4 univer-text-sm univer-text-gray-900 univer-outline-none
              focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
              enabled:active:univer-bg-gray-100
              disabled:univer-opacity-40
              dark:!univer-border-gray-600 dark:!univer-text-gray-0
              dark:enabled:active:!univer-bg-gray-600
            "
            onClick={() => onExecute?.({
                ...option,
                value: displayValue,
                id: menuItem.id,
                label: menuKey,
                commandId: option.commandId,
            })}
        >
            <CustomLabel value$={option.value$} value={displayValue} label={option.label} />
        </button>
    );
}

function getContextBarSchemas(schemas: IMenuSchema[]): IMenuSchema[] {
    return schemas.flatMap((schema) => schema.item ? [schema] : getContextBarSchemas(schema.children ?? []));
}

function MobileSchemaList(props: {
    schemas: IMenuSchema[];
    menuManagerService: IMenuManagerService;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
    inheritedDisabled$?: Observable<boolean>;
}) {
    const { schemas, menuManagerService, onExecute, onOpenView, inheritedDisabled$ } = props;
    const localeService = useDependency(LocaleService);
    const hiddenGroupStates = useContextGroupHiddenStates(schemas);

    const visibleSchemas = useMemo(() => {
        return schemas.filter((schema) => {
            if (schema.item) {
                return true;
            }

            if (schema.children?.length) {
                return !hiddenGroupStates[schema.key];
            }

            return false;
        });
    }, [hiddenGroupStates, schemas]);

    return (
        <>
            {visibleSchemas.map((schema, index) => {
                if (schema.item) {
                    return (
                        <MobileSchemaRow
                            key={schema.key}
                            schema={schema}
                            menuManagerService={menuManagerService}
                            onExecute={onExecute}
                            onOpenView={onOpenView}
                            inheritedDisabled$={inheritedDisabled$}
                            bordered={index !== visibleSchemas.length - 1}
                        />
                    );
                }

                if (!schema.children?.length) {
                    return null;
                }

                return (
                    <section
                        key={schema.key}
                        className={clsx(
                            'univer-grid',
                            index !== visibleSchemas.length - 1 && borderBottomClassName
                        )}
                    >
                        {schema.title && (
                            <div
                                className="
                                  univer-px-4 univer-pb-1 univer-pt-3 univer-text-xs univer-font-medium univer-uppercase
                                  univer-tracking-[0.08em] univer-text-gray-500
                                  dark:!univer-text-gray-400
                                "
                            >
                                {localeService.t(schema.title)}
                            </div>
                        )}
                        {schema.children.map((childSchema, childIndex) => (
                            <MobileSchemaRow
                                key={childSchema.key}
                                schema={childSchema}
                                menuManagerService={menuManagerService}
                                onExecute={onExecute}
                                onOpenView={onOpenView}
                                inheritedDisabled$={inheritedDisabled$}
                                bordered={childIndex !== schema.children!.length - 1}
                            />
                        ))}
                    </section>
                );
            })}
        </>
    );
}

function MobileSchemaRow(props: {
    schema: IMenuSchema;
    menuManagerService: IMenuManagerService;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
    inheritedDisabled$?: Observable<boolean>;
    bordered: boolean;
}) {
    const { schema, menuManagerService, onExecute, onOpenView, inheritedDisabled$, bordered } = props;
    const interaction = useMobileSchemaInteraction({ schema, menuManagerService, onOpenView, inheritedDisabled$ });

    if (!interaction || interaction.hidden) {
        return null;
    }

    const { menuItem, activated, disabled, value, currentValueText, hasSubmenu, onPress } = interaction;

    if (typeof menuItem.label === 'object' && menuItem.label) {
        return (
            <div
                role="group"
                aria-disabled={disabled}
                className={clsx(
                    `
                      univer-flex univer-min-h-12 univer-w-full univer-items-center univer-bg-gray-0 univer-px-4
                      univer-py-2
                      aria-disabled:univer-pointer-events-none aria-disabled:univer-opacity-40
                      dark:!univer-bg-gray-800
                      [&>div]:univer-box-border [&>div]:!univer-w-full
                    `,
                    bordered && borderBottomClassName
                )}
                data-u-command={menuItem.id}
                onClick={(event) => {
                    if (event.target instanceof Element && event.target.closest('button, input, select, textarea, [role="button"]')) {
                        return;
                    }

                    onPress(onExecute);
                }}
            >
                <CustomLabel
                    value={value}
                    label={menuItem.label}
                    icon={menuItem.icon}
                    onChange={(nextValue) => {
                        if (disabled) {
                            return;
                        }

                        onExecute?.({
                            commandId: menuItem.commandId,
                            value: nextValue,
                            id: menuItem.id,
                            label: schema.key,
                            params: menuItem.params,
                        });
                    }}
                />
            </div>
        );
    }

    return (
        <button
            type="button"
            className={clsx(
                `
                  univer-flex univer-min-h-12 univer-w-full univer-appearance-none univer-items-center univer-gap-3
                  univer-border-0 univer-bg-gray-0 univer-px-4 univer-py-2 univer-text-left univer-outline-none
                  univer-transition-colors
                  focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
                  enabled:hover:univer-bg-gray-50
                  enabled:active:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                  dark:!univer-bg-gray-800
                  dark:hover:!univer-bg-gray-700
                  dark:active:!univer-bg-gray-600
                `,
                bordered && borderBottomClassName
            )}
            data-u-command={menuItem.id}
            disabled={disabled}
            aria-pressed={menuItem.type === MenuItemType.BUTTON_SELECTOR ? activated : undefined}
            onClick={() => onPress(onExecute)}
        >
            <div
                className="
                  univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-3 univer-text-gray-900
                  dark:!univer-text-gray-100
                  [&>span]:univer-truncate [&>span]:univer-text-base [&>span]:univer-font-medium
                  [&>svg]:univer-shrink-0 [&>svg]:univer-text-lg [&>svg]:univer-text-gray-700
                  dark:[&>svg]:!univer-text-gray-300
                "
            >
                <CustomLabel
                    value={value}
                    title={menuItem.title ?? menuItem.tooltip}
                    label={menuItem.label}
                    icon={menuItem.icon}
                />
            </div>
            {currentValueText && (
                <span
                    className="
                      univer-max-w-[32%] univer-truncate univer-text-xs univer-font-medium univer-text-gray-400
                      dark:!univer-text-gray-500
                    "
                >
                    {currentValueText}
                </span>
            )}
            {activated && <CheckMarkIcon className="univer-shrink-0 univer-text-primary-600" />}
            {hasSubmenu && (
                <MoreRightIcon
                    className="
                      univer-shrink-0 univer-text-base univer-text-gray-400
                      dark:!univer-text-gray-500
                    "
                />
            )}
        </button>
    );
}

function MobileSelectionOptionsView(props: {
    options: IValueOption[];
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    currentValue: MenuItemDefaultValueType;
    inheritedDisabled$?: Observable<boolean>;
    onExecute?: IBaseMenuProps['onOptionSelect'];
}) {
    const { options, menuKey, menuItem, currentValue, inheritedDisabled$, onExecute } = props;
    const inheritedDisabled = useObservable<boolean>(inheritedDisabled$, false);

    return (
        <>
            {options.map((option, index) => (
                <MobileSelectionOptionRow
                    key={`${menuKey}-${String(option.value ?? index)}`}
                    option={option}
                    menuKey={menuKey}
                    menuItem={menuItem}
                    currentValue={currentValue}
                    disabled={inheritedDisabled}
                    bordered={index !== options.length - 1}
                    onExecute={onExecute}
                />
            ))}
        </>
    );
}

function MobileSelectionOptionRow(props: {
    option: IValueOption;
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuSelectorItem<string, MenuItemDefaultValueType, unknown>>;
    currentValue: MenuItemDefaultValueType;
    disabled: boolean;
    bordered: boolean;
    onExecute?: IBaseMenuProps['onOptionSelect'];
}) {
    const { option, menuKey, menuItem, currentValue, disabled, bordered, onExecute } = props;
    const componentManager = useDependency(ComponentManager);
    const optionValue = useObservable(option.value$);
    const displayValue = option.value ?? optionValue;
    const selected = displayValue === currentValue;
    const optionDisabled = disabled || Boolean(option.disabled);

    if (typeof option.label === 'object' && option.label && componentManager.get(option.label.name)) {
        return (
            <div
                role="group"
                data-u-comp="mobile-custom-menu-option"
                className={clsx(
                    `
                      univer-w-full univer-bg-gray-0
                      dark:!univer-bg-gray-800
                      [&>div>*]:univer-box-border [&>div>*]:!univer-w-full
                      [&>div]:univer-box-border [&>div]:!univer-w-full
                    `,
                    bordered && borderBottomClassName
                )}
            >
                <CustomLabel
                    value$={option.value$}
                    value={displayValue}
                    label={option.label}
                    icon={option.icon}
                    onChange={(nextValue) => {
                        if (optionDisabled) {
                            return;
                        }

                        onExecute?.({
                            ...option,
                            value: nextValue,
                            id: menuItem.id,
                            label: menuKey,
                            commandId: option.commandId,
                        });
                    }}
                />
            </div>
        );
    }

    return (
        <button
            type="button"
            aria-pressed={selected}
            className={clsx(
                `
                  univer-relative univer-flex univer-min-h-12 univer-w-full univer-appearance-none univer-items-center
                  univer-gap-3 univer-border-0 univer-bg-gray-0 univer-px-4 univer-py-2 univer-text-left
                  univer-outline-none univer-transition-colors
                  focus-visible:univer-ring-2 focus-visible:univer-ring-inset focus-visible:univer-ring-primary-500
                  enabled:hover:univer-bg-gray-50
                  enabled:active:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                  dark:!univer-bg-gray-800
                  dark:hover:!univer-bg-gray-700
                  dark:active:!univer-bg-gray-600
                `,
                bordered && borderBottomClassName
            )}
            disabled={optionDisabled}
            onClick={() => {
                if (optionDisabled) {
                    return;
                }

                onExecute?.({
                    ...option,
                    value: displayValue,
                    id: menuItem.id,
                    label: menuKey,
                    commandId: option.commandId,
                });
            }}
        >
            <div
                className="
                  univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-3 univer-text-gray-900
                  dark:!univer-text-gray-100
                  [&>span]:univer-truncate [&>span]:univer-text-base [&>span]:univer-font-medium
                  [&>svg]:univer-shrink-0 [&>svg]:univer-text-lg [&>svg]:univer-text-gray-700
                  dark:[&>svg]:!univer-text-gray-300
                "
            >
                <CustomLabel value$={option.value$} value={displayValue} label={option.label} icon={option.icon} />
            </div>
            {selected && (
                <CheckMarkIcon
                    className="
                      univer-shrink-0 univer-text-base univer-text-primary-600
                      dark:!univer-text-primary-400
                    "
                />
            )}
        </button>
    );
}

function useMobileSchemaInteraction(props: {
    schema: IMenuSchema;
    menuManagerService: IMenuManagerService;
    onOpenView: (view: MobileMenuView) => void;
    inheritedDisabled$?: Observable<boolean>;
}) {
    const { schema, menuManagerService, onOpenView, inheritedDisabled$ } = props;
    const localeService = useDependency(LocaleService);
    const menuItem = schema.item;
    const selectorItem = menuItem?.type === MenuItemType.BUTTON ? undefined : menuItem;
    const disabled$ = useMemo(() => {
        const sources = [inheritedDisabled$, menuItem?.disabled$].filter((source): source is Observable<boolean> => Boolean(source));
        return sources.length
            ? combineLatest(sources.map((source) => source.pipe(startWith(false)))).pipe(map((states) => states.some(Boolean)))
            : undefined;
    }, [inheritedDisabled$, menuItem?.disabled$]);
    const disabled = useObservable<boolean>(disabled$, false);
    const hidden = useObservable<boolean>(menuItem?.hidden$, false);
    const activated = useObservable<boolean>(menuItem?.activated$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem?.value$);
    const selectionsFromObservable = useObservable(
        selectorItem && isObservable(selectorItem.selections) ? selectorItem.selections : undefined
    );
    const schemaChildren = useMemo(() => schema.children ?? [], [schema.children]);
    const visibleSchemaChildren$ = useMemo(
        () => getVisibleSchemaCount$(schemaChildren),
        [schemaChildren]
    );
    const visibleSchemaChildren = useObservable(visibleSchemaChildren$, schemaChildren.length);

    const selections = useMemo(() => {
        if (!selectorItem || (menuItem?.type !== MenuItemType.SELECTOR && menuItem?.type !== MenuItemType.BUTTON_SELECTOR)) {
            return [];
        }

        if (selectionsFromObservable) {
            return selectionsFromObservable;
        }

        return Array.isArray(selectorItem.selections) ? selectorItem.selections : [];
    }, [menuItem?.type, selectionsFromObservable, selectorItem]);

    const subMenuItems = useMemo(() => {
        if (!menuItem || menuItem.type !== MenuItemType.SUBITEMS || !menuItem.id) {
            return [];
        }

        return menuManagerService.getMenuByPositionKey(menuItem.id);
    }, [menuItem, menuManagerService]);

    if (!menuItem) {
        return null;
    }

    const hasSubmenu = visibleSchemaChildren > 0 || selections.length > 0 || subMenuItems.length > 0;
    const effectivelyDisabled = disabled || (menuItem.type === MenuItemType.SUBITEMS && !hasSubmenu);
    const currentValueText = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

    const onPress = (onExecute?: IBaseMenuProps['onOptionSelect']) => {
        if (effectivelyDisabled) {
            return;
        }

        if (schemaChildren.length > 0) {
            const schemas = menuItem.type === MenuItemType.BUTTON_SELECTOR && selections.length === 0
                ? [{ ...schema, children: undefined }, ...schemaChildren]
                : schemaChildren;
            onOpenView({
                kind: 'schema',
                title: getMenuSchemaTitle(schema, localeService),
                schemas,
                disabled$,
            });
            return;
        }

        if (selections.length > 0 && selectorItem) {
            onOpenView({
                kind: 'options',
                title: getMenuSchemaTitle(schema, localeService),
                options: selections,
                menuItem: selectorItem,
                menuKey: schema.key,
                currentValue: value,
                disabled$,
            });
            return;
        }

        if (subMenuItems.length > 0) {
            onOpenView({
                kind: 'schema',
                title: getMenuSchemaTitle(schema, localeService),
                schemas: subMenuItems,
                disabled$,
            });
            return;
        }

        if (menuItem.type !== MenuItemType.BUTTON && menuItem.type !== MenuItemType.BUTTON_SELECTOR) {
            return;
        }

        onExecute?.({
            commandId: menuItem.commandId,
            value,
            id: menuItem.id,
            label: schema.key,
            params: menuItem.params,
        });
    };

    return {
        menuItem,
        activated,
        disabled: effectivelyDisabled,
        hidden,
        value,
        currentValueText,
        hasSubmenu,
        onPress,
    };
}

function getVisibleSchemaCount$(schemas: IMenuSchema[]) {
    const leafSchemas = getLeafItemSchemas(schemas);
    if (leafSchemas.length === 0) {
        return of(0);
    }

    return combineLatest(leafSchemas.map((schema) => (schema.item?.hidden$ ?? of(false)).pipe(startWith(false))))
        .pipe(map((hiddenStates) => hiddenStates.filter((hidden) => !hidden).length));
}

function getMenuSchemaTitle(schema: IMenuSchema, localeService: LocaleService) {
    const menuItem = schema.item as IDisplayMenuItem<IMenuItem> | undefined;

    if (typeof menuItem?.title === 'string') {
        return localeService.t(menuItem.title);
    }

    if (typeof menuItem?.label === 'string') {
        return localeService.t(menuItem.label);
    }

    if (typeof menuItem?.tooltip === 'string') {
        return localeService.t(menuItem.tooltip);
    }

    if (typeof schema.title === 'string') {
        return localeService.t(schema.title);
    }

    return schema.key;
}

function useContextGroupHiddenStates(menuSchemas: IMenuSchema[]) {
    const hiddenStates$ = useMemo(() => {
        const groupStates = menuSchemas.flatMap((menuSchema) => {
            const hiddenObservables = menuSchema.children?.length
                ? getLeafItemSchemas(menuSchema.children).map((childSchema) => childSchema.item?.hidden$ ?? of(false))
                : [];
            return hiddenObservables.length
                ? [combineLatest(hiddenObservables).pipe(map((values) => [menuSchema.key, values.every(Boolean)] as const))]
                : [];
        });

        return groupStates.length
            ? merge(...groupStates).pipe(
                scan((states, [key, hidden]) => ({ ...states, [key]: hidden }), {} as Record<string, boolean>),
                startWith({})
            )
            : of({});
    }, [menuSchemas]);

    return useObservable<Record<string, boolean>>(hiddenStates$, {});
}

function getLeafItemSchemas(schemas: IMenuSchema[]): IMenuSchema[] {
    return schemas.reduce((acc, schema) => {
        if (schema.children?.length) {
            return [...acc, ...getLeafItemSchemas(schema.children)];
        }

        if (schema.item) {
            return [...acc, schema];
        }

        return acc;
    }, [] as IMenuSchema[]);
}
