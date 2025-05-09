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
import type { IConditionCompareTypeEnum, IConditionExpect, IConditionInfo, ITableConditionTypeEnumWithoutLogic } from './type';
import { dayjs, Injector, LocaleService } from '@univerjs/core';
import { borderClassName, CascaderList, clsx, DatePicker, DateRangePicker, Dropdown, Input, InputNumber, Select } from '@univerjs/design';
import { MoreDownSingle } from '@univerjs/icons';
import { TableConditionTypeEnum, TableDateCompareTypeEnum, TableStringCompareTypeEnum } from '@univerjs/sheets-table';
import { useDependency } from '@univerjs/ui';
import { useState } from 'react';
import { ConditionSubComponentEnum } from './type';
import { datePickerSet, getCascaderListOptions, getConditionDateSelect, getSubComponentType } from './util';

interface IConditionFilterProps {
    unitId: string;
    subUnitId: string;
    tableFilter: ITableFilterItem | undefined;
    tableId: string;
    columnIndex: number;
    conditionInfo: IConditionInfo;
    onChange: (conditionInfo: IConditionInfo) => void;
}

export const SheetTableConditionPanel = (props: IConditionFilterProps) => {
    const { conditionInfo, onChange } = props;
    const localeService = useDependency(LocaleService);

    const [conditionVisible, setConditionVisible] = useState(false);

    const injector = useDependency(Injector);

    const cascaderOptions = getCascaderListOptions(injector);

    const handleConditionInfo = (info: IConditionExpect, type?: ITableConditionTypeEnumWithoutLogic, compare?: IConditionCompareTypeEnum) => {
        onChange({
            type: type ?? conditionInfo.type,
            compare: compare ?? conditionInfo.compare,
            info,
        });
    };

    const handleChange = (value: string[]) => {
        const type = value[0] as ITableConditionTypeEnumWithoutLogic;
        const compare = value[1] as IConditionCompareTypeEnum;
        if (compare) {
            setConditionVisible(false);
        };
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
        handleConditionInfo(info, value[0] as ITableConditionTypeEnumWithoutLogic, (value[1] as IConditionCompareTypeEnum ?? TableStringCompareTypeEnum.Equal));
    };

    const subComponentType = getSubComponentType(conditionInfo.type, conditionInfo.compare);

    let selectType = '';
    if (conditionInfo.compare) {
        selectType = `${localeService.t(`sheets-table.condition.${conditionInfo.type}`)} - ${localeService.t(`sheets-table.${conditionInfo.type}.compare.${conditionInfo.compare}`)}`;
    } else {
        selectType = localeService.t(`sheets-table.condition.${conditionInfo.type}`);
    }

    const conditionDateOptions = getConditionDateSelect(injector, conditionInfo.compare as TableDateCompareTypeEnum);

    return (
        <div>
            <Dropdown
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
                      univer-rounded-md univer-bg-white univer-px-2 univer-text-sm univer-transition-colors
                      univer-duration-200
                      dark:univer-bg-gray-700 dark:univer-text-white
                      focus:univer-border-primary-600 focus:univer-outline-none focus:univer-ring-2
                      hover:univer-border-primary-600
                    `, borderClassName)}
                >
                    <span>
                        {selectType}
                    </span>

                    <MoreDownSingle />
                </div>
            </Dropdown>

            <div className="univer-mt-3 univer-w-full">
                {subComponentType === ConditionSubComponentEnum.Input && (
                    <>
                        {conditionInfo.type === TableConditionTypeEnum.String
                            ? (
                                <Input
                                    className="univer-w-full"
                                    placeholder="请输入"
                                    value={conditionInfo.info.string}
                                    onChange={(v) => handleConditionInfo({ string: v })}
                                />
                            )
                            : (
                                <InputNumber
                                    className="univer-h-7 univer-w-full"
                                    value={conditionInfo.info.number}
                                    controls={false}
                                    onChange={(v) => {
                                        if (v !== null) {
                                            handleConditionInfo({ number: v });
                                        }
                                    }}
                                />
                            )}
                    </>
                )}
                {!!(subComponentType === ConditionSubComponentEnum.DatePicker) && (
                    <div id="univer-table-date-picker-wrapper" style={{ background: '#fff', position: 'relative' }}>
                        <DatePicker
                            value={dayjs(conditionInfo.info.date)}
                            defaultPickerValue={dayjs()}
                            onChange={(v) => handleConditionInfo({ date: v.toDate() })}
                            getPopupContainer={() => {
                                const wrapper = document.getElementById('univer-table-date-picker-wrapper');
                                return wrapper || document.body;
                            }}
                            className="univer-w-full"
                            allowClear={false}
                        />
                    </div>
                )}
                {!!(subComponentType === ConditionSubComponentEnum.DateRange) && (
                    <div id="univer-table-date-range-wrapper" style={{ background: '#fff', position: 'relative' }}>
                        <DateRangePicker
                            value={[dayjs(conditionInfo.info.dateRange?.[0]) ?? dayjs(), dayjs(conditionInfo.info.dateRange?.[1]) ?? dayjs()]}
                            defaultPickerValue={[dayjs(), dayjs()]}
                            onChange={(v) => {
                                if (v) {
                                    handleConditionInfo({ dateRange: v.map((i) => i?.toDate()) as [Date, Date] });
                                } else {
                                    handleConditionInfo({});
                                }
                            }}
                            getPopupContainer={() => {
                                const wrapper = document.getElementById('univer-table-date-range-wrapper');
                                return wrapper || document.body;
                            }}
                            classNames={{ popup: 'univer-w-[400px]' }}
                            allowClear={false}
                        />
                    </div>
                )}
                {subComponentType === ConditionSubComponentEnum.Inputs && (
                    <div className="univer-flex univer-items-center univer-gap-2">
                        <InputNumber
                            className="univer-w-full"
                            value={conditionInfo.info.numberRange?.[0]}
                            onChange={(v) => {
                                if (v !== null) {
                                    handleConditionInfo({ numberRange: [v, conditionInfo.info.numberRange?.[1]] });
                                }
                            }}
                            controls={false}
                        />
                        <span> - </span>
                        <InputNumber
                            className="univer-w-full"
                            value={conditionInfo.info.numberRange?.[1]}
                            controls={false}
                            onChange={(v) => {
                                if (v !== null) {
                                    handleConditionInfo({ numberRange: [conditionInfo.info.numberRange?.[0], v] });
                                }
                            }}
                        />
                    </div>
                )}
                {!!(subComponentType === ConditionSubComponentEnum.Select) && (
                    <Select
                        className="univer-w-full"
                        value={conditionInfo.info.dateSelect ?? conditionDateOptions[0].value}
                        options={conditionDateOptions}
                        onChange={(v) => handleConditionInfo({ dateSelect: v })}
                    />
                )}
            </div>
        </div>
    );
};
