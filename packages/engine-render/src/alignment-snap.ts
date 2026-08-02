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

export interface IAlignmentRect {
    left: number;
    top: number;
    width: number;
    height: number;
}

export type AlignmentSnapAxis = 'x' | 'y';

export interface IAlignmentSnapGuide {
    id: string;
    axis: AlignmentSnapAxis;
    position: number;
}

export interface IAlignmentSnapSessionConfig {
    enterThreshold?: number;
    exitThreshold?: number;
    breakawayThreshold?: number;
    softThreshold?: number;
    hardThreshold?: number;
    softMaxStrength?: number;
    cooldownMs?: number;
}

export interface IAlignmentSnapAxisOptions {
    axis: AlignmentSnapAxis;
    value: number;
    guide: IAlignmentSnapGuide | null;
    now?: number;
}

export interface IAlignmentSnapAxisResult {
    snapped: boolean;
    value: number;
    guide: IAlignmentSnapGuide | null;
}

const DEFAULT_ENTER_THRESHOLD = 6;
const DEFAULT_EXIT_THRESHOLD = 11;
const DEFAULT_COOLDOWN_MS = 250;

export function normalizeAlignmentRect(rect: IAlignmentRect): IAlignmentRect {
    return {
        left: rect.width >= 0 ? rect.left : rect.left + rect.width,
        top: rect.height >= 0 ? rect.top : rect.top + rect.height,
        width: Math.abs(rect.width),
        height: Math.abs(rect.height),
    };
}

export function getAlignmentRectXAnchors(rect: IAlignmentRect): [number, number, number] {
    const normalized = normalizeAlignmentRect(rect);
    return [normalized.left, normalized.left + normalized.width / 2, normalized.left + normalized.width];
}

export function getAlignmentRectYAnchors(rect: IAlignmentRect): [number, number, number] {
    const normalized = normalizeAlignmentRect(rect);
    return [normalized.top, normalized.top + normalized.height / 2, normalized.top + normalized.height];
}

export function getClosestAlignmentOffset(
    activeAnchors: readonly number[],
    targetAnchors: readonly number[],
    threshold: number
): number {
    let closestOffset = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    targetAnchors.forEach((target) => {
        activeAnchors.forEach((active) => {
            const offset = target - active;
            const distance = Math.abs(offset);
            if (distance <= threshold && distance < closestDistance) {
                closestDistance = distance;
                closestOffset = offset;
            }
        });
    });

    return closestDistance === Number.POSITIVE_INFINITY ? 0 : closestOffset;
}

export class AlignmentSnapSession {
    private readonly _enterThreshold: number;
    private readonly _exitThreshold: number;
    private readonly _breakawayThreshold: number | undefined;
    private readonly _softThreshold: number | undefined;
    private readonly _hardThreshold: number;
    private readonly _softMaxStrength: number;
    private readonly _cooldownMs: number;
    private _activeGuideId: string | null = null;
    private _activeGuideStartValue: number | null = null;
    private _releasedUntil = 0;

    constructor(config: IAlignmentSnapSessionConfig = {}) {
        this._enterThreshold = config.enterThreshold ?? DEFAULT_ENTER_THRESHOLD;
        this._exitThreshold = config.exitThreshold ?? DEFAULT_EXIT_THRESHOLD;
        this._breakawayThreshold = config.breakawayThreshold;
        this._softThreshold = config.softThreshold;
        this._hardThreshold = config.hardThreshold ?? this._enterThreshold;
        this._softMaxStrength = clamp(config.softMaxStrength ?? 0.65, 0, 1);
        this._cooldownMs = config.cooldownMs ?? DEFAULT_COOLDOWN_MS;
    }

    reset(): void {
        this._activeGuideId = null;
        this._activeGuideStartValue = null;
        this._releasedUntil = 0;
    }

    resolveAxisSnap(options: IAlignmentSnapAxisOptions): IAlignmentSnapAxisResult {
        const { value, guide } = options;
        const now = options.now ?? Date.now();
        if (!guide) {
            this._activeGuideId = null;
            this._activeGuideStartValue = null;
            return { snapped: false, value, guide: null };
        }

        const distance = Math.abs(value - guide.position);
        if (this._activeGuideId === guide.id) {
            const rawDragDistance = this._activeGuideStartValue === null ? 0 : Math.abs(value - this._activeGuideStartValue);
            const isPastBreakaway = this._breakawayThreshold !== undefined && rawDragDistance > this._breakawayThreshold;
            const exitThreshold = this._softThreshold ?? this._exitThreshold;
            if (isPastBreakaway || distance > exitThreshold) {
                this._activeGuideId = null;
                this._activeGuideStartValue = null;
                this._releasedUntil = now + this._cooldownMs;
                return { snapped: false, value, guide: null };
            }

            return { snapped: true, value: this._resolveSnappedValue(value, guide.position), guide };
        }

        if (this._releasedUntil > now) {
            return { snapped: false, value, guide: null };
        }

        const enterThreshold = this._softThreshold ?? this._enterThreshold;
        if (distance <= enterThreshold) {
            this._activeGuideId = guide.id;
            this._activeGuideStartValue = value;
            return { snapped: true, value: this._resolveSnappedValue(value, guide.position), guide };
        }

        return { snapped: false, value, guide: null };
    }

    private _resolveSnappedValue(value: number, guidePosition: number): number {
        if (this._softThreshold === undefined) {
            return guidePosition;
        }

        const distance = Math.abs(value - guidePosition);
        if (distance <= this._hardThreshold) {
            return guidePosition;
        }

        if (distance >= this._softThreshold) {
            return value;
        }

        const span = Math.max(this._softThreshold - this._hardThreshold, 0.001);
        const progress = clamp((this._softThreshold - distance) / span, 0, 1);
        const eased = progress * progress * (3 - 2 * progress);
        const strength = eased * this._softMaxStrength;

        return value + (guidePosition - value) * strength;
    }
}

function clamp(value: number, min: number, max: number): number {
    return Math.min(Math.max(value, min), max);
}
