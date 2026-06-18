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

import type { ICommandService, IDisposable, IMutationInfo, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { EmbedDescriptor, EmbedHostEntry, EmbedLayout, EmbedLayoutPolicies, EmbedMenuBehavior } from '@univerjs/embed';
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
    contentRoot?: HTMLElement;
    canvasRoot?: HTMLElement;
    overlayRoot?: HTMLElement;
    popupRoot?: HTMLElement;
    menuOutlet?: EmbedMenuOutlet;
    active$: Observable<boolean>;
    fullscreen?: boolean;
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
        content: HTMLElement;
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
    runtimeRoots?: {
        content?: HTMLElement;
        canvas?: HTMLElement;
        overlay?: HTMLElement;
        popup?: HTMLElement;
        menuSlot?: HTMLElement;
        footerSlot?: HTMLElement;
    };
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
    mode?: EmbedHostChromeMode;
    ribbonService: IRibbonService;
    placeholderTitle?: string;
    hideToolbar?: boolean;
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
    hostChromeMode?: EmbedHostChromeMode;
    hostHeaderMode?: 'none' | 'placeholder';
    layoutPolicy?: EmbedLayoutPolicies;
    createRibbonOverride?: (context: EmbedProductRibbonOverrideContext) => EmbedProductRibbonOverride | undefined;
}

export enum EmbedHostChromeMode {
    RIBBON = 'ribbon',
    TITLE_ONLY = 'title-only',
    NONE = 'none',
}

export type EmbedFloatingStage = 'inactive' | 'stage1' | 'stage2';

export interface EmbedFloatingActivation {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    stage?: EmbedFloatingStage;
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

export interface EmbedPassiveViewportWheelContext extends EmbedChildContainerContext {
    event: WheelEvent;
    stage: EmbedFloatingStage;
}

export interface EmbedPassiveViewportProvider {
    childType: UniverInstanceType;
    supportedLayouts?: EmbedLayout[];
    handleWheel: (context: EmbedPassiveViewportWheelContext) => boolean | void;
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
    context?: EmbedChildContainerContext;
}

export type EmbedFloatPreviewStatus = 'pending' | 'ready' | 'error' | 'stale';

export type EmbedFloatPreviewReason = 'initial' | 'stage-exit' | 'resize' | 'content-change' | 'manual';

export type EmbedFloatPreviewInvalidationReason =
    | 'model-change'
    | 'view-state-change'
    | 'resize'
    | 'theme-change'
    | 'locale-change'
    | 'dispose';

export type EmbedFloatPreviewRenderResult =
    | string
    | HTMLCanvasElement
    | ImageBitmap;

export interface EmbedFloatPreviewEntry<TViewState = unknown> {
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    status: EmbedFloatPreviewStatus;
    image?: EmbedFloatPreviewRenderResult;
    width: number;
    height: number;
    dpr: number;
    viewState?: TViewState;
    revision: number;
    updatedAt: number;
    error?: unknown;
}

export interface EmbedFloatPreviewRenderRequest<TViewState = unknown> {
    descriptor: EmbedDescriptor;
    childUnitId: string;
    childType: UniverInstanceType;
    width: number;
    height: number;
    dpr: number;
    viewState?: TViewState;
    reason: EmbedFloatPreviewReason;
    context?: EmbedChildContainerContext;
}

export interface EmbedFloatPreviewInvalidationContext {
    descriptor: EmbedDescriptor;
    childUnitId: string;
    childType: UniverInstanceType;
    reason: EmbedFloatPreviewInvalidationReason;
}

export interface EmbedFloatPreviewProvider<TViewState = unknown> {
    childType: UniverInstanceType;
    collectViewState: (context: EmbedChildContainerContext) => TViewState | Promise<TViewState>;
    restoreViewState: (context: EmbedChildContainerContext, state: TViewState) => void | Promise<void>;
    renderPreview: (
        request: EmbedFloatPreviewRenderRequest<TViewState>
    ) => EmbedFloatPreviewRenderResult | null | undefined | Promise<EmbedFloatPreviewRenderResult | null | undefined>;
    invalidateKeys?: (context: EmbedFloatPreviewInvalidationContext) => string[];
}

export interface EmbedReadonlyPreviewRoots {
    root: HTMLElement;
    content: HTMLElement;
    canvas?: HTMLElement;
}

export interface EmbedReadonlyPreviewContext<TViewState = unknown> extends EmbedContainerContext {
    roots: EmbedReadonlyPreviewRoots;
    viewState?: TViewState;
    updateViewState: (viewState: TViewState) => void;
}

export interface EmbedReadonlyPreviewWheelContext<TViewState = unknown> extends EmbedReadonlyPreviewContext<TViewState> {
    event: WheelEvent;
}

export interface EmbedReadonlyPreviewProvider<TViewState = unknown> {
    childType: UniverInstanceType;
    supportedLayouts?: EmbedLayout[];
    mount?: (context: EmbedReadonlyPreviewContext<TViewState>) => IDisposable | void;
    handleWheel?: (context: EmbedReadonlyPreviewWheelContext<TViewState>) => boolean | void | Promise<boolean | void>;
}
