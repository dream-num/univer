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

import type { ICreateUnitOptions } from '@univerjs/core';
import type {
    EmbedHostEntry,
    EmbedSource,
    ICreateEmbedCommandParams,
    IEmbedDescriptor,
    IEmbedSourceMeta,
    IResourceRef,
    ResourceRefInput,
} from '@univerjs/embed';
import type { FEmbedHostSurface } from './f-enum';
import { generateRandomId, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { CreateEmbedCommand, EmbedModelService, EmbedReferencedUnitManagerService, normalizeResourceRefLocator } from '@univerjs/embed';
import { FEmbed } from './f-embed';

export interface ICreateEmbedHostParams {
    unitId: string;
    surface: FEmbedHostSurface;
    anchorId?: string;
    context?: Record<string, unknown>;
}

export interface ICreateEmbedParams {
    embedId?: string;
    host: ICreateEmbedHostParams;
    content: EmbedSource;
    interaction?: IEmbedDescriptor['mode'];
    sourceMeta?: IEmbedSourceMeta;
}

export interface IRemoveEmbedParams {
    hostUnitId: string;
    embedId: string;
}

export interface IGetEmbedParams {
    hostUnitId: string;
    embedId: string;
}

export interface IListEmbedsParams {
    hostUnitId?: string;
}

export type FUnitRef = IResourceRef | string;

export interface ILoadUnitAsyncOptions extends ICreateUnitOptions {
    unitType?: UniverInstanceType;
    signal?: AbortSignal;
}

/**
 * @ignore
 */
export interface IFUniverEmbedMixin {
    /**
     * Create an embed descriptor and host anchor without materializing
     * provider-backed ResourceRefs.
     *
     * @param params Embed creation parameters.
     * @returns The created embed facade.
     */
    createEmbed(params: ICreateEmbedParams): FEmbed;

    /**
     * Remove an embed by host unit id and embed id.
     *
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to remove.
     * @returns `true` when the remove command succeeds.
     */
    removeEmbed(params: IRemoveEmbedParams): boolean;

    /**
     * Get one embed by host unit id and embed id.
     *
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to read.
     * @returns The embed facade, or `null` when it does not exist.
     */
    getEmbed(params: IGetEmbedParams): FEmbed | null;

    /**
     * List active embeds.
     *
     * @param params.hostUnitId Optional host unit id. When omitted, all active
     * embeds in the local runtime are returned.
     * @returns Active embed facades.
     */
    listEmbeds(params?: IListEmbedsParams): FEmbed[];

    /**
     * Load a ResourceRef-targeted unit into the current runtime.
     *
     * This is the generic facade entry for unit materialization. Embed-specific
     * callers can use {@link FEmbed.loadAsync}, which passes an embed owner.
     *
     * @param ref The resource reference to load. String input supports
     * first-version URI reference locators: `#unit=<unitId>` and bare `unitId`
     * normalized to `#unit=<unitId>`; other ResourceRef locator forms are
     * rejected as unsupported until the full locator grammar is implemented.
     * String locators require `options.unitType` because the locator and the
     * render unit type are separate concepts.
     * @param options Optional request controls.
     * @returns A promise resolving to the loaded unit object in the core runtime.
     */
    loadUnitAsync<TUnit = unknown>(ref: FUnitRef, options?: ILoadUnitAsyncOptions): Promise<TUnit>;
}

/**
 * The embed facade mixin on `FUniver`.
 * @ignore
 */
export class FUniverEmbedMixin extends FUniver implements IFUniverEmbedMixin {
    override createEmbed(params: ICreateEmbedParams): FEmbed {
        const hostType = this._univerInstanceService.getUnitType(params.host.unitId);
        if (hostType === UniverInstanceType.UNRECOGNIZED) {
            throw new Error('EMBED_HOST_UNIT_NOT_FOUND');
        }

        const descriptor = this._commandService.syncExecuteCommand<ICreateEmbedCommandParams, IEmbedDescriptor | false>(
            CreateEmbedCommand.id,
            {
                embedId: params.embedId ?? `embed_${generateRandomId(10)}`,
                hostUnitId: params.host.unitId,
                hostType,
                requestedHostAnchorId: params.host.anchorId,
                entry: params.host.surface as EmbedHostEntry,
                source: params.content,
                mode: params.interaction,
                sourceMeta: params.sourceMeta,
                hostContext: params.host.context,
            }
        );
        if (!descriptor) {
            throw new Error('EMBED_CREATE_FAILED');
        }

        return this._toFEmbed(descriptor);
    }

    override removeEmbed(params: IRemoveEmbedParams): boolean {
        const embed = this.getEmbed(params);
        return embed ? embed.remove() : false;
    }

    override getEmbed(params: IGetEmbedParams): FEmbed | null {
        const descriptor = this._injector.get(EmbedModelService).getDescriptor(params.hostUnitId, params.embedId);
        return descriptor ? this._toFEmbed(descriptor) : null;
    }

    override listEmbeds(params: IListEmbedsParams = {}): FEmbed[] {
        const model = this._injector.get(EmbedModelService);
        const descriptors = params.hostUnitId
            ? model.getActiveDescriptors(params.hostUnitId)
            : model.getAllActiveDescriptors();
        return descriptors.map((descriptor) => this._toFEmbed(descriptor));
    }

    override async loadUnitAsync<TUnit = unknown>(ref: FUnitRef, options: ILoadUnitAsyncOptions = {}): Promise<TUnit> {
        const { signal, unitType, ...createOptions } = options;
        const normalizedRef = this._normalizeLoadUnitRef(ref);
        if (typeof normalizedRef === 'string' && (unitType === undefined || unitType === UniverInstanceType.UNRECOGNIZED)) {
            throw new Error('RESOURCE_REF_UNIT_TYPE_REQUIRED');
        }

        const handle = this._injector.get(EmbedReferencedUnitManagerService).ensure({
            ref: normalizedRef,
            unitType,
            signal,
            createOptions,
        });
        const record = await handle.loaded;
        return this._univerInstanceService.getUnit(record.unitId, record.unitType) as TUnit;
    }

    private _normalizeLoadUnitRef(ref: FUnitRef): ResourceRefInput {
        if (typeof ref === 'string') {
            return normalizeResourceRefLocator(ref);
        }

        return ref;
    }

    private _toFEmbed(descriptor: IEmbedDescriptor): FEmbed {
        return this._injector.createInstance(FEmbed, descriptor);
    }
}

FUniver.extend(FUniverEmbedMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverEmbedMixin {}
}
