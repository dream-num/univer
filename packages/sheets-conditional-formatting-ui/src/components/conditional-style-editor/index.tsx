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
import { useEffect, useState } from 'react';
import { ColorPicker } from '../color-picker';

interface IConditionalStyleEditorProps {
    className?: string;
    style?: IHighlightCell['style'];
    onChange: (style: IHighlightCell['style']) => void;
};

const getAnotherBooleanNumber = (v: BooleanNumber | undefined) => {
    return [BooleanNumber.FALSE, undefined].includes(v) ? BooleanNumber.TRUE : BooleanNumber.FALSE;
};
const getBooleanFromNumber = (v: BooleanNumber) => v !== BooleanNumber.FALSE;
export const ConditionalStyleEditor = (props: IConditionalStyleEditorProps) => {
    const { style, onChange, className } = props;

    const [isBold, setIsBold] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.bl) {
            return defaultV;
        }
        return style.bl;
    });
    const [isItalic, setIsItalic] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.it) {
            return defaultV;
        }
        return style.it;
    });
    const [isUnderline, setIsUnderline] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.ul) {
            return defaultV;
        }
        return style.ul.s;
    });
    const [isStrikethrough, setIsStrikethrough] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.st) {
            return defaultV;
        }
        return style.st.s;
    });
    const [fontColor, setFontColor] = useState(() => {
        const defaultV = '#2f56ef';
        if (!style?.cl?.rgb) {
            return defaultV;
        }
        return style.cl.rgb;
    });
    const [bgColor, setBgColor] = useState(() => {
        const defaultV = '#e8ecfc';
        if (!style?.bg?.rgb) {
            return defaultV;
        }
        return style.bg.rgb;
    });

    useEffect(() => {
        const resultStyle: IHighlightCell['style'] = {
            bl: isBold,
            it: isItalic,
        };
        if (fontColor !== undefined) {
            resultStyle.cl = { rgb: fontColor };
        }
        if (bgColor !== undefined) {
            resultStyle.bg = { rgb: bgColor };
        }
        if (isStrikethrough !== undefined) {
            resultStyle.st = { s: isStrikethrough };
        }
        if (isUnderline !== undefined) {
            resultStyle.ul = { s: isUnderline };
        }
        onChange(removeUndefinedAttr(resultStyle));
    }, [isBold, isItalic, isUnderline, isStrikethrough, fontColor, bgColor]);

    const buttonItemClassName = 'univer-flex univer-cursor-pointer univer-items-center univer-rounded univer-px-1';

    return (
        <div className={clsx('univer-my-2.5 univer-flex univer-justify-between', className)}>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(isBold || BooleanNumber.FALSE),
                })}
                onClick={() => setIsBold(getAnotherBooleanNumber(isBold))}
            >
                <BoldIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(isItalic || BooleanNumber.FALSE),
                })}
                onClick={() => setIsItalic(getAnotherBooleanNumber(isItalic))}
            >
                <ItalicIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(isUnderline || BooleanNumber.FALSE),
                })}
                onClick={() => setIsUnderline(getAnotherBooleanNumber(isUnderline))}
            >
                <UnderlineIcon />
            </div>
            <div
                className={clsx(buttonItemClassName, {
                    'univer-bg-gray-100 dark:!univer-bg-gray-700': getBooleanFromNumber(isStrikethrough || BooleanNumber.FALSE),
                })}
                onClick={() => setIsStrikethrough(getAnotherBooleanNumber(isStrikethrough))}
            >
                <StrikethroughIcon />
            </div>
            <ColorPicker color={fontColor} onChange={setFontColor} Icon={FontColorDoubleIcon} />
            <ColorPicker color={bgColor} onChange={setBgColor} />
        </div>
    );
};
