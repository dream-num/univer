import type { EmbedCapability, EmbedHostEntry, EmbedSourceMeta, EmbedTabConfig } from '../types/embed';
import type { Injector } from '@univerjs/core';
import { UniverInstanceType } from '@univerjs/core';

const PENDING_EMBED_CAPABILITIES = new WeakMap<object, EmbedCapability[]>();

const TAB_CONTAINER = new Map<EmbedHostEntry, EmbedTabConfig['container']>([
    ['sheets-sheet-tab', 'sheet-tab'],
    ['bases-table-list-block', 'table-list'],
    ['slides-page-list-block', 'slide-page-list'],
]);

export function createDefaultEmbedCapabilities(): EmbedCapability[] {
    return [];
}

export function createDefaultEmbedSourceMeta(capability: EmbedCapability): EmbedSourceMeta {
    const sourceMeta: EmbedSourceMeta = {};
    if (capability.renderHost) {
        sourceMeta.renderHost = capability.renderHost;
    }

    if (
        capability.hostType === UniverInstanceType.UNIVER_DOC
        && (capability.childType === UniverInstanceType.UNIVER_SHEET || capability.childType === UniverInstanceType.UNIVER_BASE)
    ) {
        sourceMeta.verticalWheelMode = 'host';
        sourceMeta.horizontalWheelMode = 'expand-then-self';
    }

    if (capability.mode === 'float') {
        sourceMeta.floating = {
            enabled: true,
            layout: capability.layout,
            fullscreen: true,
        };
        sourceMeta.tab = false;
        return sourceMeta;
    }

    sourceMeta.floating = false;
    sourceMeta.tab = {
        enabled: true,
        container: TAB_CONTAINER.get(capability.entry),
        replaceHostMenu: capability.menuBehavior === 'host-override',
        hideHostFxBar: capability.menuBehavior === 'host-override',
        lockHostRibbon: capability.menuBehavior === 'host-override',
        thumbnail: capability.entry === 'slides-page-list-block',
    };
    return sourceMeta;
}

export class EmbedCapabilityRegistryService {
    private readonly _capabilities = new Map<string, EmbedCapability>();

    register(capability: EmbedCapability): void {
        if (capability.hostType === capability.childType) {
            throw new Error('Cannot register same product embed capability');
        }

        const key = this._key(capability.hostType, capability.childType, capability.entry);
        if (this._capabilities.has(key)) {
            throw new Error(`Embed capability already registered: ${key}`);
        }

        this._capabilities.set(key, capability);
    }

    registerMany(capabilities: readonly EmbedCapability[]): void {
        capabilities.forEach((capability) => this.register(capability));
    }

    getCapability(params: {
        hostType: UniverInstanceType;
        childType: UniverInstanceType;
        entry: EmbedHostEntry;
    }): EmbedCapability | undefined {
        return this._capabilities.get(this._key(params.hostType, params.childType, params.entry));
    }

    list(): EmbedCapability[] {
        return [...this._capabilities.values()];
    }

    private _key(hostType: UniverInstanceType, childType: UniverInstanceType, entry: EmbedHostEntry): string {
        return `${hostType}:${childType}:${entry}`;
    }
}

export function registerEmbedCapabilities(
    injector: Pick<Injector, 'get' | 'has'>,
    capabilities: readonly EmbedCapability[]
): void {
    if (injector.has(EmbedCapabilityRegistryService)) {
        const registry = injector.get(EmbedCapabilityRegistryService);
        capabilities.forEach((capability) => registerCapabilityIfMissing(registry, capability));
        return;
    }

    const key = injector as object;
    const pending = PENDING_EMBED_CAPABILITIES.get(key) ?? [];
    capabilities.forEach((capability) => {
        if (!pending.some((item) => isSameCapability(item, capability))) {
            pending.push(capability);
        }
    });
    PENDING_EMBED_CAPABILITIES.set(key, pending);
}

export function flushPendingEmbedCapabilities(injector: Pick<Injector, 'get' | 'has'>): void {
    if (!injector.has(EmbedCapabilityRegistryService)) {
        return;
    }

    const key = injector as object;
    const pending = PENDING_EMBED_CAPABILITIES.get(key) ?? [];
    if (!pending.length) {
        return;
    }

    const registry = injector.get(EmbedCapabilityRegistryService);
    pending.forEach((capability) => registerCapabilityIfMissing(registry, capability));
    PENDING_EMBED_CAPABILITIES.delete(key);
}

function registerCapabilityIfMissing(registry: EmbedCapabilityRegistryService, capability: EmbedCapability): void {
    if (!registry.getCapability(capability)) {
        registry.register(capability);
    }
}

function isSameCapability(left: EmbedCapability, right: EmbedCapability): boolean {
    return left.hostType === right.hostType && left.childType === right.childType && left.entry === right.entry;
}
