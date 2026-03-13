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

import type { IDisplayMenuItem, IMenuButtonItem, IMenuItem, IMenuSelectorItem, IValueOption, MenuItemDefaultValueType } from '../../../services/menu/menu';
import type { IMenuSchema } from '../../../services/menu/menu-manager.service';
import type { IBaseMenuProps } from '../desktop/Menu';
import { LocaleService } from '@univerjs/core';
import { borderBottomClassName, clsx } from '@univerjs/design';
import { CheckMarkIcon, MoreIcon, MoreLeftIcon } from '@univerjs/icons';
import { useEffect, useMemo, useState } from 'react';
import { combineLatest, isObservable, of } from 'rxjs';
import { scan, startWith } from 'rxjs/operators';
import { MenuItemType } from '../../../services/menu/menu';
import { IMenuManagerService } from '../../../services/menu/menu-manager.service';
import { useDependency, useObservable } from '../../../utils/di';
import { CustomLabel } from '../../custom-label';

type MobileMenuView =
    | {
        kind: 'schema';
        title?: string;
        schemas: IMenuSchema[];
    }
    | {
        kind: 'options';
        title?: string;
        options: IValueOption[];
        menuItem: IDisplayMenuItem<IMenuSelectorItem<MenuItemDefaultValueType, any>>;
        menuKey: string;
        currentValue: MenuItemDefaultValueType;
    };

interface IMobileMenuProps extends IBaseMenuProps {
    schemas?: IMenuSchema[];
}

export function MobileMenu(props: IMobileMenuProps) {
    const { menuType, onOptionSelect, schemas: providedSchemas } = props;
    const menuManagerService = useDependency(IMenuManagerService);
    const [viewStack, setViewStack] = useState<MobileMenuView[]>([]);

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
    }, [menuType, providedSchemas]);

    const currentView = viewStack[viewStack.length - 1] ?? null;

    if (!menuType && !providedSchemas) {
        return null;
    }

    const openView = (view: MobileMenuView) => setViewStack((stack) => [...stack, view]);
    const closeView = () => setViewStack((stack) => stack.slice(0, -1));

    return (
        <div className="univer-flex univer-max-h-[min(72vh,560px)] univer-flex-col univer-overflow-hidden">
            {currentView && (
                <header
                    className="
                      univer-grid univer-grid-cols-[32px_minmax(0,1fr)_32px] univer-items-center univer-gap-3
                      univer-border-0 univer-border-b univer-border-solid univer-border-gray-200 univer-bg-white
                      univer-px-4 univer-py-3
                    "
                >
                    <button
                        type="button"
                        aria-label="Back"
                        className="
                          univer-flex univer-size-8 univer-appearance-none univer-items-center univer-justify-center
                          univer-rounded-full univer-border-0 univer-bg-transparent univer-p-0 univer-text-gray-700
                          hover:univer-bg-gray-100
                          active:univer-bg-gray-200
                        "
                        onClick={closeView}
                    >
                        <MoreLeftIcon className="univer-text-base" />
                    </button>
                    <div
                        className="
                          univer-min-w-0 univer-truncate univer-text-center univer-text-sm univer-font-semibold
                          univer-text-gray-900
                        "
                    >
                        {currentView.title}
                    </div>
                    <div className="univer-size-8" aria-hidden="true" />
                </header>
            )}

            <div className="univer-flex-1 univer-overflow-y-auto univer-px-4 univer-pb-2 univer-pt-1">
                {currentView?.kind !== 'options' && (
                    <div className="univer-overflow-hidden univer-rounded-2xl univer-bg-white">
                        <MobileSchemaList
                            schemas={currentView?.kind === 'schema' ? currentView.schemas : menuSchemas}
                            menuType={menuType}
                            onExecute={onOptionSelect}
                            onOpenView={openView}
                        />
                    </div>
                )}

                {currentView?.kind === 'options' && (
                    <div className="univer-overflow-hidden univer-rounded-2xl univer-bg-white">
                        <MobileSelectionOptionsView
                            menuKey={currentView.menuKey}
                            menuItem={currentView.menuItem}
                            options={currentView.options}
                            currentValue={currentView.currentValue}
                            onExecute={onOptionSelect}
                        />
                    </div>
                )}
            </div>
        </div>
    );
}

function MobileSchemaList(props: {
    schemas: IMenuSchema[];
    menuType?: string;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
}) {
    const { schemas, menuType, onExecute, onOpenView } = props;
    const localeService = useDependency(LocaleService);
    const hiddenGroupStates = useContextGroupHiddenStates(schemas);

    const visibleSchemas = useMemo(() => {
        return schemas.filter((schema) => {
            if (schema.children?.length) {
                return !hiddenGroupStates[schema.key];
            }

            return !!schema.item;
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
                            menuType={menuType}
                            onExecute={onExecute}
                            onOpenView={onOpenView}
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
                                "
                            >
                                {localeService.t(schema.title)}
                            </div>
                        )}
                        {schema.children.map((childSchema, childIndex) => (
                            <MobileSchemaRow
                                key={childSchema.key}
                                schema={childSchema}
                                menuType={menuType}
                                onExecute={onExecute}
                                onOpenView={onOpenView}
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
    menuType?: string;
    onExecute?: IBaseMenuProps['onOptionSelect'];
    onOpenView: (view: MobileMenuView) => void;
    bordered: boolean;
}) {
    const { schema, menuType, onExecute, onOpenView, bordered } = props;
    const interaction = useMobileSchemaInteraction({ schema, menuType, onOpenView });

    if (!interaction || interaction.hidden) {
        return null;
    }

    const { menuItem, disabled, value, currentValueText, hasSubmenu, onPress } = interaction;

    return (
        <button
            type="button"
            className={clsx(
                `
                  univer-flex univer-min-h-[56px] univer-w-full univer-appearance-none univer-items-center univer-gap-3
                  univer-border-0 univer-bg-white univer-px-4 univer-py-3 univer-text-left univer-transition-colors
                  enabled:hover:univer-bg-gray-50
                  enabled:active:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                `,
                bordered && borderBottomClassName
            )}
            disabled={disabled}
            onClick={() => onPress(onExecute)}
        >
            <div
                className="
                  univer-flex univer-min-w-0 univer-flex-1 univer-items-center univer-gap-3 univer-text-gray-900
                  [&>span]:univer-truncate [&>span]:univer-text-sm [&>span]:univer-font-medium
                  [&>svg]:univer-shrink-0 [&>svg]:univer-text-lg [&>svg]:univer-text-gray-700
                "
            >
                <CustomLabel value={value} title={menuItem.title} label={menuItem.label} icon={menuItem.icon} />
            </div>
            {currentValueText && (
                <span
                    className="
                      univer-max-w-[32%] univer-truncate univer-text-xs univer-font-medium univer-text-gray-400
                    "
                >
                    {currentValueText}
                </span>
            )}
            {hasSubmenu && <MoreIcon className="univer-shrink-0 univer-text-base univer-text-gray-400" />}
        </button>
    );
}

function MobileSelectionOptionsView(props: {
    options: IValueOption[];
    menuKey: string;
    menuItem: IDisplayMenuItem<IMenuSelectorItem<MenuItemDefaultValueType, any>>;
    currentValue: MenuItemDefaultValueType;
    onExecute?: IBaseMenuProps['onOptionSelect'];
}) {
    const { options, menuKey, menuItem, currentValue, onExecute } = props;

    return (
        <>
            {options.map((option, index) => (
                <MobileSelectionOptionRow
                    key={`${menuKey}-${String(option.value ?? index)}`}
                    option={option}
                    menuKey={menuKey}
                    menuItem={menuItem}
                    currentValue={currentValue}
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
    menuItem: IDisplayMenuItem<IMenuSelectorItem<MenuItemDefaultValueType, any>>;
    currentValue: MenuItemDefaultValueType;
    bordered: boolean;
    onExecute?: IBaseMenuProps['onOptionSelect'];
}) {
    const { option, menuKey, menuItem, currentValue, bordered, onExecute } = props;
    const optionValue = useObservable(option.value$);
    const displayValue = option.value ?? optionValue;
    const selected = displayValue === currentValue;

    return (
        <button
            type="button"
            className={clsx(
                `
                  univer-relative univer-flex univer-min-h-[56px] univer-w-full univer-appearance-none
                  univer-items-center univer-gap-3 univer-border-0 univer-bg-white univer-px-4 univer-py-3
                  univer-text-left univer-transition-colors
                  enabled:hover:univer-bg-gray-50
                  enabled:active:univer-bg-gray-100
                  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
                `,
                bordered && borderBottomClassName
            )}
            disabled={option.disabled}
            onClick={() => {
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
                  [&>span]:univer-truncate [&>span]:univer-text-sm [&>span]:univer-font-medium
                  [&>svg]:univer-shrink-0 [&>svg]:univer-text-lg [&>svg]:univer-text-gray-700
                "
            >
                <CustomLabel value$={option.value$} value={displayValue} label={option.label} icon={option.icon} />
            </div>
            {selected && <CheckMarkIcon className="univer-shrink-0 univer-text-base univer-text-primary-600" />}
        </button>
    );
}

function useMobileSchemaInteraction(props: {
    schema: IMenuSchema;
    menuType?: string;
    onOpenView: (view: MobileMenuView) => void;
}) {
    const { schema, menuType, onOpenView } = props;
    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);
    const menuItem = schema.item as IDisplayMenuItem<IMenuItem> | undefined;
    const selectorItem = menuItem as IDisplayMenuItem<IMenuSelectorItem<MenuItemDefaultValueType, any>> | undefined;
    const disabled = useObservable<boolean>(menuItem?.disabled$, false);
    const hidden = useObservable<boolean>(menuItem?.hidden$, false);
    const value = useObservable<MenuItemDefaultValueType>(menuItem?.value$);
    const selectionsFromObservable = useObservable(
        selectorItem && isObservable(selectorItem.selections) ? selectorItem.selections : undefined
    );

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

    const schemaChildren = schema.children ?? [];
    const hasSubmenu = schemaChildren.length > 0 || selections.length > 0 || subMenuItems.length > 0;
    const currentValueText = typeof value === 'string' || typeof value === 'number' ? String(value) : '';

    const onPress = (onExecute?: IBaseMenuProps['onOptionSelect']) => {
        if (schemaChildren.length > 0) {
            onOpenView({
                kind: 'schema',
                title: getMenuSchemaTitle(schema, localeService),
                schemas: schemaChildren,
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
            });
            return;
        }

        if (subMenuItems.length > 0) {
            onOpenView({
                kind: 'schema',
                title: getMenuSchemaTitle(schema, localeService),
                schemas: subMenuItems,
            });
            return;
        }

        if (menuItem.type !== MenuItemType.BUTTON && menuItem.type !== MenuItemType.BUTTON_SELECTOR) {
            return;
        }

        const buttonItem = menuItem as IDisplayMenuItem<IMenuButtonItem<MenuItemDefaultValueType>>;
        onExecute?.({
            commandId: buttonItem.commandId,
            value,
            id: buttonItem.id,
            label: schema.key,
            params: buttonItem.params,
        });
    };

    return {
        menuItem,
        disabled,
        hidden,
        value,
        currentValueText,
        hasSubmenu,
        onPress,
    };
}

function getMenuSchemaTitle(schema: IMenuSchema, localeService: LocaleService) {
    const menuItem = schema.item as IDisplayMenuItem<IMenuItem> | undefined;

    if (typeof menuItem?.title === 'string') {
        return localeService.t(menuItem.title);
    }

    if (typeof menuItem?.label === 'string') {
        return localeService.t(menuItem.label);
    }

    if (typeof schema.title === 'string') {
        return localeService.t(schema.title);
    }

    return schema.key;
}

function useContextGroupHiddenStates(menuSchemas: IMenuSchema[]) {
    const [hiddenStates, setHiddenStates] = useState<Record<string, boolean>>({});

    useEffect(() => {
        const subscriptions = menuSchemas.map((menuSchema) => {
            if (!menuSchema.children?.length) {
                return null;
            }

            const hiddenObservables = getLeafItemSchemas(menuSchema.children).map((childSchema) => childSchema.item?.hidden$ ?? of(false));
            if (!hiddenObservables.length) {
                return null;
            }

            return combineLatest(hiddenObservables).subscribe((hiddenValues) => {
                const isAllHidden = hiddenValues.every((hidden) => hidden === true);
                setHiddenStates((state) => ({
                    ...state,
                    [menuSchema.key]: isAllHidden,
                }));
            });
        });

        return () => {
            subscriptions.forEach((subscription) => subscription?.unsubscribe());
            setHiddenStates({});
        };
    }, [menuSchemas]);

    return hiddenStates;
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
