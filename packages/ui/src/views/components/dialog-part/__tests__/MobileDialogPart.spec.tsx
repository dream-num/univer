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

import type { IDisposable } from '@univerjs/core';
import type { ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import enUS from '../../../../locale/en-US';
import { DesktopDialogService } from '../../../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { isMobileDialogService, MobileDialogService } from '../../../../services/dialog/mobile-dialog.service';
import { IUIPartsService, UIPartsService } from '../../../../services/parts/parts.service';
import { RediProvider } from '../../../../utils/di';
import { MobileDialogPart } from '../MobileDialogPart';

Object.defineProperty(globalThis, 'IS_REACT_ACT_ENVIRONMENT', { configurable: true, value: true, writable: true });

function renderWithDependencies(element: ReactElement, mobileService = false) {
    const injector = new Injector();
    injector.add([IUIPartsService, { useClass: UIPartsService }]);
    injector.add([IDialogService, { useClass: mobileService ? MobileDialogService : DesktopDialogService }]);
    injector.add([ILogService, { useClass: DesktopLogService }]);
    injector.add([LocaleService]);
    injector.get(LocaleService).load({ [LocaleType.EN_US]: enUS });
    injector.get(LocaleService).setLocale(LocaleType.EN_US);
    injector.add([ComponentManager]);
    injector.add([IconManager]);

    return {
        ...render(<RediProvider value={{ injector }}>{element}</RediProvider>),
        injector,
    };
}

describe('MobileDialogPart', () => {
    afterEach(() => {
        cleanup();
        vi.restoreAllMocks();
    });

    it('renders the latest active dialog as an 80 percent bottom drawer', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />);
        const dialogService = rendered.injector.get(IDialogService);

        act(() => {
            dialogService.open({ id: 'first', children: { title: <span>First</span> } });
            dialogService.open({
                id: 'second',
                title: { title: <span>Range selector</span> },
                children: { title: <span>Second</span> },
                footer: { title: <span>Actions</span> },
            });
        });

        const drawer = screen.getByRole('dialog');
        expect(drawer.getAttribute('data-snap')).toBe('expanded');
        expect(screen.queryByText('First')).toBeNull();
        expect(screen.getByText('Range selector')).toBeTruthy();
        expect(screen.getByText('Second')).toBeTruthy();
        expect(screen.getByText('Actions')).toBeTruthy();
        expect(screen.getByText('Actions').closest('[data-u-comp="mobile-actions"]')).toBeTruthy();
    });

    it('closes with the close button and invokes dialog callbacks', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />);
        const dialogService = rendered.injector.get(IDialogService);
        const onClose = vi.fn();
        const onOpenChange = vi.fn();

        act(() => {
            dialogService.open({
                id: 'pivot',
                children: { title: <span>Pivot</span> },
                onClose,
                onOpenChange,
            });
        });

        fireEvent.click(screen.getAllByRole('button', { name: 'Close sidebar' })[1]);
        expect(screen.queryByRole('dialog')).toBeNull();
        expect(onClose).toHaveBeenCalledOnce();
        expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('keeps a non-mask-closable dialog open when its backdrop is tapped', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />);
        const dialogService = rendered.injector.get(IDialogService);

        act(() => {
            dialogService.open({
                id: 'required',
                children: { title: <span>Required input</span> },
                maskClosable: false,
            });
        });

        fireEvent.click(screen.getAllByRole('button', { name: 'Close sidebar' })[0]);
        expect(screen.getByRole('dialog')).toBeTruthy();
    });

    it('makes re-entrant business close callbacks idempotent', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />, true);
        const dialogService = rendered.injector.get(IDialogService);
        const onClose = vi.fn(() => dialogService.close('table-selector'));

        act(() => {
            dialogService.open({
                id: 'table-selector',
                children: { title: <span>Table selector</span> },
                onClose,
            });
        });

        expect(() => fireEvent.click(screen.getAllByRole('button', { name: 'Close sidebar' })[1])).not.toThrow();
        expect(onClose).toHaveBeenCalledOnce();
        expect(screen.queryByRole('dialog')).toBeNull();
    });

    it('suspends mobile dialogs without unmounting their business state', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />, true);
        const dialogService = rendered.injector.get(IDialogService);
        if (!isMobileDialogService(dialogService)) throw new Error('Expected the mobile dialog service.');

        act(() => {
            dialogService.open({
                id: 'table-selector',
                children: { title: <span>Preserved table selector</span> },
            });
        });

        let firstSuspension!: IDisposable;
        let secondSuspension!: IDisposable;
        act(() => {
            firstSuspension = dialogService.suspendOverlays();
            secondSuspension = dialogService.suspendOverlays();
        });
        const dialogRoot = rendered.container.querySelector('[data-u-comp="mobile-dialog"]');

        expect(dialogRoot?.getAttribute('data-suspended')).toBe('true');
        expect(dialogRoot?.className).toContain('univer-invisible');
        expect(screen.getByText('Preserved table selector')).toBeTruthy();

        act(() => firstSuspension.dispose());
        expect(dialogRoot?.getAttribute('data-suspended')).toBe('true');

        act(() => secondSuspension.dispose());
        expect(dialogRoot?.getAttribute('data-suspended')).toBeNull();
        expect(screen.getByText('Preserved table selector')).toBeTruthy();
    });
});
