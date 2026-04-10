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

import type { IPopup } from '@univerjs/ui';
import { LocaleService } from '@univerjs/core';
import { ptToPixel } from '@univerjs/engine-render';
import { useDependency } from '@univerjs/ui';
import { useMemo } from 'react';

export const KeywordInputPlaceholderComponentKey = 'docs.quick.insert.keyword-input-placeholder';

const DEFAULT_FONT_SIZE = 11;

interface IKeywordInputPlaceholderExtraProps {
    fontSize?: number;
    fontString?: string;
    fontFamily?: string;
    fontStyle?: 'normal' | 'italic';
    fontWeight?: 'normal' | 'bold';
    ascent?: number;
    contentHeight?: number;
}

function measureTextWidth(text: string, font: string) {
    if (typeof document === 'undefined') {
        return text.length * DEFAULT_FONT_SIZE;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');

    if (!context) {
        return text.length * DEFAULT_FONT_SIZE;
    }

    context.font = font;

    return Math.ceil(context.measureText(text).width);
}

export const KeywordInputPlaceholder = ({ popup }: { popup: IPopup<IKeywordInputPlaceholderExtraProps> }) => {
    const localeService = useDependency(LocaleService);
    const placeholder = localeService.t('docQuickInsert.keywordInputPlaceholder');
    const fontSize = popup.extraProps?.fontSize ?? DEFAULT_FONT_SIZE;
    const fontSizePx = ptToPixel(fontSize);
    const fontString = popup.extraProps?.fontString ?? `${fontSizePx}px sans-serif`;
    const ascent = popup.extraProps?.ascent ?? fontSizePx;
    const contentHeight = Math.max(popup.extraProps?.contentHeight ?? fontSizePx, fontSizePx);
    const textWidth = useMemo(() => measureTextWidth(placeholder, fontString), [fontString, placeholder]);

    return (
        <div
            className={`
              univer-select-none univer-font-normal univer-text-gray-500 univer-transition-colors
              dark:!univer-text-gray-400
            `}
        >
            <svg
                width={textWidth}
                height={contentHeight}
                viewBox={`0 0 ${textWidth} ${contentHeight}`}
                style={{ overflow: 'visible', display: 'block' }}
            >
                <text
                    x={0}
                    y={ascent}
                    fill="currentColor"
                    style={{
                        font: fontString,
                        fontFamily: popup.extraProps?.fontFamily,
                        fontStyle: popup.extraProps?.fontStyle,
                        fontWeight: popup.extraProps?.fontWeight,
                    }}
                >
                    {placeholder}
                </text>
            </svg>
        </div>
    );
};

KeywordInputPlaceholder.componentKey = KeywordInputPlaceholderComponentKey;
