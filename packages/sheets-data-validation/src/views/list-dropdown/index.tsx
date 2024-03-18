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

import { DataValidationType, ICommandService } from '@univerjs/core';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { IDropdownParam } from '@univerjs/sheets-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { CheckMarkSingle } from '@univerjs/icons';
import type { ListMultipleValidator } from '../../validators/list-multiple-validator';
import { deserializeListOptions, getDataValidationCellValue } from '../../validators/util';
import styles from './index.module.less';

interface ISelectListProps {
    value: string[];
    onChange: (val: string[]) => void;
    multiple?: boolean;
    options: { label: string;value: string; color?: string }[];
    title?: string;
}

const SelectList = (props: ISelectListProps) => {
    const { value, onChange, multiple, options, title } = props;
    return (
        <div className={styles.dvListDropdown}>
            <div className={styles.dvListDropdownTitle}>
                {title}
            </div>
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
                        <div className={styles.dvListDropdownItem} style={{ background: '#ECECEC' }}>{item.label}</div>
                        <div className={styles.dvListDropdownSelectedIcon}>
                            {selected ? <CheckMarkSingle /> : null}
                        </div>
                    </div>
                );
            })}
            <div className={styles.dvListDropdownSplit} />
            <div className={styles.dvListDropdownEdit}>
                编辑
            </div>
        </div>
    );
};

export function ListDropDown(props: IDropdownParam) {
    const { location } = props;
    const { worksheet, row, col, unitId, subUnitId } = location;
    const commandService = useDependency(ICommandService);
    const [localValue, setLocalValue] = useState('');

    if (!worksheet) {
        return null;
    }

    const cellData = worksheet.getCell(row, col);
    const rule = cellData?.dataValidation?.rule;
    const validator = cellData?.dataValidation?.validator as ListMultipleValidator | undefined;

    if (!cellData || !rule || !validator) {
        return;
    }

    const multiple = rule.type === DataValidationType.LIST_MULTIPLE;
    const list = validator.getList(rule, unitId, subUnitId);
    const cellStr = localValue || getDataValidationCellValue(cellData);
    const value = deserializeListOptions(cellStr);

    return (
        <SelectList
            value={value}
            multiple={multiple}
            onChange={(newValue) => {
                const str = newValue.join(',');
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
                    },
                };
                commandService.executeCommand(SetRangeValuesCommand.id, params);
                setLocalValue(str);
            }}
            options={list.map((str) => ({
                label: str,
                value: str,
            }))}
        />
    );
}
