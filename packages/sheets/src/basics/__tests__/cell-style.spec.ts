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

import type { ICellData } from '@univerjs/core';
import { Styles } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { handleStyle, transformStyle } from '../cell-style';

describe('Test cell style sanitization', () => {
    it('ignores unexpected keys when merging cell borders', () => {
        const styles = new Styles();
        const oldVal: ICellData = {
            s: {
                bd: {
                    l: {
                        s: 0 as never,
                        cl: { rgb: '#000000' },
                    },
                },
            },
        };

        const newVal: ICellData = {
            s: JSON.parse(`{
                "bd": {
                    "__proto__": { "polluted": "yes" },
                    "evil": { "s": 2, "cl": { "rgb": "#ff00ff" } },
                    "t": { "s": 1, "cl": { "rgb": "#ff0000" }, "extra": true }
                },
                "unexpected": { "enabled": true },
                "__proto__": { "polluted": "yes" }
            }`) as ICellData['s'],
        };

        handleStyle(styles, oldVal, newVal);

        expect(styles.getStyleByCell(oldVal)).toEqual({
            bd: {
                l: {
                    s: 0,
                    cl: { rgb: '#000000' },
                },
                t: {
                    s: 1,
                    cl: { rgb: '#ff0000' },
                },
            },
        });
        expect((styles.getStyleByCell(oldVal)?.bd as Record<string, unknown>).evil).toBeUndefined();
        expect((styles.getStyleByCell(oldVal) as Record<string, unknown>).unexpected).toBeUndefined();
        expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('only records allowed border keys in undo snapshots', () => {
        const backupStyle = transformStyle(null, JSON.parse(`{
            "bd": {
                "t": { "s": 1, "cl": { "rgb": "#00ff00" }, "extra": true },
                "evil": { "s": 3, "cl": { "rgb": "#ff00ff" } }
            },
            "unexpected": { "enabled": true }
        }`));

        expect(backupStyle).toEqual({
            bd: {
                t: null,
            },
        });
    });
});
