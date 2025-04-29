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

import type { DocumentDataModel } from '@univerjs/core';
import type { IRichTextEditingMutationParams } from '@univerjs/docs';
import type { ISheetLocation } from '@univerjs/sheets';
import type { IPopup } from '@univerjs/ui';
import type { IBaseDropdownProps } from '../type';
import { BuildTextUtils, ICommandService, IUniverInstanceService, LocaleService, UniverInstanceType } from '@univerjs/core';
import { clsx, scrollbarClassName } from '@univerjs/design';
import { RichTextEditingMutation } from '@univerjs/docs';
import { CheckMarkSingle } from '@univerjs/icons';
import { RangeProtectionPermissionEditPoint, SheetPermissionCheckController, WorkbookEditablePermission, WorksheetEditPermission } from '@univerjs/sheets';
import { RectPopup, useDependency } from '@univerjs/ui';
import React, { useEffect, useMemo, useState } from 'react';
import { IEditorBridgeService } from '../../../services/editor-bridge.service';
import styles from './index.module.less';

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
    style?: React.CSSProperties;
    filter?: string;
    location: ISheetLocation;
    showEdit?: boolean;
}

const SelectList = (props: ISelectListProps) => {
    const { value, onChange, multiple, options, title, onEdit, style, filter, location, showEdit: showEditOnDropdown } = props;
    const localeService = useDependency(LocaleService);
    const lowerFilter = filter?.toLowerCase();
    const { row, col, unitId, subUnitId } = location;
    const filteredOptions = options.filter((item) => lowerFilter ? item.label.toLowerCase().includes(lowerFilter) : true);
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
        <div className={styles.dvListDropdown} style={style}>
            <div className={styles.dvListDropdownTitle}>
                {title}
            </div>
            <div className="univer-max-h-52">
                <div
                    key={filter}
                    className={clsx('univer-px-2', scrollbarClassName)}
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
                        return (
                            <div key={i} className={styles.dvListDropdownItemContainer} onClick={handleClick}>
                                <div className={styles.dvListDropdownItem} style={{ background: item.color }}>
                                    {lowerFilter && item.label.toLowerCase().includes(lowerFilter)
                                        ? (
                                            <>
                                                <span>{item.label.substring(0, index)}</span>
                                                <span style={{ fontWeight: 'bold' }}>{item.label.substring(index, index + lowerFilter.length)}</span>
                                                <span>{item.label.substring(index + lowerFilter.length)}</span>
                                            </>
                                        )
                                        : item.label}
                                </div>
                                <div className={styles.dvListDropdownSelectedIcon}>
                                    {selected ? <CheckMarkSingle /> : null}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
            {showEditOnDropdown && hasPermission
                ? (
                    <>
                        <div className={styles.dvListDropdownSplit} />
                        <div className={styles.dvListDropdownEdit}>
                            <a onClick={onEdit}>{localeService.t('dataValidation.list.edit')}</a>
                        </div>
                    </>
                )
                : null}
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
}

export function ListDropDown(props: { popup: IPopup<IListDropdownProps & IBaseDropdownProps> }) {
    const { popup: { extraProps } } = props;
    const { location, hideFn, onChange, onEdit, options, defaultValue, multiple, showEdit } = extraProps!;
    const { worksheet } = location;
    const [editingText, setEditingText] = useState('');
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localValue, setLocalValue] = useState(defaultValue);
    const editorBridgeService = useDependency(IEditorBridgeService);
    const instanceService = useDependency(IUniverInstanceService);
    const anchorRect = RectPopup.useContext();
    const cellWidth = (anchorRect.current?.right ?? 0) - (anchorRect.current?.left ?? 0);

    useEffect(() => {
        const dispose = commandService.onCommandExecuted((command) => {
            if (command.id === RichTextEditingMutation.id) {
                const params = command.params as IRichTextEditingMutationParams;
                const { unitId } = params;
                const unit = instanceService.getUnit<DocumentDataModel>(unitId, UniverInstanceType.UNIVER_DOC);
                if (!unit || !editorBridgeService.isVisible().visible) return;
                const text = BuildTextUtils.transform.getPlainText(unit.getSnapshot().body?.dataStream ?? '');
                setEditingText(text);
            }
        });

        return () => {
            dispose.dispose();
        };
    }, [commandService, editorBridgeService, instanceService]);

    if (!worksheet) {
        return null;
    }

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
            filter={editingText}
            location={location}
            showEdit={showEdit}
        />
    );
}

ListDropDown.componentKey = 'sheets.dropdown.list';
