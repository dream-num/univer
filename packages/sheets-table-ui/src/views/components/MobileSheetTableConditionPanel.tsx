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

import type { ITableFilterItem } from '@univerjs/sheets-table';
import type { LocaleKey } from '../../locale/types';
import type {
    IConditionCompareTypeEnum,
    IConditionExpect,
    IConditionInfo,
    ITableConditionTypeEnumWithoutLogic,
} from './type';
import { Injector, LocaleService } from '@univerjs/core';
import {
    borderClassName,
    CascaderList,
    clsx,
    DatePicker,
    DateRangePicker,
    Input,
    InputNumber,
    MobileDropdown,
    MobileSelect,
} from '@univerjs/design';
import { MoreDownIcon } from '@univerjs/icons';
import { TableConditionTypeEnum, TableDateCompareTypeEnum, TableStringCompareTypeEnum } from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { ConditionSubComponentEnum } from './type';
import { datePickerSet, getCascaderListOptions, getConditionDateSelect, getSubComponentType } from './util';

interface IMobileSheetTableConditionPanelProps {
    unitId: string;
    subUnitId: string;
    tableFilter: ITableFilterItem | undefined;
    tableId: string;
    columnIndex: number;
    conditionInfo: IConditionInfo;
    onChange: (conditionInfo: IConditionInfo) => void;
}

export function MobileSheetTableConditionPanel(props: IMobileSheetTableConditionPanelProps) {
    const { conditionInfo, onChange } = props;
    const localeService = useDependency(LocaleService);
    const injector = useDependency(Injector);
    const [conditionVisible, setConditionVisible] = useState(false);
    const [defaultDate] = useState(() => new Date());
    const cascaderOptions = getCascaderListOptions(injector);

    function handleConditionInfo(
        info: IConditionExpect,
        type?: ITableConditionTypeEnumWithoutLogic,
        compare?: IConditionCompareTypeEnum
    ) {
        onChange({
            type: type ?? conditionInfo.type,
            compare: compare ?? conditionInfo.compare,
            info,
        });
    }

    function handleChange(value: string[]) {
        const type = value[0] as ITableConditionTypeEnumWithoutLogic;
        const compare = value[1] as IConditionCompareTypeEnum;
        if (compare) {
            setConditionVisible(false);
        }

        const info: IConditionExpect = {};
        if (type === TableConditionTypeEnum.Date) {
            if (compare === TableDateCompareTypeEnum.Quarter) {
                info.dateSelect = TableDateCompareTypeEnum.Q1;
            } else if (compare === TableDateCompareTypeEnum.Month) {
                info.dateSelect = TableDateCompareTypeEnum.M1;
            } else if (datePickerSet.has(compare)) {
                info.date = new Date();
            } else {
                info.dateRange = [new Date(), new Date()];
            }
        } else if (type === TableConditionTypeEnum.Number) {
            info.number = 0;
        } else if (type === TableConditionTypeEnum.String) {
            info.string = '';
        }
        handleConditionInfo(info, type, compare ?? TableStringCompareTypeEnum.Equal);
    }

    const subComponentType = getSubComponentType(conditionInfo.type, conditionInfo.compare);
    const selectType = conditionInfo.compare
        ? `${localeService.t(`sheets-table-ui.condition.${conditionInfo.type}`)} - ${localeService.t(`sheets-table-ui.${conditionInfo.type}.compare.${conditionInfo.compare}`)}`
        : localeService.t(`sheets-table-ui.condition.${conditionInfo.type}`);
    const conditionDateOptions = getConditionDateSelect(injector, conditionInfo.compare as TableDateCompareTypeEnum);

    return (
        <div>
            <MobileDropdown
                align="start"
                open={conditionVisible}
                onOpenChange={setConditionVisible}
                overlay={(
                    <CascaderList
                        value={[conditionInfo.type, conditionInfo.compare!]}
                        options={cascaderOptions}
                        onChange={handleChange}
                        contentClassName="univer-flex-1"
                        wrapperClassName="!univer-h-[150px]"
                    />
                )}
            >
                <div
                    className={clsx(`
                      univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center univer-justify-between
                      univer-rounded-md univer-bg-gray-0 univer-px-2 univer-text-sm univer-transition-colors
                      univer-duration-200
                      hover:univer-border-primary-600
                      focus:univer-border-primary-600 focus:univer-outline-none focus:univer-ring-2
                      dark:!univer-bg-gray-700 dark:!univer-text-gray-0
                    `, borderClassName)}
                >
                    <span>{selectType}</span>
                    <MoreDownIcon />
                </div>
            </MobileDropdown>

            <div className="univer-mt-3 univer-w-full">
                {subComponentType === ConditionSubComponentEnum.Input && (
                    <>
                        {conditionInfo.type === TableConditionTypeEnum.String
                            ? (
                                <Input
                                    className="univer-w-full"
                                    placeholder={localeService.t<LocaleKey>('sheets-table-ui.filter.input-values-placeholder')}
                                    value={conditionInfo.info.string}
                                    onChange={(value) => handleConditionInfo({ string: value })}
                                />
                            )
                            : (
                                <InputNumber
                                    className="univer-h-7 univer-w-full"
                                    value={conditionInfo.info.number}
                                    controls={false}
                                    onChange={(value) => {
                                        if (value !== null) {
                                            handleConditionInfo({ number: value });
                                        }
                                    }}
                                />
                            )}
                    </>
                )}
                {subComponentType === ConditionSubComponentEnum.DatePicker && (
                    <div id="univer-table-date-picker-wrapper">
                        <DatePicker
                            className="univer-w-full"
                            value={conditionInfo.info.date ?? defaultDate}
                            onValueChange={(value) => handleConditionInfo({ date: value })}
                        />
                    </div>
                )}
                {subComponentType === ConditionSubComponentEnum.DateRange && (
                    <div id="univer-table-date-range-wrapper">
                        <DateRangePicker
                            className="univer-w-full"
                            value={[
                                conditionInfo.info.dateRange?.[0] ?? defaultDate,
                                conditionInfo.info.dateRange?.[1] ?? defaultDate,
                            ]}
                            onValueChange={(value) => handleConditionInfo(value ? { dateRange: value } : {})}
                        />
                    </div>
                )}
                {subComponentType === ConditionSubComponentEnum.Inputs && (
                    <div className="univer-flex univer-items-center univer-gap-2">
                        <InputNumber
                            className="univer-w-full"
                            value={conditionInfo.info.numberRange?.[0]}
                            controls={false}
                            onChange={(value) => {
                                if (value !== null) {
                                    handleConditionInfo({ numberRange: [value, conditionInfo.info.numberRange?.[1]] });
                                }
                            }}
                        />
                        <span> - </span>
                        <InputNumber
                            className="univer-w-full"
                            value={conditionInfo.info.numberRange?.[1]}
                            controls={false}
                            onChange={(value) => {
                                if (value !== null) {
                                    handleConditionInfo({ numberRange: [conditionInfo.info.numberRange?.[0], value] });
                                }
                            }}
                        />
                    </div>
                )}
                {subComponentType === ConditionSubComponentEnum.Select && (
                    <MobileSelect
                        className="univer-w-full"
                        value={conditionInfo.info.dateSelect ?? conditionDateOptions[0].value}
                        options={conditionDateOptions}
                        onChange={(value) => handleConditionInfo({ dateSelect: value })}
                    />
                )}
            </div>
        </div>
    );
}
