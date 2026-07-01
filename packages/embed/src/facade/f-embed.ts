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
import type { FUniver } from '@univerjs/core/facade';
import type { EmbedHostEntry, IEmbedDescriptor } from '@univerjs/embed';
import { ICommandService, Inject, Injector } from '@univerjs/core';
import { FBase } from '@univerjs/core/facade';
import { EMBED_CHILD_CREATE_OPTIONS, EmbedReferencedUnitFacadeResolverRegistryService, EmbedReferencedUnitManagerService, ReferencedUnitOwnerKind, RemoveEmbedCommand } from '@univerjs/embed';

export interface ILoadEmbedOptions extends ICreateUnitOptions {
    signal?: AbortSignal;
}

/**
 * Facade object for one embed descriptor.
 *
 * `FEmbed` is intentionally small: it exposes stable identity fields for
 * agents and delegates write actions back to commands.
 *
 * @hideconstructor
 */
export class FEmbed<TUnitFacade = unknown> extends FBase {
    constructor(
        private readonly _descriptor: IEmbedDescriptor,
        private readonly _univerAPI: FUniver,
        @Inject(Injector) protected readonly _injector: Injector
    ) {
        super();
    }

    /**
     * Get the embed id. This id is stable inside the host unit.
     * @returns The embed id.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getId());
     * ```
     */
    getId(): string {
        return this._descriptor.embedId;
    }

    /**
     * Get the host unit id that owns this embed.
     * @returns The host unit id.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getHostUnitId());
     * ```
     */
    getHostUnitId(): string {
        return this._descriptor.hostUnitId;
    }

    /**
     * Get the host anchor id. The host product uses this id to place the embed
     * in a doc custom block, sheet tab, sheet floating object, and so on.
     * @returns The host anchor id.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getHostAnchorId());
     * ```
     */
    getHostAnchorId(): string {
        return this._descriptor.hostAnchorId;
    }

    /**
     * Get the embedded child unit id.
     * @returns The child unit id, or `undefined` when the descriptor points to a
     * remote resource that has not been resolved locally.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getChildUnitId());
     * ```
     */
    getChildUnitId(): string | undefined {
        return this._descriptor.childUnitId;
    }

    /**
     * Get the host unit type.
     * @returns The host {@link UniverInstanceType}.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getHostType());
     * ```
     */
    getHostType(): UniverInstanceType {
        return this._descriptor.hostType;
    }

    /**
     * Get the embedded child unit type.
     * @returns The child {@link UniverInstanceType}, or `undefined` only when
     * the descriptor does not declare a child type.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getChildType());
     * ```
     */
    getChildType(): UniverInstanceType | undefined {
        return this._descriptor.childType;
    }

    /**
     * Get the host entry used by this embed, such as `docs-custom-block` or
     * `sheets-sheet-tab`.
     * @returns The host entry.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getEntry());
     * ```
     */
    getEntry(): EmbedHostEntry {
        return this._descriptor.entry;
    }

    /**
     * Get the raw descriptor snapshot for advanced inspection.
     * @returns The embed descriptor.
     * @example
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.getDescriptor());
     * ```
     */
    getDescriptor(): IEmbedDescriptor {
        return { ...this._descriptor };
    }

    /**
     * Load this embed's referenced child unit into the current runtime.
     *
     * @param options Optional request controls.
     * @returns A promise resolving to the loaded child unit facade instance.
     * @example TypeScript
     * ```ts
     * const embed = univerAPI.createEmbed({
     *     host: {
     *         unitId: hostWorkbookId,
     *         surface: univerAPI.Enum.FEmbedHostSurface.SheetFloating,
     *     },
     *     content: { kind: 'ref', unitType: UniverInstanceType.UNIVER_SHEET, ref },
     * });
     * const childWorkbook = await embed.loadAsync();
     * console.log(childWorkbook.getId());
     * ```
     * @example TypeScript descriptor read type fallback
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * const childWorkbook = await embed.loadAsync<UniverFacadeTypes.FWorkbook>();
     * console.log(childWorkbook.getActiveSheet());
     * ```
     * @example JavaScript
     * ```js
     * const embed = univerAPI.listEmbeds()[0];
     * const childWorkbook = await embed.loadAsync();
     * console.log(childWorkbook.getId());
     * ```
     */
    async loadAsync<TLoadFacade = TUnitFacade>(options: ILoadEmbedOptions = {}): Promise<TLoadFacade> {
        if (this._descriptor.source.kind !== 'ref') {
            throw new Error('EMBED_SOURCE_NOT_REFERENCE');
        }

        const { signal, ...createOptions } = options;
        const handle = this._injector.get(EmbedReferencedUnitManagerService).ensure({
            ref: this._descriptor.source.ref,
            unitType: this._descriptor.childType,
            owner: {
                kind: ReferencedUnitOwnerKind.Embed,
                unitId: this._descriptor.hostUnitId,
                ownerId: this._descriptor.embedId,
            },
            signal,
            createOptions: {
                ...EMBED_CHILD_CREATE_OPTIONS,
                ...createOptions,
            },
        });
        const record = await handle.loaded;
        return this._injector.get(EmbedReferencedUnitFacadeResolverRegistryService).resolve<TLoadFacade>({
            unitId: record.unitId,
            unitType: record.unitType,
            injector: this._injector,
            univerAPI: this._univerAPI,
        });
    }

    /**
     * Remove this embed from its host unit.
     *
     * This method executes {@link RemoveEmbedCommand}; it does not edit the
     * embed model directly.
     *
     * @returns `true` when the command succeeds.
     * @example Browser console
     * ```ts
     * const embed = univerAPI.listEmbeds()[0];
     * console.log(embed.remove());
     * ```
     */
    remove(): boolean {
        return this._injector.get(ICommandService).syncExecuteCommand(RemoveEmbedCommand.id, {
            hostUnitId: this._descriptor.hostUnitId,
            embedId: this._descriptor.embedId,
        });
    }
}
