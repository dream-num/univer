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

import type { IHighlightCell } from '@univerjs/sheets-conditional-formatting';
import { BooleanNumber, useDependency } from '@univerjs/core';
import { removeUndefinedAttr } from '@univerjs/sheets-conditional-formatting';
import { ComponentManager } from '@univerjs/ui';
import cl from 'clsx';
import React, { useEffect, useState } from 'react';
import { ColorPicker } from '../color-picker';
import styles from './index.module.less';

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
    const componentManager = useDependency(ComponentManager);
    const [isBold, isBoldSet] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.bl) {
            return defaultV;
        }
        return style.bl;
    });
    const [isItalic, isItalicSet] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.it) {
            return defaultV;
        }
        return style.it;
    });
    const [isUnderline, isUnderlineSet] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.ul) {
            return defaultV;
        }
        return style.ul.s;
    });
    const [isStrikethrough, isStrikethroughSet] = useState<BooleanNumber | undefined>(() => {
        const defaultV = undefined;
        if (!style?.st) {
            return defaultV;
        }
        return style.st.s;
    });
    const [fontColor, fontColorSet] = useState(() => {
        const defaultV = '#2f56ef';
        if (!style?.cl?.rgb) {
            return defaultV;
        }
        return style.cl.rgb;
    });
    const [bgColor, bgColorSet] = useState(() => {
        const defaultV = '#e8ecfc';
        if (!style?.bg?.rgb) {
            return defaultV;
        }
        return style.bg.rgb;
    });
    const BoldSingleIcon = componentManager.get('BoldSingle');
    const ItalicSingleIcon = componentManager.get('ItalicSingle');
    const UnderlineSingleIcon = componentManager.get('UnderlineSingle');
    const StrikethroughSingle = componentManager.get('StrikethroughSingle');
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isBold, isItalic, isUnderline, isStrikethrough, fontColor, bgColor]);
    return (
        <div className={`
          ${styles.cfStyleEdit}
          ${className}
        `}
        >
            { BoldSingleIcon && (
                <div className={cl({ [styles.isActive]: getBooleanFromNumber(isBold || BooleanNumber.FALSE) }, styles.buttonItem)} onClick={() => isBoldSet(getAnotherBooleanNumber(isBold))}>
                    <BoldSingleIcon />
                </div>
            )}
            { ItalicSingleIcon && (
                <div className={cl({ [styles.isActive]: getBooleanFromNumber(isItalic || BooleanNumber.FALSE) }, styles.buttonItem)} onClick={() => isItalicSet(getAnotherBooleanNumber(isItalic))}>
                    <ItalicSingleIcon />
                </div>
            )}
            { UnderlineSingleIcon && (
                <div className={cl({ [styles.isActive]: getBooleanFromNumber(isUnderline || BooleanNumber.FALSE) }, styles.buttonItem)} onClick={() => isUnderlineSet(getAnotherBooleanNumber(isUnderline))}>
                    <UnderlineSingleIcon />
                </div>
            )}
            { StrikethroughSingle && (
                <div className={cl({ [styles.isActive]: getBooleanFromNumber(isStrikethrough || BooleanNumber.FALSE) }, styles.buttonItem)} onClick={() => isStrikethroughSet(getAnotherBooleanNumber(isStrikethrough))}>
                    <StrikethroughSingle />
                </div>
            )}
            <ColorPicker color={fontColor} onChange={fontColorSet} iconId="FontColor" />
            <ColorPicker color={bgColor} onChange={bgColorSet} iconId="PaintBucket" />
        </div>
    );
};
