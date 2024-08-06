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

import React, { useMemo } from 'react';
import { BooleanNumber, ColorKit } from '@univerjs/core';
import { SlashSingle } from '@univerjs/icons';
import type { IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import { CFRuleType, DEFAULT_BG_COLOR, DEFAULT_FONT_COLOR, defaultDataBarNativeColor, defaultDataBarPositiveColor, getColorScaleFromValue, iconMap } from '@univerjs/sheets-conditional-formatting';
import styles from './index.module.less';

export const Preview = (props: { rule?: IConditionalFormattingRuleConfig }) => {
    const rule = props.rule;
    if (!rule) {
        return null;
    }
    const colorList = useMemo(() => {
        if (rule.type === CFRuleType.colorScale) {
            const config = rule.config.map((c, index) => ({ color: new ColorKit(c.color), value: index }));
            const maxValue = config.length - 1;
            const valueList = new Array(5).fill('').map((_v, index, arr) => index * maxValue / (arr.length - 1));
            return valueList.map((value) => getColorScaleFromValue(config, value));
        }
        return null;
    }, [rule]);
    const iconSet = useMemo(() => {
        if (rule.type === CFRuleType.iconSet) {
            return rule.config.map((item) => {
                const iconList = iconMap[item.iconType];
                return iconList && iconList[Number(item.iconId)];
            });
        }
    }, [rule]);
    switch (rule.type) {
        case CFRuleType.dataBar:
        {
            const { isGradient } = rule.config;
            const commonStyle = { width: '50%', height: '100%' };
            const positiveColor = isGradient ? `linear-gradient(to right, ${rule.config.positiveColor || defaultDataBarPositiveColor}, rgb(255 255 255))` : rule.config.positiveColor;
            const nativeColor = isGradient ? `linear-gradient(to right,  rgb(255 255 255),${rule.config.nativeColor || defaultDataBarNativeColor})` : rule.config.nativeColor;
            return (
                <div className={styles.cfPreview}>
                    <div style={{ ...commonStyle, background: nativeColor, border: `1px solid ${rule.config.nativeColor || defaultDataBarNativeColor}` }}></div>
                    <div style={{ ...commonStyle, background: positiveColor, border: `1px solid ${rule.config.positiveColor || defaultDataBarPositiveColor}` }}></div>
                </div>
            );
        }

        case CFRuleType.colorScale: {
            return colorList && (
                <div className={styles.cfPreview}>
                    {colorList.map((item, index) => (
                        <div key={index} style={{ width: `${100 / colorList.length}%`, height: '100%', background: item }}>
                        </div>
                    ))}
                </div>
            );
        }
        case CFRuleType.iconSet: {
            return iconSet && (
                <div className={styles.cfPreview}>
                    {iconSet.map((base64, index) => (base64 ? <img style={{ height: '100%' }} key={index} src={base64} /> : <SlashSingle key={index} />))}
                </div>
            );
        }
        case CFRuleType.highlightCell: {
            const { ul, st, it, bl, bg, cl } = rule.style;
            const isUnderline = ul?.s === BooleanNumber.TRUE;
            const isStrikethrough = st?.s === BooleanNumber.TRUE;
            const isItalic = it === BooleanNumber.TRUE;
            const isBold = bl === BooleanNumber.TRUE;
            const bgColor = bg?.rgb ?? DEFAULT_BG_COLOR;
            const fontColor = cl?.rgb ?? DEFAULT_FONT_COLOR;
            const style = {
                fontWeight: isBold ? 'bold' : undefined,
                fontStyle: isItalic ? 'italic' : undefined,
                textDecoration: `${isUnderline ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`.replace(/^ /, '') || undefined,
                backgroundColor: bgColor,
                color: fontColor,
            };
            return (
                <div style={style} className={styles.cfPreview}>
                    123
                </div>
            );
        }
    }
    return null;
};
