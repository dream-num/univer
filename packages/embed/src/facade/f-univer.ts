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
import { generateRandomId, IReferencedUnitManagerService, UniverInstanceType } from '@univerjs/core';
import { FUniver } from '@univerjs/core/facade';
import { CreateEmbedCommand, EmbedError, EmbedErrorCode, EmbedModelService, EmbedReferencedUnitApiResolverRegistryService, normalizeResourceRefLocator } from '@univerjs/embed';
import { FEmbed } from './f-embed';

export interface ICreateEmbedHostParams {
    unitId: string;
    surface: FEmbedHostSurface;
    anchorId?: string;
    context?: Record<string, unknown>;
}

export interface IUnitFacadeMap {}

export type FUnitFacade<TUnitType extends UniverInstanceType | undefined> =
    TUnitType extends keyof IUnitFacadeMap ? IUnitFacadeMap[TUnitType] : unknown;

export type FResolvedUnitFacade<TUnitFacade, TUnitType extends UniverInstanceType | undefined> =
    [TUnitFacade] extends [never] ? FUnitFacade<TUnitType> : TUnitFacade;

export type FEmbedSource<TChildType extends UniverInstanceType = UniverInstanceType> = EmbedSource & {
    unitType: TChildType;
};

export interface ICreateEmbedParams<TChildType extends UniverInstanceType = UniverInstanceType> {
    embedId?: string;
    host: ICreateEmbedHostParams;
    content: FEmbedSource<TChildType>;
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

export interface ILoadUnitAsyncOptions<TUnitType extends UniverInstanceType | undefined = UniverInstanceType | undefined> extends ICreateUnitOptions {
    unitType?: TUnitType;
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
     * @example TypeScript
     * ```ts
     * const hostUnitId = 'host-unit-id';
     * const hostSheetId = 'host-sheet-id';
     *
     * const embed = univerAPI.createEmbed<UniverFacadeTypes.FDocument>({
     *     embedId: 'doc-in-sheet',
     *     host: {
     *         unitId: hostUnitId,
     *         surface: univerAPI.Enum.FEmbedHostSurface.SheetFloating,
     *         context: {
     *             subUnitId: hostSheetId,
     *             left: 80,
     *             top: 80,
     *             width: 640,
     *             height: 360,
     *         },
     *     },
     *     content: {
     *         unitType: univerAPI.Enum.UniverInstanceType.UNIVER_DOC,
     *         ref: '#unit=another-unit-id&type=doc',
     *     },
     * });
     *
     * const childDocument = await embed.loadAsync();
     * ```
     */
    createEmbed<TUnitFacade = never, TChildType extends UniverInstanceType = UniverInstanceType>(
        params: ICreateEmbedParams<TChildType>
    ): FEmbed<FResolvedUnitFacade<TUnitFacade, TChildType>>;

    /**
     * Remove an embed by host unit id and embed id.
     *
     * @param params Remove parameters.
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to remove.
     * @returns `true` when the remove command succeeds.
     * @example TypeScript
     * ```ts
     * const hostUnitId = 'host-unit-id';
     *
     * const removed = univerAPI.removeEmbed({
     *     hostUnitId,
     *     embedId: 'doc-in-sheet',
     * });
     * ```
     */
    removeEmbed(params: IRemoveEmbedParams): boolean;

    /**
     * Get one embed by host unit id and embed id.
     *
     * @param params Get parameters.
     * @param params.hostUnitId The host unit id that owns the embed.
     * @param params.embedId The embed id to read.
     * @returns The embed facade, or `null` when it does not exist.
     * @example TypeScript
     * ```ts
     * const hostUnitId = 'host-unit-id';
     *
     * const embed = univerAPI.getEmbed({
     *     hostUnitId,
     *     embedId: 'doc-in-sheet',
     * });
     * ```
     */
    getEmbed(params: IGetEmbedParams): FEmbed<unknown> | null;

    /**
     * List active embeds.
     *
     * @param params List parameters.
     * @param params.hostUnitId Optional host unit id. When omitted, all active
     * embeds in the local runtime are returned.
     * @returns Active embed facades.
     * @example TypeScript
     * ```ts
     * const hostUnitId = 'host-unit-id';
     *
     * const embeds = univerAPI.listEmbeds({ hostUnitId });
     * ```
     */
    listEmbeds(params?: IListEmbedsParams): Array<FEmbed<unknown>>;

    /**
     * Load a ResourceRef-targeted unit into the current runtime.
     *
     * This is the generic facade entry for unit load. Embed-specific
     * callers can use {@link FEmbed.loadAsync}, which passes an embed owner.
     *
     * @param ref The resource reference to load. String input supports canonical
     * self unit ResourceRefs like `#unit=<unitId>&type=doc`.
     * @param options Optional request controls.
     * @returns A promise resolving to the loaded unit facade instance.
     * @example TypeScript
     * ```ts
     * const document = await univerAPI.loadUnitAsync<UniverFacadeTypes.FDocument>(
     *     '#unit=another-unit-id&type=doc',
     *     { unitType: univerAPI.Enum.UniverInstanceType.UNIVER_DOC }
     * );
     * ```
     * @example JavaScript
     * ```js
     * const document = await univerAPI.loadUnitAsync(
     *     '#unit=another-unit-id&type=doc',
     *     { unitType: univerAPI.Enum.UniverInstanceType.UNIVER_DOC }
     * );
     * ```
     */
    loadUnitAsync<
        TUnitFacade = never,
        TUnitType extends UniverInstanceType | undefined = undefined
    >(
        ref: FUnitRef,
        options?: ILoadUnitAsyncOptions<TUnitType>
    ): Promise<FResolvedUnitFacade<TUnitFacade, TUnitType>>;
}

/**
 * The embed facade mixin on `FUniver`.
 * @ignore
 */
export class FUniverEmbedMixin extends FUniver implements IFUniverEmbedMixin {
    override createEmbed<TUnitFacade = never, TChildType extends UniverInstanceType = UniverInstanceType>(
        params: ICreateEmbedParams<TChildType>
    ): FEmbed<FResolvedUnitFacade<TUnitFacade, TChildType>> {
        const hostType = this._univerInstanceService.getUnitType(params.host.unitId);
        if (hostType === UniverInstanceType.UNRECOGNIZED) {
            throw new EmbedError(EmbedErrorCode.HostUnitNotFound, {
                hostUnitId: params.host.unitId,
            });
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
            throw new EmbedError(EmbedErrorCode.CreateFailed, {
                hostUnitId: params.host.unitId,
                embedId: params.embedId,
            });
        }

        return this._toFEmbed<FResolvedUnitFacade<TUnitFacade, TChildType>>(descriptor);
    }

    override removeEmbed(params: IRemoveEmbedParams): boolean {
        const embed = this.getEmbed(params);
        return embed ? embed.remove() : false;
    }

    override getEmbed(params: IGetEmbedParams): FEmbed<unknown> | null {
        const descriptor = this._injector.get(EmbedModelService).getDescriptor(params.hostUnitId, params.embedId);
        return descriptor ? this._toFEmbed(descriptor) : null;
    }

    override listEmbeds(params: IListEmbedsParams = {}): Array<FEmbed<unknown>> {
        const model = this._injector.get(EmbedModelService);
        const descriptors = params.hostUnitId
            ? model.getActiveDescriptors(params.hostUnitId)
            : model.getAllActiveDescriptors();
        return descriptors.map((descriptor) => this._toFEmbed(descriptor));
    }

    override async loadUnitAsync<
        TUnitFacade = never,
        TUnitType extends UniverInstanceType | undefined = undefined
    >(
        ref: FUnitRef,
        options: ILoadUnitAsyncOptions<TUnitType> = {}
    ): Promise<FResolvedUnitFacade<TUnitFacade, TUnitType>> {
        const { signal, unitType, ...createOptions } = options;
        const normalizedRef = this._normalizeLoadUnitRef(ref);

        const record = await this._injector.get(IReferencedUnitManagerService).ensure(
            normalizedRef,
            {
                unitType,
                signal,
                createOptions,
            }
        );
        return this._injector.get(EmbedReferencedUnitApiResolverRegistryService).resolve<FResolvedUnitFacade<TUnitFacade, TUnitType>>({
            unitId: record.unitId,
            unitType: record.unitType,
            injector: this._injector,
            api: this,
        });
    }

    private _normalizeLoadUnitRef(ref: FUnitRef): ResourceRefInput {
        if (typeof ref === 'string') {
            return normalizeResourceRefLocator(ref);
        }

        return ref;
    }

    private _toFEmbed<TUnitFacade = unknown>(descriptor: IEmbedDescriptor): FEmbed<TUnitFacade> {
        return this._injector.createInstance(
            FEmbed as unknown as new (descriptor: IEmbedDescriptor, univerAPI: FUniver) => FEmbed<TUnitFacade>,
            descriptor,
            this
        );
    }
}

FUniver.extend(FUniverEmbedMixin);

declare module '@univerjs/core/facade' {
    // eslint-disable-next-line ts/naming-convention
    interface FUniver extends IFUniverEmbedMixin {}
}
