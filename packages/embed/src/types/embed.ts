import type { UniverInstanceType } from '@univerjs/core';
import type { ICreateUnitOptions } from '@univerjs/core';
import type { ResourceRef } from './resource-ref';

export type EmbedHostEntry =
    | 'docs-custom-block'
    | 'sheets-floating-object'
    | 'sheets-sheet-tab'
    | 'bases-table-list-block'
    | 'slides-floating-object'
    | 'slides-page-list-block'
    | 'boards-floating-object';

export type EmbedMode = 'float' | 'tab';
export type EmbedMenuBehavior = 'floating' | 'host-override' | 'none';
export type EmbedRenderHost = 'dom' | 'sheets-drawing-dom' | 'slides-object-dom' | 'boards-object-dom';
export type EmbedLayout =
    | 'docs-sticky-sheet'
    | 'docs-sticky-base'
    | 'scroll-contained'
    | 'doc-width-scale'
    | 'aspect-fit'
    | 'content-bounds-fit'
    | 'tab-peer';

export type EmbedSurfacePlacement = 'host' | 'child' | 'hidden' | 'compact';

export interface EmbedLayoutPolicy {
    ribbon?: EmbedSurfacePlacement;
    productToolbar?: EmbedSurfacePlacement;
    contextMenu?: EmbedSurfacePlacement;
    floatToolbar?: EmbedSurfacePlacement;
    footer?: EmbedSurfacePlacement;
    sidePanel?: EmbedSurfacePlacement;
    floatingMenu?: EmbedSurfacePlacement;
}

export interface EmbedLayoutPolicies {
    tab?: EmbedLayoutPolicy;
    float?: EmbedLayoutPolicy;
    docFlow?: EmbedLayoutPolicy;
}

export const DEFAULT_EMBED_TAB_LAYOUT_POLICY: Required<EmbedLayoutPolicy> = {
    ribbon: 'host',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'child',
    sidePanel: 'child',
    floatingMenu: 'hidden',
};

export const DEFAULT_EMBED_FLOAT_LAYOUT_POLICY: Required<EmbedLayoutPolicy> = {
    ribbon: 'hidden',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'compact',
    sidePanel: 'compact',
    floatingMenu: 'child',
};

export const DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY: Required<EmbedLayoutPolicy> = {
    ribbon: 'hidden',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'compact',
    sidePanel: 'compact',
    floatingMenu: 'child',
};

export interface EmbedCapability {
    hostType: UniverInstanceType;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    mode: EmbedMode;
    renderHost?: EmbedRenderHost;
    layout: EmbedLayout;
    menuBehavior: EmbedMenuBehavior;
    nestedEmbed: false;
}

export type EmbedSource =
    | {
        kind: 'ref';
        ref: ResourceRef;
    }
    | {
        kind: 'empty';
        unitType: UniverInstanceType;
        creationConfig?: Record<string, unknown>;
    };

export interface EmbedFloatingConfig {
    enabled?: boolean;
    layout?: EmbedLayout;
    fullscreen?: boolean;
}

export interface EmbedTabConfig {
    enabled?: boolean;
    container?: 'sheet-tab' | 'table-list' | 'slide-page-list';
    replaceHostMenu?: boolean;
    hideHostFxBar?: boolean;
    lockHostRibbon?: boolean;
    thumbnail?: boolean;
}

export interface EmbedSourceMeta {
    renderHost?: EmbedRenderHost;
    verticalWheelMode?: 'self' | 'host';
    horizontalWheelMode?: 'self' | 'host' | 'expand-then-self';
    floating?: false | EmbedFloatingConfig;
    tab?: false | EmbedTabConfig;
    hostBlockChrome?: false | {
        leftHoverMenu?: boolean;
        draggable?: boolean;
        resizable?: boolean;
        menuIcon?: 'text' | 'sheet' | 'doc' | 'slide' | 'table' | 'canvas' | 'block';
        menuLabel?: string;
    };
}

export interface EmbedDescriptor {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    hostAnchorId: string;
    source: EmbedSource;
    childUnitId?: string;
    childType?: UniverInstanceType;
    mode?: 'readonly' | 'interactive';
    sourceMeta?: EmbedSourceMeta;
    lifecycle?: 'active' | 'soft-deleted';
    createdAt?: number;
    updatedAt?: number;
}

export interface EmbedResource {
    version: 1;
    embeds: Record<string, EmbedDescriptor>;
}

export interface EmbeddedFocusOwner {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    reason: 'pointer' | 'keyboard' | 'fullscreen';
}

export interface EmbedResolvedSource {
    childUnitId: string;
    childType: UniverInstanceType;
    source: EmbedSource;
}

export interface EmbedCreateContext {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    hostAnchorId: string;
    entry: EmbedHostEntry;
    source: EmbedSource;
    mode?: EmbedDescriptor['mode'];
    sourceMeta?: EmbedSourceMeta;
    hostContext?: Record<string, unknown>;
    parentEmbedId?: string;
}

export interface EmbedCreateResult {
    descriptor: EmbedDescriptor;
    resolvedSource: EmbedResolvedSource;
}

export interface EmbedGuestContribution {
    childType: UniverInstanceType;
    createEmptyUnit?: (config?: Record<string, unknown>, options?: ICreateUnitOptions) => {
        unitId: string;
        unitType?: UniverInstanceType;
    };
}
