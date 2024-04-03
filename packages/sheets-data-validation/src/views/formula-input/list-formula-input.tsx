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

import { RangeSelector, useEvent } from '@univerjs/ui';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { FormLayout, Input, Radio, RadioGroup, Select } from '@univerjs/design';
import { deserializeRangeWithSheet, isReferenceString, serializeRangeWithSheet } from '@univerjs/engine-formula';
import { useDependency } from '@wendellhu/redi/react-bindings';
import type { IRange } from '@univerjs/core';
import { IUniverInstanceService, LocaleService, Tools } from '@univerjs/core';
import type { IFormulaInputProps } from '@univerjs/data-validation';
import { DeleteSingle, IncreaseSingle, SequenceSingle } from '@univerjs/icons';
import DraggableList from 'react-draggable-list';
import { deserializeListOptions, getSheetRangeValueSet, serializeListOptions } from '../../validators/util';
import { DROP_DOWN_DEFAULT_COLOR } from '../../common/const';
import styles from './index.module.less';

function isRangeInValid(range: IRange) {
    return Number.isNaN(range.startColumn) || Number.isNaN(range.endColumn) || Number.isNaN(range.startRow) || Number.isNaN(range.endRow);
}

const DEFAULT_COLOR_PRESET = [
    '#FFFFFF',
    '#FEE7E7',
    '#FEF0E6',
    '#EFFBD0',
    '#E4F4FE',
    '#E8ECFD',
    '#F1EAFA',
    '#FDE8F3',
    '#E5E5E5',
    '#FDCECE',
    '#FDC49B',
    '#DEF6A2',
    '#9FDAFF',
    '#D0D9FB',
    '#E3D5F6',
    '#FBD0E8',
    '#656565',
    '#FE4B4B',
    '#FF8C51',
    '#8BBB11',
    '#0B9EFB',
    '#3A60F7',
    '#9E6DE3',
    '#F248A6',
];

interface IDropdownItem {
    color: string;
    label: string;
    isRef: boolean;
    id: string;
}

interface IColorSelectProps {
    value: string;
    onChange: (value: string) => void;
    disabled?: boolean;
}

const ColorSelect = (props: IColorSelectProps) => {
    const { value, onChange, disabled } = props;
    const [open, setOpen] = useState(false);
    return (
        <Select
            disabled={disabled}
            open={open}
            onDropdownVisibleChange={setOpen}
            dropdownStyle={{ width: 112 }}
            className={styles.dataValidationFormulaColorSelect}
            value={value}
            onChange={onChange}
            labelRender={(item) => <div className={styles.dataValidationFormulaColorItem} style={{ background: item.value }} />}
            dropdownRender={() => {
                return (
                    <div className={styles.dataValidationFormulaColorSelectPanel}>
                        {DEFAULT_COLOR_PRESET.map(
                            (color) => (
                                <div
                                    onClick={() => {
                                        onChange(color);
                                        setOpen(false);
                                    }}
                                    className={styles.dataValidationFormulaColorItem}
                                    style={{ background: color }}
                                    key={color}
                                />
                            )
                        )}
                    </div>
                );
            }}
        />
    );
};

const Template = (props: { item: IDropdownItem; dragHandleProps: any; commonProps: any }) => {
    const { item, dragHandleProps, commonProps } = props;
    const { onMouseDown, onTouchStart } = dragHandleProps;
    const { onItemChange, onItemDelete } = commonProps;

    return (
        <div className={styles.dataValidationFormulaListItem}>
            {!item.isRef
                ? (
                    <div
                        className={styles.dataValidationFormulaListItemDrag}
                        onTouchStart={(e) => {
                            e.preventDefault();
                            onTouchStart(e);
                        }}
                        onMouseDown={(e) => {
                            onMouseDown(e);
                        }}
                    >
                        <SequenceSingle />
                    </div>
                )
                : null}
            <ColorSelect
                value={item.color}
                onChange={(color) => {
                    onItemChange(item.id, item.label, color);
                }}
            />
            <Input
                disabled={item.isRef}
                value={item.label}
                onChange={(label) => {
                    onItemChange(item.id, label, item.color);
                }}
            />
            {item.isRef
                ? null
                : (
                    <div className={styles.dataValidationFormulaListItemIcon}>
                        <DeleteSingle onClick={() => onItemDelete(item.id)} />
                    </div>
                )}
        </div>
    );
};

export function ListFormulaInput(props: IFormulaInputProps) {
    const { value, onChange: _onChange = () => { }, unitId, subUnitId, validResult, showError } = props;
    const { formula1 = '', formula2 = '' } = value || {};
    const containerRef = useRef<HTMLDivElement>(null);
    const [isRefRange, setIsRefRange] = useState(() => isReferenceString(formula1) ? '1' : '0');
    const [refRange, setRefRange] = useState(isRefRange === '1' ? formula1 : '');
    const localeService = useDependency(LocaleService);
    const univerInstanceService = useDependency(IUniverInstanceService);
    const workbook = univerInstanceService.getCurrentUniverSheetInstance();
    const worksheet = workbook.getActiveSheet();
    const [refColors, setRefColors] = useState(() => formula2.split(','));

    const formula1Res = showError ? validResult?.formula1 : '';

    const onChange = useEvent(_onChange);

    const [strList, setStrList] = useState<IDropdownItem[]>(() => {
        const strOptions = isRefRange !== '1' ? deserializeListOptions(formula1) : [];
        const strColors = formula2.split(',');
        return strOptions.map((label, i) => ({
            label,
            color: strColors[i] || DROP_DOWN_DEFAULT_COLOR,
            isRef: false,
            id: Tools.generateRandomId(4),
        }));
    });

    const handleStrItemChange = (id: string, value: string, color: string) => {
        const item = strList.find((i) => i.id === id);
        if (!item) {
            return;
        }

        item.label = value;
        item.color = color;

        setStrList([...strList]);
    };

    const handleStrItemDelete = (id: string) => {
        const index = strList.findIndex((i) => i.id === id);
        if (index !== -1) {
            strList.splice(index, 1);
            setStrList([...strList]);
        }
    };

    const refOptions = useMemo(() => getSheetRangeValueSet(
        deserializeRangeWithSheet(refRange),
        univerInstanceService,
        workbook.getUnitId(),
        worksheet.getSheetId()
    ), [refRange, univerInstanceService, workbook, worksheet]);

    const colorList = formula2.split(',');

    const refFinalList: IDropdownItem[] = useMemo(() => refOptions.map((label, i) => ({
        label,
        color: colorList[i] || DROP_DOWN_DEFAULT_COLOR,
        id: `${i}`,
        isRef: true,
    })), [colorList, refOptions]);

    const handleRefItemChange = (id: string, value: string, color: string) => {
        const newColors = [...refColors];
        newColors[+id] = color;
        setRefColors(newColors);

        onChange({
            formula1,
            formula2: newColors.join(','),
        });
    };

    const handleAdd = () => {
        setStrList([
            ...strList,
            {
                label: '',
                color: DROP_DOWN_DEFAULT_COLOR,
                isRef: false,
                id: Tools.generateRandomId(4),
            },
        ]);
    };

    useEffect(() => {
        const labelSet = new Set<string>();
        const finalList: { color: string; label: string }[] = [];
        strList.map((item) => {
            const labelList = item.label.split(',');
            return {
                labelList,
                item,
            };
        }).forEach(({ item, labelList }) => {
            labelList.forEach((labelItem) => {
                if (!labelSet.has(labelItem)) {
                    labelSet.add(labelItem);
                    finalList.push({
                        label: labelItem,
                        color: item.color,
                    });
                }
            });
        });

        onChange({
            formula1: serializeListOptions(finalList.map((item) => item.label)),
            formula2: finalList.map((item) => item.color === DROP_DOWN_DEFAULT_COLOR ? '' : item.color).join(','),
        });
    }, [strList, onChange]);

    return (
        <>
            <FormLayout label={localeService.t('dataValidation.list.options')}>
                <RadioGroup value={isRefRange} onChange={(v) => setIsRefRange(v as string)}>
                    <Radio value="0">{localeService.t('dataValidation.list.customOptions')}</Radio>
                    <Radio value="1">{localeService.t('dataValidation.list.refOptions')}</Radio>
                </RadioGroup>
            </FormLayout>
            {isRefRange === '1' ? (
                <>
                    <FormLayout error={formula1Res}>
                        <RangeSelector
                            id={`list-ref-range-${unitId}-${subUnitId}`}
                            value={refRange}
                            openForSheetUnitId={unitId}
                            openForSheetSubUnitId={subUnitId}
                            onChange={(ranges) => {
                                const range = ranges[0];
                                if (!range || isRangeInValid(range.range)) {
                                    onChange?.({
                                        formula1: '',
                                        formula2,
                                    });
                                    setRefRange('');
                                } else {
                                    const workbook = univerInstanceService.getUniverSheetInstance(range.unitId) ?? univerInstanceService.getCurrentUniverSheetInstance();
                                    const worksheet = workbook?.getSheetBySheetId(range.sheetId) ?? workbook.getActiveSheet();
                                    const rangeStr = serializeRangeWithSheet(worksheet.getName(), range.range);
                                    onChange?.({
                                        formula1: rangeStr,
                                        formula2,
                                    });
                                    setRefRange(rangeStr);
                                }
                            }}
                            isSingleChoice
                        />
                    </FormLayout>
                    <FormLayout>
                        <div ref={containerRef}>
                            <DraggableList
                                itemKey="id"
                            // @ts-ignore
                                template={Template}
                                list={refFinalList}
                                container={() => containerRef.current}
                                commonProps={{
                                    onItemChange: handleRefItemChange,
                                }}
                            />
                        </div>
                    </FormLayout>
                </>
            ) : (
                <FormLayout error={formula1Res}>
                    <div ref={containerRef}>
                        <DraggableList
                            itemKey="id"
                            // @ts-ignore
                            template={Template}
                            list={strList}
                            onMoveEnd={(newList) => {
                                // @ts-ignore
                                setStrList(newList);
                            }}
                            container={() => containerRef.current}
                            commonProps={{
                                onItemChange: handleStrItemChange,
                                onItemDelete: handleStrItemDelete,
                            }}
                        />
                        <a className={styles.dataValidationFormulaListAdd} onClick={handleAdd}>
                            <IncreaseSingle />
                            {localeService.t('dataValidation.list.add')}
                        </a>
                    </div>
                </FormLayout>
            )}
        </>
    );
}
