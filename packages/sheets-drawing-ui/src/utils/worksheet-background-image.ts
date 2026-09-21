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

const WORKSHEET_LAYOUT_DPI = 96;
const METERS_PER_INCH = 0.0254;

export interface IWorksheetBackgroundImageScale {
    scaleX: number;
    scaleY: number;
}

/**
 * Excel tiles worksheet background images using their physical resolution,
 * while Canvas tiles them using source pixels. Convert the source resolution
 * to Univer's 96-DPI worksheet layout pixels.
 */
export function getWorksheetBackgroundImageScale(source: string): IWorksheetBackgroundImageScale | undefined {
    const bytes = decodeBase64DataUri(source);
    if (!bytes) {
        return undefined;
    }

    const pixelsPerMeter = readImagePixelsPerMeter(bytes);
    if (!pixelsPerMeter) {
        return undefined;
    }

    const scaleX = WORKSHEET_LAYOUT_DPI / (pixelsPerMeter.x * METERS_PER_INCH);
    const scaleY = WORKSHEET_LAYOUT_DPI / (pixelsPerMeter.y * METERS_PER_INCH);
    if (!Number.isFinite(scaleX) || !Number.isFinite(scaleY)) {
        return undefined;
    }
    if (Math.abs(scaleX - 1) <= 0.001 && Math.abs(scaleY - 1) <= 0.001) {
        return undefined;
    }

    return { scaleX, scaleY };
}

function decodeBase64DataUri(source: string): Uint8Array | undefined {
    const separator = source.indexOf(',');
    if (separator < 0 || !source.slice(0, separator).toLowerCase().includes(';base64')) {
        return undefined;
    }

    try {
        const binary = globalThis.atob(source.slice(separator + 1));
        const bytes = new Uint8Array(binary.length);
        for (let index = 0; index < binary.length; index++) {
            bytes[index] = binary.charCodeAt(index);
        }
        return bytes;
    } catch {
        return undefined;
    }
}

function readImagePixelsPerMeter(bytes: Uint8Array): { x: number; y: number } | undefined {
    return readPngPixelsPerMeter(bytes) ?? readJpegPixelsPerMeter(bytes);
}

function readPngPixelsPerMeter(bytes: Uint8Array): { x: number; y: number } | undefined {
    if (!hasBytes(bytes, 0, [0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A])) {
        return undefined;
    }

    let offset = 8;
    while (offset + 12 <= bytes.length) {
        const length = readUint32Be(bytes, offset);
        const typeOffset = offset + 4;
        const dataOffset = offset + 8;
        const dataEnd = dataOffset + length;
        const nextOffset = dataEnd + 4;
        if (nextOffset > bytes.length) {
            return undefined;
        }
        if (hasBytes(bytes, typeOffset, [0x70, 0x48, 0x59, 0x73])) {
            if (length !== 9 || bytes[dataEnd - 1] !== 1) {
                return undefined;
            }
            const x = readUint32Be(bytes, dataOffset);
            const y = readUint32Be(bytes, dataOffset + 4);
            return x > 0 && y > 0 ? { x, y } : undefined;
        }
        offset = nextOffset;
    }
    return undefined;
}

function readJpegPixelsPerMeter(bytes: Uint8Array): { x: number; y: number } | undefined {
    if (!hasBytes(bytes, 0, [0xFF, 0xD8])) {
        return undefined;
    }

    let offset = 2;
    while (offset + 4 <= bytes.length) {
        if (bytes[offset] !== 0xFF) {
            offset++;
            continue;
        }
        while (offset < bytes.length && bytes[offset] === 0xFF) {
            offset++;
        }
        const marker = bytes[offset++];
        if (marker == null) {
            return undefined;
        }
        if (marker === 0xD8 || marker === 0xD9 || marker === 0x01 || (marker >= 0xD0 && marker <= 0xD7)) {
            continue;
        }
        const length = readUint16Be(bytes, offset);
        if (length < 2) {
            return undefined;
        }
        const dataOffset = offset + 2;
        const dataEnd = offset + length;
        if (dataEnd > bytes.length) {
            return undefined;
        }
        if (marker === 0xE0 && length >= 14 && hasBytes(bytes, dataOffset, [0x4A, 0x46, 0x49, 0x46, 0x00])) {
            const units = bytes[dataOffset + 7];
            const xDensity = readUint16Be(bytes, dataOffset + 8);
            const yDensity = readUint16Be(bytes, dataOffset + 10);
            if (!xDensity || !yDensity) {
                return undefined;
            }
            if (units === 1) {
                return {
                    x: Math.round(xDensity / METERS_PER_INCH),
                    y: Math.round(yDensity / METERS_PER_INCH),
                };
            }
            if (units === 2) {
                return { x: xDensity * 100, y: yDensity * 100 };
            }
            return undefined;
        }
        offset = dataEnd;
    }
    return undefined;
}

function hasBytes(bytes: Uint8Array, offset: number, expected: number[]): boolean {
    return expected.every((value, index) => bytes[offset + index] === value);
}

function readUint16Be(bytes: Uint8Array, offset: number): number {
    return ((bytes[offset] ?? 0) << 8) | (bytes[offset + 1] ?? 0);
}

function readUint32Be(bytes: Uint8Array, offset: number): number {
    return (
        (((bytes[offset] ?? 0) << 24) >>> 0)
        | ((bytes[offset + 1] ?? 0) << 16)
        | ((bytes[offset + 2] ?? 0) << 8)
        | (bytes[offset + 3] ?? 0)
    ) >>> 0;
}
