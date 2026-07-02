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

import type { IEmbedDescriptor } from '@univerjs/embed';
import { UniverInstanceType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { EmbedActivationService } from '../embed-activation.service';

describe('EmbedActivationService', () => {
    it('activates floating embeds without changing the global current unit', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            activate: vi.fn(),
        };
        const mountService = { activateSession: vi.fn(), deactivateFloatingSession: vi.fn(), deactivateTabSessions: vi.fn(() => []) };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never,
            undefined,
            floatingActiveService as never
        );

        service.activateFloating({
            embedId: 'float-doc',
            hostUnitId: 'host-workbook',
            hostType: UniverInstanceType.UNIVER_SHEET,
            entry: 'sheets-floating-object',
            hostAnchorId: 'drawing-1',
            source: {
                unitType: UniverInstanceType.UNIVER_DOC,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-1', type: 'doc' } },
            },
            childUnitId: 'child-doc',
            childType: UniverInstanceType.UNIVER_DOC,
        });

        expect(univerInstanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(focusOwnerService.setFocusOwner).toHaveBeenCalledWith({
            hostUnitId: 'host-workbook',
            embedId: 'float-doc',
            childUnitId: 'child-doc',
            childType: UniverInstanceType.UNIVER_DOC,
            reason: 'pointer',
        });
        expect(floatingActiveService.activate).toHaveBeenCalledWith({
            hostUnitId: 'host-workbook',
            embedId: 'float-doc',
            childUnitId: 'child-doc',
        });
        expect(mountService.activateSession).toHaveBeenCalledWith('float-doc');
    });

    it('focuses the child unit when a floating embed enters stage2', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            activate: vi.fn(),
        };
        const mountService = { activateSession: vi.fn(), deactivateFloatingSession: vi.fn(), deactivateTabSessions: vi.fn(() => []) };
        const menuOverrideService = { activate: vi.fn(), clear: vi.fn() };
        const blockRegistry = { get: vi.fn(() => ({ layoutPolicy: { float: { ribbon: 'host' } } })) };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            menuOverrideService as never,
            mountService as never,
            blockRegistry as never,
            floatingActiveService as never
        );

        const descriptor: IEmbedDescriptor = {
            embedId: 'float-sheet',
            hostUnitId: 'host-doc',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'drawing-1',
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-sheet', type: 'sheet' } },
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        };

        service.activateFloating(descriptor, 'stage2');

        expect(floatingActiveService.activate).toHaveBeenCalledWith({
            hostUnitId: 'host-doc',
            embedId: 'float-sheet',
            childUnitId: 'child-sheet',
        }, 'stage2');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-sheet');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
        expect(menuOverrideService.activate).toHaveBeenCalledWith(descriptor, 'float-stage2', {
            layoutPolicy: { ribbon: 'host' },
            allowPlaceholder: false,
        });
    });

    it('focuses the child unit when a floating runtime enters interactive stage2', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            activate: vi.fn(),
        };
        const mountService = { activateSession: vi.fn(), deactivateFloatingSession: vi.fn(), deactivateTabSessions: vi.fn(() => []) };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never,
            undefined,
            floatingActiveService as never
        );

        service.focusFloatingRuntime({
            embedId: 'float-sheet',
            hostUnitId: 'host-doc',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'drawing-1',
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-sheet', type: 'sheet' } },
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(focusOwnerService.setFocusOwner).toHaveBeenCalledWith({
            hostUnitId: 'host-doc',
            embedId: 'float-sheet',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            reason: 'pointer',
        });
        expect(mountService.activateSession).toHaveBeenCalledWith('float-sheet');
        expect(floatingActiveService.activate).toHaveBeenCalledWith({
            hostUnitId: 'host-doc',
            embedId: 'float-sheet',
            childUnitId: 'child-sheet',
        }, 'stage2');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-sheet');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
    });

    it('focuses the child unit for fullscreen runtimes without activating floating state', () => {
        const univerInstanceService = {
            getCurrentUnitOfType: vi.fn(() => ({ getUnitId: () => 'host-doc' })),
            getFocusedUnit: vi.fn(() => ({ getUnitId: () => 'host-doc' })),
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            activate: vi.fn(),
        };
        const menuOverrideService = { activate: vi.fn(), clear: vi.fn() };
        const mountService = { activateSession: vi.fn(), deactivateFloatingSession: vi.fn(), deactivateTabSessions: vi.fn(() => []) };
        const contextService = { setContextValue: vi.fn() };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            menuOverrideService as never,
            mountService as never,
            undefined,
            floatingActiveService as never,
            contextService as never
        );

        service.activateFullscreen({
            embedId: 'float-sheet',
            hostUnitId: 'host-doc',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'drawing-1',
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-sheet', type: 'sheet' } },
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(focusOwnerService.setFocusOwner).toHaveBeenCalledWith({
            hostUnitId: 'host-doc',
            embedId: 'float-sheet',
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
            reason: 'pointer',
        });
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('child-sheet');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('child-sheet');
        expect(contextService.setContextValue).toHaveBeenCalledWith(expect.any(String), true);
        expect(floatingActiveService.activate).not.toHaveBeenCalled();
        expect(menuOverrideService.activate).not.toHaveBeenCalled();
        expect(mountService.activateSession).not.toHaveBeenCalled();
    });

    it('restores host focus when clearing a fullscreen runtime', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            getFocusOwner: vi.fn(() => ({
                hostUnitId: 'host-doc',
                embedId: 'float-sheet',
                childUnitId: 'child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
                reason: 'pointer' as const,
            })),
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            { activateSession: vi.fn(), deactivateFloatingSession: vi.fn(), deactivateTabSessions: vi.fn(() => []) } as never
        );

        service.clearFullscreen({
            embedId: 'float-sheet',
            hostUnitId: 'host-doc',
            hostType: UniverInstanceType.UNIVER_DOC,
            entry: 'docs-custom-block',
            hostAnchorId: 'drawing-1',
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-sheet', type: 'sheet' } },
            },
            childUnitId: 'child-sheet',
            childType: UniverInstanceType.UNIVER_SHEET,
        });

        expect(focusOwnerService.clearFocusOwner).toHaveBeenCalledWith('float-sheet');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('host-doc');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('host-doc');
    });

    it('clears floating activation and restores host focus', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            getFocusOwner: vi.fn(() => ({
                hostUnitId: 'host-doc',
                embedId: 'float-sheet',
                childUnitId: 'child-sheet',
                childType: UniverInstanceType.UNIVER_SHEET,
                reason: 'pointer' as const,
            })),
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            clear: vi.fn(),
        };
        const mountService = {
            activateSession: vi.fn(),
            deactivateFloatingSession: vi.fn(),
            deactivateTabSessions: vi.fn(() => []),
        };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never,
            undefined,
            floatingActiveService as never
        );

        service.clearFloating('float-sheet');

        expect(floatingActiveService.clear).toHaveBeenCalledWith('float-sheet');
        expect(focusOwnerService.clearFocusOwner).toHaveBeenCalledWith('float-sheet');
        expect(mountService.deactivateFloatingSession).toHaveBeenCalledWith('float-sheet');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('host-doc');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('host-doc');
    });

    it('does not restore host focus when clearing a non-owner floating embed', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            getFocusOwner: vi.fn(() => ({
                hostUnitId: 'host-doc',
                embedId: 'active-base',
                childUnitId: 'child-base',
                childType: UniverInstanceType.UNIVER_BASE,
                reason: 'pointer' as const,
            })),
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            clear: vi.fn(),
        };
        const mountService = {
            activateSession: vi.fn(),
            deactivateFloatingSession: vi.fn(),
            deactivateTabSessions: vi.fn(() => []),
        };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never,
            undefined,
            floatingActiveService as never
        );

        service.clearFloating('inactive-sheet', 'host-doc');

        expect(floatingActiveService.clear).not.toHaveBeenCalled();
        expect(focusOwnerService.clearFocusOwner).not.toHaveBeenCalled();
        expect(mountService.deactivateFloatingSession).not.toHaveBeenCalled();
        expect(univerInstanceService.setCurrentUnitForType).not.toHaveBeenCalled();
        expect(univerInstanceService.focusUnit).not.toHaveBeenCalled();
    });

    it('restores explicit host focus when clearing a floating embed without active ownership', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            getFocusOwner: vi.fn(() => null),
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const floatingActiveService = {
            getActive: vi.fn(() => null),
            clear: vi.fn(),
        };
        const mountService = {
            activateSession: vi.fn(),
            deactivateFloatingSession: vi.fn(),
            deactivateTabSessions: vi.fn(() => []),
        };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never,
            undefined,
            floatingActiveService as never
        );

        service.clearFloating('inactive-sheet', 'host-workbook');

        expect(floatingActiveService.clear).toHaveBeenCalledWith('inactive-sheet');
        expect(focusOwnerService.clearFocusOwner).toHaveBeenCalledWith('inactive-sheet');
        expect(mountService.deactivateFloatingSession).toHaveBeenCalledWith('inactive-sheet');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('host-workbook');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('host-workbook');
    });

    it('deactivates tab sessions and restores the host when clearing a tab', () => {
        const univerInstanceService = {
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const focusOwnerService = {
            setFocusOwner: vi.fn(),
            clearFocusOwner: vi.fn(),
        };
        const hostAdapterRegistry = {
            activateAnchor: vi.fn(),
        };
        const menuOverrideService = {
            activate: vi.fn(),
            clear: vi.fn(),
        };
        const mountService = {
            activateSession: vi.fn(),
            deactivateFloatingSession: vi.fn(),
            deactivateTabSessions: vi.fn(() => [
                {
                    hostUnitId: 'host-workbook',
                    embedId: 'embed-doc',
                    childUnitId: 'child-doc',
                    childType: UniverInstanceType.UNIVER_DOC,
                    layout: 'tab-peer',
                    hostElement: {} as HTMLElement,
                },
            ]),
        };

        const service = new EmbedActivationService(
            univerInstanceService as never,
            focusOwnerService as never,
            hostAdapterRegistry as never,
            menuOverrideService as never,
            mountService as never
        );

        service.clearTab('embed-doc');

        expect(menuOverrideService.clear).toHaveBeenCalledWith('embed-doc');
        expect(focusOwnerService.clearFocusOwner).toHaveBeenCalledWith('embed-doc');
        expect(mountService.deactivateTabSessions).toHaveBeenCalledWith('embed-doc');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenCalledWith('host-workbook');
        expect(univerInstanceService.focusUnit).toHaveBeenCalledWith('host-workbook');
    });

    it('restores the previous current child unit when clearing a tab embed', () => {
        const units = new Map([
            ['sheet-before', { getUnitId: () => 'sheet-before' }],
            ['sheet-tab-child', { getUnitId: () => 'sheet-tab-child' }],
        ]);
        const univerInstanceService = {
            getCurrentUnitOfType: vi.fn((type: UniverInstanceType) => (
                type === UniverInstanceType.UNIVER_SHEET ? units.get('sheet-before') : undefined
            )),
            getUnit: vi.fn((unitId: string) => units.get(unitId)),
            getAllUnitsForType: vi.fn(() => [...units.values()]),
            setCurrentUnitForType: vi.fn(),
            focusUnit: vi.fn(),
        };
        const mountService = {
            activateSession: vi.fn(),
            deactivateFloatingSession: vi.fn(),
            deactivateTabSessions: vi.fn(() => [
                {
                    hostUnitId: 'host-slide',
                    embedId: 'sheet-tab',
                    childUnitId: 'sheet-tab-child',
                    childType: UniverInstanceType.UNIVER_SHEET,
                    layout: 'tab-peer',
                    hostElement: {} as HTMLElement,
                },
            ]),
        };
        const service = new EmbedActivationService(
            univerInstanceService as never,
            { setFocusOwner: vi.fn(), clearFocusOwner: vi.fn() } as never,
            { activateAnchor: vi.fn() } as never,
            { activate: vi.fn(), clear: vi.fn() } as never,
            mountService as never
        );

        service.activateTab({
            embedId: 'sheet-tab',
            hostUnitId: 'host-slide',
            hostType: UniverInstanceType.UNIVER_SLIDE,
            entry: 'slides-page-list-block',
            hostAnchorId: 'slide-page-1',
            source: {
                unitType: UniverInstanceType.UNIVER_SHEET,
                ref: { file: { kind: 'self' }, unit: { selector: 'child-sheet', type: 'sheet' } },
            },
            childUnitId: 'sheet-tab-child',
            childType: UniverInstanceType.UNIVER_SHEET,
        });
        service.clearTab('sheet-tab');

        expect(mountService.activateSession).toHaveBeenCalledWith('sheet-tab');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(1, 'sheet-before');
        expect(univerInstanceService.setCurrentUnitForType).toHaveBeenNthCalledWith(2, 'host-slide');
    });
});
