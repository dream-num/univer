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

import type { Serializable } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import type { ISheetDrawingPosition, ISheetFloatDom } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum, UniverInstanceType } from '@univerjs/core';

export const EMBED_SHEETS_FLOATING_COMPONENT_KEY = 'UniverEmbedSheetsFloatingObject';

export interface IEmbedSheetsFloatingObjectData {
    version: 1;
    embedId: string;
    hostType?: UniverInstanceType;
    childType?: UniverInstanceType;
    hostUnitId?: string;
    hostAnchorId: string;
    /**
     * Persistent mounting policy for this anchor. This is intentionally not the
     * current runtime state: stage, portal id, and mounted DOM status stay runtime-only.
     */
    runtimeMountMode?: 'always' | 'stage2';
    resizeBehavior?: 'free' | 'aspect-ratio' | 'height-auto' | 'disabled';
    aspectRatio?: number;
    disablePopup?: boolean;
}

export interface IEmbedSheetsFloatingObjectParams {
    embedId: string;
    childType?: UniverInstanceType;
    hostUnitId: string;
    hostSubUnitId: string;
    hostAnchorId: string;
    componentKey?: string;
    left?: number;
    top?: number;
    width?: number;
    height?: number;
    sheetTransform?: ISheetDrawingPosition;
    allowTransform?: boolean;
    resizeBehavior?: IEmbedSheetsFloatingObjectData['resizeBehavior'];
    aspectRatio?: number;
    runtimeMountMode?: IEmbedSheetsFloatingObjectData['runtimeMountMode'];
}

const DEFAULT_LEFT = 80;
const DEFAULT_TOP = 80;
const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 360;
const MIN_FLOATING_SIZE = 1;

export function createEmbedSheetsFloatingObjectData(params: {
    embedId: string;
    childType?: UniverInstanceType;
    hostUnitId?: string;
    hostAnchorId: string;
    resizeBehavior?: IEmbedSheetsFloatingObjectData['resizeBehavior'];
    aspectRatio?: number;
    runtimeMountMode?: IEmbedSheetsFloatingObjectData['runtimeMountMode'];
}): IEmbedSheetsFloatingObjectData {
    return {
        version: 1,
        embedId: params.embedId,
        hostType: UniverInstanceType.UNIVER_SHEET,
        childType: params.childType,
        hostUnitId: params.hostUnitId,
        hostAnchorId: params.hostAnchorId,
        runtimeMountMode: params.runtimeMountMode ?? 'stage2',
        resizeBehavior: params.resizeBehavior,
        aspectRatio: params.aspectRatio,
        disablePopup: true,
    };
}

export function createEmbedSheetsFloatingDrawing(params: IEmbedSheetsFloatingObjectParams): ISheetFloatDom {
    const left = params.left ?? DEFAULT_LEFT;
    const top = params.top ?? DEFAULT_TOP;
    const { width, height } = resolveEmbedSheetsFloatingObjectSize({
        width: params.width,
        height: params.height,
        resizeBehavior: params.resizeBehavior,
        aspectRatio: params.aspectRatio,
    });
    const sheetTransform = params.sheetTransform ?? createDefaultSheetTransform(left, top, width, height);

    return {
        unitId: params.hostUnitId,
        subUnitId: params.hostSubUnitId,
        drawingId: params.hostAnchorId,
        drawingType: DrawingTypeEnum.DRAWING_BLOCK,
        componentKey: params.componentKey ?? EMBED_SHEETS_FLOATING_COMPONENT_KEY,
        sheetTransform,
        axisAlignSheetTransform: sheetTransform,
        transform: {
            left,
            top,
            width,
            height,
        },
        data: createEmbedSheetsFloatingObjectData(params) as unknown as Serializable,
        allowTransform: params.allowTransform ?? true,
    };
}

export function resolveEmbedSheetsFloatingObjectSize(params: {
    width?: number;
    height?: number;
    resizeBehavior?: IEmbedSheetsFloatingObjectData['resizeBehavior'];
    aspectRatio?: number;
}): { width: number; height: number } {
    const width = isValidPositiveNumber(params.width) ? params.width : DEFAULT_WIDTH;
    const height = isValidPositiveNumber(params.height) ? params.height : DEFAULT_HEIGHT;
    const aspectRatio = isValidPositiveNumber(params.aspectRatio) ? params.aspectRatio : undefined;

    if (params.resizeBehavior !== 'aspect-ratio' || !aspectRatio) {
        return { width, height };
    }

    if (isValidPositiveNumber(params.width)) {
        return {
            width,
            height: Math.max(MIN_FLOATING_SIZE, width / aspectRatio),
        };
    }

    if (isValidPositiveNumber(params.height)) {
        return {
            width: Math.max(MIN_FLOATING_SIZE, height * aspectRatio),
            height,
        };
    }

    return {
        width,
        height: Math.max(MIN_FLOATING_SIZE, width / aspectRatio),
    };
}

export function createEmbedSheetsFloatingDrawingFromDescriptor(
    descriptor: IEmbedDescriptor,
    hostSubUnitId: string,
    hostContext?: Record<string, unknown>
): ISheetFloatDom {
    return createEmbedSheetsFloatingDrawing({
        embedId: descriptor.embedId,
        childType: descriptor.childType,
        hostUnitId: descriptor.hostUnitId,
        hostSubUnitId,
        hostAnchorId: descriptor.hostAnchorId,
        componentKey: getString(hostContext, 'componentKey') ?? undefined,
        left: getNumber(hostContext, 'left'),
        top: getNumber(hostContext, 'top'),
        width: getNumber(hostContext, 'width'),
        height: getNumber(hostContext, 'height'),
        sheetTransform: getSheetTransform(hostContext),
        allowTransform: getBoolean(hostContext, 'allowTransform'),
        resizeBehavior: getResizeBehavior(hostContext),
        aspectRatio: getNumber(hostContext, 'aspectRatio'),
        runtimeMountMode: getRuntimeMountMode(hostContext),
    });
}

export function getEmbedSheetsFloatingObjectData(drawing: Pick<ISheetFloatDom, 'data'>): IEmbedSheetsFloatingObjectData | undefined {
    if (!isEmbedSheetsFloatingObjectData(drawing.data)) {
        return undefined;
    }

    return drawing.data;
}

export function isEmbedSheetsFloatingDrawing(drawing: Pick<ISheetFloatDom, 'componentKey' | 'data'>): boolean {
    return drawing.componentKey === EMBED_SHEETS_FLOATING_COMPONENT_KEY && getEmbedSheetsFloatingObjectData(drawing) != null;
}

function createDefaultSheetTransform(left: number, top: number, width: number, height: number): ISheetDrawingPosition {
    return {
        from: {
            column: 0,
            columnOffset: left,
            row: 0,
            rowOffset: top,
        },
        to: {
            column: 0,
            columnOffset: left + width,
            row: 0,
            rowOffset: top + height,
        },
    };
}

function getNumber(hostContext: Record<string, unknown> | undefined, key: string): number | undefined {
    return typeof hostContext?.[key] === 'number' ? hostContext[key] : undefined;
}

function getString(hostContext: Record<string, unknown> | undefined, key: string): string | undefined {
    return typeof hostContext?.[key] === 'string' ? hostContext[key] : undefined;
}

function getBoolean(hostContext: Record<string, unknown> | undefined, key: string): boolean | undefined {
    return typeof hostContext?.[key] === 'boolean' ? hostContext[key] : undefined;
}

function isValidPositiveNumber(value: unknown): value is number {
    return typeof value === 'number' && Number.isFinite(value) && value > 0;
}

function getResizeBehavior(hostContext: Record<string, unknown> | undefined): IEmbedSheetsFloatingObjectData['resizeBehavior'] | undefined {
    const value = hostContext?.resizeBehavior;
    return value === 'free' || value === 'aspect-ratio' || value === 'height-auto' || value === 'disabled'
        ? value
        : undefined;
}

function getRuntimeMountMode(hostContext: Record<string, unknown> | undefined): IEmbedSheetsFloatingObjectData['runtimeMountMode'] | undefined {
    const value = hostContext?.runtimeMountMode;
    return value === 'always' || value === 'stage2' ? value : undefined;
}

function getSheetTransform(hostContext: Record<string, unknown> | undefined): ISheetDrawingPosition | undefined {
    const value = hostContext?.sheetTransform;
    if (!value || typeof value !== 'object') {
        return undefined;
    }

    const candidate = value as Partial<ISheetDrawingPosition>;
    if (!candidate.from || !candidate.to) {
        return undefined;
    }

    return candidate as ISheetDrawingPosition;
}

function isEmbedSheetsFloatingObjectData(value: unknown): value is IEmbedSheetsFloatingObjectData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<IEmbedSheetsFloatingObjectData>;
    return candidate.version === 1 &&
        typeof candidate.embedId === 'string' &&
        typeof candidate.hostAnchorId === 'string';
}
