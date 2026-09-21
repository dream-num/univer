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

import type { IDisposable } from '@univerjs/core';
import type { FormatPainterSessionService, IFormatPainterTarget } from './format-painter-session.service';

export const FORMAT_PAINTER_CURSOR_CSS = `
/* Keep the brush visible while the render engine updates its usual object/text cursors. */
canvas[data-format-painter="available"] {
    cursor: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M2 1v18l4-4 3 7 3-2-3-6h6z' fill='white' stroke='black'/%3E%3Cpath d='m17 13 8-10 2 2-8 10z' fill='white' stroke='black'/%3E%3Cpath d='M17 14c-4 0-2 5-6 6 5 2 10-1 8-5z' fill='black' stroke='white'/%3E%3C/svg%3E") 2 1, crosshair !important;
}
canvas[data-format-painter="unavailable"] {
    cursor: not-allowed !important;
}
`;

interface IFormatPainterCanvasOptions {
    adapterId: string;
    unitId: string;
    getUnitId?(): string;
    /** Object painting consumes the gesture before selection/transform handlers run. */
    intercept: boolean;
    getTarget(event: PointerEvent): IFormatPainterTarget | null;
}

export function bindFormatPainterCanvas(
    canvas: HTMLCanvasElement,
    session: FormatPainterSessionService,
    options: IFormatPainterCanvasOptions
): IDisposable {
    let pressed = false;
    let applyTask: ReturnType<typeof setTimeout> | undefined;
    const active = () => session.isActive(options.adapterId) && session.unitId === (options.getUnitId?.() ?? options.unitId);
    const updateCursor = (event?: PointerEvent) => {
        if (active()) {
            canvas.dataset.formatPainter = event && !options.getTarget(event) ? 'unavailable' : 'available';
        }
    };
    const subscription = session.state$.subscribe(() => {
        if (active()) {
            updateCursor();
        } else if (session.mode === 'off') {
            delete canvas.dataset.formatPainter;
            pressed = false;
            clearTimeout(applyTask);
        }
    });
    const down = (event: PointerEvent) => {
        if (!active() || event.button !== 0) {
            return;
        }
        pressed = !!options.getTarget(event);
        if (options.intercept || !pressed) {
            canvas.focus();
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    const up = (event: PointerEvent) => {
        if (!active() || !pressed || event.button !== 0) {
            return;
        }
        pressed = false;
        if (options.intercept) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
        // Native event callbacks run microtasks between capture and bubble listeners.
        // Wait for the complete event dispatch so text/cell selection has committed.
        clearTimeout(applyTask);
        applyTask = setTimeout(() => {
            const target = active() ? options.getTarget(event) : null;
            if (target) {
                session.apply(options.adapterId, target).catch((error: unknown) => console.error('[FormatPainter]', error));
            }
        }, 0);
    };
    const cancel = () => {
        pressed = false;
    };
    const doubleClick = (event: MouseEvent) => {
        if (active() && options.intercept) {
            event.preventDefault();
            event.stopImmediatePropagation();
        }
    };
    canvas.addEventListener('pointerdown', down, true);
    canvas.addEventListener('pointerup', up, true);
    canvas.addEventListener('pointermove', updateCursor, true);
    canvas.addEventListener('pointercancel', cancel, true);
    canvas.addEventListener('pointerleave', cancel, true);
    canvas.addEventListener('dblclick', doubleClick, true);
    return { dispose: () => {
        clearTimeout(applyTask);
        subscription.unsubscribe();
        canvas.removeEventListener('pointerdown', down, true);
        canvas.removeEventListener('pointerup', up, true);
        canvas.removeEventListener('pointermove', updateCursor, true);
        canvas.removeEventListener('pointercancel', cancel, true);
        canvas.removeEventListener('pointerleave', cancel, true);
        canvas.removeEventListener('dblclick', doubleClick, true);
        delete canvas.dataset.formatPainter;
    } };
}
