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

import type { Workbook } from '@univerjs/core';
import type { IIconSet, IIconType } from '@univerjs/sheets-conditional-formatting';
import type { IStyleEditorProps } from './type';

import { get, IUniverInstanceService, LocaleService, set, Tools, UniverInstanceType, useDependency } from '@univerjs/core';
import { Checkbox, DropdownLegacy, InputNumber, Select } from '@univerjs/design';
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
import { ILayoutService, useScrollYOverContainer, useSidebarClick } from '@univerjs/ui';

import React, { forwardRef, useEffect, useMemo, useRef, useState } from 'react';

import stylesBase from '../index.module.less';
import styles from './index.module.less';

const getIcon = (iconType: string, iconId: string | number) => {
    const arr = iconMap[iconType] || [];
    return arr[Number(iconId)] || '';
};

const TextInput = (props: { id: number; type: CFValueType; value: number | string; onChange: (v: number | string) => void; error?: string }) => {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const unitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getUnitId();
    const subUnitId = univerInstanceService.getCurrentUnitForType<Workbook>(UniverInstanceType.UNIVER_SHEET)!.getActiveSheet()?.getSheetId();
    const className = useMemo(() => {
        if (props.error) {
            return styles.errorInput;
        }
        return '';
    }, [props.error]);

    const formulaEditorActionsRef = useRef<Parameters<typeof FormulaEditor>[0]['actions']>({});
    const [isFocusFormulaEditor, isFocusFormulaEditorSet] = useState(false);

    useSidebarClick((e: MouseEvent) => {
        const handleOutClick = formulaEditorActionsRef.current?.handleOutClick;
        handleOutClick && handleOutClick(e, () => isFocusFormulaEditorSet(false));
    });
    return (
        <div className={styles.positionRelative}>
            {props.type !== CFValueType.formula
                ? (
                    <>
                        <InputNumber className={className} value={Number(props.value) || 0} onChange={(v) => props.onChange(v ?? 0)} />
                        {props.error && (
                            <div className={styles.errorText}>
                                {props.error}
                            </div>
                        )}
                    </>
                )
                : (
                    <div style={{ width: '100%' }}>
                        <FormulaEditor
                            initValue={String(props.value) as any}
                            unitId={unitId}
                            subUnitId={subUnitId}
                            isFocus={isFocusFormulaEditor}
                            onChange={(v = '') => {
                                const formula = v || '';
                                props.onChange(formula);
                            }}
                            onFocus={() => isFocusFormulaEditorSet(true)}
                            actions={formulaEditorActionsRef.current}
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

interface IconGroupListProps {
    onClick: (iconType: IIconType) => void;
    iconType?: IIconType;
};
const IconGroupList = forwardRef<HTMLDivElement | null, IconGroupListProps>((props, ref) => {
    const localeService = useDependency(LocaleService);

    const handleClick = (iconType: IIconType) => {
        props.onClick(iconType);
    };
    return (
        <div ref={ref} className={styles.iconGroupList}>
            {iconGroup.map((group, index) => {
                return (
                    <div key={index} className={styles.group}>
                        <div className={styles.title}>{localeService.t(group.title)}</div>
                        <div className={styles.itemContent}>
                            {group.group.map((groupItem) => {
                                return (
                                    <div className={styles.itemWrap} key={groupItem.name} onClick={() => { handleClick(groupItem.name); }}>
                                        <div className={styles.item}>
                                            {groupItem.list.map((base64, index) => <img className={styles.icon} key={index} src={base64}></img>)}
                                        </div>
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
        props.onClick(item.iconType, item.iconId);
    };
    return (
        <div className={styles.iconItemListWrap}>
            <div className={styles.none} onClick={() => handleClick({ iconType: EMPTY_ICON_TYPE as any, iconId: '', base64: '' })}>
                <SlashSingle className={styles.icon} />
                <span>无单元格图标</span>
            </div>
            <div className={styles.iconItemList}>
                {list.map((item) => (
                    <div key={`${item.iconType}_${item.iconId}`} className={styles.item}>
                        <img
                            onClick={() => handleClick(item)}
                            className={`
                              ${styles.icon}
                            `}
                            src={item.base64}
                        >
                        </img>
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

    const options = [{ label: localeService.t(`sheet.cf.symbol.${CFNumberOperator.greaterThan}`), value: CFNumberOperator.greaterThan },
        { label: localeService.t(`sheet.cf.symbol.${CFNumberOperator.greaterThanOrEqual}`), value: CFNumberOperator.greaterThanOrEqual }];
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
                    className={`
                      ${index ? stylesBase.mTXl : stylesBase.mTSm}
                    `}
                >
                    <div className={`
                      ${stylesBase.label}
                      ${styles.flex}
                    `}
                    >
                        <div className={`
                          ${styles.width45}
                        `}
                        >
                            {localeService.t('sheet.cf.iconSet.icon')}
                            {index + 1}
                        </div>

                        <div className={`
                          ${styles.width45}
                        `}
                        >
                            <>
                                {!isFirst && !isEnd && localeService.t('sheet.cf.iconSet.rule')}
                                {!isFirst && !isEnd && (
                                    <span className={styles.stress}>
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
                    <div className={`
                      ${styles.flex}
                      ${stylesBase.mTSm}
                    `}
                    >
                        <div className={`
                          ${styles.iconWrap}
                          ${styles.width45}
                        `}
                        >
                            <DropdownLegacy overlay={<IconItemList onClick={handleIconClick} iconId={item.iconId} iconType={item.iconType} />}>
                                <div className={styles.dropdownIcon}>
                                    {icon ? <img src={icon} className={styles.icon} /> : <SlashSingle className={styles.icon} />}
                                    <MoreDownSingle />
                                </div>
                            </DropdownLegacy>

                        </div>
                        {!isEnd
                            ? (
                                <Select
                                    className={`
                                      ${stylesBase.mL0}
                                      ${styles.width45}
                                      ${stylesBase.mR0}
                                    `}
                                    options={options}
                                    value={item.operator}
                                    onChange={(v) => { handleOperatorChange(v as CFNumberOperator, index); }}
                                />
                            )
                            : (
                                <div
                                    className={`
                                      ${styles.width45}
                                      ${stylesBase.label}
                                    `}
                                    style={{ marginTop: 0 }}
                                >
                                    {localeService.t('sheet.cf.iconSet.rule')}
                                    <span className={styles.stress}>
                                        (
                                        {localeService.t('sheet.cf.iconSet.when')}
                                        {localeService.t(`sheet.cf.symbol.${getOppositeOperator(preItem.operator)}`)}
                                        {lessThanText}
                                        {isEnd ? '' : ` ${localeService.t('sheet.cf.iconSet.and')} `}
                                        )
                                    </span>
                                </div>
                            )}
                    </div>
                    {!isEnd
                        ? (
                            <>
                                <div className={`
                                  ${stylesBase.mTSm}
                                  ${stylesBase.label}
                                  ${styles.flex}
                                `}
                                >
                                    <div className={`
                                      ${styles.width45}
                                    `}
                                    >
                                        {localeService.t('sheet.cf.iconSet.type')}
                                    </div>
                                    <div className={`
                                      ${styles.width45}
                                    `}
                                    >
                                        {localeService.t('sheet.cf.iconSet.value')}
                                    </div>
                                </div>
                                <div className={`
                                  ${stylesBase.mTSm}
                                  ${styles.flex}
                                `}
                                >
                                    <Select
                                        style={{ flexShrink: 0 }}
                                        className={`
                                          ${styles.width45}
                                          ${stylesBase.mL0}
                                        `}
                                        options={valueTypeOptions}
                                        value={item.value.type}
                                        onChange={(v) => { handleValueTypeChange(v as CFNumberOperator, index); }}
                                    />
                                    <div className={`
                                      ${stylesBase.mL0}
                                      ${styles.width45}
                                    `}
                                    >
                                        <TextInput
                                            id={index}
                                            type={item.value.type}
                                            error={error}
                                            value={item.value.value || ''}
                                            onChange={(v) => handleValueValueChange(v, index)}
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
            <div className={styles.iconWrap}>
                {list.map((icon, index) => (icon
                    ? (
                        <img
                            className={styles.icon}
                            key={index}
                            src={icon}
                        />
                    )
                    : <SlashSingle className={styles.icon} key={index} />))}
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
        <div className={styles.iconSet}>
            <div className={stylesBase.title}>{localeService.t('sheet.cf.panel.styleRule')}</div>
            <div className={`
              ${stylesBase.mTSm}
            `}
            >
                <DropdownLegacy
                    placement="bottomLeft"
                    overlay={(
                        <IconGroupList
                            ref={(el) => !iconGroupListEl && el && setIconGroupListEl(el)}
                            iconType={currentIconType}
                            onClick={handleClickIconList}
                        />
                    )}
                >
                    <div className={styles.dropdownIcon} style={{ width: 'unset' }}>
                        {previewIcon}
                        <MoreDownSingle />
                    </div>
                    {/* <div>{previewIcon}</div> */}
                </DropdownLegacy>
            </div>
            <div className={`
              ${stylesBase.mTSm}
              ${styles.renderConfig}
            `}
            >
                <div className={styles.utilItem}>
                    <Checkbox onChange={reverseIcon} />
                    {localeService.t('sheet.cf.iconSet.reverseIconOrder')}
                </div>
                <div className={`
                  ${styles.utilItem}
                  ${stylesBase.mLXl}
                `}
                >
                    <Checkbox checked={!isShowValue} onChange={(v) => { isShowValueSet(!v); }} />
                    {localeService.t('sheet.cf.iconSet.onlyShowIcon')}
                </div>
            </div>
            <IconSetRuleEdit errorMap={errorMap} onChange={handleChange} configList={configList} />
        </div>
    );
};
