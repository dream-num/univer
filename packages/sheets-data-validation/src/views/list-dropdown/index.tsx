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

import { ICommandService } from '@univerjs/core';
import { SelectList } from '@univerjs/design';
import type { ISetRangeValuesCommandParams } from '@univerjs/sheets';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import type { IDropdownParam } from '@univerjs/sheets-ui';
import { useDependency } from '@wendellhu/redi/react-bindings';
import React, { useState } from 'react';
import { LIST_MULTIPLE_FORMULA } from '../../validators/list-validator';

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

    if (!cellData || !rule) {
        return;
    }

    const listStr = rule.formula1 ?? '';
    const multiple = rule.formula2 === LIST_MULTIPLE_FORMULA;
    const list = listStr.split(',');
    const cellStr = localValue || `${cellData.v}`;

    const value = multiple ? (cellStr).split(',') : cellStr;

    return (
        <SelectList
            value={value}
            multiple={multiple}
            onChange={(newValue) => {
                const str = Array.isArray(newValue) ? newValue.join(',') : newValue ?? '';
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
