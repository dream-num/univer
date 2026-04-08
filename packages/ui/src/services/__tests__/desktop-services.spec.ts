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

import type { IGalleryProps, IMessageProps } from '@univerjs/design';
import type { IConfirmPartMethodOptions } from '../../views/components/confirm-part/interface';
import type { IDialogPartMethodOptions } from '../../views/components/dialog-part/interface';
import localforage from 'localforage';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { DesktopBeforeCloseService } from '../before-close/before-close.service';
import { DesktopConfirmService } from '../confirm/desktop-confirm.service';
import { DesktopDialogService } from '../dialog/desktop-dialog.service';
import { DesktopGalleryService } from '../gallery/desktop-gallery.service';
import { DesktopLocalFileService } from '../local-file/desktop-local-file.service';
import { DesktopLocalStorageService } from '../local-storage/local-storage.service';
import { DesktopMessageService } from '../message/desktop-message.service';
import { DesktopNotificationService } from '../notification/desktop-notification.service';
import { BuiltInUIPart } from '../parts/parts.service';

vi.mock('@univerjs/design', async (importOriginal) => {
    const actual = await importOriginal<any>();
    return {
        ...actual,
        message: vi.fn(),
        removeMessage: vi.fn(),
    };
});

vi.mock('../../components/notification/Notification', () => ({
    Notification: () => null,
    notification: {
        show: vi.fn(),
    },
}));

vi.mock('localforage', () => ({
    default: {
        getItem: vi.fn(),
        setItem: vi.fn(),
        removeItem: vi.fn(),
        clear: vi.fn(),
        key: vi.fn(),
        keys: vi.fn(),
        iterate: vi.fn(),
    },
}));

function createUiPartsService() {
    return {
        registerComponent: vi.fn(() => ({ dispose: vi.fn() })),
    };
}

describe('DesktopConfirmService', () => {
    it('should open, update, close and confirm options', async () => {
        const uiPartsService = createUiPartsService();
        const service = new DesktopConfirmService({} as any, uiPartsService as any);

        expect(uiPartsService.registerComponent).toHaveBeenCalledWith(BuiltInUIPart.GLOBAL, expect.any(Function));

        service.open({ id: 'confirm-1', title: 'A' } as IConfirmPartMethodOptions);
        expect(service.confirmOptions$.getValue()[0].visible).toBe(true);

        service.open({ id: 'confirm-1', title: 'B' } as IConfirmPartMethodOptions);
        expect(service.confirmOptions$.getValue()[0].title).toBe('B');

        service.close('confirm-1');
        expect(service.confirmOptions$.getValue()[0].visible).toBe(false);

        const promiseConfirm = service.confirm({ id: 'confirm-2', title: 'C' } as IConfirmPartMethodOptions);
        service.confirmOptions$.getValue().find((item) => item.id === 'confirm-2')?.onConfirm?.();
        await expect(promiseConfirm).resolves.toBe(true);

        const promiseClose = service.confirm({ id: 'confirm-3', title: 'D' } as IConfirmPartMethodOptions);
        service.confirmOptions$.getValue().find((item) => item.id === 'confirm-3')?.onClose?.();
        await expect(promiseClose).resolves.toBe(false);

        service.dispose();
    });
});

describe('DesktopDialogService', () => {
    it('should manage dialog lifecycle and streams', () => {
        const uiPartsService = createUiPartsService();
        const service = new DesktopDialogService({} as any, uiPartsService as any);

        const emitted: IDialogPartMethodOptions[][] = [];
        const complete = vi.fn();
        service.getDialogs$().subscribe({
            next: (v) => emitted.push(v),
            complete,
        });

        service.open({ id: 'dialog-1', title: 'A' } as IDialogPartMethodOptions);
        service.open({ id: 'dialog-1', title: 'B' } as IDialogPartMethodOptions);
        expect(emitted.at(-1)?.[0].open).toBe(true);
        expect(emitted.at(-1)?.[0].title).toBe('B');

        service.close('dialog-1');
        expect(emitted.at(-1)?.[0].open).toBe(false);

        service.open({ id: 'dialog-2', title: 'C' } as IDialogPartMethodOptions);
        service.closeAll(['dialog-2']);
        expect(emitted.at(-1)?.find((item) => item.id === 'dialog-2')?.open).toBe(true);

        service.closeAll();
        expect(emitted.at(-1)?.every((item) => item.open === false)).toBe(true);

        service.dispose();
        expect(complete).toHaveBeenCalledTimes(1);
    });
});

describe('DesktopMessageService', async () => {
    const { message, removeMessage } = await import('@univerjs/design');

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should show and remove messages', () => {
        vi.spyOn(Date, 'now').mockReturnValue(123);
        const uiPartsService = createUiPartsService();
        const service = new DesktopMessageService({} as any, uiPartsService as any);

        const disposable = service.show({ content: 'hello' } as IMessageProps);
        expect(message).toHaveBeenCalledWith(expect.objectContaining({ id: expect.stringContaining('message-123-') }));

        disposable.dispose();
        expect(removeMessage).toHaveBeenCalledWith(expect.any(String));

        service.show({ id: 'fixed-id', content: 'x' } as IMessageProps);
        expect(message).toHaveBeenCalledWith(expect.objectContaining({ id: 'fixed-id' }));

        service.remove('fixed-id');
        expect(removeMessage).toHaveBeenCalledWith('fixed-id');

        service.removeAll();
        expect(removeMessage).toHaveBeenCalledWith();

        service.dispose();
        expect(removeMessage).toHaveBeenCalledWith();
    });
});

describe('DesktopGalleryService', () => {
    it('should open and close gallery state', () => {
        const uiPartsService = createUiPartsService();
        const service = new DesktopGalleryService({} as any, uiPartsService as any);

        const emitted: IGalleryProps[] = [];
        const complete = vi.fn();
        service.gallery$.subscribe({
            next: (v) => emitted.push(v),
            complete,
        });

        const dis = service.open({ images: ['a'] } as any);
        expect(emitted.at(-1)).toEqual(expect.objectContaining({ open: true, images: ['a'] }));

        service.close();
        expect(emitted.at(-1)).toEqual({ open: false, images: [] });

        dis.dispose();
        expect(complete).toHaveBeenCalledTimes(1);

        service.dispose();
    });
});

describe('DesktopNotificationService', async () => {
    const { notification } = await import('../../components/notification/Notification');

    it('should register ui part and show notification', () => {
        const uiPartsService = createUiPartsService();
        const service = new DesktopNotificationService({} as any, uiPartsService as any);

        const dis = service.show({ title: 'hello', type: 'info' });
        expect(notification.show).toHaveBeenCalledWith({ title: 'hello', type: 'info' });

        dis.dispose();
        service.dispose();
    });
});

describe('DesktopBeforeCloseService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should handle beforeunload and unload callbacks', () => {
        const listeners: Record<string, Function> = {};
        vi.spyOn(window, 'addEventListener').mockImplementation((event, handler) => {
            listeners[event] = handler as any;
        });

        const notificationService = {
            show: vi.fn(),
        };

        const service = new DesktopBeforeCloseService(notificationService as any);

        const onClose = vi.fn();
        const regClose = service.registerOnClose(onClose);

        const keep1 = service.registerBeforeClose(() => 'unsaved A');
        const keep2 = service.registerBeforeClose(() => undefined);

        const event = { returnValue: '' } as BeforeUnloadEvent;
        const result = listeners.beforeunload(event);
        expect(result).toContain('unsaved A');
        expect(event.returnValue).toContain('unsaved A');
        expect(notificationService.show).toHaveBeenCalled();

        Object.defineProperty(window, 'event', {
            configurable: true,
            value: { returnValue: '' },
        });
        const fallbackResult = listeners.beforeunload(undefined);
        expect(fallbackResult).toContain('unsaved A');

        listeners.unload();
        expect(onClose).toHaveBeenCalledTimes(1);

        keep1.dispose();
        keep2.dispose();
        regClose.dispose();

        const noMessageResult = listeners.beforeunload({ returnValue: '' } as BeforeUnloadEvent);
        expect(noMessageResult).toBeUndefined();
    });
});

describe('DesktopLocalFileService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should open file chooser and download file', async () => {
        const service = new DesktopLocalFileService();

        const originalCreateElement = document.createElement.bind(document);
        const input = originalCreateElement('input') as HTMLInputElement;
        const anchor = originalCreateElement('a') as HTMLAnchorElement;
        const inputClick = vi.spyOn(input, 'click').mockImplementation(() => {
            Object.defineProperty(input, 'files', {
                configurable: true,
                value: [new File(['a'], 'a.txt')],
            });
            input.onchange?.({ target: input } as any);
        });
        const anchorClick = vi.spyOn(anchor, 'click').mockImplementation(() => {});

        vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
            if (tagName === 'input') return input;
            if (tagName === 'a') return anchor;
            return originalCreateElement(tagName);
        });

        const createObjectURL = vi.spyOn(window.URL, 'createObjectURL').mockReturnValue('blob:mock');

        const files = await service.openFile({ accept: '.txt', multiple: true });
        expect(files.map((file) => file.name)).toEqual(['a.txt']);
        expect(input.accept).toBe('.txt');
        expect(input.multiple).toBe(true);
        expect(inputClick).toHaveBeenCalledTimes(1);

        service.downloadFile(new Blob(['abc']), 'f.txt');
        expect(anchor.download).toBe('f.txt');
        expect(anchor.href).toBe('blob:mock');
        expect(anchorClick).toHaveBeenCalledTimes(1);
        expect(createObjectURL).toHaveBeenCalledTimes(1);
    });
});

describe('DesktopLocalStorageService', () => {
    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('should proxy localforage APIs', async () => {
        vi.mocked(localforage.getItem).mockResolvedValue('v' as any);
        vi.mocked(localforage.setItem).mockResolvedValue('saved' as any);
        vi.mocked(localforage.removeItem).mockResolvedValue(undefined as any);
        vi.mocked(localforage.clear).mockResolvedValue(undefined as any);
        vi.mocked(localforage.key).mockResolvedValue('k' as any);
        vi.mocked(localforage.keys).mockResolvedValue(['k1', 'k2']);
        vi.mocked(localforage.iterate).mockResolvedValue('iter' as any);

        const service = new DesktopLocalStorageService();

        await expect(service.getItem('a')).resolves.toBe('v');
        await expect(service.setItem('a', 'b')).resolves.toBe('saved');
        await expect(service.removeItem('a')).resolves.toBeUndefined();
        await expect(service.clear()).resolves.toBeUndefined();
        await expect(service.key(0)).resolves.toBe('k');
        await expect(service.keys()).resolves.toEqual(['k1', 'k2']);
        await expect(service.iterate((v) => v)).resolves.toBe('iter');

        expect(localforage.getItem).toHaveBeenCalledWith('a');
        expect(localforage.setItem).toHaveBeenCalledWith('a', 'b');
    });
});
