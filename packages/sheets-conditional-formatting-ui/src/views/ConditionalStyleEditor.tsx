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

import type { IHighlightCell } from '@univerjs/sheets-conditional-formatting';
import { BooleanNumber } from '@univerjs/core';
import { clsx } from '@univerjs/design';
import { BoldIcon, FontColorDoubleIcon, ItalicIcon, StrikethroughIcon, UnderlineIcon } from '@univerjs/icons';
import { removeUndefinedAttr } from '@univerjs/sheets-conditional-formatting';
import { useRef, useState } from 'react';

import { ColorPicker } from './ColorPicker';

interface IConditionalStyleEditorProps {
    className?: string;
    style?: IHighlightCell['style'];
    onChange: (style: IHighlightCell['style']) => void;
}

export function createDefaultConditionalStyle(style?: IHighlightCell['style']): IHighlightCell['style'] {
    return {
        ...style,
        cl: { rgb: style?.cl?.rgb ?? '#2f56ef' },
        bg: { rgb: style?.bg?.rgb ?? '#e8ecfc' },
    };
}

const getAnotherBooleanNumber = (v: BooleanNumber | undefined) => {
    return [BooleanNumber.FALSE, undefined].includes(v) ? BooleanNumber.TRUE : BooleanNumber.FALSE;
};
const getBooleanFromNumber = (v: BooleanNumber) => v !== BooleanNumber.FALSE;
export const ConditionalStyleEditor = (props: IConditionalStyleEditorProps) => {
    const { style: providedStyle, onChange, className } = props;
    const [style, setStyle] = useState(() => createDefaultConditionalStyle(providedStyle));
    const [previousProvidedStyle, setPreviousProvidedStyle] = useState(providedStyle);
    const styleRef = useRef(style);

    if (providedStyle !== previousProvidedStyle) {
        const nextStyle = createDefaultConditionalStyle(providedStyle);
        setPreviousProvidedStyle(providedStyle);
        setStyle(nextStyle);
        styleRef.current = nextStyle;
    }

    const updateStyle = (patch: IHighlightCell['style']) => {
        const nextStyle = removeUndefinedAttr({ ...styleRef.current, ...patch });
        styleRef.current = nextStyle;
        setStyle(nextStyle);
        onChange(nextStyle);
    };

    const buttonItemClassName = 'univer-flex univer-cursor-pointer univer-items-center univer-rounded univer-px-1';

    return (
        <div className={clsx('univer-my-2.5 univer-flex univer-justify-between', className)}>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(style.bl || BooleanNumber.FALSE),
                })}
                onClick={() => updateStyle({ bl: getAnotherBooleanNumber(styleRef.current.bl) })}
            >
                <BoldIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(style.it || BooleanNumber.FALSE),
                })}
                onClick={() => updateStyle({ it: getAnotherBooleanNumber(styleRef.current.it) })}
            >
                <ItalicIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(style.ul?.s || BooleanNumber.FALSE),
                })}
                onClick={() => updateStyle({ ul: { s: getAnotherBooleanNumber(styleRef.current.ul?.s) } })}
            >
                <UnderlineIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(style.st?.s || BooleanNumber.FALSE),
                })}
                onClick={() => updateStyle({ st: { s: getAnotherBooleanNumber(styleRef.current.st?.s) } })}
            >
                <StrikethroughIcon />
            </div>
            <ColorPicker
                color={style.cl?.rgb ?? '#2f56ef'}
                onChange={(color) => updateStyle({ cl: { rgb: color } })}
                Icon={FontColorDoubleIcon}
            />
            <ColorPicker
                color={style.bg?.rgb ?? '#e8ecfc'}
                onChange={(color) => updateStyle({ bg: { rgb: color } })}
            />
        </div>
    );
};
