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

import { Styles } from '../styles';

describe('Test Styles', () => {
    it('Init styles, set style', () => {
        const styles = new Styles({
            1: { fs: 12 },
            2: { fs: 14 },
        });

        // get style by id
        let style = styles.get('1');
        expect(style).toEqual({ fs: 12 });

        // get style by data
        style = styles.get({ fs: 12 });
        expect(style).toEqual({ fs: 12 });

        // add style
        const styleNull = styles.setValue(null);
        expect(styleNull).toBeUndefined();

        const styleId = styles.setValue({ fs: 16 });

        // search style not in cache
        const searchId = styles.search({ fs: 12 }, JSON.stringify({ fs: 12 }));
        expect(searchId).toBe('1');

        // Add duplicate style, search style in cache
        const styleIdDuplicate = styles.setValue({ fs: 16 });
        expect(styleIdDuplicate).toBe(styleId);

        // each function
        let count = 0;
        styles.each((style) => {
            count++;
        });
        expect(count).toBe(3);

        // toJSON function
        const stylesJSON = styles.toJSON();
        expect(stylesJSON).toEqual({
            1: { fs: 12 },
            2: { fs: 14 },
            [styleId as string]: { fs: 16 },
        });

        // getStyleByCell function
        const cellStyleId = { s: '1' };
        style = styles.getStyleByCell(cellStyleId);
        expect(style).toEqual({ fs: 12 });

        const cellStyleObject = { s: { fs: 12 } };
        style = styles.getStyleByCell(cellStyleObject);
        expect(style).toEqual({ fs: 12 });
    });
});
