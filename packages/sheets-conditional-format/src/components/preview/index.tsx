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

import React from 'react';
import { BooleanNumber } from '@univerjs/core';
import type { IConditionalFormatRuleConfig } from '../../models/type';
import { DEFAULT_BG_COLOR, DEFAULT_FONT_COLOR, RuleType } from '../../base/const';
import styles from './index.module.less';

export const Preview = (props: { rule?: IConditionalFormatRuleConfig }) => {
    const rule = props.rule;
    if (!rule) {
        return null;
    }
    switch (rule.type) {
        case RuleType.dataBar:
        case RuleType.colorScale:{
            return null;
        }
        case RuleType.highlightCell:{
            const { ul, st, it, bl, bg, cl } = rule.style;
            const isUnderline = ul?.s === BooleanNumber.TRUE;
            const isStrikethrough = st?.s === BooleanNumber.TRUE;
            const isItalic = it === BooleanNumber.TRUE;
            const isBold = bl === BooleanNumber.TRUE;
            const bgColor = bg?.rgb || DEFAULT_BG_COLOR;
            const fontColor = cl?.rgb || DEFAULT_FONT_COLOR;
            const style = { fontWeight: isBold ? 'bold' : undefined,
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
