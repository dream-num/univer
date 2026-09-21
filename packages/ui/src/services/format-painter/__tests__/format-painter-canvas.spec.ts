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

import { Injector } from '@univerjs/core';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { bindFormatPainterCanvas } from '../format-painter-canvas';
import { FormatPainterSessionService } from '../format-painter-session.service';

const cleanups: Array<() => void> = [];
afterEach(() => {
    cleanups.splice(0).reverse().forEach((dispose) => dispose());
    vi.useRealTimers();
});

function setup(intercept = false) {
    vi.useFakeTimers();
    const injector = new Injector([[FormatPainterSessionService]]);
    cleanups.push(() => injector.dispose());
    const session = injector.get(FormatPainterSessionService);
    const canvas = document.createElement('canvas');
    document.body.appendChild(canvas);
    cleanups.push(() => canvas.remove());
    const applied: string[] = [];
    let selection = 'source';
    let compatible = true;
    session.register({
        id: 'text',
        priority: 0,
        changes$: new Subject(),
        isActive: () => true,
        canStart: () => true,
        capture: () => ({ unitId: 'doc', apply: (target) => {
            applied.push(target.shapeId!);
            return true;
        } }),
    });
    const binding = bindFormatPainterCanvas(canvas, session, {
        adapterId: 'text',
        unitId: 'doc',
        intercept,
        getTarget: () => compatible ? { unitId: 'doc', shapeId: selection } : null,
    });
    cleanups.push(() => binding.dispose());
    const gesture = () => {
        canvas.dispatchEvent(new MouseEvent('pointerdown', { bubbles: true, button: 0 }));
        canvas.dispatchEvent(new MouseEvent('pointerup', { bubbles: true, button: 0 }));
    };
    return {
        session,
        canvas,
        applied,
        gesture,
        binding,
        setSelection: (value: string) => {
            selection = value;
        },
        setCompatible: (value: boolean) => {
            compatible = value;
        },
    };
}

describe('format painter canvas gestures', () => {
    it('waits for native selection handlers before applying and restores the cursor after one use', async () => {
        const bed = setup();
        bed.canvas.addEventListener('pointerup', () => bed.setSelection('target'));
        bed.session.activate();
        expect(bed.canvas.dataset.formatPainter).toBe('available');
        bed.gesture();
        expect(bed.applied).toEqual([]);
        await vi.runAllTimersAsync();
        expect(bed.applied).toEqual(['target']);
        expect(bed.session.mode).toBe('off');
        expect(bed.canvas.dataset.formatPainter).toBeUndefined();
    });

    it('does not consume a continuous brush or select an incompatible object', async () => {
        const bed = setup(true);
        let selected = false;
        bed.canvas.addEventListener('pointerdown', () => {
            selected = true;
        });
        bed.session.activate(true);
        bed.setCompatible(false);
        bed.canvas.dispatchEvent(new MouseEvent('pointermove', { bubbles: true }));
        expect(bed.canvas.dataset.formatPainter).toBe('unavailable');
        bed.gesture();
        await vi.runAllTimersAsync();
        expect(bed.applied).toEqual([]);
        expect(selected).toBe(false);
        expect(bed.session.mode).toBe('continuous');
    });

    it('cancels deferred work and releases the cursor and listeners on disposal', async () => {
        const bed = setup();
        bed.session.activate();
        bed.gesture();
        bed.binding.dispose();
        await vi.runAllTimersAsync();
        expect(bed.applied).toEqual([]);
        expect(bed.canvas.dataset.formatPainter).toBeUndefined();
        bed.gesture();
        await vi.runAllTimersAsync();
        expect(bed.applied).toEqual([]);
    });
});
