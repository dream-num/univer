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

// @vitest-environment happy-dom

import type { IOleConfig, IOleDrawing, IOleOnlineUnit, IOleResource } from '@univerjs/drawing';
import type { IOleHostActions } from '../ole-ui.service';
import { Buffer } from 'node:buffer';
import { createHash, webcrypto } from 'node:crypto';
import {
    DrawingTypeEnum,
    IConfigService,
    Injector,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
    UniverInstanceType,
} from '@univerjs/core';
import { IDrawingManagerService, OleService, UnitDrawingService } from '@univerjs/drawing';
import { Image } from '@univerjs/engine-render';
import { IDialogService, IMessageService } from '@univerjs/ui';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { OLE_POPUP_COMPONENT, OleUIService } from '../ole-ui.service';

const bytes = new TextEncoder().encode('%PDF-1.7 original');
const sha256 = createHash('sha256').update(bytes).digest('hex');
const injectors: Injector[] = [];

function harness(online = false, type = UniverInstanceType.UNIVER_SHEET) {
    vi.stubGlobal('crypto', webcrypto);
    const drawing = { unitId: 'host', subUnitId: 'page', drawingId: 'drawing', drawingType: DrawingTypeEnum.DRAWING_OLE, oleAttachmentId: 'ole-1' } as IOleDrawing;
    const resource = {
        version: 1,
        files: { [sha256]: { name: 'original.pdf', mimeType: 'application/pdf', size: bytes.length, sha256, ...(online ? { attachment: { source: 'stable-file', sourceType: 'UUID' } } : { data: Buffer.from(bytes).toString('base64') }) } },
        objects: { 'ole-1': { id: 'ole-1', fileId: sha256, external: false } },
    } as unknown as IOleResource;
    const focus$ = new Subject<unknown[]>();
    const remove$ = new Subject<unknown[]>();
    const enter$ = new Subject<void>();
    const leave$ = new Subject<void>();
    const pointerDown$ = new Subject<void>();
    const doubleClick$ = new Subject<void>();
    const events = (subject: Subject<void>) => ({ subscribeEvent: (callback: () => void) => subject.subscribe(callback) });
    const object = { makeDirty: vi.fn(), onPointerEnter$: events(enter$), onPointerLeave$: events(leave$), onPointerDown$: events(pointerDown$), onDblclick$: events(doubleClick$) };
    let present = true;
    const io = { upload: vi.fn(), read: vi.fn(async () => bytes.slice()) };
    const drawings = { focus$, remove$, getDrawingByParam: () => present ? drawing : undefined, getDrawingEditable: () => true };
    const disposed$ = new Subject<{ getUnitId: () => string }>();
    const config: IOleConfig = { attachmentIo: io };
    const messages = { show: vi.fn() };
    const dialogs = { open: vi.fn(), close: vi.fn() };
    const injector = new Injector([
        [OleService, { useValue: { getResource: () => resource } }],
        [IDrawingManagerService, { useValue: drawings }],
        [IUniverInstanceService, { useValue: { getUnit: () => ({ type }), getTypeOfUnitDisposed$: () => disposed$ } }],
        [IConfigService, { useValue: { getConfig: () => ({ ole: config }) } }],
        [LocaleService, { useValue: { t: (key: string, ...args: unknown[]) => args.length ? `${key}:${args.join(',')}` : key } }],
        [IMessageService, { useValue: messages }],
        [IDialogService, { useValue: dialogs }],
        [ThemeService],
        [OleUIService],
    ]);
    injectors.push(injector);
    const service = injector.get(OleUIService);
    const attach = vi.fn<IOleHostActions['attach']>(() => ({ dispose: vi.fn() }));
    const remove = vi.fn(async () => true);
    service.registerHost(type, { attach, remove });
    service.bindObject(object as never, drawing);
    return { injector, service, drawing, resource, config, drawings, disposed$, messages, pointerDown$, restoreModel: () => {
        present = true;
    }, hideGlobalModel: () => {
        present = false;
    }, enter$, leave$, focus$, remove$, io, dialogs, attach, remove, removeModel: () => {
        present = false;
        remove$.next([drawing]);
    } };
}

afterEach(() => {
    injectors.splice(0).forEach((injector) => injector.dispose());
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    vi.useRealTimers();
});

describe('OLE local UI lifecycle', () => {
    it.each([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE])('keeps selection on one toolbar and explicitly replaces it for rename (host: %s)', (type) => {
        const h = harness(false, type);
        const rename = vi.fn(async () => true);
        h.service.registerHost(type, { attach: h.attach, remove: h.remove, rename });
        const saved = JSON.stringify(h.resource);
        h.pointerDown$.next();
        expect(h.attach.mock.lastCall?.[1]).toBe(OLE_POPUP_COMPONENT);
        expect(h.attach).toHaveBeenCalledOnce();
        const toolbar = h.attach.mock.results[0].value;
        const actions = h.attach.mock.lastCall![2] as { rename: () => void };
        actions.rename();
        expect(toolbar.dispose).toHaveBeenCalledOnce();
        expect(h.attach.mock.lastCall?.[1]).toBe('drawing.ole-name');
        expect(h.attach.mock.lastCall?.[4]).toBe('top-center');
        expect(h.attach.mock.lastCall?.[2]).not.toHaveProperty('editing');
        const editor = h.attach.mock.results[1].value;
        h.focus$.next([]);
        h.focus$.next([h.drawing]);
        expect(editor.dispose).not.toHaveBeenCalled();
        const editorActions = h.attach.mock.lastCall![2] as { close: () => void };
        editorActions.close();
        expect(editor.dispose).toHaveBeenCalledOnce();
        h.pointerDown$.next();
        expect(h.attach.mock.lastCall?.[1]).toBe(OLE_POPUP_COMPONENT);
        expect(h.attach).toHaveBeenCalledTimes(3);
        expect(JSON.stringify(h.resource)).toBe(saved);
        expect(h.io.read).not.toHaveBeenCalled();
    });

    it.each([false, true])('selects an unavailable attachment without opening a separate name popup (external: %s)', (external) => {
        const h = harness();
        Object.assign(h.resource.objects['ole-1'], { external, fileId: undefined });
        h.pointerDown$.next();
        h.focus$.next([h.drawing]);
        expect(h.attach.mock.calls.every((call) => call[1] === OLE_POPUP_COMPONENT)).toBe(true);
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({ available: false, rename: undefined });
    });

    it.each([false, true])('explains unavailable external attachments once without reading or mutating them (Unit: %s)', async (unit) => {
        const h = harness(unit);
        Object.assign(h.resource.objects['ole-1'], { external: true, fileId: undefined });
        const original = JSON.stringify(h.resource);
        const image = new Image('unavailable', { width: 128, height: 80 });
        h.service.bindObject(image, h.drawing, false);
        expect(h.messages.show).not.toHaveBeenCalled();
        h.service.bindObject(image, h.drawing);
        expect(h.messages.show).toHaveBeenCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.unavailableSummary:1' }));
        const rebound = new Image('rebound', { width: 128, height: 80 });
        h.service.bindObject(rebound, h.drawing);
        h.focus$.next([h.drawing]);
        expect(h.messages.show).toHaveBeenCalledOnce();
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({
            available: false,
            fileName: 'drawing-ui.ole.externalAttachment',
            status: 'drawing-ui.ole.externalHint',
            showConvert: false,
            rename: undefined,
        });
        await h.service.preview(h.drawing);
        expect(h.messages.show).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.externalHint' }));
        expect(h.io.read).not.toHaveBeenCalled();
        expect(h.io.upload).not.toHaveBeenCalled();
        expect(h.dialogs.open).not.toHaveBeenCalled();
        expect(JSON.stringify(h.resource)).toBe(original);
        h.disposed$.next({ getUnitId: () => 'host' });
        const reopened = new Image('reopened', { width: 128, height: 80 });
        h.service.bindObject(reopened, h.drawing);
        expect(h.messages.show).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.unavailableSummary:1' }));
        expect(h.messages.show).toHaveBeenCalledTimes(3);
        image.dispose();
        rebound.dispose();
        reopened.dispose();
    });

    it('distinguishes missing data from external links and preserves a known occurrence name', async () => {
        const h = harness();
        h.resource.objects['ole-1'].fileId = 'missing-file';
        h.drawing.oleFileName = 'known.pdf';
        h.focus$.next([h.drawing]);
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({ available: false, fileName: 'known.pdf', status: 'drawing-ui.ole.missingHint' });
        await h.service.preview(h.drawing);
        expect(h.messages.show).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.missingHint' }));
        expect(h.io.read).not.toHaveBeenCalled();
        expect(h.dialogs.open).not.toHaveBeenCalled();
    });

    it('installs live canvas content for existing OLE drawings without changing their snapshot', () => {
        const h = harness();
        const saved = JSON.stringify(h.resource);
        const image = new Image('canvas-ole', { width: 96, height: 64 });
        const setter = vi.spyOn(image, 'setContentRenderer');
        h.service.bindObject(image, h.drawing);
        expect(setter).toHaveBeenCalledWith(expect.any(Function));
        expect(JSON.stringify(h.resource)).toBe(saved);
        expect(h.io.read).not.toHaveBeenCalled();
        image.dispose();
    });

    it('renders thumbnails without replacing the interactive canvas binding', () => {
        const h = harness();
        const image = new Image('thumbnail', { width: 96, height: 64 });
        const setter = vi.spyOn(image, 'setContentRenderer');
        h.service.bindObject(image, h.drawing, false);
        expect(setter).toHaveBeenCalledWith(expect.any(Function));
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[0]).not.toBe(image);
        image.dispose();
    });

    it('hover and keyboard selection expose actions without reading or converting the attachment', () => {
        const h = harness(true);
        h.enter$.next();
        expect(h.attach).toHaveBeenCalledOnce();
        expect(h.attach.mock.calls[0][2]).toMatchObject({ available: true, fileName: 'original.pdf', download: expect.any(Function), preview: expect.any(Function), remove: expect.any(Function) });
        h.focus$.next([h.drawing]);
        expect(h.attach).toHaveBeenCalledTimes(2);
        expect(h.io.read).not.toHaveBeenCalled();
        expect(h.io.upload).not.toHaveBeenCalled();
        expect(h.dialogs.open).not.toHaveBeenCalled();
    });

    it('rechecks edit permission when an already open Delete action is invoked', async () => {
        const h = harness();
        let editable = true;
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { attach: h.attach, remove: h.remove, isEditable: () => editable });
        h.enter$.next();
        const actions = h.attach.mock.lastCall![2] as { remove: () => Promise<void> };
        editable = false;
        await actions.remove();
        expect(h.remove).not.toHaveBeenCalled();
    });

    it('never opens a filename tooltip on hover', () => {
        vi.useFakeTimers();
        const h = harness();
        h.enter$.next();
        vi.advanceTimersByTime(1200);
        expect(h.attach).toHaveBeenCalledOnce();
        expect(h.attach.mock.lastCall?.[1]).toBe(OLE_POPUP_COMPONENT);
    });

    it.each([false, true])('renames only the occurrence and downloads the effective name (Unit: %s)', async (unit) => {
        const h = harness(unit);
        const original = JSON.stringify(h.resource);
        const rename = vi.fn(async (_drawing, name) => {
            h.drawing.oleFileName = name;
            return true;
        });
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { attach: h.attach, remove: h.remove, rename });
        expect(await h.service.rename(h.drawing, '新名称')).toBeUndefined();
        expect(rename).toHaveBeenCalledWith(h.drawing, '新名称.pdf');
        expect(JSON.stringify(h.resource)).toBe(original);
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:renamed');
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(function (this: HTMLAnchorElement) {
            expect(this.download).toBe('新名称.pdf');
        });
        await h.service.download(h.drawing);
        expect(click).toHaveBeenCalledOnce();
        expect(h.io.upload).not.toHaveBeenCalled();
    });

    it('leaves another occurrence sharing the same file with its own name', async () => {
        const h = harness();
        const other = { ...h.drawing, drawingId: 'other', oleAttachmentId: 'ole-2' };
        h.resource.objects['ole-2'] = { ...h.resource.objects['ole-1'], id: 'ole-2', drawingId: 'other' };
        h.injector.add([UnitDrawingService]);
        const local = h.injector.get(UnitDrawingService);
        local.registerDrawingData('host', { page: { data: { drawing: { ...h.drawing }, other }, order: ['drawing', 'other'] } });
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, {
            attach: h.attach,
            remove: h.remove,
            drawingService: local,
            rename: async (drawing, name) => {
                (local.getDrawingByParam(drawing)! as IOleDrawing).oleFileName = name;
                return true;
            },
        });
        expect(await h.service.rename(h.drawing, 'renamed')).toBeUndefined();
        expect(local.getDrawingByParam(h.drawing)).toMatchObject({ oleFileName: 'renamed.pdf' });
        expect(local.getDrawingByParam(other)).not.toHaveProperty('oleFileName');
        expect(h.resource.files[sha256].name).toBe('original.pdf');
    });

    it('rejects invalid names, read-only changes and command failures without changing bytes', async () => {
        const h = harness();
        const rename = vi.fn(async () => false);
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { attach: h.attach, remove: h.remove, rename });
        for (const value of ['', '../escape', 'a/b', 'a\\b', 'a?', 'x'.repeat(256)]) {
            expect(await h.service.rename(h.drawing, value)).toContain('invalidName');
        }
        expect(rename).not.toHaveBeenCalled();
        expect(await h.service.rename(h.drawing, 'valid')).toContain('renameFailed');
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { attach: h.attach, remove: h.remove, rename, isEditable: () => false });
        expect(await h.service.rename(h.drawing, 'valid')).toContain('renameFailed');
        expect(rename).toHaveBeenCalledOnce();
        expect(h.drawing.oleFileName).toBeUndefined();
        expect(h.resource.files[sha256].name).toBe('original.pdf');
    });

    it('keeps the menu open when moving from the object onto its controls', () => {
        vi.useFakeTimers();
        const h = harness();
        h.enter$.next();
        h.leave$.next();
        const actions = h.attach.mock.calls[0][2] as { onEnter: () => void };
        actions.onEnter();
        vi.advanceTimersByTime(200);
        expect(h.attach.mock.results[0].value.dispose).not.toHaveBeenCalled();
    });

    it('opens the PDF only on request and does not mutate persisted attachment data', async () => {
        const h = harness();
        const saved = JSON.stringify(h.resource);
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:verified-pdf');
        await h.service.preview(h.drawing);
        expect(h.dialogs.open).toHaveBeenCalledWith(expect.objectContaining({ children: expect.objectContaining({ value: expect.stringContaining('blob:verified-pdf') }) }));
        expect(JSON.stringify(h.resource)).toBe(saved);
    });

    it('a remote deletion cancels a pending read and prevents the late preview from reopening', async () => {
        const h = harness(true);
        let finish!: (value: Uint8Array<ArrayBuffer>) => void;
        h.io.read.mockImplementation(() => new Promise((resolve) => {
            finish = resolve;
        }));
        const preview = h.service.preview(h.drawing);
        h.removeModel();
        finish(bytes);
        await expect(preview).rejects.toThrow('aborted');
        expect(h.dialogs.open).not.toHaveBeenCalled();
    });
    it('uses the host drawing service for slide focus, file lookup and remote deletion', async () => {
        const h = harness(true);
        h.injector.add([UnitDrawingService]);
        const separate = h.injector.get(UnitDrawingService);
        separate.registerDrawingData('host', { page: { data: { drawing: h.drawing }, order: ['drawing'] } });
        h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { drawingService: separate, attach: h.attach, remove: h.remove });
        h.hideGlobalModel();
        separate.focusDrawing([h.drawing]);
        expect(h.attach).toHaveBeenCalledOnce();
        let finish!: (value: Uint8Array<ArrayBuffer>) => void;
        h.io.read.mockImplementation(() => new Promise((resolve) => {
            finish = resolve;
        }));
        const preview = h.service.preview(h.drawing);
        separate.removeNotification([h.drawing]);
        finish(bytes);
        await expect(preview).rejects.toThrow('aborted');
        expect(h.dialogs.open).not.toHaveBeenCalled();
    });
});

const online: IOleOnlineUnit = { unitId: 'created-doc', type: UniverInstanceType.UNIVER_DOC, url: 'https://example.test/doc/created-doc' };

function collaborativeHarness() {
    const h = harness(true);
    h.resource.files[sha256].mimeType = 'application/msword';
    h.resource.files[sha256].name = 'original.doc';
    h.config.isCollaborative = vi.fn((unitId) => unitId === 'host');
    const convert = vi.fn(async () => online);
    h.config.convertToOnline = convert;
    const save = vi.fn(async (_drawing: unknown, value: IOleOnlineUnit) => {
        h.drawing.oleOnlineUnit = value;
        return true;
    });
    h.service.registerHost(UniverInstanceType.UNIVER_SHEET, { attach: h.attach, remove: h.remove, saveOnlineUnit: save });
    const tab = { opener: {}, location: { href: 'about:blank' }, closed: false, close: vi.fn() };
    const open = vi.spyOn(window, 'open').mockReturnValue(tab as never);
    return { ...h, convert, save, tab, open };
}

describe('explicit collaborative OLE conversion', () => {
    it('shows conversion for the exact server host, but hides it for local JSON and PDF attachments', () => {
        const h = collaborativeHarness();
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({ showConvert: true, officeType: UniverInstanceType.UNIVER_DOC });
        expect(h.config.isCollaborative).toHaveBeenCalledWith('host');
        h.config.isCollaborative = () => false;
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2].showConvert).toBe(false);
        h.config.isCollaborative = () => true;
        h.resource.files[sha256].mimeType = 'application/pdf';
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2].showConvert).toBe(false);
        expect(h.convert).not.toHaveBeenCalled();
        expect(h.io.read).not.toHaveBeenCalled();
    });

    it('reserves a tab, imports once, persists the link and reopens it without touching the original bytes', async () => {
        const h = collaborativeHarness();
        const before = JSON.stringify(h.resource);
        const first = h.service.convertToOnline(h.drawing);
        const second = h.service.convertToOnline(h.drawing);
        expect(first).toBe(second);
        expect(h.open).toHaveBeenCalledWith('about:blank', '_blank');
        expect(h.tab.opener).toBeNull();
        await first;
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.save).toHaveBeenCalledWith(h.drawing, online);
        expect(h.tab.location.href).toBe(online.url);
        expect(JSON.stringify(h.resource)).toBe(before);
        await h.service.convertToOnline(h.drawing);
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.io.read).toHaveBeenCalledOnce();
        expect(h.open).toHaveBeenLastCalledWith(online.url, '_blank', 'noopener,noreferrer');
        expect(h.attach.mock.lastCall?.[2].hasOnlineUnit).toBe(true);
    });

    it('retries saving a created link without creating a second online document', async () => {
        const h = collaborativeHarness();
        h.save.mockResolvedValueOnce(false);
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('could not be saved');
        expect(h.tab.close).toHaveBeenCalledOnce();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        await h.service.convertToOnline(h.drawing);
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.save).toHaveBeenCalledTimes(2);
        expect(h.drawing.oleOnlineUnit).toEqual(online);
    });

    it('does not import for a read-only host, but allows reopening a saved online document', async () => {
        const h = collaborativeHarness();
        h.drawings.getDrawingEditable = () => false;
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('read-only');
        expect(h.convert).not.toHaveBeenCalled();
        expect(h.open).not.toHaveBeenCalled();
        h.drawing.oleOnlineUnit = online;
        await h.service.convertToOnline(h.drawing);
        expect(h.open).toHaveBeenCalledWith(online.url, '_blank', 'noopener,noreferrer');
    });

    it('retains a conversion result but does not save its link after edit permission is revoked', async () => {
        const h = collaborativeHarness();
        let complete!: (value: IOleOnlineUnit) => void;
        h.convert.mockImplementation(() => new Promise((resolve) => {
            complete = resolve;
        }));
        const pending = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.convert).toHaveBeenCalledOnce());
        h.drawings.getDrawingEditable = () => false;
        complete(online);
        await expect(pending).rejects.toThrow('could not be saved');
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
    });

    it.each(['deletion', 'unit disposal'])('discards a late conversion after %s', async (reason) => {
        const h = collaborativeHarness();
        let complete!: (value: IOleOnlineUnit) => void;
        h.convert.mockImplementation(() => new Promise((resolve) => {
            complete = resolve;
        }));
        const pending = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.convert).toHaveBeenCalledOnce());
        if (reason === 'deletion') h.removeModel();
        else h.disposed$.next({ getUnitId: () => 'host' });
        complete(online);
        await pending;
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.tab.close).toHaveBeenCalledOnce();
    });

    it('does not let a cancelled request overwrite a new conversion after deletion is undone', async () => {
        const h = collaborativeHarness();
        const complete: Array<(value: IOleOnlineUnit) => void> = [];
        h.convert.mockImplementation(() => new Promise((resolve) => {
            complete.push(resolve);
        }));
        const old = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.convert).toHaveBeenCalledTimes(1));
        h.removeModel();
        h.restoreModel();
        const current = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.convert).toHaveBeenCalledTimes(2));
        complete[0](online);
        await old;
        expect(h.service.convertToOnline(h.drawing)).toBe(current);
        expect(h.save).not.toHaveBeenCalled();
        complete[1]({ ...online, unitId: 'new-request' });
        await current;
        expect(h.drawing.oleOnlineUnit?.unitId).toBe('new-request');
        expect(h.save).toHaveBeenCalledOnce();
    });

    it('keeps failed imports and unsafe links out of the drawing snapshot', async () => {
        const h = collaborativeHarness();
        h.convert.mockRejectedValueOnce(new Error('import failed'));
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('import failed');
        h.convert.mockResolvedValueOnce({ ...online, url: 'javascript:alert(1)' });
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('Invalid');
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.tab.close).toHaveBeenCalledTimes(2);
    });
});
