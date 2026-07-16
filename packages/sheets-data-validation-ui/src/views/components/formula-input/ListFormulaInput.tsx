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

import type { ListValidator } from '@univerjs/sheets-data-validation';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { LocaleKey } from '../../../locale/types';
import type { IFormulaInputProps } from './interface';
import { DataValidationType, generateRandomId, isFormulaString, LocaleService } from '@univerjs/core';
import { DataValidationModel, DataValidatorRegistryService } from '@univerjs/data-validation';
import { borderClassName, clsx, DraggableList, Dropdown, FormLayout, Input, Radio, RadioGroup } from '@univerjs/design';
import { DeleteIcon, GripVerticalIcon, IncreaseIcon, MoreDownIcon } from '@univerjs/icons';
import { deserializeListOptions } from '@univerjs/sheets';
import { DataValidationFormulaController } from '@univerjs/sheets-data-validation';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { useDependency, useEvent, useObservable, useSidebarClick } from '@univerjs/ui';
import { useEffect, useMemo, useRef, useState } from 'react';
import { debounceTime } from 'rxjs';
import { DROP_DOWN_DEFAULT_COLOR } from '../../../const';
import { DataValidationPanelService } from '../../../services/data-validation-panel.service';
import { buildCustomListFormulaPayload } from './utils';

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
                  hover:univer-border-primary-600
                  dark:!univer-bg-gray-700 dark:!univer-text-white
                `, borderClassName)}
            >
                <div
                    className="univer-box-border univer-size-4 univer-rounded univer-text-base"
                    style={{ background: value }}
                />

                <MoreDownIcon />
            </div>
        </Dropdown>
    );
};

const Template = (props: { item: IDropdownItem; commonProps: any; className?: string }) => {
    const { item, commonProps, className } = props;
    const { onItemChange, onItemDelete } = commonProps;

    return (
        <div className={clsx('univer-flex univer-items-center univer-gap-2', className)}>
            {!item.isRef && (
                <div className={clsx('univer-cursor-move', 'draggableHandle')}>
                    <GripVerticalIcon />
                </div>
            )}
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
                        <DeleteIcon onClick={() => onItemDelete(item.id)} />
                    </div>
                )}
        </div>
    );
};

const NOOP = () => { /* empty */ };

export function ListFormulaInput(props: IFormulaInputProps) {
    const { value, onChange: _onChange = NOOP, unitId, subUnitId, validResult, showError, ruleId } = props;
    const { formula1 = '', formula2 = '' } = value || {};
    const [isFormulaStr, setIsFormulaStr] = useState(() => isFormulaString(formula1) ? '1' : '0');
    const [formulaStr, setFormulaStr] = useState(isFormulaStr === '1' ? formula1 : '=');
    const [formulaStrCopy, setFormulaStrCopy] = useState(isFormulaStr === '1' ? formula1 : '=');
    const localeService = useDependency(LocaleService);
    const dataValidatorRegistryService = useDependency(DataValidatorRegistryService);
    const dataValidationModel = useDependency(DataValidationModel);
    const dataValidationFormulaController = useDependency(DataValidationFormulaController);
    const dataValidationPanelService = useDependency(DataValidationPanelService);
    const [refColors, setRefColors] = useState(() => formula2.split(','));
    const listValidator = dataValidatorRegistryService.getValidatorItem(DataValidationType.LIST) as ListValidator;
    const [refOptions, setRefOptions] = useState<string[]>([]);
    const [localError, setLocalError] = useState('');
    const formula1Res = showError ? validResult?.formula1 : '';
    const ruleChange$ = useMemo(() => dataValidationModel.ruleChange$.pipe(debounceTime(16)), []);
    const ruleChange = useObservable(ruleChange$);

    const onChange = useEvent(_onChange);

    useEffect(() => {
        let cancelled = false;
        const timer = setTimeout(() => {
            const rule = dataValidationModel.getRuleById(unitId, subUnitId, ruleId);
            const formula1 = rule?.formula1;
            if (isFormulaString(formula1) && listValidator && rule) {
                listValidator.getListAsync(rule, unitId, subUnitId).then((options) => {
                    if (!cancelled) {
                        setRefOptions(options);
                    }
                });
            }
        }, 100);

        return () => {
            cancelled = true;
            clearTimeout(timer);
        };
    }, [dataValidationModel, ruleChange, listValidator, ruleId, subUnitId, unitId]);

    useEffect(() => {
        if (isFormulaString(formula1) && formula1 !== formulaStrCopy) {
            setFormulaStr(formula1);
            setFormulaStrCopy(formula1);
        }
    }, [formulaStrCopy, formula1]);

    const [strList, setStrList] = useState<IDropdownItem[]>(() => {
        const strOptions = isFormulaStr !== '1' ? deserializeListOptions(formula1) : [];
        const strColors = formula2.split(',');
        return strOptions.map((label, i) => ({
            label,
            color: strColors[i] || DROP_DOWN_DEFAULT_COLOR,
            isRef: false,
            id: generateRandomId(4),
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

    const refFinalList: IDropdownItem[] = useMemo(() => refOptions.map((label, i) => ({
        label,
        color: refColors[i] || DROP_DOWN_DEFAULT_COLOR,
        id: `${i}`,
        isRef: true,
    })), [refColors, refOptions]);

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
                id: generateRandomId(4),
            },
        ]);
    };

    useEffect(() => {
        if (isFormulaStr === '1') {
            return;
        }
        onChange(buildCustomListFormulaPayload(strList, DROP_DOWN_DEFAULT_COLOR));
    }, [strList, onChange, isFormulaStr]);

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
            setLocalError(localeService.t<LocaleKey>('sheets-data-validation-ui.validFail.formulaError'));
        }
    });

    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, setIsFocusFormulaEditor] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && setIsFocusFormulaEditor(false);
    });

    useEffect(() => {
        if (isFocusFormulaEditor) {
            dataValidationPanelService.setFocusFormulaEditorActiveRuleSubUnitId(subUnitId);
        } else {
            dataValidationPanelService.setFocusFormulaEditorActiveRuleSubUnitId(null);
        }
    }, [isFocusFormulaEditor, subUnitId, dataValidationPanelService]);

    return (
        <>
            <FormLayout label={localeService.t<LocaleKey>('sheets-data-validation-ui.list.options')}>
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
                    <Radio value="0">{localeService.t<LocaleKey>('sheets-data-validation-ui.list.customOptions')}</Radio>
                    <Radio value="1">{localeService.t<LocaleKey>('sheets-data-validation-ui.list.refOptions')}</Radio>
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
                              hover:univer-border-primary-600
                              dark:!univer-bg-gray-700 dark:!univer-text-white
                              [&>div:first-child]:univer-px-2.5
                              [&>div]:univer-h-5 [&>div]:univer-ring-transparent
                            `, borderClassName)}
                            initValue={formulaStr as any}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            isFocus={isFocusFormulaEditor}
                            isSupportAcrossSheet
                            onFocus={() => setIsFocusFormulaEditor(true)}
                            onChange={(v = '') => {
                                const str = (v ?? '').trim();
                                setFormulaStrCopy(str);
                                updateFormula(str);
                            }}
                        />
                        {refFinalList.length > 0 && (
                            <div className="univer-mt-3">
                                {refFinalList.map((item) => {
                                    return (
                                        <Template
                                            key={item.id}
                                            className="univer-mb-3"
                                            item={item}
                                            commonProps={{ onItemChange: handleRefItemChange }}
                                        />
                                    );
                                })}
                            </div>
                        )}
                    </FormLayout>
                )
                : (
                    <FormLayout error={formula1Res}>
                        <div>
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
                                  univer-text-primary univer-flex univer-w-fit univer-cursor-pointer univer-flex-row
                                  univer-items-center univer-rounded univer-p-1 univer-px-2 univer-text-sm
                                  hover:univer-bg-primary-50
                                  dark:hover:!univer-bg-gray-800
                                `}
                                onClick={handleAdd}
                            >
                                <IncreaseIcon className="univer-mr-1" />
                                {localeService.t<LocaleKey>('sheets-data-validation-ui.list.add')}
                            </a>
                        </div>
                    </FormLayout>
                )}
        </>
    );
}
