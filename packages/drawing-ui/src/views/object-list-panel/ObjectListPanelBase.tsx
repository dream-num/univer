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

import type { DragEvent, FocusEvent, KeyboardEvent, MouseEvent } from 'react';
import { Button, clsx, Input } from '@univerjs/design';
import {
    ArrowDownIcon,
    ArrowUpIcon,
    EyeIcon,
    EyelashIcon,
    LocateFixedIcon,
    LockIcon,
    MoreDownIcon,
    MoreRightIcon,
} from '@univerjs/icons';
import { useEffect, useMemo, useRef, useState } from 'react';
import { OBJECT_LIST_CANVAS_SECTION_ID, OBJECT_LIST_FLOATING_SECTION_ID } from './object-list-panel-layer';

export interface IObjectListPanelCapabilities {
    arrange?: boolean;
    description?: boolean;
    locate?: boolean;
    name?: boolean;
    reorder?: boolean;
    selectable?: boolean;
    visible?: boolean;
}

type ObjectListFilterMode = 'all' | 'hidden' | 'locked';

export interface IObjectListPanelItem {
    id: string;
    name: string;
    description?: string;
    visible: boolean;
    selectable?: boolean;
    disabled?: boolean;
    level?: number;
    isGroup?: boolean;
    expanded?: boolean;
    canMoveForward?: boolean;
    canMoveBackward?: boolean;
    canReorder?: boolean;
    parentId?: string;
    sectionId?: string;
    sectionTitle?: string;
    capabilities?: IObjectListPanelCapabilities;
}

export interface IObjectListPanelLabels {
    title: string;
    empty: string;
    showAll: string;
    hideAll: string;
    moveForward: string;
    moveBackward: string;
    close: string;
    show: string;
    hide: string;
    lock: string;
    unlock: string;
    name: string;
    nameInput: string;
    description: string;
    descriptionPlaceholder: string;
    details: string;
    noSelection: string;
    locate: string;
    expand: string;
    collapse: string;
    dragToReorder: string;
    search: string;
    filterAll: string;
    filterHidden: string;
    filterLocked: string;
    sectionCanvas: string;
    sectionFloating: string;
}

export type ObjectListPanelTypeNameKey =
    | 'chart'
    | 'connector'
    | 'container'
    | 'dom'
    | 'group'
    | 'image'
    | 'object'
    | 'placeholder'
    | 'shape'
    | 'smartArt'
    | 'table'
    | 'text'
    | 'unit'
    | 'video';

interface IObjectListPanelLocaleService {
    t: (key: string) => string;
}

const objectListPanelLabelKeys: Record<keyof IObjectListPanelLabels, string> = {
    title: 'drawing-ui.objectListPanel.title',
    empty: 'drawing-ui.objectListPanel.empty',
    showAll: 'drawing-ui.objectListPanel.showAll',
    hideAll: 'drawing-ui.objectListPanel.hideAll',
    moveForward: 'drawing-ui.objectListPanel.moveForward',
    moveBackward: 'drawing-ui.objectListPanel.moveBackward',
    close: 'drawing-ui.objectListPanel.close',
    show: 'drawing-ui.objectListPanel.show',
    hide: 'drawing-ui.objectListPanel.hide',
    lock: 'drawing-ui.objectListPanel.lock',
    unlock: 'drawing-ui.objectListPanel.unlock',
    name: 'drawing-ui.objectListPanel.name',
    nameInput: 'drawing-ui.objectListPanel.nameInput',
    description: 'drawing-ui.objectListPanel.description',
    descriptionPlaceholder: 'drawing-ui.objectListPanel.descriptionPlaceholder',
    details: 'drawing-ui.objectListPanel.details',
    noSelection: 'drawing-ui.objectListPanel.noSelection',
    locate: 'drawing-ui.objectListPanel.locate',
    expand: 'drawing-ui.objectListPanel.expand',
    collapse: 'drawing-ui.objectListPanel.collapse',
    dragToReorder: 'drawing-ui.objectListPanel.dragToReorder',
    search: 'drawing-ui.objectListPanel.search',
    filterAll: 'drawing-ui.objectListPanel.filterAll',
    filterHidden: 'drawing-ui.objectListPanel.filterHidden',
    filterLocked: 'drawing-ui.objectListPanel.filterLocked',
    sectionCanvas: 'drawing-ui.objectListPanel.sectionCanvas',
    sectionFloating: 'drawing-ui.objectListPanel.sectionFloating',
};

export function getObjectListPanelLabels(localeService: IObjectListPanelLocaleService): IObjectListPanelLabels {
    return Object.fromEntries(
        Object.entries(objectListPanelLabelKeys).map(([labelKey, localeKey]) => [labelKey, localeService.t(localeKey)])
    ) as unknown as IObjectListPanelLabels;
}

export function getObjectListPanelTypeName(localeService: IObjectListPanelLocaleService, typeName: ObjectListPanelTypeNameKey): string {
    return localeService.t(`drawing-ui.objectListPanel.typeNames.${typeName}`);
}

export interface IObjectListPanelBaseProps {
    items: IObjectListPanelItem[];
    selectedIds: string[];
    allObjectIds?: string[];
    focusedId?: string | null;
    labels: IObjectListPanelLabels;
    showHeader?: boolean;
    capabilities?: IObjectListPanelCapabilities;
    onSelect: (objectId: string, multiSelect: boolean) => void;
    onSetVisible: (objectIds: string[], visible: boolean) => void;
    onCommitName: (objectId: string, value: string) => void;
    onCommitDescription: (objectId: string, value: string) => void;
    onMoveForward?: (objectId: string) => void;
    onMoveBackward?: (objectId: string) => void;
    onToggleExpanded?: (objectId: string) => void;
    onToggleSelectable?: (objectId: string) => void;
    onLocate?: (objectId: string) => void;
    onReorder?: (sourceObjectId: string, targetObjectId: string) => void;
}

const iconButtonClassName = `
  univer-flex univer-size-7 univer-shrink-0 univer-items-center univer-justify-center univer-rounded-md
  univer-border-0 univer-bg-transparent univer-p-0 univer-text-gray-500 univer-outline-none univer-transition-colors
  hover:univer-bg-gray-100 hover:univer-text-gray-900
  disabled:univer-cursor-not-allowed disabled:univer-opacity-40
  dark:!univer-text-gray-300 dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-gray-100
`;

const sectionOrder = new Map([
    [OBJECT_LIST_FLOATING_SECTION_ID, 0],
    [OBJECT_LIST_CANVAS_SECTION_ID, 1],
    ['', 2],
]);

function normalizeText(value: string): string {
    return value.trim();
}

function hasCapability(
    panelCapabilities: IObjectListPanelCapabilities | undefined,
    item: IObjectListPanelItem | null | undefined,
    key: keyof IObjectListPanelCapabilities,
    fallback = true
): boolean {
    return item?.capabilities?.[key] ?? panelCapabilities?.[key] ?? fallback;
}

export function ObjectListPanelBase(props: IObjectListPanelBaseProps) {
    const {
        items,
        selectedIds,
        allObjectIds,
        focusedId,
        labels,
        showHeader = true,
        capabilities,
        onSelect,
        onSetVisible,
        onCommitName,
        onCommitDescription,
        onMoveForward,
        onMoveBackward,
        onToggleExpanded,
        onToggleSelectable,
        onLocate,
        onReorder,
    } = props;
    const selectedIdSet = useMemo(() => new Set(selectedIds), [selectedIds]);
    const [draggingId, setDraggingId] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterMode, setFilterMode] = useState<ObjectListFilterMode>('all');
    const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(() => new Set());
    const selectedItem = useMemo(
        () => items.find((item) => item.id === focusedId) ?? items.find((item) => selectedIdSet.has(item.id)) ?? null,
        [focusedId, items, selectedIdSet]
    );
    const visibleItems = useMemo(() => {
        const normalizedQuery = normalizeText(searchQuery).toLocaleLowerCase();

        return items.filter((item) => {
            if (filterMode === 'hidden' && item.visible !== false) {
                return false;
            }
            if (filterMode === 'locked' && item.selectable !== false) {
                return false;
            }
            if (!normalizedQuery) {
                return true;
            }

            return item.name.toLocaleLowerCase().includes(normalizedQuery) ||
                (item.description ?? '').toLocaleLowerCase().includes(normalizedQuery);
        });
    }, [filterMode, items, searchQuery]);
    const visibleItemSections = useMemo(() => {
        const sectionMap = new Map<string, { id: string; title: string; items: IObjectListPanelItem[] }>();

        visibleItems.forEach((item) => {
            const sectionId = item.sectionId ?? '';
            const existingSection = sectionMap.get(sectionId);
            if (existingSection) {
                existingSection.items.push(item);
                return;
            }

            sectionMap.set(sectionId, {
                id: sectionId,
                title: item.sectionTitle ?? '',
                items: [item],
            });
        });

        return [...sectionMap.values()].sort((a, b) => (sectionOrder.get(a.id) ?? 3) - (sectionOrder.get(b.id) ?? 3));
    }, [visibleItems]);
    const showSectionHeaders = visibleItemSections.length > 1 || visibleItemSections.some((section) => section.id === OBJECT_LIST_FLOATING_SECTION_ID);
    const allIds = useMemo(() => allObjectIds ?? items.map((item) => item.id), [allObjectIds, items]);
    const selectedIndex = selectedItem ? items.findIndex((item) => item.id === selectedItem.id) : -1;
    const canMoveForward = !!selectedItem && !!onMoveForward && !selectedItem.disabled && (
        selectedItem.canMoveForward ?? selectedIndex > 0
    ) && hasCapability(capabilities, selectedItem, 'arrange');
    const canMoveBackward = !!selectedItem && !!onMoveBackward && !selectedItem.disabled && (
        selectedItem.canMoveBackward ?? (selectedIndex >= 0 && selectedIndex < items.length - 1)
    ) && hasCapability(capabilities, selectedItem, 'arrange');
    const showArrangeControls = hasCapability(capabilities, selectedItem, 'arrange') && (!!onMoveForward || !!onMoveBackward);
    const showLocateControl = !!onLocate && hasCapability(capabilities, selectedItem, 'locate');
    const canReorder = !!onReorder && (capabilities?.reorder ?? true);

    const findItem = (objectId: string | null): IObjectListPanelItem | null => {
        return objectId ? items.find((item) => item.id === objectId) ?? null : null;
    };

    const handleDrop = (targetId: string) => {
        const source = findItem(draggingId);
        const target = findItem(targetId);
        setDraggingId(null);
        if (!source || !target || source.id === target.id || source.disabled || target.disabled) {
            return;
        }
        if ((source.parentId ?? '') !== (target.parentId ?? '')) {
            return;
        }
        if ((source.sectionId ?? '') !== (target.sectionId ?? '')) {
            return;
        }
        if (source.canReorder === false || target.canReorder === false) {
            return;
        }

        onReorder?.(source.id, target.id);
    };

    const toggleSectionCollapsed = (sectionId: string) => {
        if (!sectionId) {
            return;
        }

        setCollapsedSectionIds((current) => {
            const next = new Set(current);
            if (next.has(sectionId)) {
                next.delete(sectionId);
            } else {
                next.add(sectionId);
            }

            return next;
        });
    };

    return (
        <div
            className="
              univer-box-border univer-flex univer-size-full univer-min-w-0 univer-max-w-full univer-flex-col
              univer-gap-3 univer-overflow-hidden univer-text-gray-700
              dark:!univer-text-gray-200
            "
            data-drawing-object-list-panel="true"
        >
            {showHeader && (
                <div className="univer-flex univer-h-8 univer-shrink-0 univer-items-center univer-gap-2">
                    <div
                        className="
                          univer-min-w-0 univer-flex-1 univer-truncate univer-text-sm univer-font-semibold
                          univer-text-gray-900
                          dark:!univer-text-gray-100
                        "
                    >
                        {labels.title}
                    </div>
                </div>
            )}

            <div className="univer-flex univer-min-w-0 univer-items-center univer-justify-between univer-gap-2">
                <div className="univer-flex univer-min-w-0 univer-gap-2">
                    <Button size="small" disabled={items.length === 0} onClick={() => onSetVisible(allIds, true)}>
                        {labels.showAll}
                    </Button>
                    <Button size="small" disabled={items.length === 0} onClick={() => onSetVisible(allIds, false)}>
                        {labels.hideAll}
                    </Button>
                </div>
                <div className="univer-flex univer-shrink-0 univer-gap-1">
                    {showLocateControl && (
                        <button
                            type="button"
                            className={iconButtonClassName}
                            title={labels.locate}
                            aria-label={labels.locate}
                            disabled={!selectedItem?.id}
                            onClick={() => selectedItem && onLocate?.(selectedItem.id)}
                        >
                            <LocateFixedIcon />
                        </button>
                    )}
                    {showArrangeControls && (
                        <>
                            <button
                                type="button"
                                className={iconButtonClassName}
                                title={labels.moveForward}
                                aria-label={labels.moveForward}
                                disabled={!canMoveForward}
                                onClick={() => selectedItem && onMoveForward?.(selectedItem.id)}
                            >
                                <ArrowUpIcon />
                            </button>
                            <button
                                type="button"
                                className={iconButtonClassName}
                                title={labels.moveBackward}
                                aria-label={labels.moveBackward}
                                disabled={!canMoveBackward}
                                onClick={() => selectedItem && onMoveBackward?.(selectedItem.id)}
                            >
                                <ArrowDownIcon />
                            </button>
                        </>
                    )}
                </div>
            </div>

            <div className="univer-flex univer-shrink-0 univer-flex-col univer-gap-2">
                <Input
                    value={searchQuery}
                    aria-label={labels.search}
                    placeholder={labels.search}
                    onChange={setSearchQuery}
                />
                <div className="univer-flex univer-min-w-0 univer-gap-1">
                    {([
                        ['all', labels.filterAll],
                        ['hidden', labels.filterHidden],
                        ['locked', labels.filterLocked],
                    ] as const).map(([mode, label]) => (
                        <button
                            key={mode}
                            type="button"
                            className={clsx(
                                `
                                  univer-h-7 univer-min-w-0 univer-flex-1 univer-rounded-md univer-border
                                  univer-border-solid univer-px-2 univer-text-xs univer-outline-none
                                  univer-transition-colors
                                  dark:!univer-border-gray-700
                                `,
                                filterMode === mode
                                    ? `
                                      dark:!univer-bg-primary-900/30
                                      univer-border-primary-500 univer-bg-primary-50 univer-text-primary-600
                                      dark:!univer-text-primary-200
                                    `
                                    : `
                                      univer-border-gray-200 univer-bg-white univer-text-gray-600
                                      hover:univer-bg-gray-50
                                      dark:!univer-bg-gray-900 dark:!univer-text-gray-300
                                      dark:hover:!univer-bg-gray-800
                                    `
                            )}
                            aria-pressed={filterMode === mode}
                            onClick={() => setFilterMode(mode)}
                        >
                            <span className="univer-block univer-truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div className="univer-min-h-0 univer-flex-1 univer-overflow-y-auto univer-overflow-x-hidden">
                {visibleItems.length === 0
                    ? <div className="univer-py-6 univer-text-center univer-text-sm univer-text-gray-500">{labels.empty}</div>
                    : (
                        <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-0.5">
                            {visibleItemSections.map((section) => (
                                <div
                                    key={section.id || 'default'}
                                    className="univer-flex univer-min-w-0 univer-flex-col univer-gap-0.5"
                                >
                                    {showSectionHeaders && section.title && (() => {
                                        const sectionCollapsed = !!section.id && collapsedSectionIds.has(section.id);

                                        return (
                                            <button
                                                type="button"
                                                className="
                                                  univer-box-border univer-flex univer-h-7 univer-w-full
                                                  univer-items-center univer-gap-1 univer-rounded-md univer-border-0
                                                  univer-bg-transparent univer-px-2 univer-pt-1 univer-text-xs
                                                  univer-font-semibold univer-uppercase univer-text-gray-400
                                                  univer-outline-none
                                                  hover:univer-bg-gray-50 hover:univer-text-gray-600
                                                  disabled:univer-cursor-default
                                                  disabled:hover:univer-bg-transparent
                                                  dark:!univer-text-gray-500
                                                  dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-gray-300
                                                "
                                                aria-label={sectionCollapsed ? labels.expand : labels.collapse}
                                                disabled={!section.id}
                                                onClick={() => toggleSectionCollapsed(section.id)}
                                            >
                                                {section.id
                                                    ? (
                                                        <span
                                                            className="
                                                              univer-flex univer-size-4 univer-shrink-0
                                                              univer-items-center univer-justify-center
                                                            "
                                                        >
                                                            {sectionCollapsed ? <MoreRightIcon /> : <MoreDownIcon />}
                                                        </span>
                                                    )
                                                    : <span className="univer-size-4 univer-shrink-0" />}
                                                <span
                                                    className="
                                                      univer-min-w-0 univer-flex-1 univer-truncate univer-text-left
                                                    "
                                                >
                                                    {section.title}
                                                </span>
                                                <span
                                                    className="
                                                      univer-shrink-0 univer-text-[10px] univer-font-medium
                                                      univer-text-gray-400
                                                      dark:!univer-text-gray-500
                                                    "
                                                >
                                                    {section.items.length}
                                                </span>
                                            </button>
                                        );
                                    })()}
                                    {(!section.id || !collapsedSectionIds.has(section.id)) && section.items.map((item) => (
                                        <ObjectListRow
                                            key={item.id}
                                            item={item}
                                            selected={selectedIdSet.has(item.id)}
                                            labels={labels}
                                            showLock={!!onToggleSelectable && hasCapability(capabilities, item, 'selectable')}
                                            showName={hasCapability(capabilities, item, 'name')}
                                            showVisible={hasCapability(capabilities, item, 'visible')}
                                            draggable={canReorder && hasCapability(capabilities, item, 'reorder') && !item.disabled && item.canReorder !== false}
                                            dragging={draggingId === item.id}
                                            onSelect={(multiSelect) => onSelect(item.id, multiSelect)}
                                            onToggleExpanded={() => onToggleExpanded?.(item.id)}
                                            onToggleVisible={() => onSetVisible([item.id], !item.visible)}
                                            onToggleSelectable={() => onToggleSelectable?.(item.id)}
                                            onCommitName={(value) => onCommitName(item.id, value)}
                                            onDragStart={() => setDraggingId(item.id)}
                                            onDragEnd={() => setDraggingId(null)}
                                            onDrop={() => handleDrop(item.id)}
                                        />
                                    ))}
                                </div>
                            ))}
                        </div>
                    )}
            </div>

            <ObjectDetailsEditor
                item={selectedItem}
                labels={labels}
                showName={hasCapability(capabilities, selectedItem, 'name')}
                showDescription={hasCapability(capabilities, selectedItem, 'description')}
                onCommitName={(value) => selectedItem && onCommitName(selectedItem.id, value)}
                onCommitDescription={(value) => selectedItem && onCommitDescription(selectedItem.id, value)}
            />
        </div>
    );
}

function ObjectListRow(props: {
    item: IObjectListPanelItem;
    selected: boolean;
    labels: IObjectListPanelLabels;
    showLock: boolean;
    showName: boolean;
    showVisible: boolean;
    draggable: boolean;
    dragging: boolean;
    onSelect: (multiSelect: boolean) => void;
    onToggleExpanded: () => void;
    onToggleVisible: () => void;
    onToggleSelectable: () => void;
    onCommitName: (value: string) => void;
    onDragStart: () => void;
    onDragEnd: () => void;
    onDrop: () => void;
}) {
    const { item, selected, labels, showLock, showName, showVisible, draggable, dragging, onSelect, onToggleExpanded, onToggleVisible, onToggleSelectable, onCommitName, onDragStart, onDragEnd, onDrop } = props;
    const [draftName, setDraftName] = useState(item.name);
    const skipCommitOnBlurRef = useRef(false);
    const disabled = item.disabled === true;
    const level = item.level ?? 0;
    const locked = item.selectable === false;

    useEffect(() => {
        setDraftName(item.name);
    }, [item.name]);

    const handleBlur = (event: FocusEvent<HTMLInputElement>) => {
        if (disabled) {
            return;
        }
        if (skipCommitOnBlurRef.current) {
            skipCommitOnBlurRef.current = false;
            return;
        }
        if (event.currentTarget.value !== item.name) {
            onCommitName(event.currentTarget.value);
        }
    };

    const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
        if (event.key === 'Enter') {
            event.currentTarget.blur();
            return;
        }
        if (event.key === 'Escape') {
            skipCommitOnBlurRef.current = true;
            setDraftName(item.name);
            event.currentTarget.blur();
        }
    };

    return (
        <div
            className={clsx(
                `
                  univer-box-border univer-flex univer-h-8 univer-w-full univer-min-w-0 univer-max-w-full
                  univer-items-center univer-gap-1.5 univer-overflow-hidden univer-rounded-md univer-pr-1.5
                  univer-transition-colors
                `,
                !disabled && `
                  hover:univer-bg-gray-100
                  dark:hover:!univer-bg-gray-800
                `,
                selected && `
                  univer-bg-gray-100
                  dark:!univer-bg-gray-800
                `,
                disabled && `
                  univer-text-gray-400
                  dark:!univer-text-gray-500
                `,
                dragging && 'univer-opacity-50'
            )}
            style={{ paddingLeft: level * 14 + 4 }}
            draggable={draggable}
            title={draggable ? labels.dragToReorder : undefined}
            onClick={disabled ? undefined : (event: MouseEvent<HTMLDivElement>) => onSelect(event.ctrlKey || event.metaKey)}
            onDragStart={(event: DragEvent<HTMLDivElement>) => {
                if (!draggable) {
                    event.preventDefault();
                    return;
                }
                event.dataTransfer.effectAllowed = 'move';
                event.dataTransfer.setData('text/plain', item.id);
                onDragStart();
            }}
            onDragEnd={onDragEnd}
            onDragOver={(event: DragEvent<HTMLDivElement>) => {
                if (draggable) {
                    event.preventDefault();
                    event.dataTransfer.dropEffect = 'move';
                }
            }}
            onDrop={(event: DragEvent<HTMLDivElement>) => {
                event.preventDefault();
                onDrop();
            }}
        >
            {item.isGroup
                ? (
                    <button
                        type="button"
                        className="
                          univer-flex univer-size-5 univer-shrink-0 univer-items-center univer-justify-center
                          univer-rounded univer-border-0 univer-bg-transparent univer-p-0 univer-text-gray-500
                          univer-outline-none univer-transition-transform
                          hover:univer-bg-gray-100 hover:univer-text-gray-900
                          dark:!univer-text-gray-300
                          dark:hover:!univer-bg-gray-800 dark:hover:!univer-text-gray-100
                        "
                        title={item.expanded ? labels.collapse : labels.expand}
                        aria-label={item.expanded ? labels.collapse : labels.expand}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleExpanded();
                        }}
                    >
                        {item.expanded ? <MoreDownIcon /> : <MoreRightIcon />}
                    </button>
                )
                : <span className="univer-size-5 univer-shrink-0" />}
            {showName
                ? (
                    <Input
                        key={item.name}
                        className={clsx('univer-h-7 univer-w-0 univer-min-w-0 univer-flex-1', disabled && `
                          univer-cursor-not-allowed
                        `)}
                        inputClass={clsx(
                            `
                              !univer-h-7 univer-min-w-0 univer-overflow-hidden univer-text-ellipsis
                              univer-whitespace-nowrap !univer-rounded !univer-border-transparent !univer-bg-transparent
                              !univer-px-1 univer-text-sm univer-text-gray-900 !univer-shadow-none
                              focus:!univer-border-primary-500 focus:!univer-bg-white focus:!univer-ring-1
                              focus:!univer-ring-primary-100
                              disabled:!univer-bg-transparent disabled:univer-opacity-100
                              dark:!univer-text-gray-100
                              dark:focus:!univer-bg-gray-900 dark:focus:!univer-ring-primary-900
                            `,
                            disabled && `
                              univer-text-gray-400
                              dark:!univer-text-gray-500
                            `
                        )}
                        inputStyle={{ maxWidth: '100%', boxSizing: 'border-box' }}
                        value={draftName}
                        disabled={disabled}
                        aria-label={labels.nameInput}
                        onChange={setDraftName}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!disabled) {
                                onSelect(event.ctrlKey || event.metaKey);
                            }
                        }}
                    />
                )
                : <span className="univer-min-w-0 univer-flex-1 univer-truncate univer-px-1 univer-text-sm">{item.name}</span>}
            {showLock && (
                <button
                    type="button"
                    className={clsx(iconButtonClassName, !locked && 'univer-opacity-70')}
                    disabled={disabled}
                    title={locked ? labels.unlock : labels.lock}
                    aria-label={locked ? labels.unlock : labels.lock}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleSelectable();
                    }}
                >
                    <LockIcon />
                </button>
            )}
            {showVisible && (
                <button
                    type="button"
                    className={iconButtonClassName}
                    disabled={disabled}
                    title={item.visible ? labels.hide : labels.show}
                    aria-label={item.visible ? labels.hide : labels.show}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleVisible();
                    }}
                >
                    {item.visible ? <EyeIcon /> : <EyelashIcon />}
                </button>
            )}
        </div>
    );
}

function ObjectDetailsEditor(props: {
    item: IObjectListPanelItem | null;
    labels: IObjectListPanelLabels;
    showName: boolean;
    showDescription: boolean;
    onCommitName: (value: string) => void;
    onCommitDescription: (value: string) => void;
}) {
    const { item, labels, showName, showDescription, onCommitName, onCommitDescription } = props;
    const [draftName, setDraftName] = useState(item?.name ?? '');
    const [draftDescription, setDraftDescription] = useState(item?.description ?? '');
    const disabled = item?.disabled === true;

    useEffect(() => {
        setDraftName(item?.name ?? '');
        setDraftDescription(item?.description ?? '');
    }, [item?.description, item?.id, item?.name]);

    if (!item) {
        return (
            <div
                className="
                  univer-rounded-md univer-border univer-border-solid univer-border-gray-200 univer-p-3 univer-text-sm
                  univer-text-gray-500
                  dark:!univer-border-gray-700 dark:!univer-text-gray-400
                "
            >
                {labels.noSelection}
            </div>
        );
    }

    return (
        <div
            className="
              univer-flex univer-shrink-0 univer-flex-col univer-gap-2 univer-border-0 univer-border-t
              univer-border-solid univer-border-gray-200 univer-pt-3
              dark:!univer-border-gray-700
            "
        >
            <div
                className="
                  univer-text-xs univer-font-semibold univer-uppercase univer-text-gray-500
                  dark:!univer-text-gray-400
                "
            >
                {labels.details}
            </div>
            {showName && (
                <label className="univer-flex univer-flex-col univer-gap-1">
                    <span
                        className="
                          univer-text-xs univer-text-gray-500
                          dark:!univer-text-gray-400
                        "
                    >
                        {labels.name}
                    </span>
                    <Input
                        value={draftName}
                        aria-label={labels.nameInput}
                        disabled={disabled}
                        onChange={setDraftName}
                        onBlur={() => {
                            if (!disabled && normalizeText(draftName) !== item.name) {
                                onCommitName(draftName);
                            }
                        }}
                        onKeyDown={(event) => {
                            if (event.key === 'Enter') {
                                event.currentTarget.blur();
                            }
                        }}
                    />
                </label>
            )}
            {showDescription && (
                <label className="univer-flex univer-flex-col univer-gap-1">
                    <span
                        className="
                          univer-text-xs univer-text-gray-500
                          dark:!univer-text-gray-400
                        "
                    >
                        {labels.description}
                    </span>
                    <textarea
                        className="
                          univer-box-border univer-min-h-16 univer-w-full univer-resize-none univer-rounded-md
                          univer-border univer-border-solid univer-border-gray-200 univer-bg-white univer-p-2
                          univer-text-sm univer-text-gray-900 univer-outline-none
                          focus:univer-border-primary-500 focus:univer-ring-1 focus:univer-ring-primary-100
                          disabled:univer-cursor-not-allowed disabled:univer-opacity-70
                          dark:!univer-border-gray-700 dark:!univer-bg-gray-900 dark:!univer-text-gray-100
                          dark:focus:!univer-ring-primary-900
                        "
                        value={draftDescription}
                        disabled={disabled}
                        placeholder={labels.descriptionPlaceholder}
                        aria-label={labels.description}
                        onChange={(event) => setDraftDescription(event.currentTarget.value)}
                        onBlur={() => {
                            if (!disabled && normalizeText(draftDescription) !== (item.description ?? '')) {
                                onCommitDescription(draftDescription);
                            }
                        }}
                    />
                </label>
            )}
        </div>
    );
}

export type IDrawingObjectListItem = IObjectListPanelItem;
export type IDrawingObjectListPanelLabels = IObjectListPanelLabels;
export type IDrawingObjectListPanelProps = IObjectListPanelBaseProps;
