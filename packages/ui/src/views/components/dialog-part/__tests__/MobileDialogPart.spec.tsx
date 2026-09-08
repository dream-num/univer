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

import type { ReactElement } from 'react';
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react';
import { DesktopLogService, ILogService, Injector, LocaleService, LocaleType } from '@univerjs/core';
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { ComponentManager, IconManager } from '../../../../common';
import enUS from '../../../../locale/en-US';
import { DesktopDialogService } from '../../../../services/dialog/desktop-dialog.service';
import { IDialogService } from '../../../../services/dialog/dialog.service';
import { MobileDialogService } from '../../../../services/dialog/mobile-dialog.service';
import { IUIPartsService, UIPartsService } from '../../../../services/parts/parts.service';
import { RediProvider } from '../../../../utils/di';
import { MobileDrawer } from '../../mobile-drawer/MobileDrawer';
import { MobileDrawerCoordinatorProvider } from '../../mobile-drawer/MobileDrawerCoordinator';
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
        ...render(
            <RediProvider value={{ injector }}>
                <MobileDrawerCoordinatorProvider>{element}</MobileDrawerCoordinatorProvider>
            </RediProvider>
        ),
        injector,
    };
}

function NestedMobileLayer() {
    const [open, setOpen] = useState(false);

    return (
        <>
            <button type="button" onClick={() => setOpen(true)}>
                Open nested layer
            </button>
            {open && createPortal(
                <MobileDrawer
                    openMode="push"
                    snap="compact"
                    expandLabel="Nested drawer"
                    collapseLabel="Nested drawer"
                    onSnapChange={vi.fn()}
                    onClose={() => setOpen(false)}
                    role="dialog"
                    ariaLabel="Nested drawer"
                >
                    <button type="button" onClick={() => setOpen(false)}>Close nested layer</button>
                </MobileDrawer>,
                document.body
            )}
        </>
    );
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

    it('ignores the release of the pointer that opened the dialog before accepting a backdrop tap', () => {
        const rendered = renderWithDependencies(
            <>
                <button type="button">Open on pointer down</button>
                <MobileDialogPart />
            </>
        );
        const dialogService = rendered.injector.get(IDialogService);
        const trigger = screen.getByRole('button', { name: 'Open on pointer down' });
        trigger.addEventListener('pointerdown', () => {
            dialogService.open({
                id: 'pointer-down-dialog',
                children: { title: <span>Pointer down dialog</span> },
            });
        });

        fireEvent.pointerDown(trigger, { pointerId: 1 });
        const backdrop = screen.getAllByRole('button', { name: 'Close sidebar' })[0];
        fireEvent.pointerUp(backdrop, { pointerId: 1 });
        fireEvent.click(backdrop, { detail: 0 });

        expect(screen.getByRole('dialog')).toBeTruthy();

        fireEvent.pointerDown(backdrop, { pointerId: 2 });
        fireEvent.pointerUp(backdrop, { pointerId: 2 });

        expect(screen.queryByRole('dialog')).toBeNull();
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

    it('hides a parent dialog while a pushed drawer is open and restores it after close', () => {
        const rendered = renderWithDependencies(<MobileDialogPart />, true);
        const dialogService = rendered.injector.get(IDialogService);
        rendered.injector.get(ComponentManager).register('nested-mobile-layer', NestedMobileLayer);

        act(() => {
            dialogService.open({
                id: 'parent-dialog',
                children: { label: 'nested-mobile-layer' },
            });
        });

        const dialogShell = document.querySelector<HTMLElement>('[data-u-comp="mobile-dialog"]');
        expect(dialogShell?.hidden).toBe(false);

        fireEvent.click(screen.getByRole('button', { name: 'Open nested layer' }));

        expect(dialogShell?.hidden).toBe(true);
        expect(screen.getByRole('dialog', { name: 'Nested drawer' })).toBeTruthy();

        fireEvent.click(screen.getByRole('button', { name: 'Close nested layer' }));

        expect(dialogShell?.hidden).toBe(false);
        expect(screen.getByRole('button', { name: 'Open nested layer' })).toBeTruthy();
    });
});
