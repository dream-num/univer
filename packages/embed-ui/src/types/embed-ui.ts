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

import type { ICommandService, IDisposable, Injector, IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import type { EmbedHostEntry, EmbedLayout, EmbedMenuBehavior, IEmbedDescriptor, IEmbedLayoutPolicies } from '@univerjs/embed';
import type { IMenuManagerService, IRibbonService } from '@univerjs/ui';
import type { Observable } from 'rxjs';

export type {
    IEmbedHostAdapterContribution,
    IEmbedHostAnchorContext,
    IEmbedHostAnchorMutationPlan,
    IEmbedHostAnchorRemoveMutationPlan,
} from '@univerjs/embed';

export interface IEmbedContainerContext {
    descriptor: IEmbedDescriptor;
    layout: EmbedLayout;
    injector: Injector;
    hostElement?: HTMLElement;
    container?: HTMLElement;
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
}

export interface IEmbedChildContainerContext extends IEmbedContainerContext {
    hostElement: HTMLElement;
    container: HTMLElement;
    renderScope: IEmbedRenderScope;
    runtimeScope: IEmbedChildRuntimeScope;
}

export interface IEmbedMenuOutlet {
    container: HTMLElement;
}

export interface IEmbedRenderScope {
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
    menuOutlet?: IEmbedMenuOutlet;
    active$: Observable<boolean>;
    fullscreen?: boolean;
}

export interface IEmbedChildRuntimeScope {
    descriptor: IEmbedDescriptor;
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

export interface IEmbedHostMountResult {
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

export interface IEmbedHostContainerContribution {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
    supportedLayouts?: EmbedLayout[];
    menuBehavior: EmbedMenuBehavior;
    mount?: (context: IEmbedContainerContext) => IEmbedHostMountResult | IDisposable | void;
}

export interface IEmbedChildViewContribution {
    childType: UniverInstanceType;
    supportedLayouts: EmbedLayout[];
    beforeDeactivate?: (context: IEmbedChildContainerContext) => void;
    mount?: (context: IEmbedChildContainerContext) => IDisposable | void;
}

export interface IEmbedProductMenuContribution {
    childType: UniverInstanceType;
    surface?: EmbedProductMenuSurface;
    menuSchema: unknown;
    id?: string;
    order?: number;
    mountMenu?: (context: IEmbedProductMenuMountContext) => IDisposable | void;
}

export type EmbedProductMenuSurface =
    | 'ribbon'
    | 'product-toolbar'
    | 'context-menu'
    | 'float-toolbar'
    | 'footer'
    | 'side-panel'
    | 'floating-menu';

export interface IEmbedProductMenuMountContext {
    container: HTMLElement;
    portalContainer?: HTMLElement | null;
    childType: UniverInstanceType;
    surface?: EmbedProductMenuSurface;
    childUnitId?: string;
    embedId?: string;
    injector: unknown;
    menuSchema: unknown;
    menuTitlePrefix?: string;
    activeRibbonTab?: string;
    headerMenu?: boolean;
    toolbarOnly?: boolean;
}

export interface IEmbedProductRibbonOverride {
    mode?: EmbedHostChromeMode;
    ribbonService: IRibbonService;
    placeholderTitle?: string;
    hideToolbar?: boolean;
    disposable?: IDisposable;
}

export interface IEmbedProductRibbonOverrideContext {
    childType: UniverInstanceType;
    childUnitId?: string;
    injector: unknown;
    embedId: string;
    hostUnitId: string;
    entry: EmbedHostEntry;
}

export interface IEmbedBlockContribution {
    childType: UniverInstanceType;
    productName: string;
    hostChromeMode?: EmbedHostChromeMode;
    hostHeaderMode?: 'none' | 'placeholder';
    layoutPolicy?: IEmbedLayoutPolicies;
    createRibbonOverride?: (context: IEmbedProductRibbonOverrideContext) => IEmbedProductRibbonOverride | undefined;
}

export enum EmbedHostChromeMode {
    RIBBON = 'ribbon',
    TITLE_ONLY = 'title-only',
    NONE = 'none',
}

export type EmbedFloatingStage = 'inactive' | 'stage1' | 'stage2';
export type EmbedInteractionFlow = 'floating-stage' | 'doc-block';

export interface IEmbedFloatingActivation {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    stage?: EmbedFloatingStage;
}

export interface IEmbedFloatingMenuMountContext extends IEmbedChildContainerContext {
    active: IEmbedFloatingActivation | null;
}

export interface IEmbedFloatingMenuContribution {
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    childType?: UniverInstanceType;
    mount: (context: IEmbedFloatingMenuMountContext) => IDisposable | void;
}

export interface IEmbedPassiveViewportWheelContext extends IEmbedChildContainerContext {
    event: WheelEvent;
    stage: EmbedFloatingStage;
    source?: 'wheel' | 'host-scroll-sync';
    viewportScrollX?: number;
    viewportScrollY?: number;
}

export interface IEmbedPassiveViewportProvider {
    childType: UniverInstanceType;
    supportedLayouts?: EmbedLayout[];
    handleWheel: (context: IEmbedPassiveViewportWheelContext) => boolean | void;
}

export interface IEmbedPassiveWheelHandlerContribution {
    childType: UniverInstanceType;
    order?: number;
    supportedLayouts?: EmbedLayout[];
    handleWheel: (context: IEmbedPassiveViewportWheelContext) => boolean | void;
}

export interface IEmbedContentSize {
    height?: number;
    width?: number;
}

export interface IEmbedContentSizeMeasureContext {
    childType: UniverInstanceType;
    childUnit?: unknown;
    childUnitId: string;
    viewportWidth?: number;
}

export interface IEmbedContentSizeProvider {
    childType: UniverInstanceType;
    measureContentSize: (context: IEmbedContentSizeMeasureContext) => IEmbedContentSize | undefined;
}

export interface IEmbedFullscreenSession {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
}

export interface IEmbedHostMenuOverride {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    reason: 'tab-active';
    hideHostFxBar?: boolean;
    lockHostRibbon?: boolean;
}

export interface IEmbedMountSession {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    entry: EmbedHostEntry;
    layout: EmbedLayout;
    hostElement?: HTMLElement;
    context?: IEmbedChildContainerContext;
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

export interface IEmbedFloatPreviewEntry<TViewState = unknown> {
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

export interface IEmbedFloatPreviewRenderRequest<TViewState = unknown> {
    descriptor: IEmbedDescriptor;
    childUnitId: string;
    childType: UniverInstanceType;
    width: number;
    height: number;
    dpr: number;
    viewState?: TViewState;
    reason: EmbedFloatPreviewReason;
    context?: IEmbedChildContainerContext;
}

export interface IEmbedFloatPreviewInvalidationContext {
    descriptor: IEmbedDescriptor;
    childUnitId: string;
    childType: UniverInstanceType;
    reason: EmbedFloatPreviewInvalidationReason;
}

export interface IEmbedFloatPreviewProvider<TViewState = unknown> {
    childType: UniverInstanceType;
    collectViewState: (context: IEmbedChildContainerContext) => TViewState | Promise<TViewState>;
    restoreViewState: (context: IEmbedChildContainerContext, state: TViewState) => void | Promise<void>;
    renderPreview: (
        request: IEmbedFloatPreviewRenderRequest<TViewState>
    ) => EmbedFloatPreviewRenderResult | null | undefined | Promise<EmbedFloatPreviewRenderResult | null | undefined>;
    invalidateKeys?: (context: IEmbedFloatPreviewInvalidationContext) => string[];
}

export interface IEmbedReadonlyPreviewRoots {
    root: HTMLElement;
    content: HTMLElement;
    canvas?: HTMLElement;
}

export interface IEmbedReadonlyPreviewContext<TViewState = unknown> extends IEmbedContainerContext {
    roots: IEmbedReadonlyPreviewRoots;
    viewState?: TViewState;
    updateViewState: (viewState: TViewState) => void;
}

export interface IEmbedReadonlyPreviewWheelContext<TViewState = unknown> extends IEmbedReadonlyPreviewContext<TViewState> {
    event: WheelEvent;
}

export interface IEmbedReadonlyPreviewProvider<TViewState = unknown> {
    childType: UniverInstanceType;
    supportedLayouts?: EmbedLayout[];
    mount?: (context: IEmbedReadonlyPreviewContext<TViewState>) => IDisposable | void;
    handleWheel?: (context: IEmbedReadonlyPreviewWheelContext<TViewState>) => boolean | void | Promise<boolean | void>;
}
