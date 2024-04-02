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

import React, { useState } from 'react';
import { ICommandService } from '@univerjs/core';
import { useDependency } from '@wendellhu/redi/react-bindings';
import { DatePanel } from '@univerjs/design';
import { SetRangeValuesCommand } from '@univerjs/sheets';
import dayjs from 'dayjs';
import type { IDropdownComponentProps } from '../../services/dropdown-manager.service';
import type { DateValidator } from '../../validators';
import { getCellValueOrigin } from '../../utils/get-cell-data-origin';
import styles from './index.module.less';

export function DateDropdown(props: IDropdownComponentProps) {
    const { location, hideFn } = props;
    const { worksheet, row, col, unitId, subUnitId } = location;
    const commandService = useDependency(ICommandService);
    const [localDate, setLocalDate] = useState<dayjs.Dayjs>();
    if (!worksheet) {
        return null;
    }

    const cellData = worksheet.getCell(row, col);
    const rule = cellData?.dataValidation?.rule;
    const validator = cellData?.dataValidation?.validator as DateValidator | undefined;

    if (!cellData || !rule || !validator) {
        return;
    }

    const cellStr = getCellValueOrigin(cellData);
    const originDate = validator.transformDate(cellStr) ?? dayjs();
    const date = originDate.isValid() ? originDate : dayjs();

    return (
        <div className={styles.dvDateDropdown}>
            <DatePanel
                pickerValue={localDate ?? date}
                onSelect={(newValue) => {
                    const newValueStr = newValue.format('YYYY/MM/DD');
                    commandService.executeCommand(SetRangeValuesCommand.id, {
                        unitId,
                        subUnitId,
                        range: {
                            startColumn: col,
                            endColumn: col,
                            startRow: row,
                            endRow: row,
                        },
                        value: {
                            v: newValueStr,
                            p: null,
                            f: null,
                            si: null,

                        },
                    });
                    hideFn();
                }}
                onPanelChange={(value) => {
                    setLocalDate(value);
                }}
            />
        </div>

    );
}
