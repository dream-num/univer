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

import type { ICreateUnitOptions, UniverInstanceType } from '@univerjs/core';
import type { ResourceRefInput } from './resource-ref';

export const EmbedHostEntryEnum = {
    DocsCustomBlock: 'docs-custom-block',
    SheetsFloatingObject: 'sheets-floating-object',
    SheetsSheetTab: 'sheets-sheet-tab',
    BasesTableListBlock: 'bases-table-list-block',
    SlidesFloatingObject: 'slides-floating-object',
    SlidesPageListBlock: 'slides-page-list-block',
    BoardsFloatingObject: 'boards-floating-object',
} as const;

export type EmbedHostEntry = typeof EmbedHostEntryEnum[keyof typeof EmbedHostEntryEnum] | (string & {});

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

export interface IEmbedLayoutPolicy {
    ribbon?: EmbedSurfacePlacement;
    productToolbar?: EmbedSurfacePlacement;
    contextMenu?: EmbedSurfacePlacement;
    floatToolbar?: EmbedSurfacePlacement;
    footer?: EmbedSurfacePlacement;
    sidePanel?: EmbedSurfacePlacement;
    floatingMenu?: EmbedSurfacePlacement;
}

export interface IEmbedLayoutPolicies {
    tab?: IEmbedLayoutPolicy;
    float?: IEmbedLayoutPolicy;
    docFlow?: IEmbedLayoutPolicy;
}

export const DEFAULT_EMBED_TAB_LAYOUT_POLICY: Required<IEmbedLayoutPolicy> = {
    ribbon: 'host',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'child',
    sidePanel: 'child',
    floatingMenu: 'hidden',
};

export const DEFAULT_EMBED_FLOAT_LAYOUT_POLICY: Required<IEmbedLayoutPolicy> = {
    ribbon: 'hidden',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'compact',
    sidePanel: 'compact',
    floatingMenu: 'child',
};

export const DEFAULT_EMBED_DOC_FLOW_LAYOUT_POLICY: Required<IEmbedLayoutPolicy> = {
    ribbon: 'hidden',
    productToolbar: 'child',
    contextMenu: 'child',
    floatToolbar: 'child',
    footer: 'compact',
    sidePanel: 'compact',
    floatingMenu: 'child',
};

export interface IEmbedCapability {
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
        ref: ResourceRefInput;
        unitType: UniverInstanceType;
    }
    | {
        kind: 'empty';
        unitType: UniverInstanceType;
        creationConfig?: Record<string, unknown>;
    };

export interface IEmbedFloatingConfig {
    enabled?: boolean;
    layout?: EmbedLayout;
    fullscreen?: boolean;
}

export interface IEmbedTabConfig {
    enabled?: boolean;
    container?: 'sheet-tab' | 'table-list' | 'slide-page-list';
    replaceHostMenu?: boolean;
    hideHostFxBar?: boolean;
    lockHostRibbon?: boolean;
    thumbnail?: boolean;
}

export interface IEmbedSourceMeta {
    renderHost?: EmbedRenderHost;
    verticalWheelMode?: 'self' | 'host';
    horizontalWheelMode?: 'self' | 'host' | 'expand-then-self';
    floating?: false | IEmbedFloatingConfig;
    tab?: false | IEmbedTabConfig;
}

export interface IEmbedDescriptor {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    entry: EmbedHostEntry;
    hostAnchorId: string;
    source: EmbedSource;
    childUnitId?: string;
    childType: UniverInstanceType;
    mode?: 'readonly' | 'interactive';
    sourceMeta?: IEmbedSourceMeta;
    lifecycle?: 'active' | 'soft-deleted';
    createdAt?: number;
    updatedAt?: number;
}

export interface IEmbedResource {
    version: 1;
    embeds: Record<string, IEmbedDescriptor>;
}

export interface IEmbeddedFocusOwner {
    hostUnitId: string;
    embedId: string;
    childUnitId: string;
    childType: UniverInstanceType;
    reason: 'pointer' | 'keyboard' | 'fullscreen';
}

export interface IEmbedResolvedSource {
    childUnitId?: string;
    childType: UniverInstanceType;
    source: EmbedSource;
}

export interface IEmbedCreateContext {
    embedId: string;
    hostUnitId: string;
    hostType: UniverInstanceType;
    hostAnchorId: string;
    entry: EmbedHostEntry;
    source: EmbedSource;
    mode?: IEmbedDescriptor['mode'];
    sourceMeta?: IEmbedSourceMeta;
    hostContext?: Record<string, unknown>;
    parentEmbedId?: string;
}

export interface IEmbedCreateResult {
    descriptor: IEmbedDescriptor;
    resolvedSource: IEmbedResolvedSource;
}

export interface IEmbedGuestContribution {
    childType: UniverInstanceType;
    createEmptyUnit?: (config?: Record<string, unknown>, options?: ICreateUnitOptions) => {
        unitId: string;
        unitType?: UniverInstanceType;
    };
}
