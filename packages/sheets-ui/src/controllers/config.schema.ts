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

import type { DependencyOverride } from '@univerjs/core';
import type { IScrollBarProps } from '@univerjs/engine-render';
import type { ComponentType, MenuConfig } from '@univerjs/ui';
import type { IPermissionDetailUserPartProps } from '../views/permission/panel-detail/PermissionDetailUserPart';

export const SHEETS_UI_PLUGIN_CONFIG_KEY = 'sheets-ui.config';

export const configSymbol = Symbol(SHEETS_UI_PLUGIN_CONFIG_KEY);

export interface IUniverSheetsUIConfig {
    menu?: MenuConfig;
    disableAutoFocus?: true;
    override?: DependencyOverride;
    customComponents?: Set<string>;
    /**
     * The maximum count of rows triggering auto height. This is used to avoid performance issue.
     * @default 1000
     */
    maxAutoHeightCount?: number;

    /**
     * Whether to show the formula bar.
     */
    formulaBar?: boolean;

    /**
     * The config of the footer.
     * @default {}
     */
    footer?: false | {
        /**
         * Sheet bar is the manager of sub sheets, including add/switch/delete sub sheets.
         * @default true
         */
        sheetBar?: boolean;
        /**
         * statistic bar including statistic info current selections, such as count, sum, average, etc.
         * @default true
         */
        statisticBar?: boolean;
        /**
         * Including the menus in the footer. such as highlight, gridlines, etc.
         * @default true
         */
        menus?: boolean;
        /**
         * Zoom slider is the zoom slider in the footer.
         * @default true
         */
        zoomSlider?: boolean;
    };

    /**
     * @deprecated Use `footer.statisticBar` instead.
     */
    statusBarStatistic?: boolean;

    clipboardConfig?: {
        hidePasteOptions?: boolean;
    };

    scrollConfig?: IScrollBarProps;

    /**
     * Whether to show the protected range shadow.
     * @default true
     */
    protectedRangeShadow?: boolean;

    /**
     * The custom component of the protected range user selector.
     */
    protectedRangeUserSelector?: {
        /**
         * custom component, should implement the `IPermissionDetailUserPartProps` interface.
         */
        component: ComponentType<IPermissionDetailUserPartProps>;
        /**
         * The framework of the component. Must be passed correctly.
         */
        framework: 'react' | 'vue3';
    };

}

export const defaultPluginConfig: IUniverSheetsUIConfig = {
    formulaBar: true,
    statusBarStatistic: true,
    maxAutoHeightCount: 1000,
};
