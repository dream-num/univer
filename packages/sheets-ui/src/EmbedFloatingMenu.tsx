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

import type { Workbook } from '@univerjs/core';
import type { IEmbedFloatingActivation, IEmbedFloatingMenuContribution, IEmbedFloatingMenuMountContext } from '@univerjs/embed-ui';
import type { IMenuItem, IMenuSchema, IValueOption } from '@univerjs/ui';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { Observable } from 'rxjs';
import {
    BorderStyleTypes,
    BorderType,
    HorizontalAlign,
    ICommandService,
    IUniverInstanceService,
    LocaleService,
    toDisposable,
    UniverInstanceType,
    VerticalAlign,
    WrapStrategy,
} from '@univerjs/core';
import { Button, clsx, ColorPicker, Dropdown, Tooltip } from '@univerjs/design';
import { createEmbedProductFloatingMenuContributions, createEmbedReactRoot, disposeEmbedReactRoot, EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE, EmbedFloatingActiveService, EmbedRuntimeProviders, resolveEmbedFloatingMenuStage as resolveCommonEmbedFloatingMenuStage, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
import {
    AlignBottomIcon,
    AlignTopIcon,
    AllBorderIcon,
    AutowrapIcon,
    BoldIcon,
    BrushIcon,
    FilterIcon,
    FontColorDoubleIcon,
    GridOutlineIcon,
    HorizontallyIcon,
    InnerBorderDoubleIcon,
    ItalicIcon,
    LeftJustifyingIcon,
    MergeAllIcon,
    MoreDownIcon,
    NoBorderIcon,
    NumberIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    RightJustifyingIcon,
    StrikethroughIcon,
    TruncationIcon,
    TypographyIcon,
    UnderlineIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
} from '@univerjs/icons';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
    SetBackgroundColorCommand,
    SetBorderBasicCommand,
    SetHorizontalTextAlignCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { FONT_SIZE_LIST, IMenuManagerService, MenuManagerPosition, ToolbarButton, useDependency, useObservable } from '@univerjs/ui';
import { createElement, forwardRef, useEffect, useMemo, useState } from 'react';
import {
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeItalicCommand,
    SetRangeStrickThroughCommand,
    SetRangeTextColorCommand,
    SetRangeUnderlineCommand,
} from './commands/commands/inline-format.command';
import { SetOnceFormatPainterCommand } from './commands/commands/set-format-painter.command';

const OPEN_NUMFMT_PANEL_MENU_ID = 'sheet.operation.open.numfmt.panel';
const SMART_TOGGLE_FILTER_MENU_ID = 'sheet.command.smart-toggle-filter';
type SheetFloatingMenuStage = 'inactive' | 'stage2';

export type SheetFloatingToolbarItem =
    | { id: string; type: 'button' | 'dropdown' }
    | { id: string; type: 'divider' };

export function createSheetsFloatingToolbarItems(): SheetFloatingToolbarItem[] {
    return [
        { id: 'formatPainter', type: 'button' },
        { id: 'numberFormat', type: 'dropdown' },
        { id: 'divider-format', type: 'divider' },
        { id: 'fontFamily', type: 'dropdown' },
        { id: 'fontSize', type: 'dropdown' },
        { id: 'fontComposite', type: 'dropdown' },
        { id: 'divider-font', type: 'divider' },
        { id: 'textColor', type: 'dropdown' },
        { id: 'backgroundColor', type: 'dropdown' },
        { id: 'borderComposite', type: 'dropdown' },
        { id: 'divider-border', type: 'divider' },
        { id: 'merge', type: 'dropdown' },
        { id: 'wrap', type: 'dropdown' },
        { id: 'divider-layout', type: 'divider' },
        { id: 'filter', type: 'button' },
    ];
}

export interface IResolvedSheetsFloatingToolbarMenuItems {
    formatPainter?: IMenuItem;
    numberFormat?: IMenuItem;
    fontFamily?: IMenuItem;
    fontSize?: IMenuItem;
    fontComposite?: {
        bold?: IMenuItem;
        italic?: IMenuItem;
        underline?: IMenuItem;
        strikethrough?: IMenuItem;
        horizontalAlign?: IMenuItem;
        verticalAlign?: IMenuItem;
    };
    textColor?: IMenuItem;
    backgroundColor?: IMenuItem;
    borderComposite?: IMenuItem;
    merge?: {
        root?: IMenuItem;
        all?: IMenuItem;
        vertical?: IMenuItem;
        horizontal?: IMenuItem;
        unmerge?: IMenuItem;
    };
    wrap?: IMenuItem;
    filter?: IMenuItem;
}

const SHEET_FLOATING_MENU_TARGETS = {
    formatPainter: SetOnceFormatPainterCommand.id,
    numberFormat: OPEN_NUMFMT_PANEL_MENU_ID,
    fontFamily: SetRangeFontFamilyCommand.id,
    fontSize: SetRangeFontSizeCommand.id,
    textColor: SetRangeTextColorCommand.id,
    backgroundColor: SetBackgroundColorCommand.id,
    borderComposite: SetBorderBasicCommand.id,
    wrap: SetTextWrapCommand.id,
    filter: SMART_TOGGLE_FILTER_MENU_ID,
};

const SHEET_FLOATING_FONT_COMPOSITE_TARGETS = {
    bold: SetRangeBoldCommand.id,
    italic: SetRangeItalicCommand.id,
    underline: SetRangeUnderlineCommand.id,
    strikethrough: SetRangeStrickThroughCommand.id,
    horizontalAlign: SetHorizontalTextAlignCommand.id,
    verticalAlign: SetVerticalTextAlignCommand.id,
};

const SHEET_FLOATING_MERGE_TARGETS = {
    root: AddWorksheetMergeCommand.id,
    all: AddWorksheetMergeAllCommand.id,
    vertical: AddWorksheetMergeVerticalCommand.id,
    horizontal: AddWorksheetMergeHorizontalCommand.id,
    unmerge: RemoveWorksheetMergeCommand.id,
};

export function resolveSheetsFloatingToolbarMenuItems(menuSchemas: IMenuSchema[]): IResolvedSheetsFloatingToolbarMenuItems {
    const resolved: IResolvedSheetsFloatingToolbarMenuItems = {};
    const findMenuItem = (targetId: string): IMenuItem | undefined => {
        const schema = menuSchemas.find((item) => {
            const menuItem = item.item;
            return item.key === targetId || menuItem?.id === targetId || menuItem?.commandId === targetId;
        });

        return schema?.item;
    };

    Object.entries(SHEET_FLOATING_MENU_TARGETS).forEach(([key, targetId]) => {
        resolved[key as keyof IResolvedSheetsFloatingToolbarMenuItems] = findMenuItem(targetId);
    });
    const fontComposite = Object.entries(SHEET_FLOATING_FONT_COMPOSITE_TARGETS).reduce<NonNullable<IResolvedSheetsFloatingToolbarMenuItems['fontComposite']>>((result, [key, targetId]) => {
        const item = findMenuItem(targetId);
        if (item) {
            result[key as keyof NonNullable<IResolvedSheetsFloatingToolbarMenuItems['fontComposite']>] = item;
        }

        return result;
    }, {});
    if (hasResolvedMenuItem(fontComposite)) {
        resolved.fontComposite = fontComposite;
    }
    const merge = Object.entries(SHEET_FLOATING_MERGE_TARGETS).reduce<NonNullable<IResolvedSheetsFloatingToolbarMenuItems['merge']>>((result, [key, targetId]) => {
        const item = findMenuItem(targetId);
        if (item) {
            result[key as keyof NonNullable<IResolvedSheetsFloatingToolbarMenuItems['merge']>] = item;
        }

        return result;
    }, {});
    if (hasResolvedMenuItem(merge)) {
        resolved.merge = merge;
    }

    return resolved;
}

const SHEET_FLOATING_TOOLBAR_GROUPS: Array<{ dividerBefore?: string; items: Array<Exclude<keyof IResolvedSheetsFloatingToolbarMenuItems, 'fontComposite'> | 'fontComposite'> }> = [
    { items: ['formatPainter', 'numberFormat'] },
    { dividerBefore: 'divider-format', items: ['fontFamily', 'fontSize', 'fontComposite'] },
    { dividerBefore: 'divider-font', items: ['textColor', 'backgroundColor', 'borderComposite'] },
    { dividerBefore: 'divider-border', items: ['merge', 'wrap'] },
    { dividerBefore: 'divider-layout', items: ['filter'] },
];

export function createVisibleSheetsFloatingToolbarItems(resolved: IResolvedSheetsFloatingToolbarMenuItems): SheetFloatingToolbarItem[] {
    const items: SheetFloatingToolbarItem[] = [];
    SHEET_FLOATING_TOOLBAR_GROUPS.forEach((group) => {
        const groupItems = group.items
            .filter((id) => hasToolbarCapability(resolved, id))
            .map<SheetFloatingToolbarItem>((id) => ({
                id,
                type: id === 'formatPainter' || id === 'filter' ? 'button' : 'dropdown',
            }));
        if (!groupItems.length) {
            return;
        }

        if (items.length && group.dividerBefore) {
            items.push({ id: group.dividerBefore, type: 'divider' });
        }
        items.push(...groupItems);
    });

    return items;
}

function hasToolbarCapability(resolved: IResolvedSheetsFloatingToolbarMenuItems, id: string): boolean {
    if (id === 'fontComposite') {
        return Boolean(resolved.fontComposite && hasResolvedMenuItem(resolved.fontComposite));
    }

    return Boolean(resolved[id as keyof IResolvedSheetsFloatingToolbarMenuItems]);
}

function hasResolvedMenuItem(items: Record<string, IMenuItem | undefined>): boolean {
    return Object.values(items).some(Boolean);
}

export function getStaticMenuSelections(item: IMenuItem | undefined): IValueOption[] {
    if (!item || !('selections' in item) || !Array.isArray(item.selections)) {
        return [];
    }

    return item.selections;
}

export function resolveMenuCommandRequest(item: IMenuItem | undefined, params?: object): { commandId: string; params?: object } | undefined {
    if (!item) {
        return undefined;
    }

    return {
        commandId: item.commandId ?? item.id,
        params: params ?? (typeof item.params === 'function' ? item.params() : item.params),
    };
}

export function createSheetsFloatingMenuContributions(): IEmbedFloatingMenuContribution[] {
    return createEmbedProductFloatingMenuContributions({
        childType: UniverInstanceType.UNIVER_SHEET,
        mount: mountSheetsFloatingMenu,
    });
}

function mountSheetsFloatingMenu(context: IEmbedFloatingMenuMountContext) {
    const root = resolveEmbedFloatingMenuRoot(context);
    const menu = document.createElement('div');
    menu.setAttribute('data-embed-floating-menu-entry', context.descriptor.entry);
    root.appendChild(menu);

    const reactRoot = createEmbedReactRoot(menu);
    reactRoot.render(createElement(
        EmbedRuntimeProviders,
        { injector: context.runtimeScope.injector, mountContainer: root, embedId: context.embedId },
        createElement(SheetEmbedFloatingMenu, {
            hostUnitId: context.hostUnitId,
            embedId: context.embedId,
            childUnitId: context.childUnitId,
            entry: context.descriptor.entry,
            fullscreen: Boolean(context.renderScope.fullscreen),
            usesDomFloatingStage: context.descriptor.entry !== 'slides-floating-object',
            renderScopeActive$: context.renderScope.active$,
        })
    ));

    return toDisposable(() => {
        disposeEmbedReactRoot(reactRoot);
        globalThis.setTimeout(() => menu.remove(), 0);
    });
}

interface ISheetEmbedFloatingMenuProps {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    entry: string;
    fullscreen: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive$: Observable<boolean>;
}

export function resolveSheetsFloatingMenuStage(params: {
    embedId: string;
    active: IEmbedFloatingActivation | null;
    fullscreen?: boolean;
    usesDomFloatingStage: boolean;
    renderScopeActive: boolean;
}): SheetFloatingMenuStage {
    return resolveCommonEmbedFloatingMenuStage(params);
}

const FONT_FAMILY_OPTIONS = [
    { label: 'Default', value: 'Default' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Microsoft YaHei', value: 'Microsoft YaHei' },
];

export function resolveSheetsFloatingMenuClassName(params: {
    entry: string;
    fullscreen: boolean;
    stage: SheetFloatingMenuStage;
}): string {
    const { entry, fullscreen, stage } = params;

    return clsx(`
      univer-sheet-embed-floating-menu univer-pointer-events-auto univer-box-border univer-inline-flex univer-h-10
      univer-items-center univer-gap-0 univer-rounded-lg univer-border univer-border-solid univer-border-gray-200
      univer-bg-white univer-px-2 univer-text-sm univer-text-gray-900 univer-shadow-lg
      dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-white
      [&_svg]:univer-size-4 [&_svg]:univer-shrink-0
    `, {
        'univer-hidden': stage !== 'stage2',
        'univer-static univer-mx-auto univer-my-1.5 univer-translate-x-0': fullscreen,
        'univer-absolute univer-left-1/2 univer-z-[30] univer-max-w-[min(calc(100vw-72px),880px)] -univer-translate-x-1/2 univer-overflow-x-auto univer-overflow-y-visible [scrollbar-width:none] [&::-webkit-scrollbar]:univer-hidden': !fullscreen,
        'univer-top-[var(--univer-embed-floating-menu-top,-36px)]': !fullscreen && entry !== 'docs-custom-block',
        'univer-top-[calc(var(--univer-embed-docs-block-floating-menu-inset-top,52px)*-1)]': !fullscreen && entry === 'docs-custom-block',
    });
}

function SheetEmbedFloatingMenu(props: ISheetEmbedFloatingMenuProps) {
    const { hostUnitId, embedId, childUnitId, entry, fullscreen, usesDomFloatingStage, renderScopeActive$ } = props;
    const commandService = useDependency(ICommandService);
    const instanceService = useDependency(IUniverInstanceService);
    const menuManagerService = useDependency(IMenuManagerService);
    const localeService = useDependency(LocaleService);
    const selectionService = useDependency(SheetsSelectionsService);
    const floatingActiveService = useDependency(EmbedFloatingActiveService);
    const active = useObservable(() => floatingActiveService.active$, floatingActiveService.getActive(), false, [floatingActiveService]);
    const renderScopeActive = useObservable(() => renderScopeActive$, false, false, [renderScopeActive$]);
    const stage = resolveSheetsFloatingMenuStage({
        embedId,
        active,
        fullscreen,
        usesDomFloatingStage,
        renderScopeActive,
    });
    const isStage2 = stage === 'stage2';
    const [menuVersion, setMenuVersion] = useState(0);
    useEffect(() => {
        const subscription = menuManagerService.menuChanged$.subscribe(() => {
            setMenuVersion((version) => version + 1);
        });

        return () => subscription.unsubscribe();
    }, [menuManagerService]);
    const resolvedMenuItems = useMemo(() => {
        void menuVersion;
        return resolveSheetsFloatingToolbarMenuItems(menuManagerService.getFlatMenuByPositionKey(MenuManagerPosition.RIBBON));
    }, [menuManagerService, menuVersion]);
    const visibleToolbarItemIds = useMemo(() => {
        return new Set(createVisibleSheetsFloatingToolbarItems(resolvedMenuItems).map((item) => item.id));
    }, [resolvedMenuItems]);

    const activateChild = () => {
        floatingActiveService.activate({ hostUnitId, embedId, childUnitId }, 'stage2');
        instanceService.setCurrentUnitForType(childUnitId);
    };
    const execute = (commandId: string, params?: object) => {
        activateChild();
        void commandService.executeCommand(commandId, params);
    };
    const executeMenuItem = (item: IMenuItem | undefined, params?: object) => {
        const request = resolveMenuCommandRequest(item, params);
        if (!request) {
            return;
        }

        execute(request.commandId, request.params);
    };
    const getSheetTarget = () => {
        const workbook = instanceService.getUnit<Workbook>(childUnitId, UniverInstanceType.UNIVER_SHEET);
        const worksheet = workbook?.getActiveSheet();
        if (!workbook || !worksheet) {
            return null;
        }

        return { workbook, worksheet, unitId: workbook.getUnitId(), subUnitId: worksheet.getSheetId() };
    };
    const getSelectionRanges = () => {
        return selectionService.getCurrentSelections()?.map((selection) => selection.range) ?? [];
    };
    const setBorder = (item: IMenuItem | undefined, type: BorderType, style = BorderStyleTypes.THIN) => {
        const target = getSheetTarget();
        const ranges = getSelectionRanges();
        if (!target || !ranges.length) {
            return;
        }

        executeMenuItem(item, {
            unitId: target.unitId,
            subUnitId: target.subUnitId,
            ranges,
            value: {
                type,
                color: '#000000',
                style,
                activeBorderType: true,
            },
        });
    };

    return (
        <div
            className={resolveSheetsFloatingMenuClassName({ entry, fullscreen, stage: isStage2 ? 'stage2' : 'inactive' })}
            data-embed-floating-menu="true"
            data-embed-id={embedId}
            data-embed-float-stage={isStage2 ? 'stage2' : 'inactive'}
            onPointerDown={(event) => event.stopPropagation()}
            onMouseDown={keepFloatingPanelInteraction}
        >
            {visibleToolbarItemIds.has('formatPainter') && (
                <MenuButtonFromMenu item={resolvedMenuItems.formatPainter} fallbackTitle={localeService.t('sheets-ui.toolbar.formatPainter')} onClick={() => executeMenuItem(resolvedMenuItems.formatPainter)}>
                    <BrushIcon />
                </MenuButtonFromMenu>
            )}
            {visibleToolbarItemIds.has('numberFormat') && (
                <NumberFormatDropdown menuItem={resolvedMenuItems.numberFormat} onClick={() => executeMenuItem(resolvedMenuItems.numberFormat)} />
            )}
            {visibleToolbarItemIds.has('divider-format') && <Divider />}
            {visibleToolbarItemIds.has('fontFamily') && (
                <TextDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.fontFamily}
                    title={localeService.t('sheets-ui.toolbar.font')}
                    icon={<TypographyIcon />}
                    label="Default"
                    options={FONT_FAMILY_OPTIONS}
                    onSelect={(value) => executeMenuItem(resolvedMenuItems.fontFamily, { value })}
                />
            )}
            {visibleToolbarItemIds.has('fontSize') && (
                <TextDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.fontSize}
                    title={localeService.t('sheets-ui.toolbar.fontSize')}
                    icon={<span className="univer-text-[13px] univer-font-semibold">T</span>}
                    label="10"
                    options={FONT_SIZE_LIST.map((item) => ({ label: String(item.label ?? item.value), value: String(item.value) }))}
                    onSelect={(value) => executeMenuItem(resolvedMenuItems.fontSize, { value: Number(value) })}
                />
            )}
            {visibleToolbarItemIds.has('fontComposite') && <FontCompositeDropdown embedId={embedId} menuItems={resolvedMenuItems.fontComposite} execute={executeMenuItem} />}
            {visibleToolbarItemIds.has('divider-font') && <Divider />}
            {visibleToolbarItemIds.has('textColor') && (
                <ColorDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.textColor}
                    title={localeService.t('sheets-ui.toolbar.textColor.main')}
                    icon={<FontColorDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#111827"
                    onChange={(value) => executeMenuItem(resolvedMenuItems.textColor, { value })}
                />
            )}
            {visibleToolbarItemIds.has('backgroundColor') && (
                <ColorDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.backgroundColor}
                    title={localeService.t('sheets-ui.toolbar.fillColor.main')}
                    icon={<PaintBucketDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#ffffff"
                    onChange={(value) => executeMenuItem(resolvedMenuItems.backgroundColor, { value })}
                />
            )}
            {visibleToolbarItemIds.has('borderComposite') && <BorderCompositeDropdown embedId={embedId} menuItem={resolvedMenuItems.borderComposite} onSelect={(type, style) => setBorder(resolvedMenuItems.borderComposite, type, style)} />}
            {visibleToolbarItemIds.has('divider-border') && <Divider />}
            {visibleToolbarItemIds.has('merge') && <MergeDropdown embedId={embedId} menuItems={resolvedMenuItems.merge} execute={executeMenuItem} />}
            {visibleToolbarItemIds.has('wrap') && <WrapDropdown embedId={embedId} menuItem={resolvedMenuItems.wrap} execute={execute} />}
            {visibleToolbarItemIds.has('divider-layout') && <Divider />}
            {visibleToolbarItemIds.has('filter') && (
                <MenuButtonFromMenu item={resolvedMenuItems.filter} fallbackTitle="Filter" onClick={() => executeMenuItem(resolvedMenuItems.filter)}>
                    <FilterIcon />
                </MenuButtonFromMenu>
            )}
        </div>
    );
}

const SHEET_FLOATING_TOOLBAR_SELECTOR_CLASS = 'univer-gap-1 univer-px-1.5 univer-text-sm';
const SHEET_FLOATING_TOOLBAR_PANEL_BUTTON_CLASS = 'univer-size-7';
const SHEET_FLOATING_TOOLBAR_ICON_BUTTON_CLASS = 'univer-text-sm';
const SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS = 'univer-size-4';
const EMBED_FLOATING_MENU_POPUP_ATTRIBUTE = 'data-embed-floating-menu-popup';

const FloatingToolbarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    title: string;
}>(({ children, onClick, onMouseDown, onPointerDown, ...restProps }, ref) => (
    <Button
        ref={ref}
        type="button"
        size="small"
        variant="ghost"
        className={SHEET_FLOATING_TOOLBAR_SELECTOR_CLASS}
        aria-label={restProps.title}
        onPointerDown={(event) => {
            event.stopPropagation();
            onPointerDown?.(event);
        }}
        onMouseDown={(event) => {
            event.stopPropagation();
            onMouseDown?.(event);
        }}
        onClick={(event) => {
            onClick?.(event);
            event.stopPropagation();
        }}
        {...restProps}
    >
        {children}
    </Button>
));
FloatingToolbarTrigger.displayName = 'FloatingToolbarTrigger';

function MenuButton(props: {
    children: ReactNode;
    title: string;
    disabled?: boolean;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <Tooltip title={props.title} placement="bottom">
            <ToolbarButton
                className={SHEET_FLOATING_TOOLBAR_ICON_BUTTON_CLASS}
                title={props.title}
                aria-label={props.title}
                disabled={props.disabled}
                active={props.active}
                onClick={props.onClick}
            >
                {props.children}
            </ToolbarButton>
        </Tooltip>
    );
}

function MenuButtonFromMenu(props: {
    item: IMenuItem | undefined;
    children: ReactNode;
    fallbackTitle: string;
    onClick: () => void;
}) {
    const { hidden, disabled, activated } = useMenuItemRuntimeState(props.item);
    const localeService = useDependency(LocaleService);
    if (!props.item || hidden) {
        return null;
    }

    const title = getLocalizedMenuTitle(props.item, localeService, props.fallbackTitle);

    return (
        <MenuButton
            title={title}
            disabled={disabled}
            active={activated}
            onClick={props.onClick}
        >
            {props.children}
        </MenuButton>
    );
}

function useMenuItemRuntimeState(item: IMenuItem | undefined): {
    hidden: boolean;
    disabled: boolean;
    activated: boolean;
    value: unknown;
} {
    const [hidden, setHidden] = useState(false);
    const [disabled, setDisabled] = useState(false);
    const [activated, setActivated] = useState(false);
    const [value, setValue] = useState<unknown>(undefined);

    useEffect(() => {
        // eslint-disable-next-line react/set-state-in-effect
        setHidden(false);
        // eslint-disable-next-line react/set-state-in-effect
        setDisabled(false);
        // eslint-disable-next-line react/set-state-in-effect
        setActivated(false);
        // eslint-disable-next-line react/set-state-in-effect
        setValue(undefined);

        if (!item) {
            return undefined;
        }

        const subscriptions = [
            item.hidden$?.subscribe(setHidden),
            item.disabled$?.subscribe(setDisabled),
            item.activated$?.subscribe(setActivated),
            item.value$?.subscribe(setValue),
        ].filter((subscription): subscription is NonNullable<typeof subscription> => Boolean(subscription));

        return () => {
            subscriptions.forEach((subscription) => subscription.unsubscribe());
        };
    }, [item]);

    return { hidden, disabled, activated, value };
}

function NumberFormatDropdown(props: {
    menuItem: IMenuItem | undefined;
    onClick: () => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    const localeService = useDependency(LocaleService);
    if (!props.menuItem || hidden) {
        return null;
    }

    const title = getLocalizedMenuTitle(props.menuItem, localeService, 'sheets-numfmt-ui.title');
    const label = typeof value === 'string' && value ? value : localeService.t('sheets-numfmt-ui.general');

    return (
        <Tooltip
            title={title}
            placement="bottom"
        >
            <FloatingToolbarTrigger title={title} disabled={disabled} onClick={props.onClick}>
                <NumberIcon />
                <span>{label}</span>
                <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
            </FloatingToolbarTrigger>
        </Tooltip>
    );
}

function TextDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    title: string;
    icon: ReactNode;
    label: string;
    options: Array<{ label: string; value: string }>;
    onSelect: (value: string) => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    const [open, setOpen] = useState(false);
    if (!props.menuItem || hidden) {
        return null;
    }

    const label = typeof value === 'string' || typeof value === 'number' ? String(value) : props.label;

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={props.title}
            open={open}
            onOpenChange={setOpen}
            trigger={(
                <>
                    {props.icon}
                    <span className="univer-max-w-20 univer-truncate">{label}</span>
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <MenuPanel>
                    {props.options.map((item) => (
                        <MenuPanelItem
                            key={item.value}
                            active={item.value === label}
                            onClick={() => {
                                props.onSelect(item.value);
                                setOpen(false);
                            }}
                        >
                            <span className="univer-truncate">{item.label}</span>
                        </MenuPanelItem>
                    ))}
                </MenuPanel>
            )}
        />
    );
}

function FontCompositeDropdown(props: {
    embedId: string;
    menuItems: IResolvedSheetsFloatingToolbarMenuItems['fontComposite'];
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    if (!props.menuItems) {
        return null;
    }

    return (
        <Dropdown
            align="start"
            sideOffset={6}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <Panel embedId={props.embedId} onPointerDown={(event) => event.stopPropagation()}>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.bold} title={localeService.t('sheets-ui.toolbar.bold')} onClick={() => props.execute(props.menuItems?.bold)}><BoldIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.italic} title={localeService.t('sheets-ui.toolbar.italic')} onClick={() => props.execute(props.menuItems?.italic)}><ItalicIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.underline} title={localeService.t('sheets-ui.toolbar.underline')} onClick={() => props.execute(props.menuItems?.underline)}><UnderlineIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.strikethrough} title={localeService.t('sheets-ui.toolbar.strikethrough')} onClick={() => props.execute(props.menuItems?.strikethrough)}><StrikethroughIcon /></PanelButtonFromMenu>
                    </PanelRow>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title={localeService.t('sheets-ui.align.left')} onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.LEFT })}><LeftJustifyingIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title={localeService.t('sheets-ui.align.center')} onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.CENTER })}><HorizontallyIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title={localeService.t('sheets-ui.align.right')} onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.RIGHT })}><RightJustifyingIcon /></PanelButtonFromMenu>
                    </PanelRow>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title={localeService.t('sheets-ui.align.top')} onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.TOP })}><AlignTopIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title={localeService.t('sheets-ui.align.middle')} onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.MIDDLE })}><VerticalCenterIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title={localeService.t('sheets-ui.align.bottom')} onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.BOTTOM })}><AlignBottomIcon /></PanelButtonFromMenu>
                    </PanelRow>
                </Panel>
            )}
        >
            <FloatingToolbarTrigger title={localeService.t('sheets-ui.toolbar.font')}>
                <BoldIcon />
                <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
            </FloatingToolbarTrigger>
        </Dropdown>
    );
}

function PanelButtonFromMenu(props: { item: IMenuItem | undefined; title: string; children: ReactNode; onClick: () => void }) {
    const { hidden, disabled, activated } = useMenuItemRuntimeState(props.item);
    if (!props.item || hidden) {
        return null;
    }

    return (
        <PanelButton title={props.title} disabled={disabled} active={activated} onClick={props.onClick}>
            {props.children}
        </PanelButton>
    );
}

function ColorDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    title: string;
    icon: ReactNode;
    defaultColor: string;
    onChange: (value: string) => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    const [color, setColor] = useState(props.defaultColor);
    if (!props.menuItem || hidden) {
        return null;
    }

    const displayColor = typeof value === 'string' && value ? value : color;

    return (
        <Dropdown
            disabled={disabled}
            align="start"
            sideOffset={6}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <div
                    data-embed-id={props.embedId}
                    {...{ [EMBED_FLOATING_MENU_POPUP_ATTRIBUTE]: 'true' }}
                    className="
                      univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-4 univer-shadow-lg
                      dark:!univer-bg-gray-900
                    "
                    onPointerDown={keepFloatingPanelInteraction}
                >
                    <ColorPicker
                        value={displayColor}
                        onChange={(value) => {
                            setColor(value);
                            props.onChange(value);
                        }}
                    />
                </div>
            )}
        >
            <FloatingToolbarTrigger title={props.title} disabled={disabled}>
                {props.icon}
            </FloatingToolbarTrigger>
        </Dropdown>
    );
}

function BorderCompositeDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    onSelect: (type: BorderType, style?: BorderStyleTypes) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    const [borderType, setBorderType] = useState(BorderType.ALL);
    const [borderStyle, setBorderStyle] = useState(BorderStyleTypes.THIN);
    if (!props.menuItem || hidden) {
        return null;
    }

    const borderTypes = [
        { title: localeService.t('sheets-ui.borderLine.borderAll'), type: BorderType.ALL, icon: <AllBorderIcon /> },
        { title: localeService.t('sheets-ui.borderLine.borderOutside'), type: BorderType.OUTSIDE, icon: <OuterBorderDoubleIcon /> },
        { title: localeService.t('sheets-ui.borderLine.borderInside'), type: BorderType.INSIDE, icon: <InnerBorderDoubleIcon /> },
        { title: localeService.t('sheets-ui.borderLine.borderVertical'), type: BorderType.VERTICAL, icon: <VerticalBorderDoubleIcon /> },
        { title: localeService.t('sheets-ui.borderLine.borderNone'), type: BorderType.NONE, icon: <NoBorderIcon /> },
    ];
    const borderStyles = [
        { title: 'Solid', style: BorderStyleTypes.THIN },
        { title: 'Dotted', style: BorderStyleTypes.DOTTED },
        { title: 'Dashed', style: BorderStyleTypes.DASHED },
    ];
    const borderWidths = [
        { title: 'Thin', style: BorderStyleTypes.THIN },
        { title: 'Medium', style: BorderStyleTypes.MEDIUM },
        { title: 'Thick', style: BorderStyleTypes.THICK },
    ];
    const applyBorder = (nextType = borderType, nextStyle = borderStyle) => {
        setBorderType(nextType);
        setBorderStyle(nextStyle);
        props.onSelect(nextType, nextStyle);
    };

    return (
        <Dropdown
            disabled={disabled}
            align="start"
            sideOffset={6}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <Panel embedId={props.embedId} onPointerDown={(event) => event.stopPropagation()}>
                    <PanelRow>
                        {borderTypes.map((item) => (
                            <PanelButton key={item.type} title={item.title} active={borderType === item.type} onClick={() => applyBorder(item.type)}>
                                {item.icon}
                            </PanelButton>
                        ))}
                    </PanelRow>
                    <PanelRow>
                        {borderStyles.map((item) => (
                            <PanelButton key={item.style} title={item.title} active={borderStyle === item.style} onClick={() => applyBorder(borderType, item.style)}>
                                <LinePreview style={item.style} />
                            </PanelButton>
                        ))}
                    </PanelRow>
                    <PanelRow>
                        {borderWidths.map((item) => (
                            <PanelButton key={item.style} title={item.title} active={borderStyle === item.style} onClick={() => applyBorder(borderType, item.style)}>
                                <LinePreview style={item.style} />
                            </PanelButton>
                        ))}
                    </PanelRow>
                </Panel>
            )}
        >
            <FloatingToolbarTrigger title={getLocalizedMenuTitle(props.menuItem, localeService, 'sheets-ui.toolbar.border.main')}>
                <GridOutlineIcon />
                <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
            </FloatingToolbarTrigger>
        </Dropdown>
    );
}

function MergeDropdown(props: {
    embedId: string;
    menuItems: IResolvedSheetsFloatingToolbarMenuItems['merge'];
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItems?.root);
    const [open, setOpen] = useState(false);
    const entries: Array<{ item: IMenuItem; icon: ReactNode }> = [];
    [
        { item: props.menuItems?.all, icon: <MergeAllIcon /> },
        { item: props.menuItems?.vertical, icon: <VerticalBorderDoubleIcon /> },
        { item: props.menuItems?.horizontal, icon: <InnerBorderDoubleIcon /> },
        { item: props.menuItems?.unmerge, icon: <NoBorderIcon /> },
    ].forEach(({ item, icon }) => {
        if (item) {
            entries.push({ item, icon });
        }
    });
    if (!props.menuItems?.root || hidden || !entries.length) {
        return null;
    }

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={getLocalizedMenuTitle(props.menuItems.root, localeService, 'sheets-ui.toolbar.mergeCell.main')}
            open={open}
            onOpenChange={setOpen}
            trigger={(
                <>
                    <MergeAllIcon />
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <MenuPanel>
                    {entries.map(({ item, icon }) => (
                        <MenuPanelItem
                            key={item.id}
                            icon={icon}
                            onClick={() => {
                                props.execute(item);
                                setOpen(false);
                            }}
                        >
                            {localeService.t(getMenuTitle(item))}
                        </MenuPanelItem>
                    ))}
                </MenuPanel>
            )}
        />
    );
}

function WrapDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    execute: (commandId: string, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    const [open, setOpen] = useState(false);
    if (!props.menuItem || hidden) {
        return null;
    }
    const selections = getStaticMenuSelections(props.menuItem);
    const entries = selections.length
        ? selections.map((selection) => ({
            label: localeService.t(getOptionLabel(selection)),
            icon: getWrapIcon(selection.value),
            commandId: selection.commandId ?? props.menuItem?.commandId ?? props.menuItem?.id ?? SetTextWrapCommand.id,
            params: selection.params ?? { value: selection.value },
        }))
        : [
            { label: localeService.t('sheets-ui.textWrap.clip'), icon: <TruncationIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.CLIP } },
            { label: localeService.t('sheets-ui.textWrap.overflow'), icon: <OverflowIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.OVERFLOW } },
            { label: localeService.t('sheets-ui.textWrap.wrap'), icon: <AutowrapIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.WRAP } },
        ];

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={getLocalizedMenuTitle(props.menuItem, localeService, 'sheets-ui.toolbar.textWrapMode.main')}
            open={open}
            onOpenChange={setOpen}
            trigger={(
                <>
                    <AutowrapIcon />
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <MenuPanel>
                    {entries.map((entry) => (
                        <MenuPanelItem
                            key={`${entry.commandId}-${String((entry.params as { value?: unknown } | undefined)?.value ?? entry.label)}`}
                            icon={entry.icon}
                            onClick={() => {
                                props.execute(entry.commandId, entry.params);
                                setOpen(false);
                            }}
                        >
                            {entry.label}
                        </MenuPanelItem>
                    ))}
                </MenuPanel>
            )}
        />
    );
}

function getLocalizedMenuTitle(item: IMenuItem | undefined, localeService: LocaleService, fallback: string): string {
    const title = item?.tooltip ?? item?.title ?? fallback;
    return localeService.t(title);
}

function getMenuTitle(item: IMenuItem): string {
    return item.tooltip ?? item.title ?? item.id;
}

function getOptionLabel(option: IValueOption): string {
    if (typeof option.label === 'string') {
        return option.label;
    }

    return typeof option.value === 'string' || typeof option.value === 'number' ? String(option.value) : option.id ?? '';
}

function getWrapIcon(value: IValueOption['value']): ReactNode {
    if (value === WrapStrategy.CLIP) {
        return <TruncationIcon />;
    }
    if (value === WrapStrategy.WRAP) {
        return <AutowrapIcon />;
    }

    return <OverflowIcon />;
}

function shouldKeepMouseDownDefault(target: EventTarget | null): boolean {
    return target instanceof HTMLElement && Boolean(target.closest('button, input, textarea, [contenteditable="true"], [role="button"], [role="combobox"], [data-u-comp="select"], .univer-select'));
}

function keepFloatingPanelInteraction(event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>): void {
    event.stopPropagation();
    if (!shouldKeepMouseDownDefault(event.target)) {
        event.preventDefault();
    }
}

function keepFloatingDropdownOpenForOwnSurface(event: { target: EventTarget | null; preventDefault: () => void }, embedId: string): void {
    const target = event.target;
    if (!(target instanceof HTMLElement)) {
        return;
    }

    const surface = target.closest('[data-embed-floating-menu="true"], [data-embed-floating-menu-popup="true"]');
    if (surface?.getAttribute('data-embed-id') === embedId) {
        event.preventDefault();
        return;
    }

    if (target.closest(`[${EMBED_INTERACTION_BOUNDARY_OWNER_ATTRIBUTE}="${embedId}"]`)) {
        event.preventDefault();
    }
}

function Panel(props: { embedId: string; children: ReactNode; onPointerDown: (event: React.PointerEvent<HTMLElement>) => void }) {
    return (
        <section
            data-embed-id={props.embedId}
            {...{ [EMBED_FLOATING_MENU_POPUP_ATTRIBUTE]: 'true' }}
            className="
              univer-box-border univer-grid univer-gap-1 univer-rounded-lg univer-border univer-border-solid
              univer-border-gray-200 univer-bg-white univer-p-2 univer-shadow-lg
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            "
            onPointerDown={props.onPointerDown}
            onMouseDown={keepFloatingPanelInteraction}
        >
            {props.children}
        </section>
    );
}

function PanelRow(props: { children: ReactNode }) {
    return <div className="univer-flex univer-items-center univer-gap-1">{props.children}</div>;
}

function InlineFloatingDropdown(props: {
    embedId: string;
    title: string;
    trigger: ReactNode;
    overlay: ReactNode;
    disabled?: boolean;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}) {
    const { open, onOpenChange } = props;

    return (
        <Dropdown
            disabled={props.disabled}
            align="start"
            sideOffset={6}
            open={open}
            onOpenChange={onOpenChange}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <div
                    data-embed-id={props.embedId}
                    {...{ [EMBED_FLOATING_MENU_POPUP_ATTRIBUTE]: 'true' }}
                    onPointerDown={keepFloatingPanelInteraction}
                    onMouseDown={keepFloatingPanelInteraction}
                >
                    {props.overlay}
                </div>
            )}
        >
            <FloatingToolbarTrigger
                title={props.title}
                aria-haspopup="dialog"
                aria-expanded={open}
                data-state={open ? 'open' : 'closed'}
                disabled={props.disabled}
            >
                {props.trigger}
            </FloatingToolbarTrigger>
        </Dropdown>
    );
}

function MenuPanel(props: { children: ReactNode }) {
    return (
        <section
            className="
              univer-box-border univer-grid univer-min-w-32 univer-gap-0.5 univer-rounded-lg univer-border
              univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1 univer-shadow-lg
              dark:!univer-border-gray-700 dark:!univer-bg-gray-900
            "
            onPointerDown={keepFloatingPanelInteraction}
            onMouseDown={keepFloatingPanelInteraction}
        >
            {props.children}
        </section>
    );
}

function MenuPanelItem(props: { children: ReactNode; icon?: ReactNode; active?: boolean; onClick: () => void }) {
    return (
        <button
            type="button"
            className={clsx(`
              univer-box-border univer-flex univer-h-7 univer-w-full univer-items-center univer-gap-2 univer-rounded
              univer-border-none univer-bg-transparent univer-px-2 univer-text-left univer-text-sm univer-text-gray-900
              univer-transition-colors
              hover:univer-bg-gray-100
              dark:!univer-text-white
              dark:hover:!univer-bg-gray-700
            `, {
                '!univer-bg-gray-200 dark:!univer-bg-gray-500': props.active,
            })}
            onClick={props.onClick}
        >
            {props.icon}
            {props.children}
        </button>
    );
}

function PanelButton(props: { title: string; active?: boolean; disabled?: boolean; children: ReactNode; onClick: () => void }) {
    return (
        <Tooltip title={props.title} placement="bottom">
            <ToolbarButton
                className={SHEET_FLOATING_TOOLBAR_PANEL_BUTTON_CLASS}
                aria-label={props.title}
                disabled={props.disabled}
                active={props.active}
                onClick={props.onClick}
            >
                {props.children}
            </ToolbarButton>
        </Tooltip>
    );
}

function LinePreview(props: { style: BorderStyleTypes }) {
    const borderStyle = props.style === BorderStyleTypes.DOTTED ? 'dotted' : props.style === BorderStyleTypes.DASHED ? 'dashed' : 'solid';
    const borderWidth = props.style === BorderStyleTypes.THICK ? 3 : props.style === BorderStyleTypes.MEDIUM ? 2 : 1;

    return <span className="univer-block univer-w-4" style={{ borderTop: `${borderWidth}px ${borderStyle} currentColor` }} />;
}

function Divider() {
    return (
        <span
            className="
              univer-mx-2 univer-h-6 univer-w-px univer-bg-gray-200
              dark:!univer-bg-gray-600
            "
        />
    );
}
