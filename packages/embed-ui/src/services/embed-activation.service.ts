import type { EmbedDescriptor } from '@univerjs/embed';
import type { EmbedHostMenuOverride } from '../types/embed-ui';
import { EmbedFocusOwnerService } from '@univerjs/embed';
import { Inject, IUniverInstanceService, Optional } from '@univerjs/core';
import { EmbedFloatingActiveService } from './embed-floating-active.service';
import { EmbedBlockRegistryService } from './embed-block-registry.service';
import { EmbedHostAdapterRegistryService } from './embed-host-adapter-registry.service';
import { EmbedHostMenuOverrideService } from './embed-host-menu-override.service';
import { EmbedMountService } from './embed-mount.service';

export class EmbedActivationService {
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

    activateTab(descriptor: EmbedDescriptor): EmbedHostMenuOverride | null {
        this._assertResolvedChild(descriptor);
        this._univerInstanceService.setCurrentUnitForType(descriptor.childUnitId!);
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
            allowPlaceholder: contribution?.hostHeaderMode === 'placeholder',
        });
    }

    activateFloating(descriptor: EmbedDescriptor): void {
        this._assertResolvedChild(descriptor);
        this._univerInstanceService.setCurrentUnitForType(descriptor.childUnitId!);
        this._focusOwnerService.setFocusOwner({
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
            childType: descriptor.childType!,
            reason: 'pointer',
        });
        this._floatingActiveService?.activate({
            hostUnitId: descriptor.hostUnitId,
            embedId: descriptor.embedId,
            childUnitId: descriptor.childUnitId!,
        });
    }

    clearTab(embedId?: string): void {
        this._menuOverrideService.clear(embedId);
    }

    private _assertResolvedChild(descriptor: EmbedDescriptor): void {
        if (!descriptor.childUnitId || descriptor.childType == null) {
            throw new Error('EMBED_ACTIVATION_CHILD_NOT_RESOLVED');
        }
    }
}
