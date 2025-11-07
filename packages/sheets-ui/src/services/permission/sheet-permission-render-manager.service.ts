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
import type { IUniverSheetsUIConfig } from '../../controllers/config.schema';
import { Disposable, IConfigService } from '@univerjs/core';
import { IRenderManagerService } from '@univerjs/engine-render';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../controllers/config.schema';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY } from '../../views/permission/extensions/range-protection.render';
import { worksheetProtectionKey } from '../../views/permission/extensions/worksheet-permission.render';

export type ProtectedRangeShadowStrategy = 'always' | 'non-editable' | 'non-viewable' | 'none';

export interface ISheetPermissionRenderManagerService {
    /**
     * Set the shadow strategy for protected ranges
     * @param unitId The unit id
     * @param strategy The shadow strategy
     */
    setProtectedRangeShadowStrategy(unitId: string, strategy: ProtectedRangeShadowStrategy): boolean;

    /**
     * Get the current shadow strategy for a unit
     * @param unitId The unit id
     */
    getProtectedRangeShadowStrategy(unitId: string): ProtectedRangeShadowStrategy;
}

/**
 * Service to manage the rendering of sheet permissions (range protection shadows)
 */
export class SheetPermissionRenderManagerService extends Disposable implements ISheetPermissionRenderManagerService {
    private _strategyMap: Map<string, ProtectedRangeShadowStrategy> = new Map();
    private _defaultStrategy: ProtectedRangeShadowStrategy;

    constructor(
        @IConfigService private readonly _configService: IConfigService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService
    ) {
        super();

        const config = this._configService.getConfig<IUniverSheetsUIConfig>(SHEETS_UI_PLUGIN_CONFIG_KEY);
        this._defaultStrategy = config?.protectedRangeShadowStrategy || 'always';
    }

    setProtectedRangeShadowStrategy(unitId: string, strategy: ProtectedRangeShadowStrategy): boolean {
        const render = this._renderManagerService.getRenderById(unitId);
        if (!render) {
            return false;
        }

        const spreadsheet = render.mainComponent as Spreadsheet;
        if (!spreadsheet) {
            return false;
        }

        // Update the strategy in the map
        this._strategyMap.set(unitId, strategy);

        // Update all protection render extensions
        const extensions = [
            { key: RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY },
            { key: RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY },
            { key: worksheetProtectionKey },
        ];

        let updated = false;
        for (const { key } of extensions) {
            const extension = spreadsheet.getExtensionByKey(key);
            if (extension && typeof (extension as any).setShadowStrategy === 'function') {
                (extension as any).setShadowStrategy(strategy);
                updated = true;
            }
        }

        if (updated) {
            // Mark canvas as dirty to trigger re-render
            spreadsheet.makeDirty(true);
        }

        return updated;
    }

    getProtectedRangeShadowStrategy(unitId: string): ProtectedRangeShadowStrategy {
        return this._strategyMap.get(unitId) || this._defaultStrategy;
    }

    override dispose(): void {
        super.dispose();
        this._strategyMap.clear();
    }
}
