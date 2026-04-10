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

import { describe, expect, it } from 'vitest';
import { DEFAULT_STYLES } from '../../../types/const';
import { BaselineOffset, BooleanNumber } from '../../../types/enum';
import { convertTextRotation, DEFAULT_FONTFACE_PLANE, getBaselineOffsetInfo, getFontStyleString } from '../utils';

describe('document data-model utils', () => {
    it('should build font strings from default and styled text', () => {
        const defaultStyle = getFontStyleString();
        const superscriptStyle = getFontStyleString({
            ff: 'Noto Sans',
            fs: 12.2,
            it: BooleanNumber.TRUE,
            bl: BooleanNumber.TRUE,
            va: BaselineOffset.SUPERSCRIPT,
        });
        const normalStyle = getFontStyleString({
            ff: '"Ping Fang"',
            fs: 14,
            it: BooleanNumber.FALSE,
            bl: BooleanNumber.FALSE,
        });

        expect(defaultStyle).toEqual({
            fontCache: `${DEFAULT_STYLES.fs}pt  ${DEFAULT_STYLES.ff}`,
            fontString: `${DEFAULT_STYLES.fs}pt  ${DEFAULT_STYLES.ff}`,
            fontSize: DEFAULT_STYLES.fs,
            originFontSize: DEFAULT_STYLES.fs,
            fontFamily: DEFAULT_STYLES.ff,
        });
        expect(superscriptStyle.fontFamily).toBe('"Noto Sans"');
        expect(superscriptStyle.originFontSize).toBe(13);
        expect(superscriptStyle.fontSize).toBeCloseTo(7.8);
        expect(superscriptStyle.fontString).toContain(DEFAULT_FONTFACE_PLANE);
        expect(normalStyle.fontCache).toBe('normal normal 14pt "Ping Fang"');
    });

    it('should expose baseline offsets and convert text rotation', () => {
        expect(getBaselineOffsetInfo('Inter', 11)).toEqual({
            sbr: 0.6,
            sbo: 11,
            spr: 0.6,
            spo: 11,
        });
        expect(convertTextRotation({ a: 30 })).toEqual({ centerAngle: 0, vertexAngle: 30 });
        expect(convertTextRotation({ a: 30, v: BooleanNumber.TRUE })).toEqual({ centerAngle: 90, vertexAngle: 90 });
        expect(convertTextRotation()).toEqual({ centerAngle: 0, vertexAngle: 0 });
    });
});
