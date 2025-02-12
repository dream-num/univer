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

import type { IStyleData } from '../../types/interfaces';
import { describe, expect, it } from 'vitest';
import { composeStyles } from '../tools';

describe('test compose function', () => {
    it('basic test', () => {
        const style1: IStyleData = {
            bg: { rgb: 'rgb(255, 255, 255)' },
        };
        const style2: IStyleData = {
            bg: { rgb: 'rgb(0, 0, 0)' },
        };
        const composeStyle1 = composeStyles(style1, style2);
        expect(composeStyle1.bg?.rgb).toBe('rgb(0, 0, 0)');

        const composeStyle2 = composeStyles(style2, style1);
        expect(composeStyle2.bg?.rgb).toBe('rgb(255, 255, 255)');
    });

    it('test with undefined', () => {
        const style1: IStyleData = {
            bg: { rgb: 'rgb(255, 255, 255)' },
        };
        const composeStyle1 = composeStyles(style1, undefined);
        expect(composeStyle1.bg?.rgb).toBe('rgb(255, 255, 255)');
    });

    it('test with null', () => {
        const style1: IStyleData = {
            bg: { rgb: 'rgb(255, 255, 255)' },
        };
        const composeStyle1 = composeStyles(style1, null);
        expect(composeStyle1.bg?.rgb).toBe('rgb(255, 255, 255)');
    });

    it('test partial', () => {
        const style1: IStyleData = {
            bg: { rgb: 'rgb(255, 255, 255)' },
        };
        const style2: IStyleData = {
            cl: { rgb: 'rgb(0, 0, 0)' },
        };
        const composeStyle1 = composeStyles(style1, style2);
        expect(composeStyle1.bg?.rgb).toBe('rgb(255, 255, 255)');
        expect(composeStyle1.cl?.rgb).toBe('rgb(0, 0, 0)');
    });

    it('test partial2', () => {
        const style1: IStyleData = {
            bg: { rgb: 'rgb(255, 255, 255)' },
            cl: { rgb: 'rgb(0, 255, 0)' },
        };
        const style2: IStyleData = {
            cl: { rgb: 'rgb(0, 0, 0)' },
        };
        const composeStyle1 = composeStyles(style1, style2);
        expect(composeStyle1.bg?.rgb).toBe('rgb(255, 255, 255)');
        expect(composeStyle1.cl?.rgb).toBe('rgb(0, 0, 0)');

        const composeStyle2 = composeStyles(style2, style1);
        expect(composeStyle2.bg?.rgb).toBe('rgb(255, 255, 255)');
        expect(composeStyle2.cl?.rgb).toBe('rgb(0, 255, 0)');
    });
});
