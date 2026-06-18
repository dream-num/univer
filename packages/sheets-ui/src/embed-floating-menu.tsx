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
import type { EmbedFloatingActivation, EmbedFloatingMenuContribution, EmbedFloatingMenuMountContext } from '@univerjs/embed-ui';
import type { IMenuItem, IMenuSchema, IValueOption } from '@univerjs/ui';
import type { ReactNode } from 'react';
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
import { Button, ColorPicker, Dropdown, DropdownMenu, Tooltip } from '@univerjs/design';
import { createEmbedReactRoot, disposeEmbedReactRoot, EmbedFloatingActiveService, EmbedRuntimeProviders, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
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
import { FONT_SIZE_LIST, IMenuManagerService, MenuManagerPosition, useDependency, useObservable } from '@univerjs/ui';
import { createElement, useEffect, useMemo, useState } from 'react';
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

const SHEET_FLOATING_MENU_STYLE_ID = 'univer-sheet-embed-floating-menu-styles';
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

export function createSheetsFloatingMenuContributions(): EmbedFloatingMenuContribution[] {
    return [
        {
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            childType: UniverInstanceType.UNIVER_SHEET,
            mount: mountSheetsFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-floating-object',
            childType: UniverInstanceType.UNIVER_SHEET,
            mount: mountSheetsFloatingMenu,
        },
        {
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-floating-object',
            childType: UniverInstanceType.UNIVER_SHEET,
            mount: mountSheetsFloatingMenu,
        },
    ];
}

function mountSheetsFloatingMenu(context: EmbedFloatingMenuMountContext) {
    ensureSheetFloatingMenuStyles();

    const root = resolveEmbedFloatingMenuRoot(context);
    const menu = document.createElement('div');
    root.appendChild(menu);

    const reactRoot = createEmbedReactRoot(menu);
    reactRoot.render(createElement(
        EmbedRuntimeProviders,
        { injector: context.runtimeScope.injector, mountContainer: root },
        createElement(SheetEmbedFloatingMenu, {
            hostUnitId: context.hostUnitId,
            embedId: context.embedId,
            childUnitId: context.childUnitId,
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
    usesDomFloatingStage: boolean;
    renderScopeActive$: Observable<boolean>;
}

export function resolveSheetsFloatingMenuStage(params: {
    embedId: string;
    active: EmbedFloatingActivation | null;
    usesDomFloatingStage: boolean;
    renderScopeActive: boolean;
}): SheetFloatingMenuStage {
    if (params.active?.embedId === params.embedId && params.active.stage === 'stage2') {
        return 'stage2';
    }

    if (!params.usesDomFloatingStage && params.renderScopeActive) {
        return 'stage2';
    }

    return 'inactive';
}

function SheetEmbedFloatingMenu(props: ISheetEmbedFloatingMenuProps) {
    const { hostUnitId, embedId, childUnitId, usesDomFloatingStage, renderScopeActive$ } = props;
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
            className="
              univer-sheet-embed-floating-menu univer-box-border univer-inline-flex univer-h-8 univer-items-center
              univer-gap-1 univer-rounded-lg univer-border univer-border-solid univer-border-gray-200 univer-bg-white
              univer-p-1 univer-text-gray-900 univer-shadow-lg
              dark:!univer-border-gray-600 dark:!univer-bg-gray-900 dark:!univer-text-white
            "
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
                    menuItem={resolvedMenuItems.fontSize}
                    title={localeService.t('sheets-ui.toolbar.fontSize')}
                    icon={<span className="univer-text-[13px] univer-font-semibold">T</span>}
                    label="10"
                    options={FONT_SIZE_LIST.map((item) => ({ label: String(item.label ?? item.value), value: String(item.value) }))}
                    onSelect={(value) => executeMenuItem(resolvedMenuItems.fontSize, { value: Number(value) })}
                />
            )}
            {visibleToolbarItemIds.has('fontComposite') && <FontCompositeDropdown menuItems={resolvedMenuItems.fontComposite} execute={executeMenuItem} />}
            {visibleToolbarItemIds.has('divider-font') && <Divider />}
            {visibleToolbarItemIds.has('textColor') && (
                <ColorDropdown
                    menuItem={resolvedMenuItems.textColor}
                    title={localeService.t('sheets-ui.toolbar.textColor.main')}
                    icon={<FontColorDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#111827"
                    onChange={(value) => executeMenuItem(resolvedMenuItems.textColor, { value })}
                />
            )}
            {visibleToolbarItemIds.has('backgroundColor') && (
                <ColorDropdown
                    menuItem={resolvedMenuItems.backgroundColor}
                    title={localeService.t('sheets-ui.toolbar.fillColor.main')}
                    icon={<PaintBucketDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#ffffff"
                    onChange={(value) => executeMenuItem(resolvedMenuItems.backgroundColor, { value })}
                />
            )}
            {visibleToolbarItemIds.has('borderComposite') && <BorderCompositeDropdown menuItem={resolvedMenuItems.borderComposite} onSelect={(type, style) => setBorder(resolvedMenuItems.borderComposite, type, style)} />}
            {visibleToolbarItemIds.has('divider-border') && <Divider />}
            {visibleToolbarItemIds.has('merge') && <MergeDropdown menuItems={resolvedMenuItems.merge} execute={executeMenuItem} />}
            {visibleToolbarItemIds.has('wrap') && <WrapDropdown menuItem={resolvedMenuItems.wrap} execute={execute} />}
            {visibleToolbarItemIds.has('divider-layout') && <Divider />}
            {visibleToolbarItemIds.has('filter') && (
                <MenuButtonFromMenu item={resolvedMenuItems.filter} fallbackTitle="Filter" onClick={() => executeMenuItem(resolvedMenuItems.filter)}>
                    <FilterIcon />
                </MenuButtonFromMenu>
            )}
        </div>
    );
}

const FONT_FAMILY_OPTIONS = [
    { label: 'Default', value: 'Default' },
    { label: 'Arial', value: 'Arial' },
    { label: 'Times New Roman', value: 'Times New Roman' },
    { label: 'Courier New', value: 'Courier New' },
    { label: 'Microsoft YaHei', value: 'Microsoft YaHei' },
];

function MenuButton(props: {
    children: ReactNode;
    title: string;
    disabled?: boolean;
    className?: string;
    onClick: () => void;
}) {
    return (
        <Tooltip title={props.title} placement="bottom">
            <Button
                type="button"
                size="small"
                variant="ghost"
                className={['univer-size-6 univer-p-0', props.className].filter(Boolean).join(' ')}
                title={props.title}
                aria-label={props.title}
                disabled={props.disabled}
                onClick={props.onClick}
            >
                {props.children}
            </Button>
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

    const title = props.item.tooltip ? localeService.t(props.item.tooltip) : props.item.title ? localeService.t(props.item.title) : props.fallbackTitle;

    return (
        <MenuButton
            title={title}
            disabled={disabled}
            className={activated
                ? `
                  univer-bg-gray-100 univer-text-primary-600
                  dark:!univer-bg-gray-700 dark:!univer-text-primary-300
                `
                : undefined}
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
        setHidden(false);
        setDisabled(false);
        setActivated(false);
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
    if (!props.menuItem || hidden) {
        return null;
    }

    return (
        <Tooltip
            title={props.menuItem.tooltip ?? props.menuItem.title ?? 'Number format'}
            placement="bottom"
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title="Number format"
                disabled={disabled}
                onClick={props.onClick}
            >
                <NumberIcon />
                <span>{typeof value === 'string' && value ? value : 'General'}</span>
                <MoreDownIcon className="univer-size-3" />
            </Button>
        </Tooltip>
    );
}

function TextDropdown(props: {
    menuItem: IMenuItem | undefined;
    title: string;
    icon: ReactNode;
    label: string;
    options: Array<{ label: string; value: string }>;
    onSelect: (value: string) => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    if (!props.menuItem || hidden) {
        return null;
    }

    const label = typeof value === 'string' || typeof value === 'number' ? String(value) : props.label;

    return (
        <DropdownMenu
            disabled={disabled}
            align="start"
            sideOffset={6}
            items={[{
                type: 'radio',
                value: props.options[0]?.value ?? '',
                hideIndicator: true,
                options: props.options.map((item) => ({ label: item.label, value: item.value })),
                onSelect: props.onSelect,
            }]}
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title={props.title}
            >
                {props.icon}
                <span className="univer-max-w-20 univer-truncate">{label}</span>
                <MoreDownIcon className="univer-size-3" />
            </Button>
        </DropdownMenu>
    );
}

function FontCompositeDropdown(props: {
    menuItems: IResolvedSheetsFloatingToolbarMenuItems['fontComposite'];
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    if (!props.menuItems) {
        return null;
    }

    return (
        <Dropdown
            align="start"
            sideOffset={6}
            overlay={(
                <Panel onPointerDown={(event) => event.stopPropagation()}>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.bold} title="Bold" onClick={() => props.execute(props.menuItems?.bold)}><BoldIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.italic} title="Italic" onClick={() => props.execute(props.menuItems?.italic)}><ItalicIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.underline} title="Underline" onClick={() => props.execute(props.menuItems?.underline)}><UnderlineIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.strikethrough} title="Strikethrough" onClick={() => props.execute(props.menuItems?.strikethrough)}><StrikethroughIcon /></PanelButtonFromMenu>
                    </PanelRow>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title="Align left" onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.LEFT })}><LeftJustifyingIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title="Align center" onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.CENTER })}><HorizontallyIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.horizontalAlign} title="Align right" onClick={() => props.execute(props.menuItems?.horizontalAlign, { value: HorizontalAlign.RIGHT })}><RightJustifyingIcon /></PanelButtonFromMenu>
                    </PanelRow>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title="Align top" onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.TOP })}><AlignTopIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title="Align middle" onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.MIDDLE })}><VerticalCenterIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItems.verticalAlign} title="Align bottom" onClick={() => props.execute(props.menuItems?.verticalAlign, { value: VerticalAlign.BOTTOM })}><AlignBottomIcon /></PanelButtonFromMenu>
                    </PanelRow>
                </Panel>
            )}
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title="Font and alignment"
            >
                <BoldIcon />
                <MoreDownIcon className="univer-size-3" />
            </Button>
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
            overlay={(
                <div
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
            <Button type="button" size="small" variant="ghost" className="univer-size-6 univer-p-0" title={props.title} aria-label={props.title}>
                {props.icon}
            </Button>
        </Dropdown>
    );
}

function BorderCompositeDropdown(props: {
    menuItem: IMenuItem | undefined;
    onSelect: (type: BorderType, style?: BorderStyleTypes) => void;
}) {
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    const [borderType, setBorderType] = useState(BorderType.ALL);
    const [borderStyle, setBorderStyle] = useState(BorderStyleTypes.THIN);
    if (!props.menuItem || hidden) {
        return null;
    }

    const borderTypes = [
        { title: 'All borders', type: BorderType.ALL, icon: <AllBorderIcon /> },
        { title: 'Outer borders', type: BorderType.OUTSIDE, icon: <OuterBorderDoubleIcon /> },
        { title: 'Inner borders', type: BorderType.INSIDE, icon: <InnerBorderDoubleIcon /> },
        { title: 'Vertical borders', type: BorderType.VERTICAL, icon: <VerticalBorderDoubleIcon /> },
        { title: 'No border', type: BorderType.NONE, icon: <NoBorderIcon /> },
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
            overlay={(
                <Panel onPointerDown={(event) => event.stopPropagation()}>
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
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title="Borders"
            >
                <GridOutlineIcon />
                <MoreDownIcon className="univer-size-3" />
            </Button>
        </Dropdown>
    );
}

function MergeDropdown(props: {
    menuItems: IResolvedSheetsFloatingToolbarMenuItems['merge'];
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItems?.root);
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
        <DropdownMenu
            disabled={disabled}
            align="start"
            sideOffset={6}
            items={entries.map(({ item, icon }) => ({
                type: 'item' as const,
                children: <MenuItemLabel icon={icon}>{localeService.t(getMenuTitle(item))}</MenuItemLabel>,
                onSelect: () => props.execute(item),
            }))}
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title="Merge cells"
            >
                <MergeAllIcon />
                <MoreDownIcon className="univer-size-3" />
            </Button>
        </DropdownMenu>
    );
}

function WrapDropdown(props: {
    menuItem: IMenuItem | undefined;
    execute: (commandId: string, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
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
            { label: 'Clip', icon: <TruncationIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.CLIP } },
            { label: 'Overflow', icon: <OverflowIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.OVERFLOW } },
            { label: 'Wrap', icon: <AutowrapIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.WRAP } },
        ];

    return (
        <DropdownMenu
            disabled={disabled}
            align="start"
            sideOffset={6}
            items={entries.map((entry) => ({
                type: 'item' as const,
                children: <MenuItemLabel icon={entry.icon}>{entry.label}</MenuItemLabel>,
                onSelect: () => props.execute(entry.commandId, entry.params),
            }))}
        >
            <Button
                type="button"
                size="small"
                variant="ghost"
                className="univer-h-6 univer-gap-1 univer-px-2 univer-text-xs"
                title="Text wrap"
            >
                <AutowrapIcon />
                <MoreDownIcon className="univer-size-3" />
            </Button>
        </DropdownMenu>
    );
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
    return target instanceof HTMLElement && Boolean(target.closest('input, textarea, [contenteditable="true"], [role="combobox"], [data-u-comp="select"], .univer-select'));
}

function keepFloatingPanelInteraction(event: React.MouseEvent<HTMLElement> | React.PointerEvent<HTMLElement>): void {
    event.stopPropagation();
    if (!shouldKeepMouseDownDefault(event.target)) {
        event.preventDefault();
    }
}

function Panel(props: { children: ReactNode; onPointerDown: (event: React.PointerEvent<HTMLElement>) => void }) {
    return (
        <section
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

function PanelButton(props: { title: string; active?: boolean; disabled?: boolean; children: ReactNode; onClick: () => void }) {
    return (
        <Tooltip title={props.title} placement="bottom">
            <button
                type="button"
                className={[
                    'univer-flex univer-size-7 univer-items-center univer-justify-center univer-rounded-md univer-border-none univer-bg-transparent univer-p-0 univer-text-gray-700 hover:univer-bg-gray-100 dark:!univer-text-gray-100 dark:hover:!univer-bg-gray-800',
                    props.active ? 'univer-bg-gray-100 univer-text-primary-600 dark:!univer-bg-gray-700 dark:!univer-text-primary-300' : '',
                    props.disabled ? 'univer-cursor-not-allowed univer-opacity-40' : '',
                ].filter(Boolean).join(' ')}
                aria-label={props.title}
                disabled={props.disabled}
                onClick={props.onClick}
            >
                {props.children}
            </button>
        </Tooltip>
    );
}

function LinePreview(props: { style: BorderStyleTypes }) {
    const borderStyle = props.style === BorderStyleTypes.DOTTED ? 'dotted' : props.style === BorderStyleTypes.DASHED ? 'dashed' : 'solid';
    const borderWidth = props.style === BorderStyleTypes.THICK ? 3 : props.style === BorderStyleTypes.MEDIUM ? 2 : 1;

    return <span className="univer-block univer-w-4" style={{ borderTop: `${borderWidth}px ${borderStyle} currentColor` }} />;
}

function MenuItemLabel(props: { icon: ReactNode; children: ReactNode }) {
    return (
        <span className="univer-flex univer-items-center univer-gap-2">
            {props.icon}
            <span>{props.children}</span>
        </span>
    );
}

function Divider() {
    return (
        <span
            className="
              univer-mx-0.5 univer-h-5 univer-w-px univer-bg-gray-200
              dark:!univer-bg-gray-600
            "
        />
    );
}

function ensureSheetFloatingMenuStyles(): void {
    if (typeof document === 'undefined' || document.getElementById(SHEET_FLOATING_MENU_STYLE_ID)) {
        return;
    }

    const style = document.createElement('style');
    style.id = SHEET_FLOATING_MENU_STYLE_ID;
    style.textContent = `
.univer-sheet-embed-floating-menu {
    position: absolute;
    top: -36px;
    left: 34px;
    z-index: 30;
    max-width: min(calc(100vw - 72px), 880px);
    overflow-x: auto;
    overflow-y: visible;
    scrollbar-width: none;
}
.univer-sheet-embed-floating-menu::-webkit-scrollbar {
    display: none;
}
.univer-sheet-embed-floating-menu:not([data-embed-float-stage="stage2"]) {
    display: none;
}
[data-embed-fullscreen-menu-slot="true"] .univer-sheet-embed-floating-menu {
    position: static;
    margin: 6px auto;
}
`;
    document.head.appendChild(style);
}
