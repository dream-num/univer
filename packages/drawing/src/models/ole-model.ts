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

import type { IBaseAttachment, IDisposable } from '@univerjs/core';
import type { IImageData } from './image-model-interface';
import { UniverInstanceType } from '@univerjs/core';

export const OLE_RESOURCE_NAME = 'UNIVER_OLE_ATTACHMENT_PLUGIN';
export const OLE_MAX_RESOURCE_BYTES = 50 * 1024 * 1024;

export interface IOleDrawing extends IImageData {
    oleAttachmentId: string;
    /** Per-occurrence display and download name; original attachment metadata stays intact. */
    oleFileName?: string;
    oleOnlineUnit?: IOleOnlineUnit;
}

export interface IOleOnlineUnit {
    unitId: string;
    type: UniverInstanceType;
    url: string;
}

export function getOleOfficeType(mimeType: string): UniverInstanceType | undefined {
    switch (mimeType) {
        case 'application/vnd.ms-excel':
        case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
            return UniverInstanceType.UNIVER_SHEET;
        case 'application/msword':
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
            return UniverInstanceType.UNIVER_DOC;
        case 'application/vnd.ms-powerpoint':
        case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
            return UniverInstanceType.UNIVER_SLIDE;
        default:
            return undefined;
    }
}

export interface IOleFile {
    name: string;
    mimeType: string;
    size: number;
    sha256: string;
    data?: string;
    attachment?: IBaseAttachment;
}

export interface IOleRelationship {
    id: string;
    relationshipType: string;
    target: string;
    external: boolean;
}

export interface IOleObject {
    id: string;
    hostPart: string;
    fileName?: string;
    subUnitId: string;
    drawingId: string;
    initialGeometry?: object;
    shapeId: string;
    progId: string;
    relationshipId: string;
    external: boolean;
    status: 'ready' | 'opaque' | 'missing' | 'external-unavailable';
    rawFileId: string | null;
    fileId: string | null;
    xml: string;
    relationships: IOleRelationship[];
    parts: Record<string, string>;
    legacy?: {
        hostPart: string;
        xml: string;
        shapeTypes: string[];
        relationships: IOleRelationship[];
    };
}

export interface IOleResource {
    version: 1;
    files: Record<string, IOleFile>;
    objects: Record<string, IOleObject>;
}

/** The online adapter follows the application's existing attachment upload/read contract. */
export interface IOleAttachmentIo {
    upload: (file: File, targetUnitId: string) => Promise<IBaseAttachment>;
    read: (attachment: IBaseAttachment, signal?: AbortSignal) => Promise<Uint8Array>;
}

export interface IOlePreviewRequest {
    unitId: string;
    attachmentId: string;
    name: string;
    mimeType: string;
    bytes: Uint8Array;
    signal: AbortSignal;
}

export type OleConversionStage = 'reading' | 'uploading' | 'converting' | 'creating' | 'saving';

/** Existing Unit attachments are converted by reference. JSON attachments upload their bytes once. */
export type IOleOnlineConversionRequest = Omit<IOlePreviewRequest, 'bytes'> & {
    onProgress?: (stage: OleConversionStage) => void;
} & ({ fileId: string; bytes?: never } | { bytes: Uint8Array; fileId?: never });

export interface IOleConfig {
    /** Whether this exact host Unit is backed by the collaboration server. */
    isCollaborative?: (unitId: string) => boolean;
    /** Explicitly create an independent online Unit and return its application URL. */
    convertToOnline?: (request: IOleOnlineConversionRequest) => Promise<IOleOnlineUnit>;
    attachmentIo?: IOleAttachmentIo;
    /** Open a temporary read-only Office preview. The handler must not create a persisted child Unit. */
    previewOffice?: (request: IOlePreviewRequest) => Promise<void>;
    /** Convert on demand to UnitData, using JSON output without persisting a child Unit. */
    createOfficePreview?: (container: HTMLElement, view: { type: UniverInstanceType; data: object }) => Promise<IDisposable>;
    convertOffice?: (request: IOlePreviewRequest) => Promise<{ type: UniverInstanceType; data: object }>;
}

export function parseOleResource(json: string): IOleResource {
    if (new TextEncoder().encode(json).byteLength > OLE_MAX_RESOURCE_BYTES) {
        throw new Error('OLE resource exceeds size limit');
    }
    const value = JSON.parse(json) as IOleResource;
    if (value?.version !== 1 || !value.files || !value.objects || Array.isArray(value.files) || Array.isArray(value.objects)) {
        throw new Error('Invalid OLE resource');
    }
    let total = 0;
    for (const [id, file] of Object.entries(value.files)) {
        if (!/^[a-f0-9]{64}$/.test(id) || id !== file.sha256 || !Number.isSafeInteger(file.size) || file.size < 0 || typeof file.name !== 'string' || typeof file.mimeType !== 'string') {
            throw new Error('Invalid OLE file record');
        }
        total += file.size;
        if (total > OLE_MAX_RESOURCE_BYTES || (file.data != null && (typeof file.data !== 'string' || file.data.length > Math.ceil(file.size / 3) * 4))) {
            throw new Error('OLE files exceed size limit');
        }
        if (file.data == null && (!file.attachment?.source || file.attachment.sourceType !== 'UUID')) {
            throw new Error('Missing OLE attachment source');
        }
    }
    for (const [id, object] of Object.entries(value.objects)) {
        if (object.id !== id || typeof object.drawingId !== 'string' || typeof object.subUnitId !== 'string' || (object.fileName != null && typeof object.fileName !== 'string')) {
            throw new Error('Invalid OLE object identity');
        }
        for (const fileId of [object.fileId, object.rawFileId, ...Object.values(object.parts)]) {
            if (fileId != null && !Object.prototype.hasOwnProperty.call(value.files, fileId)) {
                throw new Error('Missing OLE file record');
            }
        }
    }
    return value;
}

export async function readOleFile(file: IOleFile, io?: IOleAttachmentIo, signal?: AbortSignal): Promise<Uint8Array> {
    if (signal?.aborted) {
        throw new Error('OLE request aborted');
    }
    let bytes: Uint8Array;
    if (file.data != null) {
        const binary = atob(file.data);
        bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
    } else if (file.attachment && io) {
        bytes = await io.read(file.attachment, signal);
    } else {
        throw new Error('OLE attachment reader is unavailable');
    }
    if (signal?.aborted) {
        throw new Error('OLE request aborted');
    }
    if (bytes.byteLength !== file.size || bytes.byteLength > OLE_MAX_RESOURCE_BYTES) {
        throw new Error('OLE attachment size mismatch');
    }
    const hash = await globalThis.crypto.subtle.digest('SHA-256', bytes as Uint8Array<ArrayBuffer>);
    if (signal?.aborted) {
        throw new Error('OLE request aborted');
    }
    const digest = Array.from(new Uint8Array(hash), (byte) => byte.toString(16).padStart(2, '0')).join('');
    if (digest !== file.sha256) {
        throw new Error('OLE attachment integrity mismatch');
    }
    return bytes;
}

/** Atomic model conversion: failures leave the caller's resource unchanged. */
export async function prepareOleResource(resource: IOleResource, mode: 'json' | 'unit', targetUnitId?: string, io?: IOleAttachmentIo): Promise<IOleResource> {
    const candidate = parseOleResource(JSON.stringify(resource));
    if (mode === 'unit' && (!targetUnitId || !io)) {
        throw new Error('OLE online import requires a target Unit and attachment IO');
    }
    // Upload sequentially to bound memory and follow the existing endpoint's rate limits.
    for (const file of Object.values(candidate.files)) {
        const bytes = await readOleFile(file, io);
        if (mode === 'unit') {
            const attachment = await io!.upload(new File([bytes as Uint8Array<ArrayBuffer>], file.name, { type: file.mimeType }), targetUnitId!);
            if (!attachment.source || attachment.sourceType !== 'UUID' || attachment.size !== file.size) {
                throw new Error('Invalid persisted OLE attachment response');
            }
            file.attachment = attachment;
            delete file.data;
        } else {
            // Avoid spreading a large binary into a function call's argument list.
            let binary = '';
            for (let offset = 0; offset < bytes.length; offset += 8192) {
                binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
            }
            file.data = btoa(binary);
            delete file.attachment;
        }
    }
    return parseOleResource(JSON.stringify(candidate));
}

/** Prepare a UnitData model or a native exchange JSON envelope without changing the caller's model. */
export async function prepareOleSnapshot<T extends object>(snapshot: T, mode: 'json' | 'unit', targetUnitId?: string, io?: IOleAttachmentIo): Promise<T> {
    interface IResourceHost { resources?: Array<{ name: string; data: string | Uint8Array }>; originalMeta?: string | Uint8Array }
    interface IEnvelope extends IResourceHost { snapshot?: IEnvelope; workbook?: IResourceHost; doc?: IResourceHost; slide?: IResourceHost }
    const clone = (value: unknown): unknown => {
        if (value instanceof Uint8Array) return Uint8Array.from(value);
        if (Array.isArray(value)) return value.map(clone);
        if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([key, item]) => [key, clone(item)]));
        return value;
    };
    const candidate = clone(snapshot) as T & IEnvelope;
    const envelope = candidate.snapshot ?? candidate;
    const host = envelope.workbook ?? envelope.doc ?? envelope.slide ?? envelope;
    let model = host;
    let encoded = false;
    if (envelope.slide && host.originalMeta != null) {
        const bytes = typeof host.originalMeta === 'string'
            ? Uint8Array.from(atob(host.originalMeta), (character) => character.charCodeAt(0))
            : host.originalMeta;
        model = JSON.parse(new TextDecoder().decode(bytes)) as IResourceHost;
        encoded = true;
    }
    for (const entry of model.resources ?? []) {
        if (entry.name === OLE_RESOURCE_NAME) {
            const text = typeof entry.data === 'string' ? entry.data : new TextDecoder().decode(entry.data);
            const prepared = JSON.stringify(await prepareOleResource(parseOleResource(text), mode, targetUnitId, io));
            entry.data = typeof entry.data === 'string' ? prepared : new TextEncoder().encode(prepared);
        }
    }
    if (encoded) {
        const bytes = new TextEncoder().encode(JSON.stringify(model));
        let binary = '';
        for (let offset = 0; offset < bytes.length; offset += 8192) {
            binary += String.fromCharCode(...bytes.subarray(offset, offset + 8192));
        }
        host.originalMeta = typeof host.originalMeta === 'string' ? btoa(binary) : bytes;
    }
    return candidate;
}
