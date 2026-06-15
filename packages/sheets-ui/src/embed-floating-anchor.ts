import type { EmbedDescriptor } from '@univerjs/embed';
import type { Serializable } from '@univerjs/core';
import type { ISheetDrawingPosition, ISheetFloatDom } from '@univerjs/sheets-drawing';
import { DrawingTypeEnum } from '@univerjs/core';

export const EMBED_SHEETS_FLOATING_COMPONENT_KEY = 'UniverEmbedSheetsFloatingObject';

export interface EmbedSheetsFloatingObjectData {
    version: 1;
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
}

export interface EmbedSheetsFloatingObjectParams {
    embedId: string;
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
}

const DEFAULT_LEFT = 80;
const DEFAULT_TOP = 80;
const DEFAULT_WIDTH = 560;
const DEFAULT_HEIGHT = 360;

export function createEmbedSheetsFloatingObjectData(params: {
    embedId: string;
    hostUnitId?: string;
    hostAnchorId: string;
}): EmbedSheetsFloatingObjectData {
    return {
        version: 1,
        embedId: params.embedId,
        hostUnitId: params.hostUnitId,
        hostAnchorId: params.hostAnchorId,
    };
}

export function createEmbedSheetsFloatingDrawing(params: EmbedSheetsFloatingObjectParams): ISheetFloatDom {
    const left = params.left ?? DEFAULT_LEFT;
    const top = params.top ?? DEFAULT_TOP;
    const width = params.width ?? DEFAULT_WIDTH;
    const height = params.height ?? DEFAULT_HEIGHT;
    const sheetTransform = params.sheetTransform ?? createDefaultSheetTransform(left, top, width, height);

    return {
        unitId: params.hostUnitId,
        subUnitId: params.hostSubUnitId,
        drawingId: params.hostAnchorId,
        drawingType: DrawingTypeEnum.DRAWING_DOM,
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

export function createEmbedSheetsFloatingDrawingFromDescriptor(
    descriptor: EmbedDescriptor,
    hostSubUnitId: string,
    hostContext?: Record<string, unknown>
): ISheetFloatDom {
    return createEmbedSheetsFloatingDrawing({
        embedId: descriptor.embedId,
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
    });
}

export function getEmbedSheetsFloatingObjectData(drawing: Pick<ISheetFloatDom, 'data'>): EmbedSheetsFloatingObjectData | undefined {
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

function isEmbedSheetsFloatingObjectData(value: unknown): value is EmbedSheetsFloatingObjectData {
    if (!value || typeof value !== 'object') {
        return false;
    }

    const candidate = value as Partial<EmbedSheetsFloatingObjectData>;
    return candidate.version === 1 &&
        typeof candidate.embedId === 'string' &&
        typeof candidate.hostAnchorId === 'string';
}
