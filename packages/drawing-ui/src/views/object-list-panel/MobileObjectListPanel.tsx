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

import type { ComponentProps } from 'react';
import type { IObjectListPanelBaseProps, IObjectListRowProps } from './ObjectListPanelBase';
import { Button, clsx, Input, StateIconButton } from '@univerjs/design';
import { ArrowDownIcon, ArrowUpIcon, EyeIcon, EyelashIcon, LocateFixedIcon, LockIcon, MoreDownIcon, UnlockIcon } from '@univerjs/icons';
import { hasCapability, ObjectDetailsEditor, useObjectListPanel, useObjectListRow } from './ObjectListPanelBase';

const mobileIconButtonClassName = `
  univer-flex univer-size-11 univer-shrink-0 univer-items-center univer-justify-center univer-rounded-xl
  univer-border-0 univer-bg-gray-100 univer-p-0 univer-text-lg univer-text-gray-600 univer-outline-none
  active:univer-scale-95 active:univer-bg-primary-100 active:univer-text-primary-600
  disabled:univer-opacity-40
  dark:!univer-bg-gray-800 dark:!univer-text-gray-200
`;

function MobileObjectListInput(props: ComponentProps<typeof Input>) {
    return (
        <Input
            {...props}
            className={clsx(props.className, 'univer-h-12')}
            inputClass={clsx(props.inputClass, '!univer-text-base')}
        />
    );
}

export function MobileObjectListPanel(props: IObjectListPanelBaseProps) {
    const { labels, capabilities, onSelect, onSetVisible, onCommitName, onCommitDescription, onMoveForward, onMoveBackward, onToggleExpanded, onToggleSelectable, onSetSelectable, onLocate, renderPermissionAction } = props;
    const { selectedIdSet, draggingId, setDraggingId, searchQuery, setSearchQuery, filterMode, setFilterMode, collapsedSectionIds, selectedItem, visibleItems, visibleItemSections, showSectionHeaders, visibilityItems, selectableItems, allVisible, allLocked, canMoveForward, canMoveBackward, showArrangeControls, showLocateControl, canReorder, handleDrop, toggleSectionCollapsed } = useObjectListPanel(props);
    return (
        <div
            className={clsx(`
              univer-box-border univer-flex univer-min-w-0 univer-max-w-full univer-flex-col univer-gap-3 univer-py-2
              univer-text-gray-700
              dark:!univer-text-gray-200
            `, 'univer-h-auto univer-overflow-visible univer-pb-4')}
            data-drawing-object-list-panel="true"
        >

            <div className="univer-flex univer-min-w-0 univer-flex-col univer-gap-2">
                <div className="univer-flex univer-w-full univer-min-w-0 univer-gap-2">
                    <Button
                        className="univer-h-12 univer-flex-1"
                        size="middle"
                        disabled={visibilityItems.length === 0}
                        onClick={() => onSetVisible(visibilityItems.map((item) => item.id), !allVisible)}
                    >
                        {allVisible ? labels.hideAll : labels.showAll}
                    </Button>
                    {onSetSelectable && (
                        <Button
                            size="middle"
                            className="univer-h-12 univer-flex-1"
                            disabled={selectableItems.length === 0}
                            onClick={() => onSetSelectable(selectableItems.map((item) => item.id), allLocked)}
                        >
                            {allLocked ? (labels.unlockAll ?? labels.unlock) : (labels.lockAll ?? labels.lock)}
                        </Button>
                    )}
                </div>
                <div className="univer-flex univer-shrink-0 univer-justify-end univer-gap-1">
                    {showLocateControl && (
                        <button
                            type="button"
                            className={mobileIconButtonClassName}

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
                                className={mobileIconButtonClassName}

                                aria-label={labels.moveForward}
                                disabled={!canMoveForward}
                                onClick={() => selectedItem && onMoveForward?.(selectedItem.id)}
                            >
                                <ArrowUpIcon />
                            </button>
                            <button
                                type="button"
                                className={mobileIconButtonClassName}

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
                    className="univer-h-12"
                    inputClass="!univer-text-base"
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
                                  univer-min-w-0 univer-flex-1 univer-rounded-md univer-border univer-border-solid
                                  univer-px-2 univer-text-xs univer-outline-none univer-transition-colors
                                  dark:!univer-border-gray-700
                                `,
                                'univer-h-11 univer-text-sm',
                                filterMode === mode
                                    ? `
                                      dark:!univer-bg-primary-900/30
                                      univer-border-primary-500 univer-bg-primary-50 univer-text-primary-600
                                      dark:!univer-text-primary-200
                                    `
                                    : clsx(`
                                      univer-border-gray-200 univer-bg-gray-0 univer-text-gray-600
                                      dark:!univer-bg-gray-900 dark:!univer-text-gray-300
                                    `)
                            )}
                            aria-pressed={filterMode === mode}
                            onClick={() => setFilterMode(mode)}
                        >
                            <span className="univer-block univer-truncate">{label}</span>
                        </button>
                    ))}
                </div>
            </div>

            <div
                className="univer-flex-none univer-overflow-visible"
            >
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
                                                className={clsx(`
                                                  univer-box-border univer-flex univer-h-11 univer-w-full
                                                  univer-items-center univer-gap-1 univer-rounded-md univer-border-0
                                                  univer-bg-transparent univer-px-2 univer-pt-1 univer-text-xs
                                                  univer-font-semibold univer-uppercase univer-text-gray-400
                                                  univer-outline-none
                                                  disabled:univer-cursor-default
                                                  dark:!univer-text-gray-500
                                                `)}
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
                                                            <MoreDownIcon
                                                                className={clsx({
                                                                    '-univer-rotate-90 rtl:univer-rotate-90': sectionCollapsed,
                                                                })}
                                                            />
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
                                        <MobileObjectListRow
                                            key={item.id}
                                            item={item}
                                            selected={selectedIdSet.has(item.id)}
                                            labels={labels}
                                            permissionAction={renderPermissionAction?.(item)}
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
                InputComponent={MobileObjectListInput}
                descriptionClassName="!univer-text-base"
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

function MobileObjectListRow(props: IObjectListRowProps) {
    const { item, selected, labels, showLock, showName, showVisible, permissionAction, onSelect, onToggleExpanded, onToggleVisible, onToggleSelectable } = props;
    const { draftName, setDraftName, disabled, level, locked, handleBlur, handleKeyDown } = useObjectListRow(props);
    return (
        <div
            className={clsx(`
              univer-flex univer-min-h-12 univer-min-w-0 univer-items-center univer-gap-1.5 univer-rounded-xl
              univer-py-1 univer-pr-1.5
            `, selected
                ? 'univer-bg-primary-50'
                : `
                  univer-bg-gray-50
                  dark:!univer-bg-gray-800
                `, disabled && 'univer-opacity-50')}
            style={{ paddingLeft: level * 14 + 4 }}
            onClick={() => !disabled && onSelect(false)}
        >
            {item.isGroup
                ? (
                    <button
                        type="button"
                        className={mobileIconButtonClassName}
                        aria-label={item.expanded ? labels.collapse : labels.expand}
                        disabled={disabled}
                        onClick={(event) => {
                            event.stopPropagation();
                            onToggleExpanded();
                        }}
                    >
                        <MoreDownIcon
                            className={clsx(!item.expanded && `
                              -univer-rotate-90
                              rtl:univer-rotate-90
                            `)}
                        />
                    </button>
                )
                : <span className="univer-w-2 univer-shrink-0" />}
            {showName
                ? (
                    <MobileObjectListInput
                        className="univer-w-0 univer-min-w-0 univer-flex-1"
                        value={draftName}
                        disabled={disabled}
                        aria-label={labels.nameInput}
                        onChange={setDraftName}
                        onBlur={handleBlur}
                        onKeyDown={handleKeyDown}
                        onClick={(event) => {
                            event.stopPropagation();
                            if (!disabled) {
                                onSelect(false);
                            }
                        }}
                    />
                )
                : <span className="univer-min-w-0 univer-flex-1 univer-truncate univer-text-sm">{item.name}</span>}
            {permissionAction}
            {showLock && (
                <StateIconButton
                    active={locked}
                    emphasizeActive
                    className={mobileIconButtonClassName}
                    disabled={disabled}
                    aria-pressed={locked}
                    aria-label={locked ? labels.unlock : labels.lock}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleSelectable();
                    }}
                >
                    {locked ? <LockIcon /> : <UnlockIcon />}
                </StateIconButton>
            )}
            {showVisible && (
                <StateIconButton
                    active={!item.visible}
                    className={mobileIconButtonClassName}
                    disabled={disabled}
                    aria-pressed={!item.visible}
                    aria-label={item.visible ? labels.hide : labels.show}
                    onClick={(event) => {
                        event.stopPropagation();
                        onToggleVisible();
                    }}
                >
                    {item.visible ? <EyeIcon /> : <EyelashIcon />}
                </StateIconButton>
            )}
        </div>
    );
}
