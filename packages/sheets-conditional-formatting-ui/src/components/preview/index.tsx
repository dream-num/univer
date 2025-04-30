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

import type { IConditionalFormattingRuleConfig } from '@univerjs/sheets-conditional-formatting';
import { BooleanNumber, ColorKit } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { SlashSingle } from '@univerjs/icons';
import { CFRuleType, DEFAULT_BG_COLOR, DEFAULT_FONT_COLOR, defaultDataBarNativeColor, defaultDataBarPositiveColor, getColorScaleFromValue, iconMap } from '@univerjs/sheets-conditional-formatting';
import { useMemo } from 'react';

export const Preview = (props: { rule?: IConditionalFormattingRuleConfig }) => {
    const rule = props.rule;

    if (!rule) return null;

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

    const previewClassName = `univer-pointer-events-none univer-flex univer-h-5 univer-min-w-[72px] univer-items-center
    univer-justify-center univer-text-xs`;

    switch (rule.type) {
        case CFRuleType.dataBar:
        {
            const { isGradient } = rule.config;
            const positiveColor = isGradient ? `linear-gradient(to right, ${rule.config.positiveColor || defaultDataBarPositiveColor}, rgb(255 255 255))` : rule.config.positiveColor;
            const nativeColor = isGradient ? `linear-gradient(to right,  rgb(255 255 255),${rule.config.nativeColor || defaultDataBarNativeColor})` : rule.config.nativeColor;

            return (
                <div className={previewClassName}>
                    <div
                        className="univer-h-full univer-w-1/2"
                        style={{
                            background: nativeColor,
                            border: `1px solid ${rule.config.nativeColor || defaultDataBarNativeColor}`,
                        }}
                    />
                    <div
                        className="univer-h-full univer-w-1/2"
                        style={{
                            background: positiveColor,
                            border: `1px solid ${rule.config.positiveColor || defaultDataBarPositiveColor}`,
                        }}
                    />
                </div>
            );
        }

        case CFRuleType.colorScale: {
            return colorList && (
                <div className={previewClassName}>
                    {colorList.map((item, index) => (
                        <div key={index} className="univer-h-full" style={{ width: `${100 / colorList.length}%`, background: item }} />
                    ))}
                </div>
            );
        }
        case CFRuleType.iconSet: {
            return iconSet && (
                <div className={previewClassName}>
                    {iconSet.map((base64, index) => (
                        base64 ?
                            <img key={index} className="univer-h-full" src={base64} draggable={false} />
                            : <SlashSingle key={index} />))}
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
                textDecoration: `${isUnderline ? 'underline' : ''} ${isStrikethrough ? 'line-through' : ''}`.replace(/^ /, '') ?? undefined,
                backgroundColor: bgColor,
                color: fontColor,
            };

            return (
                <div
                    className={clsx(previewClassName, {
                        'univer-font-bold': isBold,
                        'univer-italic': isItalic,
                    })}
                    style={style}
                >
                    123
                </div>
            );
        }
    }
};
