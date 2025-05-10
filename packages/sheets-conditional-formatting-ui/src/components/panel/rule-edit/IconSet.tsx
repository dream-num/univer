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

import type { Workbook } from '@univerjs/core';
import type { IIconSet, IIconType } from '@univerjs/sheets-conditional-formatting';
import type { IFormulaEditorRef } from '@univerjs/sheets-formula-ui';
import type { IStyleEditorProps } from './type';
import { get, IUniverInstanceService, LocaleService, set, Tools, UniverInstanceType } from '@univerjs/core';
import { borderClassName, Checkbox, clsx, Dropdown, InputNumber, Select } from '@univerjs/design';
import { MoreDownSingle, SlashSingle } from '@univerjs/icons';
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFValueType,
    compareWithNumber,
    createDefaultValue,
    EMPTY_ICON_TYPE,
    getOppositeOperator,
    iconGroup,
    iconMap,
} from '@univerjs/sheets-conditional-formatting';
import { FormulaEditor } from '@univerjs/sheets-formula-ui';
import { ILayoutService, useDependency, useScrollYOverContainer, useSidebarClick } from '@univerjs/ui';
import { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

const getIcon = (iconType: string, iconId: string | number) => {
    const arr = iconMap[iconType] || [];
    return arr[Number(iconId)] || '';
};

const TextInput = (props: { id: number; type: CFValueType; value: number | string; onChange: (v: number | string) => void; error?: string }) => {
    const { error, type, onChange } = props;

    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
    const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();

    const formulaEditorRef = useRef<IFormulaEditorRef>(null);
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const isOutSide = formulaEditorRef.current?.isClickOutSide(e);
        isOutSide && isFocusFormulaEditorSet(false);
    });
    return (
        <div className="univer-relative">
            {type !== CFValueType.formula
                ? (
                    <>
                        <InputNumber
                            className={clsx({
                                'univer-border-red-500': error,
                            })}
                            value={Number(props.value) || 0}
                            onChange={(v) => onChange(v ?? 0)}
                        />
                        {error && (
                            <div className="univer-absolute univer-text-xs univer-text-red-500">
                                {error}
                            </div>
                        )}
                    </>
                )
                : (
                    <div className="univer-w-full">
                        <FormulaEditor
                            ref={formulaEditorRef}
                            initValue={String(props.value) as any}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            isFocus={isFocusFormulaEditor}
                            onChange={(v = '') => {
                                const formula = v || '';
                                onChange(formula);
                            }}
                            onFocus={() => isFocusFormulaEditorSet(true)}
                        />
                    </div>
                )}
        </div>
    );
};
const createDefaultConfigItem = (iconType: IIconType, index: number, list: unknown[]): IIconSet['config'][number] => ({
    operator: CFNumberOperator.greaterThan,
    value: { type: CFValueType.num, value: (list.length - 1 - index) * 10 },
    iconType,
    iconId: String(index),
});

interface IIconGroupListProps {
    onClick: (iconType: IIconType) => void;
    iconType?: IIconType;
};
const IconGroupList = forwardRef<HTMLDivElement, IIconGroupListProps>((props, ref) => {
    const { onClick } = props;
    const localeService = useDependency(LocaleService);

    const handleClick = (iconType: IIconType) => {
        onClick(iconType);
    };
    return (
        <div ref={ref} className="univer-w-80">
            {iconGroup.map((group, index) => {
                return (
                    <div key={index} className="univer-mb-3">
                        <div className="univer-mb-1 univer-text-sm">{localeService.t(group.title)}</div>
                        <div className="univer-flex univer-flex-wrap">
                            {group.group.map((groupItem) => {
                                return (
                                    <div
                                        key={groupItem.name}
                                        className="univer-mb-1 univer-flex univer-w-1/2 univer-items-center"
                                        onClick={() => { handleClick(groupItem.name); }}
                                    >
                                        <a
                                            className={`
                                              univer-cursor-pointer univer-rounded
                                              hover:univer-bg-gray-100
                                            `}
                                        >
                                            {groupItem.list.map((base64, index) => (
                                                <img
                                                    key={index}
                                                    className="univer-size-5"
                                                    src={base64}
                                                    draggable={false}
                                                />
                                            ))}
                                        </a>
                                    </div>
                                );
                            })}
                        </div>

                    </div>
                );
            })}
        </div>
    );
});

const IconItemList = (props: { onClick: (iconType: IIconType, iconId: string) => void; iconType?: IIconType; iconId: string }) => {
    const { onClick } = props;

    const list = useMemo(() => {
        const result: { iconType: IIconType; iconId: string; base64: string }[] = [];
        for (const key in iconMap) {
            const list = iconMap[key as IIconType];
            const iconType = key as IIconType;
            list.forEach((base64, index) => {
                result.push({
                    iconType,
                    base64,
                    iconId: String(index),
                });
            });
        }
        return result;
    }, []);

    const handleClick = (item: typeof list[0]) => {
        onClick(item.iconType, item.iconId);
    };

    return (
        <div>
            <div
                className="univer-mb-2.5 univer-flex univer-cursor-pointer univer-items-center univer-pl-1"
                onClick={() => handleClick({ iconType: EMPTY_ICON_TYPE as any, iconId: '', base64: '' })}
            >
                <SlashSingle className="univer-size-5" />
                <span className="univer-ml-2">无单元格图标</span>
            </div>
            <div className="univer-flex univer-w-64 univer-flex-wrap">
                {list.map((item) => (
                    <div
                        key={`${item.iconType}_${item.iconId}`}
                        className={`
                          univer-mb-2 univer-mr-2 univer-flex univer-cursor-pointer univer-items-center
                          univer-justify-center univer-rounded
                          hover:univer-bg-gray-100
                        `}
                    >
                        <img
                            className="univer-size-5"
                            src={item.base64}
                            draggable={false}
                            onClick={() => handleClick(item)}
                        />
                    </div>
                ))}
            </div>
        </div>
    );
};

const IconSetRuleEdit = (props: {
    configList: IIconSet['config'];
    onChange: (keys: string[], value: unknown) => void;
    errorMap?: Record<string, string>;
}) => {
    const { onChange, configList, errorMap = {} } = props;
    const localeService = useDependency(LocaleService);

    const options = [{ label: localeService.t(`sheet.cf.symbol.${CFNumberOperator.greaterThan}`), value: CFNumberOperator.greaterThan }, { label: localeService.t(`sheet.cf.symbol.${CFNumberOperator.greaterThanOrEqual}`), value: CFNumberOperator.greaterThanOrEqual }];
    const valueTypeOptions = [
        { label: localeService.t(`sheet.cf.valueType.${CFValueType.num}`), value: CFValueType.num },
        { label: localeService.t(`sheet.cf.valueType.${CFValueType.percent}`), value: CFValueType.percent },
        { label: localeService.t(`sheet.cf.valueType.${CFValueType.percentile}`), value: CFValueType.percentile },
        { label: localeService.t(`sheet.cf.valueType.${CFValueType.formula}`), value: CFValueType.formula },

    ];
    const handleValueValueChange = (v: number | string, index: number) => {
        onChange([String(index), 'value', 'value'], v);
    };

    const handleOperatorChange = (operator: CFNumberOperator, index: number) => {
        onChange([String(index), 'operator'], operator);
        const defaultValue = createDefaultValue(CFSubRuleType.number, operator) as number;
        handleValueValueChange(defaultValue, index);
    };

    const handleValueTypeChange = (v: string, index: number) => {
        onChange([String(index), 'value', 'type'], v);
        const item = configList[index];
        const defaultValue = createDefaultValue(CFSubRuleType.number, item.operator) as number;
        handleValueValueChange(defaultValue, index);
    };
    const render = useMemo(() => {
        return configList.map((item, index) => {
            const error = errorMap[index];
            const icon = getIcon(item.iconType, item.iconId);
            const isEnd = index === configList.length - 1;
            const isFirst = index === 0;
            const preItem = configList[index - 1];
            const lessThanText = preItem?.value.type === CFValueType.formula ? localeService.t('sheet.cf.valueType.formula') : preItem?.value.value;

            const handleIconClick = (iconType: IIconType, iconId: string) => {
                const value = { ...item, iconId, iconType } as typeof item;
                onChange([String(index)], value);
            };
            return (
                <div
                    key={index}
                    className={index ? 'univer-mt-6' : 'univer-mt-3'}
                >
                    <div
                        className={`
                          univer-mt-3 univer-flex univer-items-center univer-justify-between univer-text-sm
                          univer-text-gray-600
                          dark:univer-text-gray-200
                        `}
                    >
                        <div
                            className="univer-w-[45%]"
                        >
                            {localeService.t('sheet.cf.iconSet.icon')}
                            {index + 1}
                        </div>

                        <div className="univer-w-[45%]">
                            <>
                                {!isFirst && !isEnd && localeService.t('sheet.cf.iconSet.rule')}
                                {!isFirst && !isEnd && (
                                    <span
                                        className={`
                                          univer-font-medium univer-text-gray-600
                                          dark:univer-text-gray-200
                                        `}
                                    >
                                        (
                                        {localeService.t('sheet.cf.iconSet.when')}
                                        {localeService.t(`sheet.cf.symbol.${getOppositeOperator(preItem.operator)}`)}
                                        {lessThanText}
                                        {isEnd ? '' : ` ${localeService.t('sheet.cf.iconSet.and')} `}
                                        )
                                    </span>
                                )}

                            </>
                        </div>
                    </div>
                    <div className="univer-mt-3 univer-flex univer-items-center univer-justify-between univer-gap-4">
                        <div className="univer-flex univer-items-center">
                            <Dropdown
                                overlay={(
                                    <div className="univer-rounded-lg univer-p-4">
                                        <IconItemList onClick={handleIconClick} iconId={item.iconId} iconType={item.iconType} />
                                    </div>
                                )}
                            >
                                <div
                                    className={clsx(`
                                      univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center
                                      univer-justify-between univer-rounded-md univer-bg-white univer-px-4 univer-py-2
                                      univer-text-xs univer-text-gray-600 univer-transition-all
                                      dark:univer-text-gray-200
                                      hover:univer-border-primary-600
                                    `, borderClassName)}
                                >
                                    {icon
                                        ? <img src={icon} className="univer-size-4" draggable={false} />
                                        : (
                                            <SlashSingle
                                                className="univer-size-4"
                                            />
                                        )}
                                    <MoreDownSingle />
                                </div>
                            </Dropdown>
                        </div>
                        {!isEnd
                            ? (
                                <Select
                                    options={options}
                                    value={item.operator}
                                    onChange={(v) => { handleOperatorChange(v as CFNumberOperator, index); }}
                                />
                            )
                            : (
                                <div
                                    className={`
                                      univer-mt-0 univer-w-[45%] univer-text-sm univer-text-gray-600
                                      dark:univer-text-gray-200
                                    `}
                                >
                                    {localeService.t('sheet.cf.iconSet.rule')}
                                    <span className="univer-font-medium">
                                        {localeService.t('sheet.cf.iconSet.when')}
                                        {localeService.t(`sheet.cf.symbol.${getOppositeOperator(preItem.operator)}`)}
                                        {lessThanText}
                                        {isEnd ? '' : ` ${localeService.t('sheet.cf.iconSet.and')} `}
                                    </span>
                                </div>
                            )}
                    </div>
                    {!isEnd
                        ? (
                            <>
                                <div
                                    className={`
                                      univer-mt-3 univer-flex univer-items-center univer-justify-between univer-gap-4
                                      univer-text-sm univer-text-gray-600
                                      dark:univer-text-gray-200
                                    `}
                                >
                                    <div>
                                        {localeService.t('sheet.cf.iconSet.type')}
                                    </div>
                                    <div>
                                        {localeService.t('sheet.cf.iconSet.value')}
                                    </div>
                                </div>
                                <div
                                    className={`
                                      univer-mt-3 univer-flex univer-items-center univer-justify-between univer-gap-4
                                    `}
                                >
                                    <Select
                                        className="univer-flex-shrink-0"
                                        options={valueTypeOptions}
                                        value={item.value.type}
                                        onChange={(v) => {
                                            handleValueTypeChange(v as CFNumberOperator, index);
                                        }}
                                    />
                                    <div>
                                        <TextInput
                                            id={index}
                                            type={item.value.type}
                                            error={error}
                                            value={item.value.value || ''}
                                            onChange={(v) => {
                                                handleValueValueChange(v, index);
                                            }}
                                        />
                                    </div>
                                </div>
                            </>
                        )
                        : <div />}
                </div>
            );
        });
    }, [configList, errorMap]);
    return render;
};
export const IconSet = (props: IStyleEditorProps<unknown, IIconSet>) => {
    const { interceptorManager } = props;
    const rule = props.rule?.type === CFRuleType.iconSet ? props.rule : undefined;
    const localeService = useDependency(LocaleService);
    const [errorMap, errorMapSet] = useState<Record<string, string>>({});
    const [currentIconType, currentIconTypeSet] = useState<IIconType>(() => {
        const defaultV = Object.keys(iconMap)[0] as IIconType;
        if (rule && rule.config.length) {
            const type = rule.config[0].iconType;
            const isNotSame = rule.config.some((item) => item.iconType !== type);
            if (!isNotSame) {
                return type;
            }
        }
        return defaultV;
    });

    const [configList, configListSet] = useState(() => {
        if (rule && rule.config.length) {
            return Tools.deepClone(rule?.config);
        }
        const list = iconMap[currentIconType] || [];
        return new Array(list.length).fill('').map((_e, index, list) => {
            if (index === list.length - 1) {
                // The last condition is actually the complement of the above conditions,
                // packages/sheets-conditional-formatting/src/services/calculate-unit/icon-set.ts
                return {
                    operator: CFNumberOperator.lessThanOrEqual,
                    value: { type: CFValueType.num, value: Number.MAX_SAFE_INTEGER },
                    iconType: currentIconType,
                    iconId: String(index),
                };
            }
            return createDefaultConfigItem(currentIconType, index, list);
        });
    });

    const [isShowValue, isShowValueSet] = useState(() => {
        if (!rule) {
            return true;
        }
        return !!rule.isShowValue;
    });

    const previewIcon = useMemo(() => {
        const list = configList.map((item) => {
            return getIcon(item.iconType, item.iconId);
        });
        return (
            <div className="univer-flex univer-items-center">
                {list.map((icon, index) => (icon
                    ? (
                        <img
                            className="univer-size-5"
                            key={index}
                            src={icon}
                        />
                    )
                    : <SlashSingle className="univer-size-5" key={index} />))}
            </div>
        );
    }, [configList]);

    const checkResult = (_configList: typeof configList) => {
        const isTypeSame = _configList.reduce((pre, cur, index) => {
            if ((pre.preType && !pre.result) || _configList.length - 1 === index) {
                return pre;
            }

            if (cur.value.type === CFValueType.formula) {
                return {
                    preType: CFValueType.formula,
                    result: false,
                };
            }
            if (pre.preType) {
                return {
                    result: pre.preType === cur.value.type,
                    preType: cur.value.type,
                };
            } else {
                return {
                    result: true,
                    preType: cur.value.type,
                };
            }
        }, { result: true, preType: '' }).result;
        if (isTypeSame && [CFValueType.num, CFValueType.percent, CFValueType.percentile].includes(_configList[0].value.type)) {
            const result: Record<string, string> = {};
            _configList.forEach((item, index, arr) => {
                const preIndex = index - 1;
                if (preIndex < 0 || index === arr.length - 1) {
                    return;
                }
                const preItem = _configList[index - 1];
                const preOperator = getOppositeOperator(preItem.operator);
                if (!compareWithNumber({ operator: preOperator, value: preItem.value.value as number }, item.value.value as number)) {
                    result[index] = `${localeService.t(`sheet.cf.form.${preOperator}`, String(preItem.value.value))} `;
                }
            });
            return result;
        }
        return {};
    };
    const handleChange = (keys: string[], v: unknown) => {
        const oldV = get(configList, keys);
        if (oldV !== v) {
            set(configList, keys, v);
            configListSet([...configList]);
            errorMapSet(checkResult(configList));
        }
    };
    const handleClickIconList = (iconType: IIconType) => {
        currentIconTypeSet(iconType);
        const list = iconMap[iconType] || [];
        const config = new Array(list.length).fill('').map((_e, index, list) => createDefaultConfigItem(iconType, index, list));
        configListSet(config);
        errorMapSet(checkResult(config));
    };

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, {
            handler() {
                const result: IIconSet = { type: CFRuleType.iconSet, isShowValue, config: configList } as IIconSet;
                return result;
            },
        });
        return () => {
            dispose();
        };
    }, [isShowValue, configList, interceptorManager]);

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().beforeSubmit, {
            handler() {
                const keys = Object.keys(errorMap);
                return keys.length === 0;
            },
        });
        return () => {
            dispose();
        };
    }, [isShowValue, configList, interceptorManager, errorMap]);

    const reverseIcon = () => {
        const iconList = configList.map((item) => ({ ...item }));
        configList.forEach((item, index) => {
            const mirrorIndex = configList.length - 1 - index;
            const newIcon = iconList[mirrorIndex];
            item.iconId = newIcon.iconId;
            item.iconType = newIcon.iconType;
        });
        configListSet([...configList]);
    };
    const layoutService = useDependency(ILayoutService);
    const [iconGroupListEl, setIconGroupListEl] = useState<HTMLDivElement>();

    useScrollYOverContainer(iconGroupListEl, layoutService.rootContainerElement);

    return (
        <div>
            <div className="univer-mt-4 univer-text-sm univer-text-gray-600">
                {localeService.t('sheet.cf.panel.styleRule')}
            </div>
            <div className="univer-mt-3">
                <Dropdown
                    overlay={(
                        <div className="univer-rounded-lg univer-p-4">
                            <IconGroupList
                                ref={(el) => {
                                    !iconGroupListEl && el && setIconGroupListEl(el);
                                }}
                                iconType={currentIconType}
                                onClick={handleClickIconList}
                            />
                        </div>
                    )}
                >
                    <div
                        className={clsx(`
                          univer-box-border univer-flex univer-h-8 univer-w-full univer-items-center
                          univer-justify-between univer-rounded-md univer-bg-white univer-px-4 univer-py-2
                          univer-text-xs univer-text-gray-600 univer-transition-all
                          hover:univer-border-primary-600
                        `, borderClassName)}
                    >
                        {previewIcon}
                        <MoreDownSingle />
                    </div>
                </Dropdown>
            </div>
            <div className="univer-mt-3 univer-flex univer-items-center univer-text-xs">
                <div className="univer-flex univer-items-center univer-text-xs">
                    <Checkbox onChange={reverseIcon} />
                    {localeService.t('sheet.cf.iconSet.reverseIconOrder')}
                </div>
                <div className="univer-ml-6 univer-flex univer-items-center univer-text-xs">
                    <Checkbox checked={!isShowValue} onChange={(v) => { isShowValueSet(!v); }} />
                    {localeService.t('sheet.cf.iconSet.onlyShowIcon')}
                </div>
            </div>
            <IconSetRuleEdit errorMap={errorMap} onChange={handleChange} configList={configList} />
        </div>
    );
};
