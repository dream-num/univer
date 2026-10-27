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
import { IDialogService, IMessageService, INotificationService } from '@univerjs/ui';
import { Buffer } from 'node:buffer';
import { createHash, webcrypto } from 'node:crypto';
import { Subject } from 'rxjs';
import { afterEach, describe, expect, it, vi } from 'vitest';
import type { IOleHostActions } from '../ole-ui.service';
import { OleCanvasRenderer } from '../../views/ole/ole-canvas-renderer';
import { OleObject } from '../../views/ole/ole-object';
import * as previewRegistry from '../ole-preview-viewer';
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
    const notifications = { show: vi.fn<INotificationService['show']>(() => ({ dispose: vi.fn() })) };
    const injector = new Injector([
        [OleService, { useValue: { getResource: () => resource } }],
        [IDrawingManagerService, { useValue: drawings }],
        [IUniverInstanceService, { useValue: { getUnit: () => ({ type }), getTypeOfUnitDisposed$: () => disposed$ } }],
        [IConfigService, { useValue: { getConfig: () => ({ ole: config }) } }],
        [LocaleService, { useValue: { t: (key: string, ...args: unknown[]) => args.length ? `${key}:${args.join(',')}` : key } }],
        [IMessageService, { useValue: messages }],
        [IDialogService, { useValue: dialogs }],
        [INotificationService, { useValue: notifications }],
        [ThemeService],
        [OleUIService],
    ]);
    injectors.push(injector);
    const service = injector.get(OleUIService);
    const attach = vi.fn<IOleHostActions['attach']>(() => ({ dispose: vi.fn() }));
    const remove = vi.fn(async () => true);
    service.registerHost(type, { attach, remove });
    service.bindObject(object as never, drawing);
    return { injector, service, drawing, resource, config, drawings, disposed$, messages, notifications, pointerDown$, restoreModel: () => {
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
        const image = new OleObject('canvas-ole', { width: 96, height: 64 });
        const setter = vi.spyOn(image, 'setRenderer');
        h.service.bindObject(image, h.drawing);
        expect(setter).toHaveBeenCalledWith(expect.any(OleCanvasRenderer));
        expect(JSON.stringify(h.resource)).toBe(saved);
        expect(h.io.read).not.toHaveBeenCalled();
        image.dispose();
    });

    it('renders thumbnails without replacing the interactive canvas binding', () => {
        const h = harness();
        const image = new OleObject('thumbnail', { width: 96, height: 64 });
        const setter = vi.spyOn(image, 'setRenderer');
        h.service.bindObject(image, h.drawing, false);
        expect(setter).toHaveBeenCalledWith(expect.any(OleCanvasRenderer));
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

    it.each(['application/pdf', 'application/msword'])('gives nested preview a stable focus owner for %s', async (mimeType) => {
        const h = harness();
        h.resource.files[sha256].mimeType = mimeType;
        h.config.convertOffice = vi.fn(async () => ({ type: UniverInstanceType.UNIVER_DOC, data: {} }));
        vi.spyOn(previewRegistry, 'getOlePreviewRenderer').mockReturnValue(vi.fn());
        vi.spyOn(URL, 'createObjectURL').mockReturnValue('blob:preview');
        const owner = document.createElement('div');
        owner.setAttribute('role', 'dialog');
        owner.tabIndex = -1;
        const button = document.createElement('button');
        owner.appendChild(button);
        document.body.appendChild(owner);
        button.focus();
        h.dialogs.open.mockImplementation(() => {
            expect(document.activeElement).toBe(owner);
        });
        try {
            await h.service.preview(h.drawing);
            expect(h.dialogs.open).toHaveBeenCalledOnce();
            button.remove();
            expect(document.activeElement).toBe(owner);
        } finally {
            owner.remove();
        }
    });

    it('uses the target product UI factory even before a host of that product exists', async () => {
        const h = harness();
        h.resource.files[sha256].mimeType = 'application/msword';
        const data = { id: 'preview-doc' };
        h.config.convertOffice = vi.fn(async () => ({ type: UniverInstanceType.UNIVER_DOC, data }));
        const renderer = { dispose: vi.fn() };
        const factory = vi.fn(() => renderer);
        vi.spyOn(previewRegistry, 'getOlePreviewRenderer').mockImplementation((type) => type === UniverInstanceType.UNIVER_DOC ? factory : undefined);
        await h.service.preview(h.drawing);
        const id = h.dialogs.open.mock.lastCall![0].children.value;
        const container = document.createElement('div');
        const mounted = h.service.mountOfficePreview(id, container)!;
        await Promise.resolve();
        expect(factory).toHaveBeenCalledWith(expect.objectContaining({ container, data, type: UniverInstanceType.UNIVER_DOC, theme: h.injector.get(ThemeService) }));
        mounted.dispose();
        expect(renderer.dispose).toHaveBeenCalledOnce();
    });

    it.each([false, true])('does not read or convert Office attachments when their product UI is absent (Unit: %s)', async (unit) => {
        const h = harness(unit);
        h.resource.files[sha256].mimeType = 'application/msword';
        h.config.convertOffice = vi.fn();
        vi.spyOn(previewRegistry, 'getOlePreviewRenderer').mockReturnValue(undefined);
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({ available: true, previewAvailable: false });
        await h.service.preview(h.drawing);
        expect(h.config.convertOffice).not.toHaveBeenCalled();
        expect(h.io.read).not.toHaveBeenCalled();
        expect(h.dialogs.open).not.toHaveBeenCalled();
        expect(h.messages.show).toHaveBeenLastCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.unsupported' }));
    });

    it('retains application preview overrides instead of replacing them with a registered product default', async () => {
        const h = harness();
        h.resource.files[sha256].mimeType = 'application/msword';
        h.config.convertOffice = vi.fn(async () => ({ type: UniverInstanceType.UNIVER_DOC, data: { id: 'preview-doc' } }));
        const custom = { dispose: vi.fn() };
        h.config.createOfficePreview = vi.fn(async () => custom);
        const factory = vi.fn();
        vi.spyOn(previewRegistry, 'getOlePreviewRenderer').mockReturnValue(factory);
        await h.service.preview(h.drawing);
        const mounted = h.service.mountOfficePreview(h.dialogs.open.mock.lastCall![0].children.value, document.createElement('div'))!;
        await Promise.resolve();
        expect(h.config.createOfficePreview).toHaveBeenCalledOnce();
        expect(factory).not.toHaveBeenCalled();
        mounted.dispose();
        expect(custom.dispose).toHaveBeenCalledOnce();
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

const online: IOleOnlineUnit = { unitId: 'created-doc', type: UniverInstanceType.UNIVER_DOC };
const onlineUrl = 'https://example.test/doc/created-doc';

function collaborativeHarness(type = UniverInstanceType.UNIVER_SHEET) {
    const h = harness(true, type);
    h.resource.files[sha256].mimeType = 'application/msword';
    h.resource.files[sha256].name = 'original.doc';
    h.config.isCollaborative = vi.fn((unitId) => unitId === 'host');
    const getLink = vi.fn((_unitId: string, _type: UniverInstanceType) => onlineUrl);
    h.config.getLink = getLink;
    const convert = vi.fn<NonNullable<IOleConfig['convertToOnline']>>(async () => online);
    h.config.convertToOnline = convert;
    const save = vi.fn(async (_drawing: unknown, value: IOleOnlineUnit) => {
        h.drawing.oleOnlineUnit = value;
        return true;
    });
    h.service.registerHost(type, { attach: h.attach, remove: h.remove, saveOnlineUnit: save });
    const open = vi.spyOn(window, 'open').mockReturnValue(null);
    return { ...h, convert, save, open, getLink };
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

    it('imports once, waits on the source page and opens only after an explicit user action', async () => {
        const h = collaborativeHarness();
        const before = JSON.stringify(h.resource);
        const first = h.service.convertToOnline(h.drawing);
        const second = h.service.convertToOnline(h.drawing);
        expect(first).toBe(second);
        expect(h.open).not.toHaveBeenCalled();
        await first;
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.convert).toHaveBeenCalledWith(expect.objectContaining({ fileId: 'stable-file', unitId: 'host' }));
        expect(h.convert.mock.calls[0][0]).not.toHaveProperty('bytes');
        expect(h.save).toHaveBeenCalledWith(h.drawing, online);
        expect(h.drawing.oleOnlineUnit).not.toHaveProperty('url');
        expect(h.getLink).not.toHaveBeenCalled();
        expect(h.open).not.toHaveBeenCalled();
        expect(h.notifications.show).toHaveBeenLastCalledWith(expect.objectContaining({
            type: 'success',
            title: 'drawing-ui.ole.converted',
            content: 'original.doc',
            action: { label: 'drawing-ui.ole.openDoc', onClick: expect.any(Function) },
        }));
        expect(JSON.stringify(h.resource)).toBe(before);
        await h.service.convertToOnline(h.drawing);
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.io.read).not.toHaveBeenCalled();
        expect(h.open).toHaveBeenLastCalledWith(onlineUrl, '_blank', 'noopener,noreferrer');
        expect(h.attach.mock.lastCall?.[2].hasOnlineUnit).toBe(true);
    });

    it.each([UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE])('offers an Open action only after the link has been saved (host: %s)', async (type) => {
        const h = collaborativeHarness(type);
        let finishSave!: () => void;
        h.save.mockImplementation(async (_drawing, value) => {
            await new Promise<void>((resolve) => {
                finishSave = resolve;
            });
            h.drawing.oleOnlineUnit = value;
            return true;
        });
        const pending = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.save).toHaveBeenCalledOnce());
        expect(h.open).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.notifications.show).toHaveBeenCalledOnce();
        finishSave();
        await pending;
        expect(h.drawing.oleOnlineUnit).toEqual(online);
        expect(h.open).not.toHaveBeenCalled();
        const action = h.notifications.show.mock.calls.at(-1)![0].action;
        if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('Missing Open action');
        h.config.getLink = vi.fn(() => 'https://new-domain.test/new-route/created-doc');
        action.onClick({} as never);
        expect(h.open).toHaveBeenCalledOnce();
        expect(h.open).toHaveBeenCalledWith('https://new-domain.test/new-route/created-doc', '_blank', 'noopener,noreferrer');
        h.injector.dispose();
        expect(h.notifications.show.mock.results.at(-1)!.value.dispose).toHaveBeenCalledOnce();
    });

    it('reports a failed completion Open and allows a corrected resolver without reconverting', async () => {
        const h = collaborativeHarness();
        await h.service.convertToOnline(h.drawing);
        const action = h.notifications.show.mock.calls.at(-1)![0].action;
        if (!action || typeof action !== 'object' || !('onClick' in action)) throw new Error('Missing Open action');
        h.config.getLink = () => {
            throw new Error('Application route unavailable');
        };
        action.onClick({} as never);
        await vi.waitFor(() => expect(h.messages.show).toHaveBeenCalledWith(expect.objectContaining({ content: 'drawing-ui.ole.failed' })));
        expect(h.open).not.toHaveBeenCalled();
        h.config.getLink = () => onlineUrl;
        action.onClick({} as never);
        expect(h.open).toHaveBeenCalledWith(onlineUrl, '_blank', 'noopener,noreferrer');
        expect(h.convert).toHaveBeenCalledOnce();
        expect(h.drawing.oleOnlineUnit).toEqual(online);
    });

    it('also keeps inline attachment conversion on the source page', async () => {
        const h = collaborativeHarness();
        delete h.resource.files[sha256].attachment;
        h.resource.files[sha256].data = Buffer.from(bytes).toString('base64');
        await h.service.convertToOnline(h.drawing);
        expect(h.convert).toHaveBeenCalledWith(expect.objectContaining({ bytes, unitId: 'host' }));
        expect(h.convert.mock.calls[0][0]).not.toHaveProperty('fileId');
        expect(h.drawing.oleOnlineUnit).toEqual(online);
        expect(h.notifications.show).toHaveBeenLastCalledWith(expect.objectContaining({ type: 'success' }));
        expect(h.open).not.toHaveBeenCalled();
    });

    it.each(['deletion', 'unit disposal'])('suppresses completion when %s occurs while saving the link', async (reason) => {
        const h = collaborativeHarness();
        let finishSave!: (value: boolean) => void;
        h.save.mockImplementation(() => new Promise<boolean>((resolve) => {
            finishSave = resolve;
        }));
        const pending = h.service.convertToOnline(h.drawing);
        await vi.waitFor(() => expect(h.save).toHaveBeenCalledOnce());
        if (reason === 'deletion') h.removeModel();
        else h.disposed$.next({ getUnitId: () => 'host' });
        finishSave(true);
        await pending;
        expect(h.notifications.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
        expect(h.open).not.toHaveBeenCalled();
    });

    it('retries saving a created link without creating a second online document', async () => {
        const h = collaborativeHarness();
        h.save.mockResolvedValueOnce(false);
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('could not be saved');
        expect(h.open).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.notifications.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
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
        expect(h.open).toHaveBeenCalledWith(onlineUrl, '_blank', 'noopener,noreferrer');
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
        const progress = h.notifications.show.mock.results[0].value;
        expect(progress.dispose).not.toHaveBeenCalled();
        h.convert.mock.calls[0][0].onProgress?.('creating');
        if (reason === 'deletion') h.removeModel();
        else h.disposed$.next({ getUnitId: () => 'host' });
        expect(progress.dispose).toHaveBeenCalledOnce();
        expect(h.open).not.toHaveBeenCalled();
        complete(online);
        await pending;
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.open).not.toHaveBeenCalled();
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

    it('keeps failed imports and invalid Unit identities out of the drawing snapshot', async () => {
        const h = collaborativeHarness();
        h.convert.mockRejectedValueOnce(new Error('import failed'));
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('import failed');
        h.convert.mockResolvedValueOnce({ ...online, unitId: '' });
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('Invalid');
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBeUndefined();
        expect(h.open).not.toHaveBeenCalled();
        expect(h.notifications.show).not.toHaveBeenCalledWith(expect.objectContaining({ type: 'success' }));
    });

    it('ignores a legacy stored URL and resolves each Open with the current application config', async () => {
        const h = collaborativeHarness();
        const legacy = { ...online, url: 'javascript:alert(1)' };
        h.drawing.oleOnlineUnit = legacy;
        h.config.convertToOnline = undefined;
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2]).toMatchObject({ showConvert: true, hasOnlineUnit: true });
        await h.service.convertToOnline(h.drawing);
        expect(h.open).toHaveBeenLastCalledWith(onlineUrl, '_blank', 'noopener,noreferrer');
        h.config.getLink = () => '/new-route/created-doc';
        await h.service.convertToOnline(h.drawing);
        expect(h.open).toHaveBeenLastCalledWith(new URL('/new-route/created-doc', window.location.href).href, '_blank', 'noopener,noreferrer');
        expect(h.convert).not.toHaveBeenCalled();
        expect(h.save).not.toHaveBeenCalled();
        expect(h.drawing.oleOnlineUnit).toBe(legacy);
    });

    it('strips legacy adapter URL fields before saving a new online reference', async () => {
        const h = collaborativeHarness();
        const legacy = { ...online, url: 'https://obsolete.test/old-route' };
        h.convert.mockResolvedValueOnce(legacy);
        await h.service.convertToOnline(h.drawing);
        expect(h.save).toHaveBeenCalledWith(h.drawing, { unitId: 'created-doc', type: UniverInstanceType.UNIVER_DOC });
        expect(h.drawing.oleOnlineUnit).not.toHaveProperty('url');
        expect(h.getLink).not.toHaveBeenCalled();
    });

    it('hides conversion without a resolver and never falls back to a legacy URL', async () => {
        const h = collaborativeHarness();
        h.config.getLink = undefined;
        h.enter$.next();
        expect(h.attach.mock.lastCall?.[2].showConvert).toBe(false);
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow();
        const legacy = { ...online, url: onlineUrl };
        h.drawing.oleOnlineUnit = legacy;
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow();
        expect(h.convert).not.toHaveBeenCalled();
        expect(h.open).not.toHaveBeenCalled();
    });

    it.each(['javascript:alert(1)', 'data:text/html,unsafe', ''])('rejects unsafe or empty resolved URLs on Open (%s)', async (url) => {
        const h = collaborativeHarness();
        h.drawing.oleOnlineUnit = online;
        h.config.getLink = () => url;
        await expect(h.service.convertToOnline(h.drawing)).rejects.toThrow('Invalid');
        expect(h.open).not.toHaveBeenCalled();
        expect(h.convert).not.toHaveBeenCalled();
    });
});
