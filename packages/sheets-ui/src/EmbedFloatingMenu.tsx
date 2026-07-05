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
import type { ButtonHTMLAttributes, HTMLAttributes, ReactNode } from 'react';
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
import { RemoveEmbedCommand } from '@univerjs/embed';
import { createEmbedProductFloatingMenuContributions, createEmbedReactRoot, disposeEmbedReactRoot, EmbedFloatingActiveService, EmbedRuntimeProviders, resolveEmbedFloatingMenuStage as resolveCommonEmbedFloatingMenuStage, resolveEmbedFloatingMenuRoot } from '@univerjs/embed-ui';
import {
    AlignBottomIcon,
    AlignTopIcon,
    AutowrapIcon,
    BoldIcon,
    BrushIcon,
    CancelMergeIcon,
    CheckMarkIcon,
    DeleteIcon,
    FilterIcon,
    FontColorDoubleIcon,
    HorizontallyIcon,
    HorizontalMergeIcon,
    LeftJustifyingIcon,
    MergeAllIcon,
    MoreDownIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NumberIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    RightJustifyingIcon,
    TruncationIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
} from '@univerjs/icons';
import {
    AddWorksheetMergeAllCommand,
    AddWorksheetMergeCommand,
    AddWorksheetMergeHorizontalCommand,
    AddWorksheetMergeVerticalCommand,
    RemoveWorksheetMergeCommand,
    ResetBackgroundColorCommand,
    SetBackgroundColorCommand,
    SetBorderBasicCommand,
    SetHorizontalTextAlignCommand,
    SetTextWrapCommand,
    SetVerticalTextAlignCommand,
    SheetsSelectionsService,
} from '@univerjs/sheets';
import { FONT_SIZE_LIST, FontFamilyItem, IconManager, IMenuManagerService, MenuManagerPosition, ToolbarButton, useDependency, useObservable } from '@univerjs/ui';
import { createElement, forwardRef, useEffect, useMemo, useState } from 'react';
import {
    ResetRangeTextColorCommand,
    SetRangeBoldCommand,
    SetRangeFontFamilyCommand,
    SetRangeFontSizeCommand,
    SetRangeTextColorCommand,
} from './commands/commands/inline-format.command';
import { SetOnceFormatPainterCommand } from './commands/commands/set-format-painter.command';
import { BorderLine } from './views/border-panel/border-line/BorderLine';
import { BORDER_LINE_CHILDREN, BORDER_SIZE_CHILDREN } from './views/border-panel/interface';

const OPEN_NUMFMT_PANEL_MENU_ID = 'sheet.operation.open.numfmt.panel';
const SMART_TOGGLE_FILTER_MENU_ID = 'sheet.command.smart-toggle-filter';
type SheetFloatingMenuStage = 'inactive' | 'stage2';

export type SheetFloatingToolbarItem =
    | { id: string; type: 'button' | 'dropdown' }
    | { id: string; type: 'divider' };

export function createSheetsFloatingToolbarItems(): SheetFloatingToolbarItem[] {
    return [
        { id: 'formatPainter', type: 'button' },
        { id: 'divider-format-tools', type: 'divider' },
        { id: 'numberFormat', type: 'dropdown' },
        { id: 'divider-format', type: 'divider' },
        { id: 'fontFamily', type: 'dropdown' },
        { id: 'fontSize', type: 'dropdown' },
        { id: 'bold', type: 'button' },
        { id: 'divider-font', type: 'divider' },
        { id: 'textColor', type: 'dropdown' },
        { id: 'backgroundColor', type: 'dropdown' },
        { id: 'borderComposite', type: 'dropdown' },
        { id: 'divider-border', type: 'divider' },
        { id: 'merge', type: 'dropdown' },
        { id: 'horizontalAlign', type: 'dropdown' },
        { id: 'verticalAlign', type: 'dropdown' },
        { id: 'wrap', type: 'dropdown' },
        { id: 'divider-layout', type: 'divider' },
        { id: 'filter', type: 'button' },
        { id: 'divider-block', type: 'divider' },
        { id: 'deleteBlock', type: 'button' },
    ];
}

export function createSheetsFloatingBorderLineItems(): typeof BORDER_LINE_CHILDREN {
    return [...BORDER_LINE_CHILDREN];
}

export function createSheetsFloatingFontSizeItems(): typeof FONT_SIZE_LIST {
    return [...FONT_SIZE_LIST];
}

export interface IResolvedSheetsFloatingToolbarMenuItems {
    formatPainter?: IMenuItem;
    numberFormat?: IMenuItem;
    fontFamily?: IMenuItem;
    fontSize?: IMenuItem;
    bold?: IMenuItem;
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
    horizontalAlign?: IMenuItem;
    verticalAlign?: IMenuItem;
    wrap?: IMenuItem;
    filter?: IMenuItem;
    deleteBlock?: true;
}

type SheetFloatingDirectMenuKey = Exclude<keyof IResolvedSheetsFloatingToolbarMenuItems, 'merge' | 'deleteBlock'>;

const SHEET_FLOATING_MENU_TARGETS: Record<SheetFloatingDirectMenuKey, string> = {
    formatPainter: SetOnceFormatPainterCommand.id,
    numberFormat: OPEN_NUMFMT_PANEL_MENU_ID,
    fontFamily: SetRangeFontFamilyCommand.id,
    fontSize: SetRangeFontSizeCommand.id,
    bold: SetRangeBoldCommand.id,
    textColor: SetRangeTextColorCommand.id,
    backgroundColor: SetBackgroundColorCommand.id,
    borderComposite: SetBorderBasicCommand.id,
    horizontalAlign: SetHorizontalTextAlignCommand.id,
    verticalAlign: SetVerticalTextAlignCommand.id,
    wrap: SetTextWrapCommand.id,
    filter: SMART_TOGGLE_FILTER_MENU_ID,
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

    (Object.keys(SHEET_FLOATING_MENU_TARGETS) as SheetFloatingDirectMenuKey[]).forEach((key) => {
        resolved[key] = findMenuItem(SHEET_FLOATING_MENU_TARGETS[key]);
    });
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
    resolved.deleteBlock = true;

    return resolved;
}

const SHEET_FLOATING_TOOLBAR_GROUPS: Array<{ dividerBefore?: string; items: Array<keyof IResolvedSheetsFloatingToolbarMenuItems> }> = [
    { items: ['formatPainter'] },
    { dividerBefore: 'divider-format-tools', items: ['numberFormat'] },
    { dividerBefore: 'divider-format', items: ['fontFamily', 'fontSize', 'bold'] },
    { dividerBefore: 'divider-font', items: ['textColor', 'backgroundColor', 'borderComposite'] },
    { dividerBefore: 'divider-border', items: ['merge', 'horizontalAlign', 'verticalAlign', 'wrap'] },
    { dividerBefore: 'divider-layout', items: ['filter'] },
    { dividerBefore: 'divider-block', items: ['deleteBlock'] },
];

export function createVisibleSheetsFloatingToolbarItems(resolved: IResolvedSheetsFloatingToolbarMenuItems): SheetFloatingToolbarItem[] {
    const items: SheetFloatingToolbarItem[] = [];
    SHEET_FLOATING_TOOLBAR_GROUPS.forEach((group) => {
        const groupItems = group.items
            .filter((id) => hasToolbarCapability(resolved, id))
            .map<SheetFloatingToolbarItem>((id) => ({
                id,
                type: id === 'formatPainter' || id === 'bold' || id === 'filter' || id === 'deleteBlock' ? 'button' : 'dropdown',
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
            usesDomFloatingStage: shouldUseSheetsFloatingMenuDomStage(context.descriptor.entry),
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

export function shouldUseSheetsFloatingMenuDomStage(_entry: string): boolean {
    return true;
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
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const getDropdownOpenProps = (id: string) => ({
        open: openDropdown === id,
        onOpenChange: (open: boolean) => setOpenDropdown(open ? id : null),
    });
    useEffect(() => {
        if (!openDropdown) {
            return;
        }

        const closeDropdownOnOutsidePointerDown = (event: PointerEvent) => {
            if (!isFloatingDropdownOwnSurfaceTarget(event.target, embedId)) {
                setOpenDropdown(null);
            }
        };

        document.addEventListener('pointerdown', closeDropdownOnOutsidePointerDown, true);

        return () => {
            document.removeEventListener('pointerdown', closeDropdownOnOutsidePointerDown, true);
        };
    }, [embedId, openDropdown]);
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
    const setBorder = (item: IMenuItem | undefined, type: BorderType, style = BorderStyleTypes.THIN, color = '#000000') => {
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
                color,
                style,
                activeBorderType: true,
            },
        });
    };
    const removeEmbed = () => {
        void commandService.executeCommand(RemoveEmbedCommand.id, { hostUnitId, embedId });
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
            {visibleToolbarItemIds.has('divider-format-tools') && <Divider />}
            {visibleToolbarItemIds.has('numberFormat') && (
                <NumberFormatDropdown menuItem={resolvedMenuItems.numberFormat} onClick={() => executeMenuItem(resolvedMenuItems.numberFormat)} />
            )}
            {visibleToolbarItemIds.has('divider-format') && <Divider />}
            {visibleToolbarItemIds.has('fontFamily') && (
                <FontFamilyFloatingDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.fontFamily}
                    title={localeService.t('sheets-ui.toolbar.font')}
                    {...getDropdownOpenProps('fontFamily')}
                    onSelect={(value) => executeMenuItem(resolvedMenuItems.fontFamily, { value })}
                />
            )}
            {visibleToolbarItemIds.has('fontSize') && (
                <FontSizeFloatingDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.fontSize}
                    title={localeService.t('sheets-ui.toolbar.fontSize')}
                    {...getDropdownOpenProps('fontSize')}
                    onSelect={(value) => executeMenuItem(resolvedMenuItems.fontSize, { value: Number(value) })}
                />
            )}
            {visibleToolbarItemIds.has('bold') && (
                <MenuButtonFromMenu item={resolvedMenuItems.bold} fallbackTitle={localeService.t('sheets-ui.toolbar.bold')} onClick={() => executeMenuItem(resolvedMenuItems.bold)}>
                    <BoldIcon />
                </MenuButtonFromMenu>
            )}
            {visibleToolbarItemIds.has('divider-font') && <Divider />}
            {visibleToolbarItemIds.has('textColor') && (
                <ColorDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.textColor}
                    title={localeService.t('sheets-ui.toolbar.textColor.main')}
                    icon={<FontColorDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#111827"
                    {...getDropdownOpenProps('textColor')}
                    onChange={(value) => executeMenuItem(resolvedMenuItems.textColor, { value })}
                    onReset={() => execute(ResetRangeTextColorCommand.id)}
                />
            )}
            {visibleToolbarItemIds.has('backgroundColor') && (
                <ColorDropdown
                    embedId={embedId}
                    menuItem={resolvedMenuItems.backgroundColor}
                    title={localeService.t('sheets-ui.toolbar.fillColor.main')}
                    icon={<PaintBucketDoubleIcon className="univer-fill-primary-600" />}
                    defaultColor="#ffffff"
                    {...getDropdownOpenProps('backgroundColor')}
                    onChange={(value) => executeMenuItem(resolvedMenuItems.backgroundColor, { value })}
                    onReset={() => execute(ResetBackgroundColorCommand.id)}
                />
            )}
            {visibleToolbarItemIds.has('borderComposite') && <BorderCompositeDropdown embedId={embedId} menuItem={resolvedMenuItems.borderComposite} {...getDropdownOpenProps('borderComposite')} onSelect={(type, style, color) => setBorder(resolvedMenuItems.borderComposite, type, style, color)} />}
            {visibleToolbarItemIds.has('divider-border') && <Divider />}
            {visibleToolbarItemIds.has('merge') && <MergeDropdown embedId={embedId} menuItems={resolvedMenuItems.merge} {...getDropdownOpenProps('merge')} execute={executeMenuItem} />}
            {visibleToolbarItemIds.has('horizontalAlign') && (
                <HorizontalAlignDropdown embedId={embedId} menuItem={resolvedMenuItems.horizontalAlign} {...getDropdownOpenProps('horizontalAlign')} execute={executeMenuItem} />
            )}
            {visibleToolbarItemIds.has('verticalAlign') && (
                <VerticalAlignDropdown embedId={embedId} menuItem={resolvedMenuItems.verticalAlign} {...getDropdownOpenProps('verticalAlign')} execute={executeMenuItem} />
            )}
            {visibleToolbarItemIds.has('wrap') && <WrapDropdown embedId={embedId} menuItem={resolvedMenuItems.wrap} {...getDropdownOpenProps('wrap')} execute={execute} />}
            {visibleToolbarItemIds.has('divider-layout') && <Divider />}
            {visibleToolbarItemIds.has('filter') && (
                <MenuButtonFromMenu item={resolvedMenuItems.filter} fallbackTitle="Filter" onClick={() => executeMenuItem(resolvedMenuItems.filter)}>
                    <FilterIcon />
                </MenuButtonFromMenu>
            )}
            {visibleToolbarItemIds.has('divider-block') && <Divider />}
            {visibleToolbarItemIds.has('deleteBlock') && (
                <MenuButton
                    title="Delete embed block"
                    className="
                      univer-text-red-500
                      hover:univer-text-red-600
                    "
                    onClick={removeEmbed}
                >
                    <DeleteIcon />
                </MenuButton>
            )}
        </div>
    );
}

const SHEET_FLOATING_TOOLBAR_SELECTOR_CLASS = 'univer-gap-1 univer-px-1.5 univer-text-sm';
const SHEET_FLOATING_TOOLBAR_COMPACT_DROPDOWN_CLASS = 'univer-gap-0.5 univer-px-1';
const SHEET_FLOATING_TOOLBAR_PANEL_BUTTON_CLASS = 'univer-size-7';
const SHEET_FLOATING_TOOLBAR_ICON_BUTTON_CLASS = 'univer-text-sm';
const SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS = 'univer-size-4';
const EMBED_FLOATING_MENU_POPUP_ATTRIBUTE = 'data-embed-floating-menu-popup';

const FloatingToolbarTrigger = forwardRef<HTMLButtonElement, ButtonHTMLAttributes<HTMLButtonElement> & {
    children: ReactNode;
    title: string;
}>(({ children, className, onClick, onMouseDown, onPointerDown, ...restProps }, ref) => (
    <Button
        ref={ref}
        type="button"
        size="small"
        variant="ghost"
        className={clsx(SHEET_FLOATING_TOOLBAR_SELECTOR_CLASS, className)}
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

const FloatingToolbarSplitTrigger = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement> & {
    title: string;
    primary: ReactNode;
    disabled?: boolean;
    open?: boolean;
    onPrimaryClick: () => void;
}>(({ title, primary, disabled, open, onPrimaryClick, onMouseDown, onPointerDown, onClick, ...restProps }, ref) => (
    <div
        ref={ref}
        className={clsx(`
          univer-box-border univer-inline-flex univer-h-6 univer-cursor-pointer univer-select-none univer-items-center
          univer-overflow-hidden univer-rounded-md univer-text-sm univer-text-gray-900
          hover:univer-bg-gray-100
          dark:!univer-text-white
          dark:hover:!univer-bg-gray-700
        `, {
            'univer-bg-gray-100 dark:!univer-bg-gray-700': open,
            'univer-cursor-not-allowed univer-opacity-60': disabled,
        })}
        role="group"
        aria-label={title}
        aria-disabled={disabled}
        title={title}
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
        <button
            type="button"
            className="
              univer-box-border univer-flex univer-h-6 univer-w-7 univer-cursor-pointer univer-items-center
              univer-justify-center univer-border-none univer-bg-transparent univer-p-0 univer-text-gray-900
              hover:univer-bg-gray-200
              disabled:univer-cursor-not-allowed
              dark:!univer-text-white
              dark:hover:!univer-bg-gray-600
            "
            aria-label={title}
            title={title}
            disabled={disabled}
            onClick={(event) => {
                event.stopPropagation();
                onPrimaryClick();
            }}
        >
            {primary}
        </button>
        <span
            className="
              univer-h-3 univer-w-px univer-bg-gray-100
              dark:!univer-bg-gray-700
            "
        />
        <button
            type="button"
            className="
              univer-box-border univer-flex univer-h-6 univer-w-5 univer-cursor-pointer univer-items-center
              univer-justify-center univer-border-none univer-bg-transparent univer-p-0 univer-text-gray-900
              hover:univer-bg-gray-200
              disabled:univer-cursor-not-allowed
              dark:!univer-text-white
              dark:hover:!univer-bg-gray-600
            "
            aria-label={title}
            title={title}
            disabled={disabled}
        >
            <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
        </button>
    </div>
));
FloatingToolbarSplitTrigger.displayName = 'FloatingToolbarSplitTrigger';

function MenuButton(props: {
    children: ReactNode;
    title: string;
    className?: string;
    disabled?: boolean;
    active?: boolean;
    onClick: () => void;
}) {
    return (
        <Tooltip title={props.title} placement="bottom">
            <ToolbarButton
                className={clsx(SHEET_FLOATING_TOOLBAR_ICON_BUTTON_CLASS, props.className)}
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
    const label = typeof value === 'string' && value ? value : 'General';

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

function FontFamilyFloatingDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (value: string) => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    if (!props.menuItem || hidden) {
        return null;
    }

    const fontFamily = typeof value === 'string' && value ? value : 'Arial';

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={props.title}
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={(
                <>
                    <span className="univer-w-28 univer-truncate univer-text-left">{fontFamily}</span>
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <div
                    className="
                      univer-box-border univer-max-h-72 univer-min-w-44 univer-overflow-y-auto univer-rounded-lg
                      univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1
                      univer-shadow-lg
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                      [&_button]:!univer-h-7 [&_button]:!univer-px-2
                      [&_ul]:!univer-text-sm
                    "
                    onPointerDown={keepFloatingPanelInteraction}
                    onMouseDown={keepFloatingPanelInteraction}
                >
                    <FontFamilyItem
                        value={fontFamily}
                        onChange={(nextValue) => {
                            props.onSelect(nextValue);
                            props.onOpenChange(false);
                        }}
                    />
                </div>
            )}
        />
    );
}

function FontSizeFloatingDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    title: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (value: string) => void;
}) {
    const { hidden, disabled, value } = useMenuItemRuntimeState(props.menuItem);
    if (!props.menuItem || hidden) {
        return null;
    }

    const fontSize = typeof value === 'number' || typeof value === 'string' ? Number(value) : 11;

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={props.title}
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={(
                <>
                    <span className="univer-min-w-6 univer-text-left">{fontSize}</span>
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <div
                    className="
                      univer-box-border univer-max-h-72 univer-min-w-20 univer-overflow-y-auto univer-rounded-lg
                      univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-1
                      univer-shadow-lg
                      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                    "
                    onPointerDown={keepFloatingPanelInteraction}
                    onMouseDown={keepFloatingPanelInteraction}
                >
                    {createSheetsFloatingFontSizeItems().map((item) => {
                        const selected = Number(item.value) === fontSize;
                        return (
                            <button
                                key={item.value}
                                type="button"
                                className={clsx(`
                                  univer-grid univer-h-7 univer-w-full univer-grid-cols-[1fr_1rem] univer-items-center
                                  univer-gap-2 univer-rounded univer-border-none univer-bg-transparent univer-px-2
                                  univer-text-left univer-text-sm univer-text-gray-900
                                  hover:univer-bg-gray-100
                                  dark:!univer-text-white
                                  dark:hover:!univer-bg-gray-700
                                `, {
                                    'univer-bg-gray-100 dark:!univer-bg-gray-700': selected,
                                })}
                                onClick={() => {
                                    props.onSelect(String(item.value));
                                    props.onOpenChange(false);
                                }}
                            >
                                <span>{item.label}</span>
                                {selected && <CheckMarkIcon className="univer-text-primary-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
        />
    );
}

function HorizontalAlignDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    if (!props.menuItem || hidden) {
        return null;
    }

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={localeService.t('sheets-ui.toolbar.horizontalAlignMode.main')}
            triggerClassName={SHEET_FLOATING_TOOLBAR_COMPACT_DROPDOWN_CLASS}
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={(
                <>
                    <LeftJustifyingIcon />
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <Panel embedId={props.embedId} onPointerDown={(event) => event.stopPropagation()}>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.left')} onClick={() => props.execute(props.menuItem, { value: HorizontalAlign.LEFT })}><LeftJustifyingIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.center')} onClick={() => props.execute(props.menuItem, { value: HorizontalAlign.CENTER })}><HorizontallyIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.right')} onClick={() => props.execute(props.menuItem, { value: HorizontalAlign.RIGHT })}><RightJustifyingIcon /></PanelButtonFromMenu>
                    </PanelRow>
                </Panel>
            )}
        />
    );
}

function VerticalAlignDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    if (!props.menuItem || hidden) {
        return null;
    }

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={localeService.t('sheets-ui.toolbar.verticalAlignMode.main')}
            triggerClassName={SHEET_FLOATING_TOOLBAR_COMPACT_DROPDOWN_CLASS}
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={(
                <>
                    <VerticalCenterIcon />
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <Panel embedId={props.embedId} onPointerDown={(event) => event.stopPropagation()}>
                    <PanelRow>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.top')} onClick={() => props.execute(props.menuItem, { value: VerticalAlign.TOP })}><AlignTopIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.middle')} onClick={() => props.execute(props.menuItem, { value: VerticalAlign.MIDDLE })}><VerticalCenterIcon /></PanelButtonFromMenu>
                        <PanelButtonFromMenu item={props.menuItem} title={localeService.t('sheets-ui.align.bottom')} onClick={() => props.execute(props.menuItem, { value: VerticalAlign.BOTTOM })}><AlignBottomIcon /></PanelButtonFromMenu>
                    </PanelRow>
                </Panel>
            )}
        />
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onChange: (value: string) => void;
    onReset: () => void;
}) {
    const localeService = useDependency(LocaleService);
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
            open={props.open}
            onOpenChange={props.onOpenChange}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <div
                    data-embed-id={props.embedId}
                    {...{ [EMBED_FLOATING_MENU_POPUP_ATTRIBUTE]: 'true' }}
                    className="
                      univer-box-border univer-w-72 univer-overflow-hidden univer-rounded-lg univer-border
                      univer-border-solid univer-border-gray-200 univer-bg-white univer-p-3 univer-shadow-lg
                      dark:!univer-bg-gray-900
                    "
                    onPointerDown={keepFloatingPanelInteraction}
                    onMouseDown={keepFloatingPanelInteraction}
                >
                    <ColorPicker
                        value={displayColor}
                        onChange={(value) => {
                            setColor(value);
                            props.onChange(value);
                        }}
                    />
                    <MenuSeparator />
                    <button
                        type="button"
                        className="
                          univer-flex univer-h-8 univer-w-full univer-items-center univer-gap-2 univer-rounded
                          univer-border-none univer-bg-transparent univer-px-1 univer-text-left univer-text-sm
                          univer-text-gray-900
                          hover:univer-bg-gray-100
                          dark:!univer-text-white
                          dark:hover:!univer-bg-gray-700
                        "
                        onClick={() => {
                            setColor(props.defaultColor);
                            props.onReset();
                            props.onOpenChange(false);
                        }}
                    >
                        <NoColorDoubleIcon />
                        <span>{localeService.t('sheets-ui.toolbar.resetColor')}</span>
                    </button>
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
    open: boolean;
    onOpenChange: (open: boolean) => void;
    onSelect: (type: BorderType, style?: BorderStyleTypes, color?: string) => void;
}) {
    const localeService = useDependency(LocaleService);
    const iconManager = useDependency(IconManager);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItem);
    const [borderType, setBorderType] = useState(BorderType.ALL);
    const [borderStyle, setBorderStyle] = useState(BorderStyleTypes.THIN);
    const [borderColor, setBorderColor] = useState('#000000');
    if (!props.menuItem || hidden) {
        return null;
    }

    const applyBorder = (nextType = borderType, nextStyle = borderStyle, nextColor = borderColor) => {
        setBorderType(nextType);
        setBorderStyle(nextStyle);
        setBorderColor(nextColor);
        props.onSelect(nextType, nextStyle, nextColor);
    };
    const getBorderIconName = (type: BorderType) => {
        return createSheetsFloatingBorderLineItems().find((item) => item.value === type)?.icon ?? 'AllBorderIcon';
    };
    const renderBorderIcon = (icon: string, className = 'univer-fill-primary-600') => {
        const Icon = iconManager.get(icon);
        return Icon ? <Icon className={className} /> : <NoBorderIcon />;
    };

    return (
        <Dropdown
            disabled={disabled}
            align="start"
            sideOffset={6}
            open={props.open}
            onOpenChange={props.onOpenChange}
            onPointerDownOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onFocusOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            onInteractOutside={(event) => keepFloatingDropdownOpenForOwnSurface(event, props.embedId)}
            overlay={(
                <Panel embedId={props.embedId} onPointerDown={(event) => event.stopPropagation()}>
                    <div
                        className="
                          univer-grid univer-grid-cols-5 univer-gap-2 univer-text-gray-600
                          dark:!univer-text-gray-200
                        "
                    >
                        {createSheetsFloatingBorderLineItems().map((item) => (
                            <PanelButton
                                key={item.value}
                                title={localeService.t(item.label)}
                                active={borderType === item.value}
                                onClick={() => applyBorder(item.value as BorderType)}
                            >
                                {renderBorderIcon(item.icon)}
                            </PanelButton>
                        ))}
                    </div>
                    <MenuSeparator />
                    <PanelRow>
                        <Dropdown
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
                                      univer-overflow-hidden univer-rounded-lg univer-bg-white univer-p-4
                                      univer-shadow-lg
                                      dark:!univer-bg-gray-900
                                    "
                                    onPointerDown={keepFloatingPanelInteraction}
                                    onMouseDown={keepFloatingPanelInteraction}
                                >
                                    <ColorPicker value={borderColor} onChange={(color) => applyBorder(borderType, borderStyle, color)} />
                                </div>
                            )}
                        >
                            <PanelButton title={localeService.t('sheets-ui.borderLine.borderColor')} active={false} onClick={() => undefined}>
                                <PaintBucketDoubleIcon extend={{ colorChannel1: borderColor }} />
                                <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                            </PanelButton>
                        </Dropdown>
                        <Dropdown
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
                                      univer-box-border univer-grid univer-min-w-48 univer-gap-1 univer-rounded-lg
                                      univer-border univer-border-solid univer-border-gray-200 univer-bg-white
                                      univer-p-1.5 univer-shadow-lg
                                      dark:!univer-border-gray-700 dark:!univer-bg-gray-900
                                    "
                                    onPointerDown={keepFloatingPanelInteraction}
                                    onMouseDown={keepFloatingPanelInteraction}
                                >
                                    {BORDER_SIZE_CHILDREN.map((item) => (
                                        <button
                                            key={item.value}
                                            type="button"
                                            className={clsx(`
                                              univer-relative univer-flex univer-h-8 univer-cursor-pointer
                                              univer-items-center univer-justify-center univer-rounded
                                              univer-border-none univer-bg-transparent univer-px-2
                                              hover:univer-bg-gray-100
                                              dark:hover:!univer-bg-gray-700
                                            `, {
                                                'univer-bg-gray-200 dark:!univer-bg-gray-600': borderStyle === item.value,
                                            })}
                                            onClick={() => applyBorder(borderType, item.value)}
                                        >
                                            <BorderLine
                                                className="
                                                  univer-fill-gray-900
                                                  dark:!univer-fill-white
                                                "
                                                type={item.value}
                                            />
                                        </button>
                                    ))}
                                </div>
                            )}
                        >
                            <PanelButton title={localeService.t('sheets-ui.borderLine.borderSize')} active={false} onClick={() => undefined}>
                                <BorderLine
                                    className="
                                      univer-fill-gray-900
                                      dark:!univer-fill-white
                                    "
                                    type={borderStyle}
                                />
                                <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                            </PanelButton>
                        </Dropdown>
                    </PanelRow>
                </Panel>
            )}
        >
            <FloatingToolbarSplitTrigger
                title={getLocalizedMenuTitle(props.menuItem, localeService, 'sheets-ui.toolbar.border.main')}
                disabled={disabled}
                open={props.open}
                primary={renderBorderIcon(getBorderIconName(borderType), 'univer-text-gray-900 dark:!univer-text-white')}
                onPrimaryClick={() => {
                    applyBorder();
                    props.onOpenChange(false);
                }}
            />
        </Dropdown>
    );
}

function MergeDropdown(props: {
    embedId: string;
    menuItems: IResolvedSheetsFloatingToolbarMenuItems['merge'];
    open: boolean;
    onOpenChange: (open: boolean) => void;
    execute: (item: IMenuItem | undefined, params?: object) => void;
}) {
    const localeService = useDependency(LocaleService);
    const { hidden, disabled } = useMenuItemRuntimeState(props.menuItems?.root);
    const entries: Array<{ item: IMenuItem; icon: ReactNode }> = [];
    [
        { item: props.menuItems?.all, icon: <MergeAllIcon /> },
        { item: props.menuItems?.vertical, icon: <VerticalIntegrationIcon /> },
        { item: props.menuItems?.horizontal, icon: <HorizontalMergeIcon /> },
        { item: props.menuItems?.unmerge, icon: <CancelMergeIcon /> },
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
            triggerClassName={SHEET_FLOATING_TOOLBAR_COMPACT_DROPDOWN_CLASS}
            open={props.open}
            onOpenChange={props.onOpenChange}
            trigger={(
                <>
                    <MergeAllIcon />
                    <MoreDownIcon className={SHEET_FLOATING_TOOLBAR_MORE_ICON_CLASS} />
                </>
            )}
            overlay={(
                <RibbonListPanel>
                    {entries.map(({ item, icon }) => (
                        <RibbonListItem
                            key={item.id}
                            icon={icon}
                            onClick={() => {
                                props.execute(item);
                                props.onOpenChange(false);
                            }}
                        >
                            {localeService.t(getMenuTitle(item))}
                        </RibbonListItem>
                    ))}
                </RibbonListPanel>
            )}
        />
    );
}

function WrapDropdown(props: {
    embedId: string;
    menuItem: IMenuItem | undefined;
    open: boolean;
    onOpenChange: (open: boolean) => void;
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
            { label: localeService.t('sheets-ui.textWrap.clip'), icon: <TruncationIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.CLIP } },
            { label: localeService.t('sheets-ui.textWrap.overflow'), icon: <OverflowIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.OVERFLOW } },
            { label: localeService.t('sheets-ui.textWrap.wrap'), icon: <AutowrapIcon />, commandId: SetTextWrapCommand.id, params: { value: WrapStrategy.WRAP } },
        ];

    return (
        <InlineFloatingDropdown
            embedId={props.embedId}
            disabled={disabled}
            title={getLocalizedMenuTitle(props.menuItem, localeService, 'sheets-ui.toolbar.textWrapMode.main')}
            triggerClassName={SHEET_FLOATING_TOOLBAR_COMPACT_DROPDOWN_CLASS}
            open={props.open}
            onOpenChange={props.onOpenChange}
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
                                props.onOpenChange(false);
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

export function isFloatingDropdownOwnSurfaceTarget(target: EventTarget | null, embedId: string): boolean {
    if (!(target instanceof HTMLElement)) {
        return false;
    }

    const surface = target.closest('[data-embed-floating-menu="true"], [data-embed-floating-menu-popup="true"]');
    return surface?.getAttribute('data-embed-id') === embedId;
}

export function keepFloatingDropdownOpenForOwnSurface(event: { target: EventTarget | null; preventDefault: () => void }, embedId: string): void {
    const target = event.target;
    if (isFloatingDropdownOwnSurfaceTarget(target, embedId)) {
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

function MenuSeparator() {
    return (
        <span
            className="
              univer-my-1 univer-block univer-h-px univer-w-full univer-bg-gray-200
              dark:!univer-bg-gray-700
            "
        />
    );
}

function InlineFloatingDropdown(props: {
    embedId: string;
    title: string;
    trigger: ReactNode;
    overlay: ReactNode;
    disabled?: boolean;
    triggerClassName?: string;
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
                className={props.triggerClassName}
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

function RibbonListPanel(props: { children: ReactNode }) {
    return (
        <section
            className="
              univer-box-border univer-grid univer-min-w-44 univer-gap-0.5 univer-rounded-lg univer-border
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

function RibbonListItem(props: { children: ReactNode; icon: ReactNode; onClick: () => void }) {
    return (
        <button
            type="button"
            className="
              univer-box-border univer-grid univer-h-7 univer-w-full univer-grid-cols-[1.5rem_1fr] univer-items-center
              univer-gap-2 univer-rounded univer-border-none univer-bg-transparent univer-px-2 univer-text-left
              univer-text-sm univer-text-gray-900 univer-transition-colors
              hover:univer-bg-gray-100
              dark:!univer-text-white
              dark:hover:!univer-bg-gray-700
            "
            onClick={props.onClick}
        >
            <span className="univer-flex univer-items-center univer-justify-center">{props.icon}</span>
            <span className="univer-truncate">{props.children}</span>
        </button>
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
