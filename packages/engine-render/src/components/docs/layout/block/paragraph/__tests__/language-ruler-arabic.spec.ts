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

import { describe, expect, it, vi } from 'vitest';

import { ArabicHandler } from '../language-ruler';

vi.mock('../../../model/glyph', () => ({
    createSkeletonLetterGlyph: (content: string) => ({
        content,
        // Provide a non-null `fontStyle` so the charAdvances path in
        // ArabicHandler runs; the FontCache mock below produces stub
        // widths from the `fontStyle` reference identity, not its
        // contents.
        fontStyle: { fontSize: 14 },
        // `width` is expected by ArabicHandler when it pins the last
        // advance; use a deterministic value derived from `content` so
        // tests can assert on it.
        width: content.length * 10,
    }),
    createSkeletonWordGlyph: (content: string) => ({ content }),
}));

vi.mock('../../../tools', () => ({
    getFontCreateConfig: () => ({}),
}));

// Stub FontCache: for each prefix `slice(0, i)`, return width = i * 10
// (linear growth). Matches the `content.length * 10` value the mock
// `createSkeletonLetterGlyph` reports, so `charAdvances[last] === width`
// holds without an extra clamp.
vi.mock('../../../shaping-engine/font-cache', () => ({
    FontCache: {
        getTextSize: (text: string) => ({ width: text.length * 10, height: 14 }),
    },
}));

describe('ArabicHandler', () => {
    it('preserves logical character order when bundling Arabic chars into a glyph', () => {
        // Logical: ك ت ا ب  (Arabic for "book")
        const result = ArabicHandler(
            0,
            'كتاب',
            {} as any,
            {} as any,
            {} as any,
            {} as any
        );

        expect(result.step).toBe(4);
        expect(result.glyphGroup).toHaveLength(1);
        // The glyph content MUST be in logical order so that the renderer's
        // shaping engine produces correct initial/medial/final forms.
        expect(result.glyphGroup[0].content).toBe('كتاب');
    });

    it('stops at the first non-Arabic character', () => {
        const result = ArabicHandler(
            0,
            'كتابXY',
            {} as any,
            {} as any,
            {} as any,
            {} as any
        );

        expect(result.step).toBe(4);
        expect(result.glyphGroup[0].content).toBe('كتاب');
    });

    it('handles a single Arabic letter', () => {
        const result = ArabicHandler(
            0,
            'ا',
            {} as any,
            {} as any,
            {} as any,
            {} as any
        );

        expect(result.step).toBe(1);
        expect(result.glyphGroup[0].content).toBe('ا');
    });

    it('does not reverse - regression for shaping bug', () => {
        // Hebrew is handled by the default path, so use only Arabic here.
        // Specifically guards against the historical bug where chars were
        // unshifted (reversed), making the renderer compute wrong joining
        // forms.
        const input = 'مرحبا';
        const result = ArabicHandler(
            0,
            input,
            {} as any,
            {} as any,
            {} as any,
            {} as any
        );

        expect(result.glyphGroup[0].content).toBe(input);
        // Explicitly assert it is NOT reversed.
        expect(result.glyphGroup[0].content).not.toBe(input.split('').reverse().join(''));
    });

    it('attaches per-char prefix advances on multi-char clusters for sub-glyph caret', () => {
        // Caret-aware cluster contract: an Arabic word is shaped as a
        // single glyph (so cursive joining works) but the editor still
        // needs to land the caret between two letters of the word.
        // ArabicHandler is the sole producer of `charAdvances` today;
        // the hit-test / caret / step-by-char paths all key off this
        // array. With the mock FontCache returning width = i*10 per
        // prefix, a 4-char cluster must have advances [10, 20, 30, 40]
        // and the last entry must equal `glyph.width` exactly.
        const result = ArabicHandler(0, 'كتاب', {} as any, {} as any, {} as any, {} as any);
        const g = result.glyphGroup[0];

        expect(g.charAdvances).toEqual([10, 20, 30, 40]);
        // Last advance is pinned to the painted width — see the comment
        // in `ArabicHandler` about sub-pixel drift.
        expect(g.charAdvances![g.charAdvances!.length - 1]).toBe(g.width);
    });

    it('does not attach charAdvances on single-char clusters', () => {
        // No sub-cluster geometry exists for a one-char glyph: the
        // legacy "caret before / caret after the glyph" path is
        // sufficient. Attaching `charAdvances` here would force the
        // sub-offset path with no measurable benefit and risk
        // confusing downstream consumers that probe its presence.
        const result = ArabicHandler(0, 'ا', {} as any, {} as any, {} as any, {} as any);
        expect(result.glyphGroup[0].charAdvances).toBeUndefined();
    });

    it('produces non-decreasing advances (clamped, monotonic)', () => {
        // Defensive contract for hit-test binary search: even if a
        // shaper's prefix width were to dip due to a contextual
        // ligature reshuffle, our clamp keeps `charAdvances` weakly
        // monotonic so `resolveSubOffset`'s midpoint walk stays
        // well-defined. The mock here is monotonic by construction;
        // this test pins the invariant against future regressions.
        const result = ArabicHandler(0, 'كتاب', {} as any, {} as any, {} as any, {} as any);
        const adv = result.glyphGroup[0].charAdvances!;
        for (let i = 1; i < adv.length; i++) {
            expect(adv[i]).toBeGreaterThanOrEqual(adv[i - 1]);
        }
    });
});
