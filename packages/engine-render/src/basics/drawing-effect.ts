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

import type { IGlowEffect, IShadowEffect } from '@univerjs/core';
import type { IBoundRectNoAngle } from './vector2';
import { ColorKit } from '@univerjs/core';

// Canvas blur visually spans about twice the DrawingML glow radius. This factor is verified against PowerPoint output.
const DRAWINGML_GLOW_BLUR_SCALE = 0.5;
// Canvas drop-shadow uses a Gaussian blur. Three standard deviations retain the visible effect without clipping.
const GAUSSIAN_BLUR_BOUND_SCALE = 3;

export interface IResolvedDrawingShadow {
    color: string;
    blurRadius: number;
    offsetX: number;
    offsetY: number;
}

function clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
}

function colorWithOpacity(color: string, opacity: number | undefined): string {
    if (opacity === undefined) {
        return color;
    }

    const parsedColor = new ColorKit(color);
    if (!parsedColor.isValid) {
        return color;
    }

    return parsedColor.setAlpha(parsedColor.getAlpha() * clamp(opacity, 0, 1)).toRgbString();
}

function isTransparentColor(color: string): boolean {
    const parsedColor = new ColorKit(color);
    return parsedColor.isValid && parsedColor.getAlpha() <= 0;
}

function cssPixels(value: number): string {
    return `${Math.abs(value) < Number.EPSILON ? 0 : value}px`;
}

function toDropShadowFilter(effect: IResolvedDrawingShadow): string {
    return `drop-shadow(${cssPixels(effect.offsetX)} ${cssPixels(effect.offsetY)} ${cssPixels(effect.blurRadius)} ${effect.color})`;
}

export function resolveOuterShadowEffect(effect: IShadowEffect | undefined): IResolvedDrawingShadow | undefined {
    if (!effect?.color || (effect.opacity !== undefined && effect.opacity <= 0)) {
        return undefined;
    }

    const distance = effect.distance ?? 0;
    const direction = ((effect.direction ?? 0) * Math.PI) / 180;
    const sizeScale = ((effect.sx ?? 1) + (effect.sy ?? 1)) / 2;

    const color = colorWithOpacity(effect.color, effect.opacity);
    if (isTransparentColor(color)) {
        return undefined;
    }

    return {
        color,
        blurRadius: Math.max(0, effect.blurRadius ?? 0) * sizeScale,
        offsetX: Math.cos(direction) * distance * sizeScale,
        offsetY: Math.sin(direction) * distance * sizeScale,
    };
}

export function resolveGlowEffect(effect: IGlowEffect | undefined): IResolvedDrawingShadow | undefined {
    if (!effect?.color || (effect.radius ?? 0) <= 0 || isTransparentColor(effect.color)) {
        return undefined;
    }

    return {
        color: effect.color,
        blurRadius: Math.max(0, effect.radius ?? 0) * DRAWINGML_GLOW_BLUR_SCALE,
        offsetX: 0,
        offsetY: 0,
    };
}

/**
 * Resolves effects painted from an off-screen alpha mask.
 *
 * A glow uses two centered mask passes to match PowerPoint's DrawingML glow density without repainting source content.
 */
export function resolveDrawingEffectMasks(
    glow: IGlowEffect | undefined,
    outerShadow: IShadowEffect | undefined
): IResolvedDrawingShadow[] {
    const effects: IResolvedDrawingShadow[] = [];
    const resolvedGlow = resolveGlowEffect(glow);
    const resolvedOuterShadow = resolveOuterShadowEffect(outerShadow);

    if (resolvedGlow) {
        effects.push(resolvedGlow, resolvedGlow);
    }
    if (resolvedOuterShadow) {
        effects.push(resolvedOuterShadow);
    }

    return effects;
}

export function expandDrawingEffectBounds(
    bounds: IBoundRectNoAngle,
    glow: IGlowEffect | undefined,
    outerShadow: IShadowEffect | undefined
): IBoundRectNoAngle {
    let expandedBounds = { ...bounds };
    const effects = [resolveGlowEffect(glow), resolveOuterShadowEffect(outerShadow)];

    for (const effect of effects) {
        if (!effect) {
            continue;
        }

        const blurBound = effect.blurRadius * GAUSSIAN_BLUR_BOUND_SCALE;
        const shadowBounds = {
            left: expandedBounds.left + effect.offsetX - blurBound,
            top: expandedBounds.top + effect.offsetY - blurBound,
            right: expandedBounds.right + effect.offsetX + blurBound,
            bottom: expandedBounds.bottom + effect.offsetY + blurBound,
        };
        expandedBounds = {
            left: Math.min(expandedBounds.left, shadowBounds.left),
            top: Math.min(expandedBounds.top, shadowBounds.top),
            right: Math.max(expandedBounds.right, shadowBounds.right),
            bottom: Math.max(expandedBounds.bottom, shadowBounds.bottom),
        };
    }

    return expandedBounds;
}

export function createDrawingEffectFilter(
    glow: IGlowEffect | undefined,
    outerShadow: IShadowEffect | undefined
): string {
    const filters: string[] = [];
    const resolvedGlow = resolveGlowEffect(glow);
    const resolvedOuterShadow = resolveOuterShadowEffect(outerShadow);

    if (resolvedGlow) {
        filters.push(toDropShadowFilter(resolvedGlow));
    }

    if (resolvedOuterShadow) {
        filters.push(toDropShadowFilter(resolvedOuterShadow));
    }

    return filters.join(' ');
}

export function combineDrawingEffectFilter(currentFilter: string, effectFilter: string): string {
    if (!effectFilter) {
        return currentFilter;
    }

    return currentFilter && currentFilter !== 'none' ? `${currentFilter} ${effectFilter}` : effectFilter;
}
