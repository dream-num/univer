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

import type { IFormulaInputProps } from '@univerjs/data-validation';
import type { ListValidator } from '@univerjs/sheets-data-validation';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { CSSProperties } from 'react';
import { DataValidationType, isFormulaString, LocaleService, Tools } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { borderClassName, clsx, DraggableList, Dropdown, FormLayout, Input, Radio, RadioGroup } from '@univerjs/design';
import { DeleteSingle, IncreaseSingle, MoreDownSingle, SequenceSingle } from '@univerjs/icons';
import { DataValidationFormulaController, deserializeListOptions, serializeListOptions } from '@univerjs/sheets-data-validation';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useEvent, useObservable, useSidebarClick } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { DROP_DOWN_DEFAULT_COLOR } from '../../../const';

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
        <Dropdown
            align="start"
            disabled={disabled}
            open={open}
            onOpenChange={setOpen}
            overlay={(
                <div
                    className={`
                      univer-box-border univer-grid univer-w-fit univer-grid-cols-6 univer-flex-wrap univer-gap-2
                      univer-p-1.5
                    `}
                >
                    {DEFAULT_COLOR_PRESET.map(
                        (color) => (
                            <div
                                key={color}
                                className={clsx('univer-box-border univer-size-4 univer-cursor-pointer univer-rounded', borderClassName)}
                                style={{ background: color }}
                                onClick={() => {
                                    onChange(color);
                                    setOpen(false);
                                }}
                            />
                        )
                    )}
                </div>
            )}
        >
            <div
                className={clsx(`
                  univer-box-border univer-inline-flex univer-h-8 univer-w-16 univer-cursor-pointer univer-items-center
                  univer-justify-between univer-gap-2 univer-rounded-lg univer-bg-white univer-px-2.5
                  univer-transition-colors univer-duration-200
                  dark:univer-bg-gray-700 dark:univer-text-white
                  hover:univer-border-primary-600
                `, borderClassName)}
            >
                <div
                    className="univer-box-border univer-h-4 univer-w-4 univer-rounded univer-text-base"
                    style={{ background: value }}
                />

                <MoreDownSingle />
            </div>
        </Dropdown>
    );
};

const Template = (props: { item: IDropdownItem; commonProps: any; style?: CSSProperties }) => {
    const { item, commonProps, style } = props;
    const { onItemChange, onItemDelete } = commonProps;

    return (
        <div className="univer-flex univer-items-center univer-gap-2" style={style}>
            {!item.isRef
                ? (
                    <div className={clsx('univer-cursor-move', 'draggableHandle')}>
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
                    <div
                        className={`
                          univer-ml-1 univer-cursor-pointer univer-rounded univer-text-base
                          hover:univer-bg-gray-200
                        `}
                    >
                        <DeleteSingle onClick={() => onItemDelete(item.id)} />
                    </div>
                )}
        </div>
    );
};

export function ListFormulaInput(props: IFormulaInputProps) {
    const { value, onChange: _onChange = () => { /* empty */ }, unitId, subUnitId, validResult, showError, ruleId } = props;
    const { formula1 = '', formula2 = '' } = value || {};
    const [isFormulaStr, setIsFormulaStr] = useState(() => isFormulaString(formula1) ? '1' : '0');
    const [formulaStr, setFormulaStr] = useState(isFormulaStr === '1' ? formula1 : '=');
    const [formulaStrCopy, setFormulaStrCopy] = useState(isFormulaStr === '1' ? formula1 : '=');
    const localeService = useDependency(LocaleService);
    const dataValidatorRegistryService = useDependency(DataValidatorRegistryService);
    const dataValidationModel = useDependency(DataValidationModel);
    const dataValidationFormulaController = useDependency(DataValidationFormulaController);
    const [refColors, setRefColors] = useState(() => formula2.split(','));
    const listValidator = dataValidatorRegistryService.getValidatorItem(DataValidationType.LIST) as ListValidator;
    const [refOptions, setRefOptions] = useState<string[]>([]);
    const [localError, setLocalError] = useState('');
    const formula1Res = showError ? validResult?.formula1 : '';
    const ruleChange$ = useMemo(() => dataValidationModel.ruleChange$.pipe(debounceTime(16)), []);
    const ruleChange = useObservable(ruleChange$);

    const onChange = useEvent(_onChange);

    useEffect(() => {
        (async () => {
            await new Promise<any>((resolve) => {
                setTimeout(() => resolve(true), 100);
            });

            const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            const formula1 = rule?.formula1;
            if (isFormulaString(formula1) && listValidator && rule) {
                const res = await listValidator.getListAsync(rule, unitId, subUnitId);
                setRefOptions(res);
            }
        })();
    }, [dataValidationModel, ruleChange, listValidator, ruleId, subUnitId, unitId]);

    useEffect(() => {
        if (isFormulaString(formula1) && formula1 !== formulaStrCopy) {
            setFormulaStr(formula1);
            setFormulaStrCopy(formulaStrCopy);
        }
    }, [formulaStrCopy, formula1]);

    const [strList, setStrList] = useState<IDropdownItem[]>(() => {
        const strOptions = isFormulaStr !== '1' ? deserializeListOptions(formula1) : [];
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
        if (isFormulaStr === '1') {
            return;
        }
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
    }, [strList, onChange, isFormulaStr, formulaStrCopy, refColors]);

    const updateFormula = useEvent(async (str: string) => {
        if (!isFormulaString(str)) {
            onChange?.({
                formula1: '',
                formula2,
            });
            return;
        }
        if (dataValidationFormulaController.getFormulaRefCheck(str)) {
            onChange?.({
                formula1: isFormulaString(str) ? str : '',
                formula2,
            });
            setLocalError('');
        } else {
            onChange?.({
                formula1: '',
                formula2,
            });
            setFormulaStr('=');
            setLocalError(localeService.t('dataValidation.validFail.formulaError'));
        }
    });

    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && isFocusFormulaEditorSet(false);
    });

    return (
        <>
            <FormLayout label={localeService.t('dataValidation.list.options')}>
                <RadioGroup
                    value={isFormulaStr}
                    onChange={(v) => {
                        setIsFormulaStr(v as string);
                        setFormulaStr(formulaStrCopy);
                        if (v === '1') {
                            onChange({
                                formula1: formulaStrCopy === '=' ? '' : formulaStrCopy,
                                formula2: refColors.join(','),
                            });
                        }
                    }}
                >
                    <Radio value="0">{localeService.t('dataValidation.list.customOptions')}</Radio>
                    <Radio value="1">{localeService.t('dataValidation.list.refOptions')}</Radio>
                </RadioGroup>
            </FormLayout>
            {isFormulaStr === '1'
                ? (
                    <FormLayout error={(formula1Res || localError) || undefined}>
                        <FormulaEditor
                            ref={formulaEditorRef}
                            className={clsx(`
                              univer-box-border univer-h-8 univer-w-full univer-cursor-pointer univer-items-center
                              univer-rounded-lg univer-bg-white univer-pt-2 univer-transition-colors
                              [&>div:first-child]:univer-px-2.5
                              [&>div]:univer-h-5 [&>div]:univer-ring-transparent
                              dark:univer-bg-gray-700 dark:univer-text-white
                              hover:univer-border-primary-600
                            `, borderClassName)}
                            initValue={formulaStr as any}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            isFocus={isFocusFormulaEditor}
                            isSupportAcrossSheet
                            onFocus={() => isFocusFormulaEditorSet(true)}
                            onChange={(v = '') => {
                                const str = (v ?? '').trim();
                                setFormulaStrCopy(str);
                                updateFormula(str);
                            }}
                        />
                        {refFinalList.length > 0 && (
                            <div style={{ marginTop: '12px' }}>
                                {refFinalList.map((item) => {
                                    return (
                                        <Template
                                            key={item.id}
                                            item={item}
                                            commonProps={{ onItemChange: handleRefItemChange }}
                                            style={{ marginBottom: 12 }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </FormLayout>
                )
                : (
                    <FormLayout error={formula1Res}>
                        <div style={{ marginTop: '-12px' }}>
                            <DraggableList
                                list={strList}
                                onListChange={setStrList}
                                rowHeight={28}
                                margin={[0, 12]}
                                draggableHandle=".draggableHandle"
                                itemRender={(item) => (
                                    <Template
                                        key={item.id}
                                        item={item}
                                        commonProps={{
                                            onItemChange: handleStrItemChange,
                                            onItemDelete: handleStrItemDelete,
                                        }}
                                    />
                                )}
                                idKey="id"
                            />
                            <a
                                className={`
                                  univer-flex univer-w-fit univer-cursor-pointer univer-flex-row univer-items-center
                                  univer-rounded univer-p-1 univer-px-2 univer-text-sm univer-text-primary
                                  hover:univer-bg-primary-50
                                `}
                                onClick={handleAdd}
                            >
                                <IncreaseSingle className="univer-mr-1" />
                                {localeService.t('dataValidation.list.add')}
                            </a>
                        </div>
                    </FormLayout>
                )}
        </>
    );
}
