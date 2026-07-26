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
import {
    combineDrawingEffectFilter,
    createDrawingEffectFilter,
    resolveDrawingEffectMasks,
    resolveGlowEffect,
    resolveOuterShadowEffect,
} from '../drawing-effect';

describe('drawing effect', () => {
    it('resolves an outer shadow using opacity, direction, distance, and scale', () => {
        const resolved = resolveOuterShadowEffect({
            color: '#336699',
            opacity: 0.5,
            blurRadius: 8,
            direction: 90,
            distance: 4,
            sx: 2,
            sy: 2,
        });

        expect(resolved).toMatchObject({
            color: 'rgba(51,102,153,0.5)',
            blurRadius: 16,
            offsetY: 8,
        });
        expect(resolved?.offsetX).toBeCloseTo(0);
    });

    it('resolves a centered glow with the DrawingML calibration', () => {
        expect(resolveGlowEffect({
            color: '#5b9bd5',
            radius: 12,
        })).toEqual({
            color: '#5b9bd5',
            blurRadius: 6,
            offsetX: 0,
            offsetY: 0,
        });
    });

    it('creates one filter chain for glow and shadow without duplicating the source draw', () => {
        expect(createDrawingEffectFilter(
            { color: '#5b9bd5', radius: 4 },
            { color: '#000000', opacity: 0.4, blurRadius: 3, distance: 2, direction: 0 }
        )).toBe(
            'drop-shadow(0px 0px 2px #5b9bd5) '
            + 'drop-shadow(2px 0px 3px rgba(0,0,0,0.4))'
        );
        expect(combineDrawingEffectFilter('blur(1px)', 'drop-shadow(0 0 1px red)'))
            .toBe('blur(1px) drop-shadow(0 0 1px red)');
    });

    it('resolves alpha-mask passes for glow and outer shadow', () => {
        expect(resolveDrawingEffectMasks(
            { color: '#5b9bd5', radius: 4 },
            { color: '#000000', blurRadius: 3 }
        )).toEqual([
            { color: '#5b9bd5', blurRadius: 2, offsetX: 0, offsetY: 0 },
            { color: '#5b9bd5', blurRadius: 2, offsetX: 0, offsetY: 0 },
            { color: '#000000', blurRadius: 3, offsetX: 0, offsetY: 0 },
        ]);
    });
});
