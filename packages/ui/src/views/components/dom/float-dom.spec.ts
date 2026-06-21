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
import { resolveFloatDomOverflow } from './FloatDom';

describe('resolveFloatDomOverflow', () => {
    it('keeps regular float dom layers clipped', () => {
        expect(resolveFloatDomOverflow({})).toEqual({
            outerOverflow: 'hidden',
            innerOverflow: 'hidden',
        });
    });

    it('allows docs custom block bleed layers to escape the drawing wrapper', () => {
        expect(resolveFloatDomOverflow({
            customBlockRenderViewport: {
                bleedLeft: 210,
                bleedWidth: 1420,
            },
        })).toEqual({
            outerOverflow: 'visible',
            innerOverflow: 'visible',
        });
    });
});
