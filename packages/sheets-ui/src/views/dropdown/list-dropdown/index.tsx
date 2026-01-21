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

import type { ISheetLocation } from '@univerjs/sheets';
import type { IPopup } from '@univerjs/ui';
import type { CSSProperties } from 'react';
import type { IBaseDropdownProps } from '../type';
import {
    ColorKit,
    LocaleService,
} from '@univerjs/core';
import { borderClassName, borderTopClassName, clsx, scrollbarClassName } from '@univerjs/design';
import {
    RangeProtectionPermissionEditPoint,
    SheetPermissionCheckController,
    WorkbookEditablePermission,
    WorksheetEditPermission,
} from '@univerjs/sheets';
import { ComponentManager, useDependency } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';

function serializeListOptions(options: string[]) {
    return options.filter(Boolean).join(',');
}

function deserializeListOptions(optionsStr: string) {
    return optionsStr.split(',').filter(Boolean);
}

interface ISelectListProps {
    value: string[];
    onChange: (val: string[]) => void;
    multiple?: boolean;
    options: { label: string; value: string; color?: string }[];
    title?: string;
    onEdit?: () => void;
    style?: CSSProperties;
    location: ISheetLocation;
    showEdit?: boolean;
    showSearch?: boolean;
}

function SelectList(props: ISelectListProps) {
    const { value, onChange, multiple, options, title, onEdit, style, location, showEdit: showEditOnDropdown, showSearch: showSearchOnDropdown } = props;
    const localeService = useDependency(LocaleService);
    const componentManager = useDependency(ComponentManager);

    const CheckMarkIcon = componentManager.get('CheckMarkIcon');

    const { row, col, unitId, subUnitId } = location;

    const searchRef = useRef<HTMLInputElement>(null);
    useEffect(() => {
        let timer: NodeJS.Timeout | null = null;

        if (showSearchOnDropdown) {
            timer = setTimeout(() => {
                searchRef.current?.focus();
            }, 0);
        }

        return () => {
            if (timer) {
                clearTimeout(timer);
            }
        };
    }, [showSearchOnDropdown]);

    const [lowerFilter, setLowerFilter] = useState('');
    const filteredOptions = useMemo(() => {
        return options.filter((item) => lowerFilter ? item.label.toLowerCase().includes(lowerFilter) : true);
    }, [options, lowerFilter]);

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setLowerFilter(e.target.value.toLowerCase());
    };

    const sheetPermissionCheckController = useDependency(SheetPermissionCheckController);
    const hasPermission = useMemo(() => sheetPermissionCheckController.permissionCheckWithRanges(
        {
            workbookTypes: [WorkbookEditablePermission],
            rangeTypes: [RangeProtectionPermissionEditPoint],
            worksheetTypes: [WorksheetEditPermission],
        },
        [{ startColumn: col, startRow: row, endColumn: col, endRow: row }],
        unitId,
        subUnitId
    ), [sheetPermissionCheckController, col, row, unitId, subUnitId]);

    return (
        <div
            data-u-comp="sheets-dropdown-list"
            className={clsx(`
              univer-box-border univer-rounded-lg univer-bg-white univer-py-1 univer-text-gray-900 univer-shadow
              dark:!univer-bg-black dark:!univer-text-white
            `, borderClassName)}
            style={style}
        >
            {showSearchOnDropdown && (
                <div className="univer-box-border univer-flex univer-w-full univer-px-2">
                    <input
                        ref={searchRef}
                        className={`
                          univer-w-full univer-rounded-md univer-border univer-border-[rgba(13,13,13,0.12)] univer-px-2
                          univer-py-1 univer-text-sm
                          focus:univer-border-primary-500 focus:univer-outline-none
                          dark:!univer-text-white
                        `}
                        type="text"
                        value={lowerFilter}
                        autoFocus
                        onChange={handleSearchChange}
                    />
                </div>
            )}
            <div className="univer-px-3.5 univer-py-1 univer-pt-2 univer-text-xs">{title}</div>
            <div
                key={lowerFilter}
                className={clsx(`
                  univer-flex univer-max-h-52 univer-flex-col univer-gap-1 univer-overflow-y-auto univer-px-2
                  univer-py-1
                `, scrollbarClassName)}
            >
                {filteredOptions.map((item, i) => {
                    const selected = value.indexOf(item.value) > -1;
                    const handleClick = () => {
                        let set: Set<string>;
                        if (selected) {
                            set = new Set(value.filter((sub) => sub !== item.value));
                        } else {
                            set = new Set(multiple ? [...value, item.value] : [item.value]);
                        }
                        const newValue: string[] = [];
                        options.forEach((opt) => {
                            if (set.has(opt.value)) {
                                newValue.push(opt.value);
                            }
                        });

                        onChange(newValue);
                    };

                    const index = item.label.toLocaleLowerCase().indexOf(lowerFilter!);

                    const isDark = new ColorKit(item.color).isDark();

                    return (
                        <div
                            key={i}
                            className={`
                              univer-flex univer-cursor-pointer univer-flex-row univer-items-center
                              univer-justify-between univer-rounded-md univer-px-1.5 univer-py-1
                              hover:univer-bg-gray-50
                              dark:hover:!univer-bg-gray-700
                            `}
                            onClick={handleClick}
                        >
                            <div
                                className={clsx(`
                                  univer-inline-flex univer-h-4 univer-w-fit univer-items-center univer-truncate
                                  univer-rounded-full univer-px-1.5 univer-text-xs
                                `, {
                                    'univer-text-gray-900': !isDark,
                                    'univer-text-white': isDark,
                                })}
                                style={{ background: item.color }}
                            >
                                {lowerFilter && item.label.toLowerCase().includes(lowerFilter)
                                    ? (
                                        <>
                                            <span>{item.label.substring(0, index)}</span>
                                            <span className="univer-font-semibold">{item.label.substring(index, index + lowerFilter.length)}</span>
                                            <span>{item.label.substring(index + lowerFilter.length)}</span>
                                        </>
                                    )
                                    : item.label}
                            </div>
                            <div
                                className={`
                                  univer-ml-3 univer-h-4 univer-w-4 univer-flex-shrink-0 univer-flex-grow-0
                                  univer-text-base univer-text-primary-500
                                `}
                            >
                                {selected && <CheckMarkIcon className="univer-text-primary-600" />}
                            </div>
                        </div>
                    );
                })}
            </div>
            {(showEditOnDropdown && hasPermission) && (
                <div className={clsx('univer-box-border univer-px-2 univer-pt-1', borderTopClassName)}>
                    <a
                        className={`
                          univer-block univer-cursor-pointer univer-rounded univer-px-1.5 univer-py-1 univer-text-xs
                          hover:univer-bg-gray-100
                          dark:hover:!univer-bg-gray-800
                        `}
                        onClick={onEdit}
                    >
                        {localeService.t('dataValidation.list.edit')}
                    </a>
                </div>
            )}
        </div>
    );
};

export interface IListDropdownProps {
    multiple?: boolean;
    onEdit?: () => void;
    onChange?: (value: string[]) => boolean | Promise<boolean>;
    options: { label: string; value: string; color?: string }[];
    defaultValue?: string;
    showEdit?: boolean;
    showSearch?: boolean;
}

export function ListDropDown(props: { popup: IPopup<IListDropdownProps & IBaseDropdownProps> }) {
    const { popup: { extraProps, anchorRect } } = props;
    const { location, hideFn, onChange, onEdit, options, defaultValue, multiple, showSearch, showEdit } = extraProps!;

    const { worksheet } = location;
    if (!worksheet) return null;

    const localeService = useDependency(LocaleService);
    const [localValue, setLocalValue] = useState(defaultValue);
    const cellWidth = (anchorRect?.right ?? 0) - (anchorRect?.left ?? 0);

    return (
        <SelectList
            style={{ minWidth: cellWidth, maxWidth: Math.max(cellWidth, 200) }}
            title={multiple ? localeService.t('dataValidation.listMultiple.dropdown') : localeService.t('dataValidation.list.dropdown')}
            value={deserializeListOptions(localValue ?? '')}
            multiple={multiple}
            onChange={async (newValue) => {
                const str = serializeListOptions(newValue);
                setLocalValue(str);
                const success = await onChange?.(newValue);
                if (!(success === false)) {
                    hideFn();
                }
            }}
            options={options}
            onEdit={onEdit}
            location={location}
            showEdit={showEdit}
            showSearch={showSearch}
        />
    );
}

ListDropDown.componentKey = 'sheets.dropdown.list';
