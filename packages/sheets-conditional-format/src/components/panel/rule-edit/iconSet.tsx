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

import React, { useEffect, useMemo, useState } from 'react';
import set from 'lodash.set';
import get from 'lodash.get';
import { MoreDownSingle } from '@univerjs/icons';

import { Checkbox, Dropdown, InputNumber, Select } from '@univerjs/design';
import { useDependency } from '@wendellhu/redi/react-bindings';

import { LocaleService, Tools } from '@univerjs/core';
import type { IIconType } from '../../../models/icon-map';
import { iconMap } from '../../../models/icon-map';
import type { IIconSet } from '../../../models/type';
import { NumberOperator, RuleType, ValueType } from '../../../base/const';
import { getOppositeOperator } from '../../../services/calculate-unit/utils';
import stylesBase from '../index.module.less';
import type { IStyleEditorProps } from './type';
import styles from './index.module.less';

const createDefaultConfigItem = (iconType: IIconType, index: number, list: unknown[]): IIconSet['config'][number] => ({
    operator: NumberOperator.greaterThan,
    value: { type: ValueType.num, value: (list.length - 1 - index) * 10 },
    iconType,
    iconId: String(index),
});

const IconGroupList = (props: {
    onClick: (iconType: IIconType) => void;
    iconType?: IIconType;
}) => {
    const list = useMemo(() => {
        const result: { title: IIconType; options: string[] }[] = [];
        for (const key in iconMap) {
            const value = iconMap[key as IIconType];
            result.push({
                title: key as IIconType,
                options: value,
            });
        }
        return result;
    }, []);

    const handleClick = (iconType: IIconType) => {
        props.onClick(iconType);
    };
    return (
        <div className={styles.iconGroupList}>
            {list.map((item, index) => {
                return (
                    <div key={index}>
                        {/* <div className={stylesBase.label}>{item.title}</div> */}
                        <div className={styles.item} onClick={() => { handleClick(item.title); }}>{item.options.map((base64, index) => <img className={styles.icon} key={index} src={base64}></img>)}</div>
                    </div>
                );
            })}
        </div>
    );
};

const IconItemList = (props: { onClick: (iconType: IIconType, iconId: string) => void;iconType?: IIconType; iconId: string }) => {
    const list = useMemo(() => {
        const result: { iconType: IIconType;iconId: string; base64: string }[] = [];
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
        <div className={styles.iconItemList}>
            {list.map((item) => (
                <div key={`${item.iconType}_${item.iconId}`} className={styles.item}>
                    <img onClick={() => handleClick(item)} className={`${styles.icon}`} src={item.base64}></img>
                </div>
            ))}
        </div>
    );
};

const IconSetRuleEdit = (props: {
    configList: IIconSet['config'];
    onChange: (keys: string[], value: unknown) => void;
}) => {
    const { onChange, configList } = props;
    const localeService = useDependency(LocaleService);

    const options = [{ label: localeService.t(`sheet.cf.symbol.${NumberOperator.greaterThan}`), value: NumberOperator.greaterThan },
        { label: localeService.t(`sheet.cf.symbol.${NumberOperator.greaterThanOrEqual}`), value: NumberOperator.greaterThanOrEqual }];
    const valueTypeOptions = [
        { label: localeService.t(`sheet.cf.valueType.${ValueType.num}`), value: ValueType.num },
        { label: localeService.t(`sheet.cf.valueType.${ValueType.percent}`), value: ValueType.percent },
        { label: localeService.t(`sheet.cf.valueType.${ValueType.percentile}`), value: ValueType.percentile },
        { label: localeService.t(`sheet.cf.valueType.${ValueType.formula}`), value: ValueType.formula },

    ];
    const handleOperatorChange = (operator: NumberOperator, index: number) => {
        onChange([String(index), 'operator'], operator);
    };
    const handleValueValueChange = (v: number, index: number) => {
        onChange([String(index), 'value', 'value'], v);
    };
    const handleValueTypeChange = (v: string, index: number) => {
        onChange([String(index), 'value', 'type'], v);
    };
    const render = useMemo(() => {
        return configList.map((item, index) => {
            const icon = iconMap[item.iconType][Number(item.iconId)];
            const isEnd = index === configList.length - 1;
            const isFirst = index === 0;
            const preItem = configList[index - 1];
            const handleIconClick = (iconType: IIconType, iconId: string) => {
                const value = { ...item, iconId, iconType } as typeof item;
                onChange([String(index)], value);
            };
            return (
                <div key={index} className={`${index ? stylesBase.mTXl : stylesBase.mTSm}`}>
                    <div className={`${stylesBase.label} ${styles.flex}`}>
                        <div className={`${styles.width45}`}>
                            {localeService.t('sheet.cf.iconSet.icon')}
                            {' '}
                            {index + 1}
                        </div>

                        <div className={`${styles.width45}`}>
                            <>
                                {localeService.t('sheet.cf.iconSet.rule')}
                                {!isFirst && (
                                    <span>
                                        (
                                        {localeService.t('sheet.cf.iconSet.when')}
                                        {' '}
                                        {localeService.t(`sheet.cf.symbol.${getOppositeOperator(preItem.operator)}`)}
                                        {' '}
                                        {preItem.value.value}
                                        {isEnd ? '' : localeService.t('sheet.cf.iconSet.and')}
                                        )
                                    </span>
                                )}

                            </>

                        </div>

                    </div>
                    <div className={`${styles.flex} ${stylesBase.mTSm}`}>
                        <div className={`${styles.iconWrap} ${styles.width45}`}>
                            <Dropdown overlay={<IconItemList onClick={handleIconClick} iconId={item.iconId} iconType={item.iconType} />}>
                                <div className={styles.dropdownIcon}>
                                    <img src={icon} className={styles.icon} />
                                    <MoreDownSingle />
                                </div>

                            </Dropdown>

                        </div>
                        {!isEnd
                            ? <Select className={`${stylesBase.mL0} ${styles.width45} ${stylesBase.mR0}`} options={options} value={item.operator} onChange={(v) => { handleOperatorChange(v as NumberOperator, index); }} />
                            : (
                                <div className={`${stylesBase.label} ${styles.width45}`}>
                                </div>
                            )}
                    </div>
                    {!isEnd
                        ? (
                            <>
                                <div className={`${stylesBase.mTSm} ${stylesBase.label} ${styles.flex}`}>
                                    <div className={`${styles.width45}`}>
                                        {' '}
                                        {localeService.t('sheet.cf.iconSet.type')}
                                    </div>
                                    <div className={`${styles.width45}`}>
                                        {' '}
                                        {localeService.t('sheet.cf.iconSet.value')}
                                    </div>
                                </div>
                                <div className={`${stylesBase.mTSm} ${styles.flex}`}>
                                    <Select className={`${styles.width45} ${stylesBase.mL0}`} options={valueTypeOptions} value={item.value.type} onChange={(v) => { handleValueTypeChange(v as NumberOperator, index); }} />
                                    <InputNumber className={`${stylesBase.mL0} ${styles.width45}`} value={Number(item.value.value)} onChange={(v) => handleValueValueChange(v as number, index)} />
                                </div>
                            </>
                        )
                        : <div />}

                </div>
            );
        });
    }, [configList]);
    return render;
};
export const IconSet = (props: IStyleEditorProps<unknown, IIconSet>) => {
    const { interceptorManager } = props;
    const rule = props.rule?.type === RuleType.iconSet ? props.rule : undefined;
    const localeService = useDependency(LocaleService);

    const [currentIconType, currentIconTypeSet] = useState<IIconType>(() => {
        if (rule) {
            const type = rule.config[0].iconType;
            const isNotSame = rule.config.some((item) => item.iconType !== type);
            if (!isNotSame) {
                return type;
            }
        }
        return Object.keys(iconMap)[0] as IIconType;
    });

    const [configList, configListSet] = useState(() => {
        if (rule) {
            return Tools.deepClone(rule?.config);
        }
        const list = iconMap[currentIconType];
        return new Array(list.length).fill('').map((_e, index, list) => createDefaultConfigItem(currentIconType, index, list));
    });

    const [isShowValue, isShowValueSet] = useState(() => {
        if (!rule) {
            return true;
        }
        return rule.isShowValue;
    });

    const previewIcon = useMemo(() => {
        const list = configList.map((item) => iconMap[item.iconType][Number(item.iconId)]);
        return (
            <div className={styles.iconWrap}>
                {list.map((icon, index) => <img className={styles.icon} key={index} src={icon} />)}
            </div>
        );
    }, [configList]);

    const handleClickIconList = (iconType: IIconType) => {
        currentIconTypeSet(iconType);
        const list = iconMap[iconType];
        const config = new Array(list.length).fill('').map((_e, index, list) => createDefaultConfigItem(iconType, index, list));
        configListSet(config);
    };

    const handleChange = (keys: string[], v: unknown) => {
        const oldV = get(configList, keys);
        if (oldV !== v) {
            set(configList, keys, v);
            configListSet([...configList]);
        }
    };

    useEffect(() => {
        const dispose = interceptorManager.intercept(interceptorManager.getInterceptPoints().submit, { handler() {
            const result: IIconSet = { type: RuleType.iconSet, isShowValue, config: configList } as IIconSet;
            return result;
        } });
        return () => {
            dispose();
        };
    }, [isShowValue, configList, interceptorManager]);

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
    return (
        <div className={styles.iconSet}>
            <div className={stylesBase.title}>{localeService.t('sheet.cf.panel.styleRule')}</div>
            <div className={`${stylesBase.mTSm}`}>
                <Dropdown overlay={<IconGroupList iconType={currentIconType} onClick={handleClickIconList} />}>
                    <div className={styles.dropdownIcon} style={{ width: 'unset' }}>
                        {previewIcon}
                        <MoreDownSingle />
                    </div>
                    {/* <div>{previewIcon}</div> */}
                </Dropdown>
            </div>
            <div className={`${stylesBase.mTSm} ${styles.renderConfig}`}>
                <div className={styles.utilItem}>
                    <Checkbox onChange={reverseIcon} />
                    {localeService.t('sheet.cf.iconSet.reverseIconOrder')}
                </div>
                <div className={`${styles.utilItem} ${stylesBase.mLXl}`}>
                    <Checkbox value={undefined} checked={!isShowValue} onChange={(v) => { isShowValueSet(!v); }} />
                    {localeService.t('sheet.cf.iconSet.onlyShowIcon')}
                </div>
            </div>
            <IconSetRuleEdit onChange={handleChange} configList={configList} />
        </div>
    );
};
