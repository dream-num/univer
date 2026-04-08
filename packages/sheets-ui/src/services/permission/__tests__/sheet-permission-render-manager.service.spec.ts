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

import { describe, expect, it, vi } from 'vitest';
import { SHEETS_UI_PLUGIN_CONFIG_KEY } from '../../../config/config';
import { RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY, RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY } from '../../../views/permission/extensions/range-protection.render';
import { worksheetProtectionKey } from '../../../views/permission/extensions/worksheet-permission.render';
import { SheetPermissionRenderManagerService } from '../sheet-permission-render-manager.service';

function createSpreadsheetWithExtensions(extensions: Record<string, unknown>) {
    return {
        getExtensionByKey: vi.fn((key: string) => extensions[key]),
        makeDirty: vi.fn(),
    };
}

describe('SheetPermissionRenderManagerService', () => {
    it('updates all render extensions and marks spreadsheet dirty when strategy changes', () => {
        const canViewExtension = { setShadowStrategy: vi.fn() };
        const cannotViewExtension = { setShadowStrategy: vi.fn() };
        const worksheetExtension = { setShadowStrategy: vi.fn() };
        const spreadsheet = createSpreadsheetWithExtensions({
            [RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY]: canViewExtension,
            [RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY]: cannotViewExtension,
            [worksheetProtectionKey]: worksheetExtension,
        });

        const configService = {
            getConfig: vi.fn((key: string) => {
                if (key === SHEETS_UI_PLUGIN_CONFIG_KEY) {
                    return {
                        protectedRangeShadow: 'non-viewable',
                    };
                }
                return null;
            }),
        };

        const renderManagerService = {
            getRenderAll: vi.fn(() => [{ mainComponent: spreadsheet }]),
        };

        const service = new SheetPermissionRenderManagerService(configService as any, renderManagerService as any);
        const strategyValues: string[] = [];
        service.getProtectedRangeShadowStrategy$().subscribe((v) => strategyValues.push(v));

        expect(service.getProtectedRangeShadowStrategy()).toBe('non-viewable');

        service.setProtectedRangeShadowStrategy('none');
        expect(canViewExtension.setShadowStrategy).toHaveBeenCalledWith('none');
        expect(cannotViewExtension.setShadowStrategy).toHaveBeenCalledWith('none');
        expect(worksheetExtension.setShadowStrategy).toHaveBeenCalledWith('none');
        expect(spreadsheet.makeDirty).toHaveBeenCalledWith(true);
        expect(service.getProtectedRangeShadowStrategy()).toBe('none');
        expect(strategyValues).toContain('none');

        service.dispose();
    });

    it('keeps working when extensions do not implement shadow strategy', () => {
        const spreadsheet = createSpreadsheetWithExtensions({
            [RANGE_PROTECTION_CAN_VIEW_RENDER_EXTENSION_KEY]: {},
            [RANGE_PROTECTION_CAN_NOT_VIEW_RENDER_EXTENSION_KEY]: null,
            [worksheetProtectionKey]: undefined,
        });

        const configService = {
            getConfig: vi.fn(() => ({
                protectedRangeShadow: false,
            })),
        };

        const renderManagerService = {
            getRenderAll: vi.fn(() => [{ mainComponent: spreadsheet }]),
        };

        const service = new SheetPermissionRenderManagerService(configService as any, renderManagerService as any);

        expect(service.getProtectedRangeShadowStrategy()).toBe('none');

        service.setProtectedRangeShadowStrategy('non-editable');
        expect(spreadsheet.makeDirty).not.toHaveBeenCalled();
        expect(service.getProtectedRangeShadowStrategy()).toBe('non-editable');

        service.dispose();
    });
});
