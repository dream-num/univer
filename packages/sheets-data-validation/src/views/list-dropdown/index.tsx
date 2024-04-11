/**
 * Copyright 2023-present DreamNum Inc.
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

import { DataValidationRenderMode, DataValidationType, ICommandService, LocaleService } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { CheckMarkSingle } from '@univerjs/icons';
import { IEditorBridgeService } from '@univerjs/sheets-ui';
import { KeyCode } from '@univerjs/ui';
import { DeviceInputEventType } from '@univerjs/engine-render';
import { RectPopup, Scrollbar } from '@univerjs/design';
import type { ListMultipleValidator } from '../../validators/list-multiple-validator';
import { deserializeListOptions, getDataValidationCellValue, serializeListOptions } from '../../validators/util';
import type { IDropdownComponentProps } from '../../services/dropdown-manager.service';
import { DROP_DOWN_DEFAULT_COLOR } from '../../common/const';
import { OpenValidationPanelOperation } from '../../commands/operations/data-validation.operation';
import styles from './index.module.less';

interface ISelectListProps {
    value: string[];
    onChange: (val: string[]) => void;
    multiple?: boolean;
    options: { label: string;value: string; color?: string }[];
    title?: string;
    onEdit?: () => void;
    style?: React.CSSProperties;
}

const SelectList = (props: ISelectListProps) => {
    const { value, onChange, multiple, options, title, onEdit, style } = props;
    return (
        <div className={styles.dvListDropdown} style={style}>
            <div className={styles.dvListDropdownTitle}>
                {title}
            </div>
            <div className={styles.dvListDropdownList}>
                <Scrollbar>
                    <div className={styles.dvListDropdownListContainer}>
                        {options.map((item, i) => {
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
                            return (
                                <div key={i} className={styles.dvListDropdownItemContainer} onClick={handleClick}>
                                    <div className={styles.dvListDropdownItem} style={{ background: item.color || DROP_DOWN_DEFAULT_COLOR }}>{item.label}</div>
                                    <div className={styles.dvListDropdownSelectedIcon}>
                                        {selected ? <CheckMarkSingle /> : null}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </Scrollbar>
            </div>
            <div className={styles.dvListDropdownSplit} />
            <div className={styles.dvListDropdownEdit}>
                <a onClick={onEdit}>编辑</a>
            </div>
        </div>
    );
};

export function ListDropDown(props: IDropdownComponentProps) {
    const { location, hideFn } = props;
    const { worksheet, row, col, unitId, subUnitId } = location;
    const commandService = useDependency(ICommandService);
    const localeService = useDependency(LocaleService);
    const [localValue, setLocalValue] = useState('');
    const editorBridgeService = useDependency(IEditorBridgeService);
    const anchorRect = RectPopup.useContext();
    const cellWidth = anchorRect.right - anchorRect.left;
    if (!worksheet) {
        return null;
    }

    const cellData = worksheet.getCell(row, col);
    const rule = cellData?.dataValidation?.rule;
    const validator = cellData?.dataValidation?.validator as ListMultipleValidator | undefined;
    const showColor = rule?.renderMode === DataValidationRenderMode.CUSTOM || rule?.renderMode === undefined;

    if (!cellData || !rule || !validator) {
        return;
    }

    const multiple = rule.type === DataValidationType.LIST_MULTIPLE;
    const list = validator.getListWithColor(rule, unitId, subUnitId);
    const cellStr = localValue || getDataValidationCellValue(cellData);
    const value = deserializeListOptions(cellStr);

    const handleEdit = () => {
        commandService.executeCommand(OpenValidationPanelOperation.id, {
            ruleId: rule.uid,
        });
        hideFn();
    };

    return (
        <SelectList
            style={{ minWidth: cellWidth, maxWidth: Math.max(cellWidth, 200) }}
            title={multiple ? localeService.t('dataValidation.listMultiple.dropdown') : localeService.t('dataValidation.list.dropdown')}
            value={value}
            multiple={multiple}
            onChange={(newValue) => {
                const str = serializeListOptions(newValue);
                const params: ISetRangeValuesCommandParams = {
                    unitId,
                    subUnitId,
                    range: {
                        startColumn: col,
                        endColumn: col,
                        startRow: row,
                        endRow: row,
                    },
                    value: {
                        v: str,
                        p: null,
                        f: null,
                        si: null,
                    },
                };

                if (editorBridgeService.isVisible()) {
                    editorBridgeService.changeVisible({
                        visible: false,
                        keycode: KeyCode.ESC,
                        eventType: DeviceInputEventType.Keyboard,
                    });
                }

                commandService.executeCommand(SetRangeValuesCommand.id, params);
                setLocalValue(str);
                if (!multiple) {
                    hideFn();
                }
            }}
            options={list.map((item) => ({
                label: item.label,
                value: item.label,
                color: showColor ? item.color : 'transparent',
            }))}
            onEdit={handleEdit}
        />
    );
}
