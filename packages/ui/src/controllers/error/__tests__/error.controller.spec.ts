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

import {
    ErrorService,
    Injector,
    IPermissionService,
    LocaleService,
    LocaleType,
    PermissionService,
} from '@univerjs/core';
import { MessageType } from '@univerjs/design';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import enUS from '../../../locale/en-US';
import zhCN from '../../../locale/zh-CN';
import { DesktopMessageService } from '../../../services/message/desktop-message.service';
import { IMessageService } from '../../../services/message/message.service';
import { IUIPartsService, UIPartsService } from '../../../services/parts/parts.service';
import { ErrorController } from '../error.controller';

describe('permission denied feedback', () => {
    let injector: Injector;

    beforeEach(() => {
        vi.useFakeTimers();
        injector = new Injector([
            [ErrorService],
            [LocaleService],
            [IPermissionService, { useClass: PermissionService }],
            [IUIPartsService, { useClass: UIPartsService }],
            [IMessageService, { useClass: DesktopMessageService }],
            [ErrorController],
        ]);
        const locale = injector.get(LocaleService);
        locale.load({ [LocaleType.EN_US]: enUS, [LocaleType.ZH_CN]: zhCN });
        locale.setLocale(LocaleType.EN_US);
        injector.get(ErrorController);
    });

    afterEach(() => {
        injector.dispose();
        vi.useRealTimers();
        vi.restoreAllMocks();
    });

    it('shows one warning for continuous attempts and allows a new warning after a quiet interval', () => {
        const show = vi.spyOn(injector.get(IMessageService), 'show');
        const errors = injector.get(ErrorService);
        errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        for (let i = 0; i < 6; i++) {
            vi.advanceTimersByTime(1000);
            errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        }
        expect(show).toHaveBeenCalledTimes(1);
        expect(show).toHaveBeenCalledWith(expect.objectContaining({
            content: enUS.ui.objectPermission.operationDenied,
            type: MessageType.Warning,
            duration: 3000,
        }));
        vi.advanceTimersByTime(3000);
        errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).toHaveBeenCalledTimes(2);
    });

    it('immediately refreshes the warning when switching objects or documents', () => {
        const show = vi.spyOn(injector.get(IMessageService), 'show');
        const errors = injector.get(ErrorService);
        errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        errors.emitPermissionDenied('doc-1', ['paragraph-2']);
        expect(show).toHaveBeenCalledTimes(2);
        errors.emitPermissionDenied('doc-1', ['paragraph-2']);
        expect(show).toHaveBeenCalledTimes(2);
        errors.emitPermissionDenied('doc-2', ['paragraph-2']);
        errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).toHaveBeenCalledTimes(4);
        expect(new Set(show.mock.calls.map(([options]) => options.id)).size).toBe(1);
    });

    it('deduplicates the same multi-object selection regardless of target order or duplicates', () => {
        const show = vi.spyOn(injector.get(IMessageService), 'show');
        const errors = injector.get(ErrorService);
        errors.emitPermissionDenied('doc-1', ['section-1', 'paragraph-1', 'paragraph-2']);
        errors.emitPermissionDenied('doc-1', ['paragraph-2', 'paragraph-1', 'section-1', 'paragraph-1']);
        expect(show).toHaveBeenCalledTimes(1);
        errors.emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).toHaveBeenCalledTimes(2);
    });

    it('honors the shared permission visibility setting without suppressing other errors', () => {
        const show = vi.spyOn(injector.get(IMessageService), 'show');
        injector.get(IPermissionService).setShowComponents(false);
        injector.get(ErrorService).emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).not.toHaveBeenCalled();
        injector.get(ErrorService).emit('Network unavailable');
        expect(show).toHaveBeenCalledWith({ content: 'Network unavailable', type: MessageType.Error });
        injector.get(IPermissionService).setShowComponents(true);
        injector.get(ErrorService).emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).toHaveBeenCalledTimes(2);
    });

    it('uses the current locale when an operation is rejected', () => {
        const show = vi.spyOn(injector.get(IMessageService), 'show');
        injector.get(LocaleService).setLocale(LocaleType.ZH_CN);
        injector.get(ErrorService).emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).toHaveBeenCalledWith(expect.objectContaining({
            content: zhCN.ui.objectPermission.operationDenied,
        }));
    });

    it('stops feedback and dismisses its message on disposal', () => {
        const service = injector.get(IMessageService);
        const show = vi.spyOn(service, 'show');
        const remove = vi.spyOn(service, 'remove');
        injector.get(ErrorController).dispose();
        injector.get(ErrorService).emitPermissionDenied('doc-1', ['paragraph-1']);
        expect(show).not.toHaveBeenCalled();
        expect(remove).toHaveBeenCalledWith('ui.permission-denied');
    });
});
