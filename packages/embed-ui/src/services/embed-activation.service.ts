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

import type { UniverInstanceType } from '@univerjs/core';
import type { IEmbedDescriptor } from '@univerjs/embed';
import type { IEmbedHostMenuOverride } from '../types/embed-ui';
import { Inject, IUniverInstanceService, Optional } from '@univerjs/core';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { EmbedHostChromeMode } from '../types/embed-ui';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedHostMenuOverrideService } from './embed-host-menu-override.service';
import { EmbedMountService } from './embed-mount.service';

export class EmbedActivationService {
    private readonly _previousChildCurrentUnits = new Map<string, { childType: UniverInstanceType; unitId?: string }>();

    constructor(
        @IUniverInstanceService private readonly _univerInstanceService: IUniverInstanceService,
        @Inject(EmbedFocusOwnerService) private readonly _focusOwnerService: EmbedFocusOwnerService,
        @Inject(EmbedHostAdapterRegistryService) private readonly _hostAdapterRegistry: EmbedHostAdapterRegistryService,
        @Inject(EmbedHostMenuOverrideService) private readonly _menuOverrideService: EmbedHostMenuOverrideService,
        @Inject(EmbedMountService) private readonly _mountService: EmbedMountService,
        @Optional(EmbedBlockRegistryService) private readonly _blockRegistry?: EmbedBlockRegistryService,
        @Optional(EmbedFloatingActiveService) private readonly _floatingActiveService?: EmbedFloatingActiveService
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

    activateFloating(descriptor: IEmbedDescriptor, stage?: 'stage1' | 'stage2'): void {
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
        if (stage === 'stage2') {
            this._univerInstanceService.setCurrentUnitForType(descriptor.childUnitId!);
            this._univerInstanceService.focusUnit(descriptor.childUnitId!);
        }
    }

    focusFloatingRuntime(descriptor: IEmbedDescriptor): void {
        this.activateFloating(descriptor, 'stage2');
    }

    clearFloating(embedId?: string, hostUnitId?: string): void {
        const owner = this._focusOwnerService.getFocusOwner();
        if (embedId && owner?.embedId && owner.embedId !== embedId) {
            return;
        }
        const getActive = (this._floatingActiveService as { getActive?: () => ReturnType<EmbedFloatingActiveService['getActive']> } | undefined)?.getActive;
        const active = typeof getActive === 'function' ? getActive.call(this._floatingActiveService) : null;
        if (embedId && !owner && active?.embedId !== embedId) {
            return;
        }
        const nextHostUnitId = hostUnitId ?? owner?.hostUnitId ?? active?.hostUnitId;

        this._floatingActiveService?.clear(embedId);
        this._focusOwnerService.clearFocusOwner(embedId);
        if (embedId) {
            this._mountService.setActive(embedId, false);
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

    private _assertResolvedChild(descriptor: IEmbedDescriptor): void {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_ACTIVATION_CHILD_NOT_RESOLVED');
        }
    }
}
