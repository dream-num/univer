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

import { BooleanNumber } from '@univerjs/core';
import {
    CFNumberOperator,
    CFRuleType,
    CFSubRuleType,
    CFValueType,
    iconMap,
    IIconSetType,
} from '@univerjs/sheets-conditional-formatting';
import { renderToStaticMarkup } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { ConditionalFormattingRulePreview } from '../ConditionalFormattingRulePreview';

describe('ConditionalFormattingRulePreview', () => {
    it('previews the configured highlight colors and text decoration', () => {
        const container = document.createElement('div');
        container.innerHTML = renderToStaticMarkup(
            <ConditionalFormattingRulePreview
                rule={{
                    type: CFRuleType.highlightCell,
                    subType: CFSubRuleType.number,
                    operator: CFNumberOperator.greaterThan,
                    value: 0,
                    style: {
                        bg: { rgb: '#ff0000' },
                        cl: { rgb: '#0000ff' },
                        ul: { s: BooleanNumber.TRUE },
                        st: { s: BooleanNumber.TRUE },
                    },
                }}
            />
        );

        const preview = container.firstElementChild as HTMLElement;
        expect(preview.style.backgroundColor).toBe('#ff0000');
        expect(preview.style.color).toBe('#0000ff');
        expect(preview.style.textDecoration).toBe('underline line-through');
    });

    it('previews both negative and positive data bar colors', () => {
        const container = document.createElement('div');
        container.innerHTML = renderToStaticMarkup(
            <ConditionalFormattingRulePreview
                rule={{
                    type: CFRuleType.dataBar,
                    isShowValue: true,
                    config: {
                        min: { type: CFValueType.min },
                        max: { type: CFValueType.max },
                        isGradient: false,
                        nativeColor: '#ff0000',
                        positiveColor: '#00ff00',
                    },
                }}
            />
        );

        const bars = Array.from(container.firstElementChild!.children) as HTMLElement[];
        expect(bars.map((bar) => bar.style.background)).toEqual(['#ff0000', '#00ff00']);
    });

    it('previews the configured color scale endpoints', () => {
        const container = document.createElement('div');
        container.innerHTML = renderToStaticMarkup(
            <ConditionalFormattingRulePreview
                rule={{
                    type: CFRuleType.colorScale,
                    config: [
                        { index: 0, color: '#000000', value: { type: CFValueType.min } },
                        { index: 1, color: '#ffffff', value: { type: CFValueType.max } },
                    ],
                }}
            />
        );

        const firstColor = container.firstElementChild!.firstElementChild as HTMLElement;
        const lastColor = container.firstElementChild!.lastElementChild as HTMLElement;
        expect([firstColor.style.background, lastColor.style.background]).toEqual(['rgb(0, 0, 0)', 'rgb(255, 255, 255)']);
    });

    it('previews the chosen icons in rule order', () => {
        const container = document.createElement('div');
        container.innerHTML = renderToStaticMarkup(
            <ConditionalFormattingRulePreview
                rule={{
                    type: CFRuleType.iconSet,
                    isShowValue: true,
                    config: [
                        {
                            operator: CFNumberOperator.greaterThanOrEqual,
                            value: { type: CFValueType.num, value: 10 },
                            iconType: IIconSetType.threeArrows,
                            iconId: '2',
                        },
                        {
                            operator: CFNumberOperator.greaterThanOrEqual,
                            value: { type: CFValueType.num, value: 0 },
                            iconType: IIconSetType.threeArrowsGray,
                            iconId: '0',
                        },
                    ],
                }}
            />
        );

        expect(Array.from(container.querySelectorAll('img'), (image) => image.getAttribute('src'))).toEqual([
            iconMap[IIconSetType.threeArrows][2],
            iconMap[IIconSetType.threeArrowsGray][0],
        ]);
    });

    it('renders nothing while no rule is selected', () => {
        expect(renderToStaticMarkup(<ConditionalFormattingRulePreview />)).toBe('');
    });
});
