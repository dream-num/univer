import type { EmbedDescriptor, EmbedHostEntry, EmbedLayout, EmbedLayoutPolicies, EmbedMenuBehavior } from '@univerjs/embed';
import type { ICommandService, IDisposable, IMutationInfo, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { IMenuManagerService, IRibbonService } from '@univerjs/ui';
import type { Observable } from 'rxjs';

export interface EmbedContainerContext {
    descriptor: EmbedDescriptor;
    layout: EmbedLayout;
    injector: Injector;
    hostElement?: HTMLElement;
    container?: HTMLElement;
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
}

export interface EmbedChildContainerContext extends EmbedContainerContext {
    hostElement: HTMLElement;
    container: HTMLElement;
    renderScope: EmbedRenderScope;
    runtimeScope: EmbedChildRuntimeScope;
}

export interface EmbedMenuOutlet {
    container: HTMLElement;
}

export interface EmbedRenderScope {
    hostUnitId: string;
    hostAnchorId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    layout: EmbedLayout;
    mode: 'tab' | 'float' | 'inline';
    rootElement: HTMLElement;
    canvasRoot?: HTMLElement;
    overlayRoot?: HTMLElement;
    menuOutlet?: EmbedMenuOutlet;
    active$: Observable<boolean>;
}

export interface EmbedChildRuntimeScope {
    descriptor: EmbedDescriptor;
    host: {
        unitId: string;
        type: UniverInstanceType;
        anchorId: string;
        entry: EmbedHostEntry;
        layout: 'doc-flow' | 'float' | 'tab-peer';
    };
    child: {
        unitId: string;
        type: UniverInstanceType;
    };
    injector: Injector;
    instanceService?: IUniverInstanceService;
    commandService?: ICommandService;
    menuManagerService?: IMenuManagerService;
    roots: {
        root: HTMLElement;
        canvas?: HTMLElement;
        overlay: HTMLElement;
        popup: HTMLElement;
        menuSlot?: HTMLElement;
        footerSlot?: HTMLElement;
    };
    activate: () => void;
    deactivate: () => void;
    dispose: () => void;
}

export interface EmbedHostMountResult {
    hostElement?: HTMLElement;
    disposable?: IDisposable;
}

export interface EmbedHostAnchorContext {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    requestedAnchorId?: string;
    hostContext?: Record<string, unknown>;
    descriptor?: EmbedDescriptor;
}

export interface EmbedHostAnchorMutationPlan {
    hostAnchorId: string;
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

export interface EmbedHostAnchorRemoveMutationPlan {
    redoMutations: IMutationInfo[];
    undoMutations: IMutationInfo[];
}

export interface EmbedHostAdapterContribution {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    createAnchor?: (context: EmbedHostAnchorContext) => string;
    removeAnchor?: (context: EmbedHostAnchorContext & { hostAnchorId: string }) => void;
    createAnchorPlan?: (context: EmbedHostAnchorContext) => EmbedHostAnchorMutationPlan;
    removeAnchorPlan?: (context: EmbedHostAnchorContext & { hostAnchorId: string }) => EmbedHostAnchorRemoveMutationPlan;
    afterCreateAnchor?: (context: EmbedHostAnchorContext & { hostAnchorId: string; descriptor: EmbedDescriptor }) => void;
    afterRemoveAnchor?: (context: EmbedHostAnchorContext & { hostAnchorId: string; descriptor?: EmbedDescriptor }) => void;
    activateAnchor?: (context: EmbedHostAnchorContext & { hostAnchorId: string; descriptor: EmbedDescriptor }) => void;
}

export interface EmbedHostContainerContribution {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
    supportedLayouts?: EmbedLayout[];
    menuBehavior: EmbedMenuBehavior;
    mount?: (context: EmbedContainerContext) => EmbedHostMountResult | IDisposable | void;
}

export interface EmbedChildViewContribution {
    childType: UniverInstanceType;
    supportedLayouts: EmbedLayout[];
    mount?: (context: EmbedChildContainerContext) => IDisposable | void;
}

export interface EmbedProductMenuContribution {
    childType: UniverInstanceType;
    surface?: EmbedProductMenuSurface;
    menuSchema: unknown;
    id?: string;
    order?: number;
    mountMenu?: (context: EmbedProductMenuMountContext) => IDisposable | void;
}

export type EmbedProductMenuSurface =
    | 'ribbon'
    | 'product-toolbar'
    | 'context-menu'
    | 'float-toolbar'
    | 'footer'
    | 'side-panel'
    | 'floating-menu';

export interface EmbedProductMenuMountContext {
    container: HTMLElement;
    childType: UniverInstanceType;
    surface?: EmbedProductMenuSurface;
    childUnitId?: string;
    injector: unknown;
    menuSchema: unknown;
    menuTitlePrefix?: string;
    activeRibbonTab?: string;
    toolbarOnly?: boolean;
}

export interface EmbedProductRibbonOverride {
    ribbonService: IRibbonService;
    placeholderTitle?: string;
    disposable?: IDisposable;
}

export interface EmbedProductRibbonOverrideContext {
    childType: UniverInstanceType;
    childUnitId?: string;
    injector: unknown;
    embedId: string;
    hostUnitId: string;
    entry: EmbedHostEntry;
}

export interface EmbedBlockContribution {
    childType: UniverInstanceType;
    productName: string;
    hostHeaderMode?: 'none' | 'placeholder';
    layoutPolicy?: EmbedLayoutPolicies;
    createRibbonOverride?: (context: EmbedProductRibbonOverrideContext) => EmbedProductRibbonOverride | undefined;
}

export interface EmbedFloatingActivation {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
}

export interface EmbedFloatingMenuMountContext extends EmbedChildContainerContext {
    active: EmbedFloatingActivation | null;
}

export interface EmbedFloatingMenuContribution {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    childType?: UniverInstanceType;
    mount: (context: EmbedFloatingMenuMountContext) => IDisposable | void;
}

export interface EmbedFullscreenSession {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
}

export interface EmbedHostMenuOverride {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    reason: 'tab-active';
    hideHostFxBar?: boolean;
    lockHostRibbon?: boolean;
}

export interface EmbedMountSession {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
    hostElement?: HTMLElement;
}
