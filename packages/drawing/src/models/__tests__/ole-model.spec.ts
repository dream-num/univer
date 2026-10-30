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

import type { IOleAttachmentIo, IOleResource } from '../ole-model';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { describe, expect, it, vi } from 'vitest';
import { parseOleResource, prepareOleResource, prepareOleSnapshot, readOleFile } from '../ole-model';

const bytes = new TextEncoder().encode('%PDF-1.7 original attachment');
const sha256 = createHash('sha256').update(bytes).digest('hex');

function resource(): IOleResource {
    return {
        version: 1,
        files: { [sha256]: { name: 'original.pdf', mimeType: 'application/pdf', size: bytes.length, sha256, data: Buffer.from(bytes).toString('base64') } },
        objects: Object.fromEntries(['ole-1', 'ole-2'].map((id) => [id, {
            id,
            hostPart: 'xl/worksheets/sheet1.xml',
            subUnitId: 'sheet1',
            drawingId: id,
            shapeId: id,
            progId: '',
            relationshipId: 'r1',
            external: false,
            status: 'ready',
            rawFileId: sha256,
            fileId: sha256,
            xml: '<oleObject/>',
            relationships: [],
            parts: { 'xl/embeddings/object.bin': sha256 },
        }])),
    };
}

function adapter(): IOleAttachmentIo {
    return {
        upload: vi.fn(async (file, unitId) => ({ id: `${unitId}-file`, name: file.name, mimeType: file.type, size: file.size, source: `${unitId}-file`, sourceType: 'UUID' as never })),
        read: vi.fn(async () => bytes.slice()),
    };
}

describe('durable OLE attachments', () => {
    it('verifies original bytes on HTTP origins without Web Crypto', async () => {
        vi.stubGlobal('crypto', {});
        expect(await readOleFile(resource().files[sha256])).toEqual(bytes);
        const corrupt = resource().files[sha256];
        corrupt.data = Buffer.from('different bytes').toString('base64');
        corrupt.size = Buffer.from('different bytes').length;
        await expect(readOleFile(corrupt)).rejects.toThrow('integrity mismatch');
    });

    it('JSON save and reopen is self-contained and never calls attachment IO', async () => {
        const io = adapter();
        const json = await prepareOleResource(resource(), 'json', undefined, io);
        expect(await readOleFile(parseOleResource(JSON.stringify(json)).files[sha256])).toEqual(bytes);
        expect(io.upload).not.toHaveBeenCalled();
        expect(io.read).not.toHaveBeenCalled();
        expect(Object.keys(json.objects)).toEqual(['ole-1', 'ole-2']);
    });

    it('Unit upload binds the explicit host and stores a stable attachment identity', async () => {
        const input = resource();
        const io = adapter();
        const online = await prepareOleResource(input, 'unit', 'target-host', io);
        expect(io.upload).toHaveBeenCalledTimes(1);
        expect(io.upload).toHaveBeenCalledWith(expect.any(File), 'target-host');
        expect(online.files[sha256].data).toBeUndefined();
        expect(online.files[sha256].attachment?.source).toBe('target-host-file');
        expect(input.files[sha256].data).toBeDefined();
        expect(await readOleFile(online.files[sha256], io)).toEqual(bytes);
        const portable = await prepareOleResource(online, 'json', undefined, io);
        expect(portable.files[sha256].attachment).toBeUndefined();
        expect(await readOleFile(portable.files[sha256])).toEqual(bytes);
    });

    it('upload failure never partially rewrites the source model', async () => {
        const input = resource();
        const original = JSON.stringify(input);
        const io = adapter();
        io.upload = vi.fn(async () => {
            throw new Error('upload failed');
        });
        await expect(prepareOleResource(input, 'unit', 'host', io)).rejects.toThrow('upload failed');
        expect(JSON.stringify(input)).toBe(original);
        await expect(prepareOleResource(input, 'unit', undefined, io)).rejects.toThrow('target Unit');
    });

    it('rejects corrupt, missing and oversized resources instead of returning partial files', async () => {
        const value = resource();
        value.files[sha256].data = Buffer.from(new Uint8Array(bytes.length)).toString('base64');
        await expect(readOleFile(value.files[sha256])).rejects.toThrow('integrity');
        value.files[sha256].size = 100 * 1024 * 1024;
        expect(() => parseOleResource(JSON.stringify(value))).toThrow('size limit');
        const missing = resource();
        missing.objects['ole-1'].fileId = 'constructor';
        expect(() => parseOleResource(JSON.stringify(missing))).toThrow('Missing OLE');
    });

    it('cancellation prevents a late attachment response from opening a preview', async () => {
        const io = adapter();
        const online = await prepareOleResource(resource(), 'unit', 'host', io);
        const controller = new AbortController();
        io.read = async () => {
            controller.abort();
            return bytes;
        };
        await expect(readOleFile(online.files[sha256], io, controller.signal)).rejects.toThrow('aborted');
    });
});

describe.each(['workbook', 'doc', 'slide'])('OLE snapshot transport: %s', (host) => {
    it('preserves SDK binary metadata and UTF-8 resources during attachment transfer', async () => {
        const opaque = new Uint8Array([0, 255, 128]);
        const model = { resources: [{ name: 'UNIVER_OLE_ATTACHMENT_PLUGIN', data: JSON.stringify(resource()) }] };
        const meta = new TextEncoder().encode(JSON.stringify(model));
        const input = { snapshot: { [host]: host === 'slide'
            ? { originalMeta: meta }
            : {
                ...model,
                originalMeta: opaque,
                resources: [{ ...model.resources[0], data: new TextEncoder().encode(model.resources[0].data) }],
            } }, sheetBlocks: [{ data: opaque }] };
        const online = await prepareOleSnapshot(input, 'unit', 'target-host', adapter());
        expect(online.sheetBlocks[0].data).toEqual(opaque);
        expect(online.sheetBlocks[0].data).not.toBe(opaque);
        const raw = online.snapshot[host];
        const converted = host === 'slide' ? JSON.parse(new TextDecoder().decode(raw.originalMeta)) : raw;
        const entry = converted.resources[0].data;
        const attached = parseOleResource(typeof entry === 'string' ? entry : new TextDecoder().decode(entry));
        expect(attached.files[sha256].data).toBeUndefined();
        expect(attached.files[sha256].attachment?.source).toBe('target-host-file');
        expect(input.snapshot[host].originalMeta).toEqual(host === 'slide' ? meta : opaque);
    });

    it('roundtrips JSON → Unit → JSON without changing the original snapshot', async () => {
        const onlineUnit = { unitId: 'child', type: 1 };
        const model = { drawings: { 'ole-1': { oleAttachmentId: 'ole-1', oleOnlineUnit: onlineUnit, oleFileName: '预算.pdf' } }, resources: [{ name: 'UNIVER_OLE_ATTACHMENT_PLUGIN', data: JSON.stringify(resource()) }] };
        const snapshot = { snapshot: { [host]: host === 'slide' ? { originalMeta: Buffer.from(JSON.stringify(model)).toString('base64') } : model } };
        const saved = JSON.stringify(snapshot);
        const io = adapter();
        const online = await prepareOleSnapshot(snapshot, 'unit', 'target-host', io);
        expect(io.upload).toHaveBeenCalledTimes(1);
        expect(JSON.stringify(snapshot)).toBe(saved);
        const portable = await prepareOleSnapshot(online, 'json', undefined, io);
        const raw = portable.snapshot[host];
        const data = host === 'slide' ? JSON.parse(Buffer.from((raw as { originalMeta: string }).originalMeta, 'base64').toString()) : raw;
        expect(data.drawings['ole-1'].oleOnlineUnit).toEqual(onlineUnit);
        expect(data.drawings['ole-1'].oleFileName).toBe('预算.pdf');
        expect(parseOleResource(data.resources[0].data).files[sha256].name).toBe('original.pdf');
        expect(await readOleFile(parseOleResource(data.resources[0].data).files[sha256])).toEqual(bytes);
        expect(Object.keys(parseOleResource(data.resources[0].data).objects)).toHaveLength(2);
    });
});
