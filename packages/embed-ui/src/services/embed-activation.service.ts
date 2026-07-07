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
import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedHostMenuOverride } from '../types/embed-ui';
import { FOCUSING_DOC, FOCUSING_SHEET, FOCUSING_SLIDE, FOCUSING_UNIT, IContextService, Inject, IUniverInstanceService, Optional, toDisposable, UniverInstanceType } from '@univerjs/core';
import { EmbedFocusOwnerService, EmbedHostAdapterRegistryService } from '@univerjs/embed';
import { ILayoutService } from '@univerjs/ui';
import { EmbedHostChromeMode } from '../types/embed-ui';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedHostMenuOverrideService } from './embed-host-menu-override.service';
import { EmbedMountService } from './embed-mount.service';

export interface IEmbedFloatingActivationOptions {
    portalContainer?: HTMLElement | null;
}

export class EmbedActivationService {
    private readonly _previousChildCurrentUnits = new Map<string, { childType: UniverInstanceType; unitId?: string }>();
    private readonly _floatingHostFocusRestorers = new Map<string, IDisposable>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(EmbedFocusOwnerService) private readonly _focusOwnerService: EmbedFocusOwnerService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostMenuOverrideService) private readonly _menuOverrideService: EmbedHostMenuOverrideService,
        @Inject(EmbedMountService) private readonly _mountService: EmbedMountService,
        @Optional(EmbedBlockRegistryService) private readonly _blockRegistry?: EmbedBlockRegistryService,
        @Optional(EmbedFloatingActiveService) private readonly _floatingActiveService?: EmbedFloatingActiveService,
        @Optional(IContextService) private readonly _contextService?: IContextService,
        @Optional(ILayoutService) private readonly _layoutService?: ILayoutService
    ) {
        // noop
    }

    activateTab(descriptor: IEmbedDescriptor): IEmbedHostMenuOverride | null {
        this._assertResolvedChild(descriptor);
        this._rememberPreviousChildCurrentUnit(descriptor);
        this._hostAdapterRegistry.activateAnchor({
            embedId: descriptor.embedId,
            hostUnitId: descriptor.hostUnitId,
            hostType: descriptor.hostType,
            entry: descriptor.entry,
            hostAnchorId: descriptor.hostAnchorId,
            descriptor,
        });
        this._mountService.activateSession(descriptor.embedId);
        const contribution = this._blockRegistry?.get(descriptor.childType!);
        return this._menuOverrideService.activate(descriptor, 'tab-active', {
            layoutPolicy: contribution?.layoutPolicy?.tab,
            allowPlaceholder: contribution?.hostChromeMode === EmbedHostChromeMode.TITLE_ONLY || contribution?.hostHeaderMode === 'placeholder',
        });
    }

    activateFloating(descriptor: IEmbedDescriptor, stage?: 'stage1' | 'stage2', _options: IEmbedFloatingActivationOptions = {}): void {
        this._assertResolvedChild(descriptor);
        this._focusOwnerService.setFocusOwner({
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            reason: 'pointer',
        });
        this._mountService.activateSession(descriptor.embedId);
        const activation = {
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
        };
        if (stage) {
            this._floatingActiveService?.activate(activation, stage);
        } else {
            this._floatingActiveService?.activate(activation);
        }
        this._menuOverrideService.clear();
        if (stage === 'stage2') {
            this._setCurrentUnitForType(descriptor.childUnitId!, descriptor.childType!);
            this._preserveHostGlobalFocusForFloating(descriptor);
        } else {
            this._releaseFloatingHostFocusRestorers();
        }
    }

    focusFloatingRuntime(descriptor: IEmbedDescriptor, options: IEmbedFloatingActivationOptions = {}): void {
        this.activateFloating(descriptor, 'stage2', options);
    }

    activateFullscreen(descriptor: IEmbedDescriptor): void {
        this._assertResolvedChild(descriptor);
        this._focusOwnerService.setFocusOwner({
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            reason: 'pointer',
        });
        this._focusUnit(descriptor.childUnitId!, descriptor.childType!);
    }

    clearFullscreen(descriptor: IEmbedDescriptor): void {
        const owner = this._focusOwnerService.getFocusOwner();
        if (owner?.embedId && owner.embedId !== descriptor.embedId) {
            return;
        }

        this._focusOwnerService.clearFocusOwner(descriptor.embedId);
        this._univerInstanceService.setCurrentUnitForType(descriptor.hostUnitId);
        this._univerInstanceService.focusUnit(descriptor.hostUnitId);
    }

    clearFloating(embedId?: string, hostUnitId?: string): void {
        const owner = this._focusOwnerService.getFocusOwner();
        if (embedId && owner?.embedId && owner.embedId !== embedId) {
            return;
        }
        const getActive = (this._floatingActiveService as { getActive?: () => ReturnType<EmbedFloatingActiveService['getActive']> } | undefined)?.getActive;
        const active = typeof getActive === 'function' ? getActive.call(this._floatingActiveService) : null;
        if (embedId && !owner && active?.embedId !== embedId && !hostUnitId) {
            return;
        }
        const nextHostUnitId = hostUnitId ?? owner?.hostUnitId ?? active?.hostUnitId;

        this._floatingActiveService?.clear(embedId);
        this._focusOwnerService.clearFocusOwner(embedId);
        this._menuOverrideService.clear(embedId);
        this._releaseFloatingHostFocusRestorers(embedId);
        if (embedId) {
            this._mountService.deactivateFloatingSession(embedId);
        }

        if (nextHostUnitId) {
            this._univerInstanceService.setCurrentUnitForType(nextHostUnitId);
            this._univerInstanceService.focusUnit(nextHostUnitId);
        }
    }

    clearTab(embedId?: string): void {
        this._menuOverrideService.clear(embedId);
        this._focusOwnerService.clearFocusOwner(embedId);

        const deactivatedSessions = this._mountService.deactivateTabSessions(embedId);
        deactivatedSessions.forEach((session) => this._restorePreviousChildCurrentUnit(session.embedId, session.childType, session.childUnitId));
        const hostUnitIds = new Set(deactivatedSessions.map((session) => session.hostUnitId));
        hostUnitIds.forEach((hostUnitId) => {
            this._univerInstanceService.setCurrentUnitForType(hostUnitId);
            this._univerInstanceService.focusUnit(hostUnitId);
        });
    }

    private _rememberPreviousChildCurrentUnit(descriptor: IEmbedDescriptor): void {
        const childType = descriptor.childType!;
        const currentUnitId = this._getCurrentUnitId(childType);
        this._previousChildCurrentUnits.set(descriptor.embedId, {
            childType,
            unitId: currentUnitId && currentUnitId !== descriptor.childUnitId ? currentUnitId : undefined,
        });
    }

    private _restorePreviousChildCurrentUnit(embedId: string, childType: UniverInstanceType, childUnitId: string): void {
        const previous = this._previousChildCurrentUnits.get(embedId);
        this._previousChildCurrentUnits.delete(embedId);

        const previousUnitId = previous?.childType === childType && previous.unitId && this._hasUnit(previous.unitId, childType)
            ? previous.unitId
            : this._findFallbackUnitId(childType, childUnitId);

        if (previousUnitId) {
            this._univerInstanceService.setCurrentUnitForType(previousUnitId);
        }
    }

    private _getCurrentUnitId(type: UniverInstanceType): string | undefined {
        const getCurrentUnitOfType = (this._univerInstanceService as unknown as {
            getCurrentUnitOfType?: (type: UniverInstanceType) => { getUnitId: () => string } | null | undefined;
        }).getCurrentUnitOfType;
        return getCurrentUnitOfType?.call(this._univerInstanceService, type)?.getUnitId();
    }

    private _hasUnit(unitId: string, type: UniverInstanceType): boolean {
        const getUnit = (this._univerInstanceService as unknown as {
            getUnit?: (unitId: string, type: UniverInstanceType) => unknown;
        }).getUnit;
        return !!getUnit?.call(this._univerInstanceService, unitId, type);
    }

    private _findFallbackUnitId(type: UniverInstanceType, excludedUnitId: string): string | undefined {
        const getAllUnitsForType = (this._univerInstanceService as unknown as {
            getAllUnitsForType?: (type: UniverInstanceType) => Array<{ getUnitId: () => string }>;
        }).getAllUnitsForType;
        return getAllUnitsForType?.call(this._univerInstanceService, type)
            ?.find((unit) => unit.getUnitId() !== excludedUnitId)
            ?.getUnitId();
    }

    private _focusUnit(unitId: string, unitType: UniverInstanceType): void {
        this._setCurrentUnitForType(unitId, unitType);
        const getFocusedUnit = (this._univerInstanceService as unknown as {
            getFocusedUnit?: () => { getUnitId: () => string } | null | undefined;
        }).getFocusedUnit;

        if (
            typeof getFocusedUnit !== 'function' ||
            getFocusedUnit.call(this._univerInstanceService)?.getUnitId() !== unitId
        ) {
            this._univerInstanceService.focusUnit(unitId);
        }

        this._contextService?.setContextValue(FOCUSING_UNIT, true);
        this._contextService?.setContextValue(FOCUSING_DOC, unitType === UniverInstanceType.UNIVER_DOC);
        this._contextService?.setContextValue(FOCUSING_SHEET, unitType === UniverInstanceType.UNIVER_SHEET);
        this._contextService?.setContextValue(FOCUSING_SLIDE, unitType === UniverInstanceType.UNIVER_SLIDE);
        this._focusLayout();
    }

    private _setCurrentUnitForType(unitId: string, unitType: UniverInstanceType): void {
        const getCurrentUnitOfType = (this._univerInstanceService as unknown as {
            getCurrentUnitOfType?: (type: UniverInstanceType) => { getUnitId: () => string } | null | undefined;
        }).getCurrentUnitOfType;

        if (
            typeof getCurrentUnitOfType !== 'function' ||
            getCurrentUnitOfType.call(this._univerInstanceService, unitType)?.getUnitId() !== unitId
        ) {
            this._univerInstanceService.setCurrentUnitForType(unitId);
        }
    }

    private _focusLayout(): void {
        const focus = () => this._layoutService?.focus();
        focus();

        if (typeof queueMicrotask === 'function') {
            queueMicrotask(focus);
        }

        if (typeof requestAnimationFrame === 'function') {
            requestAnimationFrame(focus);
        }
    }

    private _preserveHostGlobalFocusForFloating(descriptor: IEmbedDescriptor): void {
        this._releaseFloatingHostFocusRestorers();
        if (descriptor.entry === 'docs-custom-block') {
            return;
        }

        const childUnitId = descriptor.childUnitId!;
        const hostUnitId = descriptor.hostUnitId;
        const instanceService = this._univerInstanceService as unknown as {
            focused$?: { subscribe: (listener: () => void) => { unsubscribe: () => void } };
            getFocusedUnit?: () => { getUnitId: () => string } | null | undefined;
        };
        let restoring = false;
        const restoreHostIfChildFocused = () => {
            if (restoring || instanceService.getFocusedUnit?.call(this._univerInstanceService)?.getUnitId() !== childUnitId) {
                return;
            }

            restoring = true;
            try {
                this._univerInstanceService.setCurrentUnitForType(hostUnitId);
                this._univerInstanceService.focusUnit(hostUnitId);
            } finally {
                restoring = false;
            }
        };

        const subscription = instanceService.focused$?.subscribe(restoreHostIfChildFocused);
        this._floatingHostFocusRestorers.set(descriptor.embedId, toDisposable(() => subscription?.unsubscribe()));
        restoreHostIfChildFocused();
    }

    private _releaseFloatingHostFocusRestorers(embedId?: string): void {
        this._floatingHostFocusRestorers.forEach((disposable, currentEmbedId) => {
            if (embedId && currentEmbedId !== embedId) {
                return;
            }

            disposable.dispose();
            this._floatingHostFocusRestorers.delete(currentEmbedId);
        });
    }

    private _assertResolvedChild(descriptor: IEmbedDescriptor): void {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_ACTIVATION_CHILD_NOT_RESOLVED');
        }
    }
}
