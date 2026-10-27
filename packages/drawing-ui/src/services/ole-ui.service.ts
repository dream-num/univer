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

import type { IDisposable, IDrawingParam, IDrawingSearch, Nullable } from '@univerjs/core';
import type {
    IOleConfig,
    IOleDrawing,
    IOleOnlineUnit,
    IUnitDrawingService,
    IUniverDrawingConfig,
} from '@univerjs/drawing';
import type { BaseObject } from '@univerjs/engine-render';
import {
    Disposable,
    IConfigService,
    Inject,
    IUniverInstanceService,
    LocaleService,
    ThemeService,
    toDisposable,
    UniverInstanceType,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { getOleOfficeType, IDrawingManagerService, OleService, readOleFile } from '@univerjs/drawing';
import { IDialogService, IMessageService, INotificationService } from '@univerjs/ui';
import type { LocaleKey } from '../locale/types';
import { OleCanvasRenderer } from '../views/ole/ole-canvas-renderer';
import { OleObject } from '../views/ole/ole-object';
import { createOleConversionProgress } from '../views/ole/OleConversionProgress';
import { getOlePreviewRenderer } from './ole-preview-viewer';

export const OLE_NAME_COMPONENT = 'drawing.ole-name';
export const OLE_POPUP_COMPONENT = 'drawing.ole-popup';
export const OLE_PREVIEW_COMPONENT = 'drawing.ole-preview';
export const OLE_OFFICE_PREVIEW_COMPONENT = 'drawing.ole-office-preview';

export interface IOleHostActions {
    drawingService?: Pick<IUnitDrawingService<IDrawingParam>, 'getDrawingByParam' | 'getDrawingEditable' | 'focus$' | 'remove$'>;
    isEditable?: (drawing: IDrawingSearch) => boolean;
    attach: (object: BaseObject, componentKey: string, extraProps: Record<string, unknown>, drawing: IDrawingSearch, direction?: 'top-center' | 'bottom-center') => IDisposable;
    remove: (drawing: IDrawingSearch) => Promise<boolean>;
    rename?: (drawing: IDrawingSearch, name: string) => Promise<boolean>;
    saveOnlineUnit?: (drawing: IDrawingSearch, online: IOleOnlineUnit) => Promise<boolean>;
    createPreview?: (container: HTMLElement, data: object) => IDisposable;
}

function key(drawing: IDrawingSearch): string {
    return `${drawing.unitId}\u0000${drawing.subUnitId}\u0000${drawing.drawingId}`;
}

function attachmentId(drawing: Nullable<IDrawingParam>): string | undefined {
    const value = drawing as (Partial<IOleDrawing> & { element?: { oleAttachmentId?: string } }) | undefined;
    return value?.oleAttachmentId ?? value?.element?.oleAttachmentId;
}

function onlineUnit(drawing: Nullable<IDrawingParam>): IOleOnlineUnit | undefined {
    const value = drawing as (Partial<IOleDrawing> & { element?: Partial<IOleDrawing> }) | undefined;
    const online = value?.oleOnlineUnit ?? value?.element?.oleOnlineUnit;
    return online ? { unitId: online.unitId, type: online.type } : undefined;
}

class OleLinkSaveError extends Error {}

/** UI state stays local. Original bytes and collaborative geometry stay in their model resources. */
export class OleUIService extends Disposable {
    private readonly _hosts = new Map<UniverInstanceType, IOleHostActions>();
    private readonly _bindings = new Map<string, { object: BaseObject; dispose: () => void }>();
    private readonly _previews = new Map<string, AbortController>();
    private readonly _officeViews = new Map<string, { type: UniverInstanceType; data: object }>();
    private readonly _onlinePending = new Map<string, { controller: AbortController; promise: Promise<void> }>();
    private readonly _onlineResults = new Map<string, { attachmentId: string; online: IOleOnlineUnit }>();
    private readonly _captionColor = { value: '', warning: '' };
    private readonly _reportedUnits = new Set<string>();
    private _popup?: IDisposable;
    private _namePopup?: IDisposable;
    private _closeTimer?: ReturnType<typeof setTimeout>;

    constructor(
        @Inject(OleService) private readonly _oleService: OleService,
        @IDrawingManagerService private readonly _drawings: IDrawingManagerService,
        @IUniverInstanceService private readonly _instances: IUniverInstanceService,
        @IConfigService private readonly _config: IConfigService,
        @Inject(LocaleService) private readonly _locale: LocaleService,
        @IMessageService private readonly _messages: IMessageService,
        @IDialogService private readonly _dialogs: IDialogService,
        @INotificationService private readonly _notifications: INotificationService,
        @Inject(ThemeService) private readonly _theme: ThemeService
    ) {
        super();
        this.disposeWithMe(this._theme.currentTheme$.subscribe((value) => {
            this._captionColor.value = value.gray[900];
            this._captionColor.warning = value.yellow[600];
            for (const binding of this._bindings.values()) {
                binding.object.makeDirty(true);
            }
        }));
        this.disposeWithMe(this._drawings.remove$.subscribe((items) => this._handleRemoved(items)));
        this.disposeWithMe(this._drawings.focus$.subscribe((items) => this._handleFocused(items)));
        for (const type of [UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE]) {
            this.disposeWithMe(this._instances.getTypeOfUnitDisposed$(type).subscribe((unit) => {
                this._reportedUnits.delete(unit.getUnitId());
                const prefix = `${unit.getUnitId()}\u0000`;
                const keys = new Set([...this._bindings.keys(), ...this._onlinePending.keys(), ...this._onlineResults.keys(), ...this._previews.keys(), ...this._officeViews.keys()]);
                const drawings = [...keys].filter((id) => id.startsWith(prefix)).map((id) => {
                    const [unitId, subUnitId, drawingId] = id.split('\u0000');
                    return { unitId, subUnitId, drawingId };
                });
                if (drawings.length) {
                    this._handleRemoved(drawings);
                }
            }));
        }
    }

    private _handleRemoved(items: IDrawingSearch[]): void {
        for (const item of items) {
            this._onlinePending.get(key(item))?.controller.abort();
            this._onlinePending.delete(key(item));
            this._onlineResults.delete(key(item));
            this._bindings.get(key(item))?.dispose();
            this._bindings.delete(key(item));
            this._previews.get(key(item))?.abort();
            this._previews.delete(key(item));
            this._officeViews.delete(key(item));
            this._dialogs.close(`ole-preview-${key(item)}`);
        }
        this._closePopup();
        this._closeName();
    }

    private _handleFocused(items: IDrawingParam[]): void {
        if (items.length === 1 && attachmentId(this._getDrawing(items[0]))) {
            const binding = this._bindings.get(key(items[0]));
            if (binding) {
                this._show(binding.object, items[0]);
            }
        } else { this._closePopup(); }
    }

    private _getDrawing(drawing: IDrawingSearch): Nullable<IDrawingParam> {
        const type = this._instances.getUnit(drawing.unitId)?.type;
        return (type == null ? undefined : this._hosts.get(type)?.drawingService)?.getDrawingByParam(drawing)
            ?? this._drawings.getDrawingByParam(drawing);
    }

    registerHost(type: UniverInstanceType, actions: IOleHostActions): IDisposable {
        this._hosts.set(type, actions);
        const service = actions.drawingService;
        const remove = service?.remove$.subscribe((items) => this._handleRemoved(items));
        const focus = service?.focus$.subscribe((items) => this._handleFocused(items));
        const registration = toDisposable(() => {
            remove?.unsubscribe();
            focus?.unsubscribe();
            if (this._hosts.get(type) === actions) {
                this._hosts.delete(type);
            }
        });
        this.disposeWithMe(registration);
        return registration;
    }

    bindObject(object: BaseObject, drawing: IDrawingSearch, interactive = true): void {
        if (!attachmentId(this._getDrawing(drawing))) {
            return;
        }
        const id = key(drawing);
        if (this._bindings.get(id)?.object === object) {
            return;
        }
        if (object instanceof OleObject) {
            const resource = this._oleService.getResource(drawing.unitId);
            const record = resource?.objects[attachmentId(this._getDrawing(drawing))!];
            const file = record?.fileId ? resource?.files[record.fileId] : undefined;
            const color = this._captionColor;
            const unavailable = record?.external || !file;
            const renderer = new OleCanvasRenderer(
                this._fileName(drawing),
                file?.mimeType ?? '',
                () => color.value,
                () => this._fileName(drawing),
                unavailable ? { label: this._locale.t<LocaleKey>(record?.external ? 'drawing-ui.ole.external' : 'drawing-ui.ole.missing'), color: () => color.warning } : undefined
            );
            object.setRenderer(renderer);
        }
        if (!interactive) return;
        this._reportUnavailable(drawing.unitId);
        this._bindings.get(id)?.dispose();
        const enter = object.onPointerEnter$.subscribeEvent(() => {
            this._show(object, drawing);
        });
        const leave = object.onPointerLeave$.subscribeEvent(() => {
            this._scheduleClose();
        });
        const click = object.onPointerDown$.subscribeEvent(() => {
            this._show(object, drawing);
        });
        const doubleClick = object.onDblclick$.subscribeEvent(() => {
            return this._act(() => this.preview(drawing));
        });
        this._bindings.set(id, { object, dispose: () => {
            enter.unsubscribe();
            leave.unsubscribe();
            click.unsubscribe();
            doubleClick.unsubscribe();
        } });
    }

    private _oleConfig(): IOleConfig {
        return this._config.getConfig<IUniverDrawingConfig>('drawing.config')?.ole ?? {};
    }

    private _show(object: BaseObject, drawing: IDrawingSearch): void {
        if (this._namePopup) return;
        clearTimeout(this._closeTimer);
        const type = this._instances.getUnit(drawing.unitId)?.type;
        const host = type == null ? undefined : this._hosts.get(type);
        if (!host || !attachmentId(this._getDrawing(drawing))) {
            return;
        }
        this._closePopup();
        const id = attachmentId(this._getDrawing(drawing))!;
        const resource = this._oleService.getResource(drawing.unitId);
        const record = resource?.objects[id];
        const file = record?.fileId ? resource?.files[record.fileId] : undefined;
        const available = !!file && !record?.external;
        const savedOnline = onlineUnit(this._getDrawing(drawing));
        const officeType = savedOnline?.type ?? (file ? getOleOfficeType(file.mimeType) : undefined);
        const config = this._oleConfig();
        const canConvert = !!config.getLink && config.isCollaborative?.(drawing.unitId) === true &&
            (!!savedOnline || (available && !!config.convertToOnline && !!host.saveOnlineUnit && officeType != null));
        let statusKey: LocaleKey = 'drawing-ui.ole.attachment';
        if (record?.external) {
            statusKey = 'drawing-ui.ole.external';
        } else if (record?.status === 'missing') {
            statusKey = 'drawing-ui.ole.missing';
        } else if (record?.status === 'opaque') {
            statusKey = 'drawing-ui.ole.opaque';
        }
        this._popup = host.attach(object, OLE_POPUP_COMPONENT, {
            available,
            previewAvailable: available && this._canPreview(file.mimeType),
            officeType,
            showConvert: canConvert,
            hasOnlineUnit: !!savedOnline,
            converting: this._onlinePending.has(key(drawing)),
            convert: () => this._act(() => this.convertToOnline(drawing), 'drawing-ui.ole.conversionFailed'),
            fileName: this._fileName(drawing),
            rename: available && host.rename ? () => this._showName(object, drawing) : undefined,
            status: this._locale.t<LocaleKey>(record?.external ? 'drawing-ui.ole.externalHint' : !available ? 'drawing-ui.ole.missingHint' : statusKey),
            editable: host.isEditable?.(drawing) ?? host.drawingService?.getDrawingEditable() ?? this._drawings.getDrawingEditable(),
            onEnter: () => clearTimeout(this._closeTimer),
            onLeave: () => this._scheduleClose(),
            download: () => this._act(() => this.download(drawing)),
            preview: () => this._act(() => this.preview(drawing)),
            remove: () => this._act(async () => {
                const editable = host.isEditable?.(drawing) ?? host.drawingService?.getDrawingEditable() ?? this._drawings.getDrawingEditable();
                if (editable && await host.remove(drawing)) {
                    this._closePopup();
                }
            }),
        }, drawing);
    }

    private _reportUnavailable(unitId: string): void {
        if (this._reportedUnits.has(unitId)) return;
        const resource = this._oleService.getResource(unitId);
        const count = Object.values(resource?.objects ?? {}).filter((record) =>
            record.external || !record.fileId || !resource?.files[record.fileId]
        ).length;
        if (count > 0) {
            this._reportedUnits.add(unitId);
            this._messages.show({ type: MessageType.Info, content: this._locale.t<LocaleKey>('drawing-ui.ole.unavailableSummary', String(count)) });
        }
    }

    private _fileName(drawing: IDrawingSearch): string {
        const current = this._getDrawing(drawing) as (Partial<IOleDrawing> & { element?: Partial<IOleDrawing> }) | undefined;
        const resource = this._oleService.getResource(drawing.unitId);
        const id = attachmentId(current as IDrawingParam);
        const record = id ? resource?.objects[id] : undefined;
        const fileId = record?.fileId;
        return current?.oleFileName ?? current?.element?.oleFileName
            ?? record?.fileName ?? (fileId ? resource?.files[fileId]?.name : undefined) ?? this._locale.t<LocaleKey>(record?.external ? 'drawing-ui.ole.externalAttachment' : 'drawing-ui.ole.attachment');
    }

    private _showName(object: BaseObject, drawing: IDrawingSearch): void {
        this._closePopup();
        this._closeName();
        const type = this._instances.getUnit(drawing.unitId)?.type;
        const host = type == null ? undefined : this._hosts.get(type);
        if (!host || !attachmentId(this._getDrawing(drawing))) {
            return;
        }
        this._namePopup = host.attach(object, OLE_NAME_COMPONENT, {
            fileName: this._fileName(drawing),
            close: () => this._closeName(),
            save: (baseName: string) => this.rename(drawing, baseName),
        }, drawing, 'top-center');
    }

    async rename(drawing: IDrawingSearch, baseName: string): Promise<string | undefined> {
        const type = this._instances.getUnit(drawing.unitId)?.type;
        const host = type == null ? undefined : this._hosts.get(type);
        const current = this._getDrawing(drawing);
        const editable = host?.isEditable?.(drawing) ?? host?.drawingService?.getDrawingEditable() ?? this._drawings.getDrawingEditable();
        const name = this._fileName(drawing);
        const dot = name.lastIndexOf('.');
        const extension = dot > 0 ? name.slice(dot) : '';
        const base = baseName.trim();
        if (!base || /[<>:"/\\|?*\u0000-\u001F\u007F]/.test(base) || /[. ]$/.test(base) || Array.from(base + extension).length > 255) {
            return this._locale.t<LocaleKey>('drawing-ui.ole.invalidName');
        }
        if (!current || !attachmentId(current) || !editable || !host?.rename) {
            return this._locale.t<LocaleKey>('drawing-ui.ole.renameFailed');
        }
        try {
            if (base + extension !== name && !await host.rename(drawing, base + extension)) {
                return this._locale.t<LocaleKey>('drawing-ui.ole.renameFailed');
            }
            this._bindings.get(key(drawing))?.object.makeDirty(true);
            this._closeName();
        } catch {
            return this._locale.t<LocaleKey>('drawing-ui.ole.renameFailed');
        }
    }

    private _closeName(): void {
        this._namePopup?.dispose();
        this._namePopup = undefined;
    }

    private _scheduleClose(): void {
        clearTimeout(this._closeTimer);
        this._closeTimer = setTimeout(() => this._closePopup(), 180);
    }

    private _closePopup(): void {
        clearTimeout(this._closeTimer);
        this._popup?.dispose();
        this._popup = undefined;
    }

    private async _act(action: () => Promise<void>, errorKey: LocaleKey = 'drawing-ui.ole.failed'): Promise<void> {
        try {
            await action();
        } catch (error) {
            this._messages.show({ type: MessageType.Error, content: this._locale.t<LocaleKey>(error instanceof OleLinkSaveError ? 'drawing-ui.ole.linkSaveFailed' : errorKey) });
        }
    }

    private async _file(drawing: IDrawingSearch, signal?: AbortSignal) {
        const id = attachmentId(this._getDrawing(drawing));
        const resource = this._oleService.getResource(drawing.unitId);
        const object = id ? resource?.objects[id] : undefined;
        const file = object?.fileId ? resource?.files[object.fileId] : undefined;
        if (!id || !file || object?.external) {
            throw new Error('OLE attachment is unavailable');
        }
        const bytes = await readOleFile(file, this._oleConfig().attachmentIo, signal);
        if (attachmentId(this._getDrawing(drawing)) !== id) {
            throw new Error('OLE object was removed');
        }
        return { id, file: { ...file, name: this._fileName(drawing) }, bytes };
    }

    convertToOnline(drawing: IDrawingSearch): Promise<void> {
        const id = key(drawing);
        const pending = this._onlinePending.get(id);
        if (pending) {
            return pending.promise;
        }
        const controller = new AbortController();
        const promise = this._convertToOnline(drawing, controller).finally(() => {
            if (this._onlinePending.get(id)?.controller === controller) {
                this._onlinePending.delete(id);
            }
            const binding = this._bindings.get(id);
            if (binding) {
                this._show(binding.object, drawing);
            }
        });
        this._onlinePending.set(id, { controller, promise });
        return promise;
    }

    private _onlineReference(online: IOleOnlineUnit): IOleOnlineUnit {
        if (typeof online?.unitId !== 'string' || !online.unitId.trim() || ![UniverInstanceType.UNIVER_SHEET, UniverInstanceType.UNIVER_DOC, UniverInstanceType.UNIVER_SLIDE].includes(online.type)) {
            throw new Error('Invalid OLE online Unit reference');
        }
        return { unitId: online.unitId, type: online.type };
    }

    private _onlineUrl(online: IOleOnlineUnit): string {
        const reference = this._onlineReference(online);
        const link = this._oleConfig().getLink?.(reference.unitId, reference.type);
        if (typeof link !== 'string' || !link.trim()) throw new Error('Invalid OLE online Unit link');
        const url = new URL(link, window.location.href);
        if (!['http:', 'https:'].includes(url.protocol)) throw new Error('Invalid OLE online Unit link');
        return url.href;
    }

    private _showOnlineComplete(name: string, online: IOleOnlineUnit): void {
        const openKey: LocaleKey = online.type === UniverInstanceType.UNIVER_SHEET
            ? 'drawing-ui.ole.openSheet'
            : online.type === UniverInstanceType.UNIVER_SLIDE ? 'drawing-ui.ole.openSlide' : 'drawing-ui.ole.openDoc';
        this.disposeWithMe(this._notifications.show({
            type: 'success',
            title: this._locale.t<LocaleKey>('drawing-ui.ole.converted'),
            content: name,
            position: 'bottom-right',
            duration: Infinity,
            action: {
                label: this._locale.t<LocaleKey>(openKey),
                onClick: () => {
                    void this._act(async () => {
                        window.open(this._onlineUrl(online), '_blank', 'noopener,noreferrer');
                    });
                },
            },
        }));
    }

    private async _convertToOnline(drawing: IDrawingSearch, controller: AbortController): Promise<void> {
        const config = this._oleConfig();
        const current = this._getDrawing(drawing);
        const type = this._instances.getUnit(drawing.unitId)?.type;
        const host = type == null ? undefined : this._hosts.get(type);
        if (!current || !config.isCollaborative?.(drawing.unitId) || !config.getLink) {
            throw new Error('OLE online conversion requires a collaborative Unit');
        }
        const existing = onlineUnit(current);
        if (existing) {
            window.open(this._onlineUrl(existing), '_blank', 'noopener,noreferrer');
            return;
        }
        if (!config.convertToOnline || !host?.saveOnlineUnit) throw new Error('OLE online conversion is unavailable');
        if (!(host.isEditable?.(drawing) ?? host.drawingService?.getDrawingEditable() ?? this._drawings.getDrawingEditable())) {
            throw new Error('OLE link is read-only');
        }
        const objectId = attachmentId(current);
        const resource = this._oleService.getResource(drawing.unitId);
        const record = objectId ? resource?.objects[objectId] : undefined;
        const file = record?.fileId ? resource?.files[record.fileId] : undefined;
        const officeType = file ? getOleOfficeType(file.mimeType) : undefined;
        if (!file || record?.external || officeType == null) {
            throw new Error('Unsupported online conversion');
        }
        const progress = createOleConversionProgress(this._notifications, this._locale, this._fileName(drawing));
        const cancelProgress = () => progress.dispose();
        controller.signal.addEventListener('abort', cancelProgress, { once: true });
        try {
            const cached = this._onlineResults.get(key(drawing));
            let online = cached && cached.attachmentId === objectId ? cached.online : undefined;
            if (!online) {
                const request = {
                    unitId: drawing.unitId,
                    attachmentId: objectId!,
                    name: this._fileName(drawing),
                    mimeType: file.mimeType,
                    signal: controller.signal,
                    onProgress: progress.update,
                };
                if (file.data == null && file.attachment?.sourceType === 'UUID' && file.attachment.source) {
                    online = await config.convertToOnline({ ...request, fileId: file.attachment.source });
                } else {
                    const { bytes } = await this._file(drawing, controller.signal);
                    online = await config.convertToOnline({ ...request, bytes });
                }
                if (online.type !== officeType) {
                    throw new Error('OLE online Unit type mismatch');
                }
                online = this._onlineReference(online);
                if (!controller.signal.aborted) {
                    this._onlineResults.set(key(drawing), { attachmentId: objectId!, online });
                }
            }
            if (controller.signal.aborted || attachmentId(this._getDrawing(drawing)) !== objectId) {
                return;
            }
            progress.update('saving');
            try {
                const editable = host.isEditable?.(drawing) ?? host.drawingService?.getDrawingEditable() ?? this._drawings.getDrawingEditable();
                if (!editable || !await host.saveOnlineUnit(drawing, online)) {
                    throw new Error('Link persistence rejected');
                }
            } catch {
                throw new OleLinkSaveError('OLE online link could not be saved');
            }
            if (controller.signal.aborted || attachmentId(this._getDrawing(drawing)) !== objectId) {
                return;
            }
            progress.dispose();
            this._showOnlineComplete(this._fileName(drawing), online);
        } catch (error) {
            if (!controller.signal.aborted) {
                throw error;
            }
        } finally {
            controller.signal.removeEventListener('abort', cancelProgress);
            progress.dispose();
        }
    }

    async download(drawing: IDrawingSearch): Promise<void> {
        const { file, bytes } = await this._file(drawing);
        const url = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: file.mimeType }));
        const link = document.createElement('a');
        link.href = url;
        link.download = file.name;
        link.click();
        setTimeout(() => URL.revokeObjectURL(url), 1000);
    }

    async preview(drawing: IDrawingSearch): Promise<void> {
        const resource = this._oleService.getResource(drawing.unitId);
        const objectId = attachmentId(this._getDrawing(drawing));
        const record = objectId ? resource?.objects[objectId] : undefined;
        if (record?.external || !record?.fileId || !resource?.files[record.fileId]) {
            this._messages.show({ type: MessageType.Info, content: this._locale.t<LocaleKey>(record?.external ? 'drawing-ui.ole.externalHint' : 'drawing-ui.ole.missingHint') });
            return;
        }
        if (!this._canPreview(resource.files[record.fileId].mimeType)) {
            this._messages.show({ type: MessageType.Info, content: this._locale.t<LocaleKey>('drawing-ui.ole.unsupported') });
            return;
        }
        // The existing dialog service must capture a stable opener when the OLE toolbar unmounts.
        const focusOwner = document.activeElement?.closest<HTMLElement>('[role="dialog"]');
        const previewKey = key(drawing);
        this._previews.get(previewKey)?.abort();
        const controller = new AbortController();
        this._previews.set(previewKey, controller);
        const { id, file, bytes } = await this._file(drawing, controller.signal);
        if (file.mimeType === 'application/pdf' || ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(file.mimeType)) {
            const url = URL.createObjectURL(new Blob([bytes as Uint8Array<ArrayBuffer>], { type: file.mimeType }));
            const dialogId = `ole-preview-${previewKey}`;
            const close = () => {
                controller.abort();
                URL.revokeObjectURL(url);
                this._dialogs.close(dialogId);
                this._previews.delete(previewKey);
            };
            controller.signal.addEventListener('abort', () => URL.revokeObjectURL(url), { once: true });
            focusOwner?.focus({ preventScroll: true });
            this._dialogs.open({ id: dialogId, title: { title: file.name }, children: { label: OLE_PREVIEW_COMPONENT, value: JSON.stringify({ url, mimeType: file.mimeType, name: file.name }) }, width: '80vw', onClose: close });
        } else if (this._oleConfig().previewOffice) {
            await this._oleConfig().previewOffice!({ unitId: drawing.unitId, attachmentId: id, bytes, name: file.name, mimeType: file.mimeType, signal: controller.signal });
        } else if (this._oleConfig().convertOffice && getOleOfficeType(file.mimeType) != null) {
            const view = await this._oleConfig().convertOffice!({ unitId: drawing.unitId, attachmentId: id, bytes, name: file.name, mimeType: file.mimeType, signal: controller.signal });
            if (controller.signal.aborted || attachmentId(this._getDrawing(drawing)) !== id) {
                return;
            }
            if (!this._previewFactory(view.type)) {
                throw new Error('Office preview renderer is unavailable');
            }
            this._officeViews.set(previewKey, view);
            const dialogId = `ole-preview-${previewKey}`;
            const close = () => {
                controller.abort();
                this._dialogs.close(dialogId);
                this._officeViews.delete(previewKey);
                this._previews.delete(previewKey);
            };
            focusOwner?.focus({ preventScroll: true });
            this._dialogs.open({
                id: dialogId,
                title: { title: file.name },
                children: { label: OLE_OFFICE_PREVIEW_COMPONENT, value: previewKey },
                width: '90vw',
                // Fixed canvas popups use viewport coordinates, so their modal must not create a transformed containing block.
                style: { top: 0, right: 0, bottom: 0, left: 0, margin: 'auto', height: 'max-content', transform: 'none', animation: 'none' },
                onClose: close,
            });
        } else {
            this._messages.show({ type: MessageType.Info, content: this._locale.t<LocaleKey>('drawing-ui.ole.unsupported') });
            this._previews.delete(previewKey);
        }
    }

    private _canPreview(mimeType: string): boolean {
        if (mimeType === 'application/pdf' || ['image/png', 'image/jpeg', 'image/gif', 'image/webp'].includes(mimeType)) {
            return true;
        }
        const config = this._oleConfig();
        if (config.previewOffice) {
            return true;
        }
        const type = getOleOfficeType(mimeType);
        return !!config.convertOffice && type != null && !!this._previewFactory(type);
    }

    private _previewFactory(type: UniverInstanceType): IOleConfig['createOfficePreview'] {
        const configured = this._oleConfig().createOfficePreview;
        if (configured) {
            return configured;
        }
        const host = this._hosts.get(type)?.createPreview;
        if (host) {
            return async (container, view) => host(container, view.data);
        }
        const renderer = getOlePreviewRenderer(type);
        return renderer ? async (container, view) => renderer({ container, ...view, config: this._config, locale: this._locale, theme: this._theme }) : undefined;
    }

    mountOfficePreview(id: string, container: HTMLElement): IDisposable | undefined {
        const view = this._officeViews.get(id);
        if (!view) {
            return;
        }
        const factory = this._previewFactory(view.type);
        if (!factory) {
            return;
        }
        let disposed = false;
        let renderer: IDisposable | undefined;
        void factory(container, view).then((value) => {
            if (disposed) {
                value.dispose();
            } else {
                renderer = value;
            }
        }).catch(() => {
            if (!disposed) {
                this._messages.show({ type: MessageType.Error, content: this._locale.t<LocaleKey>('drawing-ui.ole.failed') });
            }
        });
        return { dispose: () => {
            disposed = true;
            renderer?.dispose();
        } };
    }

    override dispose(): void {
        this._closePopup();
        this._closeName();
        for (const pending of this._onlinePending.values()) {
            pending.controller.abort();
        }
        this._reportedUnits.clear();
        this._onlinePending.clear();
        this._onlineResults.clear();
        for (const binding of this._bindings.values()) {
            binding.dispose();
        }
        for (const preview of this._previews.values()) {
            preview.abort();
        }
        this._bindings.clear();
        this._previews.clear();
        this._officeViews.clear();
        super.dispose();
    }
}
