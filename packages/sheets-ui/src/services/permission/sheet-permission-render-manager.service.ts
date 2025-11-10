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

import type { Spreadsheet } from '@univerjs/engine-render';
import type { Observable } from 'rxjs';
import type { IUniverSheetsUIConfig } from '../../controllers/config.schema';
import { Disposable, IConfigService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { BehaviorSubject } from 'rxjs';
import { convertToShadowStrategy, SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY } from '../../views/permission/extensions/range-protection.render';
import { worksheetProtectionKey } from '../../views/permission/extensions/worksheet-permission.render';

export type ProtectedRangeShadowStrategy = 'always' | 'non-editable' | 'non-viewable' | 'none';

/**
 * Interface for extensions that support shadow strategy
 */
interface IExtensionWithShadowStrategy {
    setShadowStrategy: (strategy: ProtectedRangeShadowStrategy) => void;
}

/**
 * Type guard to check if an extension supports shadow strategy
 */
function hasSetShadowStrategy(extension: unknown): extension is IExtensionWithShadowStrategy {
    return typeof (extension as IExtensionWithShadowStrategy).setShadowStrategy === 'function';
}

export interface ISheetPermissionRenderManagerService {
    /**
     * Set the global shadow strategy for protected ranges
     * This will apply to all workbooks
     * @param strategy The shadow strategy
     */
    setProtectedRangeShadowStrategy(strategy: ProtectedRangeShadowStrategy): void;

    /**
     * Get the current global shadow strategy
     */
    getProtectedRangeShadowStrategy(): ProtectedRangeShadowStrategy;

    /**
     * Get an observable of the global shadow strategy
     */
    getProtectedRangeShadowStrategy$(): Observable<ProtectedRangeShadowStrategy>;
}

/**
 * Service to manage the rendering of sheet permissions (range protection shadows)
 * This is a global service that applies the strategy to all workbooks
 */
export class SheetPermissionRenderManagerService extends Disposable implements ISheetPermissionRenderManagerService {
    private _currentStrategy: ProtectedRangeShadowStrategy;
    private _strategySubject: BehaviorSubject<ProtectedRangeShadowStrategy>;

    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        const config = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        this._currentStrategy = convertToShadowStrategy(config?.protectedRangeShadow);
        this._strategySubject = new BehaviorSubject<ProtectedRangeShadowStrategy>(this._currentStrategy);

        this.disposeWithMe({
            dispose: () => {
                this._strategySubject.complete();
            },
        });
    }

    private _updateAllWorkbooks(strategy: ProtectedRangeShadowStrategy): void {
        // Get all renders (workbooks)
        const renders = this._renderManagerService.getRenderAll();

        renders.forEach((render) => {
            const spreadsheet = render.mainComponent as Spreadsheet;
            if (!spreadsheet) {
                return;
            }

            // Update all protection render extensions
            const extensions = [
                { key: RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY },
                { key: RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY },
                { key: worksheetProtectionKey },
            ];

            let updated = false;
            for (const { key } of extensions) {
                const extension = spreadsheet.getExtensionByKey(key);
                if (extension && hasSetShadowStrategy(extension)) {
                    extension.setShadowStrategy(strategy);
                    updated = true;
                }
            }

            if (updated) {
                // Mark canvas as dirty to trigger re-render
                spreadsheet.makeDirty(true);
            }
        });
    }

    setProtectedRangeShadowStrategy(strategy: ProtectedRangeShadowStrategy): void {
        // Update the current strategy
        this._currentStrategy = strategy;

        // Emit the new strategy to observers
        this._strategySubject.next(strategy);

        // Update all workbooks
        this._updateAllWorkbooks(strategy);
    }

    getProtectedRangeShadowStrategy(): ProtectedRangeShadowStrategy {
        return this._currentStrategy;
    }

    getProtectedRangeShadowStrategy$(): Observable<ProtectedRangeShadowStrategy> {
        return this._strategySubject.asObservable();
    }

    override dispose(): void {
        super.dispose();
        this._strategySubject.complete();
    }
}
