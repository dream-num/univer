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

import type { IPoint } from '@univerjs/engine-render';
import { Disposable, toDisposable } from '@univerjs/core';

export interface IMobileCanvasGestureOptions {
    start: (point: IPoint) => 'pan' | 'object' | 'ignore';
    tap: (point: IPoint) => void;
    pan: (delta: IPoint) => void;
    pinch: (factor: number, previousCenter: IPoint, center: IPoint) => void;
    finishObjectTransform: () => void;
    endPinch: () => void;
}

/** Routes touch browsing separately from the canvas's existing object manipulation. */
export class MobileCanvasGesture extends Disposable {
    private readonly _points = new Map<number, IPoint>();
    private _objectPointerId: number | null = null;
    private _startPoint: IPoint | null = null;
    private _moved = false;
    private _pinching = false;
    private _suppressClick = false;
    private _lastMoveTime = 0;
    private _velocity: IPoint = { x: 0, y: 0 };
    private _frame: number | null = null;

    constructor(private readonly _canvas: HTMLCanvasElement, private readonly _options: IMobileCanvasGestureOptions) {
        super();
        const touchAction = _canvas.style.touchAction;
        _canvas.style.touchAction = 'none';
        const down = (event: PointerEvent) => this._onDown(event);
        const move = (event: PointerEvent) => this._onMove(event);
        const up = (event: PointerEvent) => this._onEnd(event);
        const blur = () => this._reset();
        const click = (event: MouseEvent) => {
            if (event.target === _canvas && this._suppressClick) {
                event.preventDefault();
                event.stopImmediatePropagation();
            }
        };
        window.addEventListener('pointerdown', down, true);
        window.addEventListener('pointermove', move, true);
        window.addEventListener('pointerup', up, true);
        window.addEventListener('pointercancel', up, true);
        window.addEventListener('click', click, true);
        window.addEventListener('blur', blur);
        this.disposeWithMe(toDisposable(() => {
            this._reset();
            _canvas.style.touchAction = touchAction;
            window.removeEventListener('pointerdown', down, true);
            window.removeEventListener('pointermove', move, true);
            window.removeEventListener('pointerup', up, true);
            window.removeEventListener('pointercancel', up, true);
            window.removeEventListener('click', click, true);
            window.removeEventListener('blur', blur);
        }));
    }

    private _point(event: PointerEvent): IPoint {
        const rect = this._canvas.getBoundingClientRect();
        return { x: event.clientX - rect.left, y: event.clientY - rect.top };
    }

    private _consume(event: PointerEvent): void {
        event.preventDefault();
        event.stopImmediatePropagation();
    }

    private _onDown(event: PointerEvent): void {
        this._stopInertia();
        if (event.target !== this._canvas || event.pointerType !== 'touch') {
            this._suppressClick = false;
            return;
        }
        const point = this._point(event);
        if (this._points.size === 0) {
            this._suppressClick = false;
            const action = this._options.start(point);
            if (action === 'ignore') {
                return;
            }
            this._startPoint = point;
            this._moved = false;
            this._lastMoveTime = event.timeStamp;
            this._points.set(event.pointerId, point);
            if (action === 'object') {
                this._objectPointerId = event.pointerId;
                return;
            }
        } else {
            this._points.set(event.pointerId, point);
            if (!this._pinching) {
                this._options.finishObjectTransform();
                this._pinching = true;
                this._moved = true;
            }
        }
        this._suppressClick = true;
        this._consume(event);
    }

    private _onMove(event: PointerEvent): void {
        const previous = this._points.get(event.pointerId);
        if (!previous) {
            return;
        }
        const point = this._point(event);
        const previousPoints = Array.from(this._points.values());
        this._points.set(event.pointerId, point);
        if (this._pinching) {
            const points = Array.from(this._points.values());
            if (points.length >= 2) {
                const [a, b] = previousPoints;
                const [c, d] = points;
                const distance = Math.hypot(a.x - b.x, a.y - b.y);
                if (distance > 0) {
                    this._options.pinch(
                        Math.hypot(c.x - d.x, c.y - d.y) / distance,
                        { x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 },
                        { x: (c.x + d.x) / 2, y: (c.y + d.y) / 2 }
                    );
                }
            }
            this._consume(event);
            return;
        }
        if (this._objectPointerId !== null) {
            return;
        }
        if (!this._moved && this._startPoint && Math.hypot(point.x - this._startPoint.x, point.y - this._startPoint.y) >= 8) {
            this._moved = true;
            this._options.pan({ x: point.x - this._startPoint.x, y: point.y - this._startPoint.y });
        } else if (this._moved) {
            this._options.pan({ x: point.x - previous.x, y: point.y - previous.y });
        }
        const elapsed = Math.max(1, event.timeStamp - this._lastMoveTime);
        this._velocity = { x: (point.x - previous.x) / elapsed, y: (point.y - previous.y) / elapsed };
        this._lastMoveTime = event.timeStamp;
        this._consume(event);
    }

    private _onEnd(event: PointerEvent): void {
        if (!this._points.has(event.pointerId)) {
            return;
        }
        this._points.delete(event.pointerId);
        const objectPointer = this._objectPointerId === event.pointerId;
        if (objectPointer) {
            this._objectPointerId = null;
        } else {
            this._consume(event);
        }
        if (this._points.size !== 0) {
            return;
        }
        if (this._pinching) {
            this._options.endPinch();
        } else if (!objectPointer && event.type !== 'pointercancel') {
            if (!this._moved) {
                this._options.tap(this._point(event));
            } else if (event.timeStamp - this._lastMoveTime < 80) {
                this._startInertia();
            }
        }
        this._pinching = false;
        this._startPoint = null;
    }

    private _startInertia(): void {
        let velocity = {
            x: Math.max(-3, Math.min(3, this._velocity.x)),
            y: Math.max(-3, Math.min(3, this._velocity.y)),
        };
        let previousTime = performance.now();
        const frame = (time: number) => {
            const elapsed = Math.min(32, time - previousTime);
            previousTime = time;
            const decay = Math.exp(-0.005 * elapsed);
            this._options.pan({ x: velocity.x * (1 - decay) / 0.005, y: velocity.y * (1 - decay) / 0.005 });
            velocity = { x: velocity.x * decay, y: velocity.y * decay };
            this._frame = Math.hypot(velocity.x, velocity.y) > 0.02 ? requestAnimationFrame(frame) : null;
        };
        if (Math.hypot(velocity.x, velocity.y) > 0.04) {
            this._frame = requestAnimationFrame(frame);
        }
    }

    private _stopInertia(): void {
        if (this._frame !== null) {
            cancelAnimationFrame(this._frame);
            this._frame = null;
        }
        this._velocity = { x: 0, y: 0 };
    }

    private _reset(): void {
        this._stopInertia();
        if (this._objectPointerId !== null) {
            this._options.finishObjectTransform();
        }
        if (this._pinching) {
            this._options.endPinch();
        }
        this._points.clear();
        this._objectPointerId = null;
        this._pinching = false;
        this._startPoint = null;
    }
}
