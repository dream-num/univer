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
import { CellValueType, Styles, Tools } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getComparableCellData } from '../editing.render-controller';

describe('cell editor commit comparison', () => {
    const unchanged: Array<{ name: string; previous: ICellData; incoming: ICellData }> = [
        { name: 'ordinary text after draft Undo', previous: { v: 'Committed', t: CellValueType.STRING }, incoming: { v: 'Committed' } },
        { name: 'number text', previous: { v: 42, t: CellValueType.NUMBER }, incoming: { v: '42' } },
        { name: 'zero', previous: { v: 0, t: CellValueType.NUMBER }, incoming: { v: '0' } },
        { name: 'true', previous: { v: 1, t: CellValueType.BOOLEAN }, incoming: { v: 'TRUE' } },
        { name: 'false', previous: { v: 0, t: CellValueType.BOOLEAN }, incoming: { v: 'FALSE' } },
        { name: 'forced text', previous: { v: '001', t: CellValueType.FORCE_STRING }, incoming: { v: '001', t: CellValueType.FORCE_STRING } },
        { name: 'inherited text format', previous: { v: '001', t: CellValueType.STRING, s: 'text' }, incoming: { v: '001', s: 'text' } },
        { name: 'resolved equivalent style', previous: { v: 'Styled', t: CellValueType.STRING, s: 'blue' }, incoming: { v: 'Styled', s: { cl: { rgb: '#0000ff' } } } },
    ];

    it.each(unchanged)('recognizes unchanged $name without mutating the input or styles', ({ previous, incoming }) => {
        const styles = new Styles({ text: { n: { pattern: '@' } }, blue: { cl: { rgb: '#0000ff' } } });
        const previousBefore = Tools.deepClone(previous);
        const incomingBefore = Tools.deepClone(incoming);
        expect(getComparableCellData(incoming, styles, previous)).toEqual(getComparableCellData(previous, styles, previous));
        expect(previous).toEqual(previousBefore);
        expect(incoming).toEqual(incomingBefore);
        expect(styles.get('text')).toEqual({ n: { pattern: '@' } });
        expect(styles.get('blue')).toEqual({ cl: { rgb: '#0000ff' } });
    });

    const changed: Array<{ name: string; previous: ICellData; incoming: ICellData }> = [
        { name: 'actual text edit', previous: { v: 'old', t: CellValueType.STRING }, incoming: { v: 'new' } },
        { name: 'numeric conversion from text', previous: { v: '001', t: CellValueType.STRING }, incoming: { v: '001' } },
        { name: 'removing forced text', previous: { v: '001', t: CellValueType.FORCE_STRING }, incoming: { v: '001' } },
        { name: 'boolean conversion', previous: { v: 'TRUE', t: CellValueType.STRING }, incoming: { v: 'TRUE' } },
        { name: 'format-only edit', previous: { v: 'same', t: CellValueType.STRING, s: { bl: 0 } }, incoming: { v: 'same', s: { bl: 1 } } },
        { name: 'formula replacement', previous: { v: 2, t: CellValueType.NUMBER, f: '=1+1' }, incoming: { v: null, f: '=1+2' } },
    ];

    it.each(changed)('preserves a meaningful $name', ({ previous, incoming }) => {
        const styles = new Styles();
        expect(getComparableCellData(incoming, styles, previous)).not.toEqual(getComparableCellData(previous, styles, previous));
    });
});
