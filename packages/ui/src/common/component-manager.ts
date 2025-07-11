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

import type { IDisposable } from '@univerjs/core';
import type { ForwardRefExoticComponent } from 'react';
import { Disposable, toDisposable } from '@univerjs/core';
import {
    AddDigitsIcon,
    AddImageIcon,
    AdditionAndSubtractionIcon,
    AdjustHeightDoubleIcon,
    AdjustWidthDoubleIcon,
    AlignBottomIcon,
    AlignTextBothIcon,
    AlignTopIcon,
    AllBorderIcon,
    AmplifyIcon,
    AutoHeightDoubleIcon,
    AutoWidthDoubleIcon,
    AutowrapIcon,
    AvgIcon,
    BackSlashIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    ClearFormatDoubleIcon,
    CntIcon,
    CodeIcon,
    ConditionsDoubleIcon,
    CopyDoubleIcon,
    DeleteCellMoveDownDoubleIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftRightDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteRowDoubleIcon,
    DirectExportIcon,
    DollarIcon,
    DownBorderDoubleIcon,
    EuroIcon,
    ExportIcon,
    EyeOutlineIcon,
    FolderIcon,
    FontColorDoubleIcon,
    FontSizeIncreaseIcon,
    FontSizeReduceIcon,
    FreezeColumnIcon,
    FreezeRowIcon,
    FreezeToSelectedIcon,
    FunctionIcon,
    GridIcon,
    HeaderFooterIcon,
    HideDoubleIcon,
    HorizontalBorderDoubleIcon,
    HorizontallyIcon,
    HorizontalMergeIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    KeyboardIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalIcon,
    MaxIcon,
    MenuIcon,
    MergeAllIcon,
    MinIcon,
    MoreDownIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NoRotationIcon,
    OrderIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    PasteSpecialDoubleIcon,
    PercentIcon,
    PipingIcon,
    RedoIcon,
    ReduceDigitsIcon,
    ReduceDoubleIcon,
    ReduceIcon,
    RightBorderDoubleIcon,
    RightDoubleDiagonalIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    RmbIcon,
    RoubleIcon,
    ShortcutIcon,
    SlashIcon,
    StrikethroughIcon,
    SubscriptIcon,
    SumIcon,
    SuperscriptIcon,
    TruncationIcon,
    UnderlineIcon,
    UndoIcon,
    UnorderIcon,
    UpBorderDoubleIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
    VerticalTextIcon,
} from '@univerjs/icons';
import { createElement, useEffect, useRef } from 'react';

type ComponentFramework = string;

export interface IComponentOptions {
    framework?: ComponentFramework;
}

export interface IComponent<T = any> {
    framework: string;
    component: any;
};

export type ComponentType<T = any> = any;

export type ComponentList = Map<string, IComponent>;

const iconList: Record<string, ForwardRefExoticComponent<any>> = {
    AddDigitsIcon,
    AddImageIcon,
    AdditionAndSubtractionIcon,
    AdjustHeightDoubleIcon,
    AdjustWidthDoubleIcon,
    AlignBottomIcon,
    AlignTextBothIcon,
    AlignTopIcon,
    AllBorderIcon,
    AmplifyIcon,
    AutoHeightDoubleIcon,
    AutoWidthDoubleIcon,
    AutowrapIcon,
    AvgIcon,
    BackSlashIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    ClearFormatDoubleIcon,
    CntIcon,
    CodeIcon,
    ConditionsDoubleIcon,
    CopyDoubleIcon,
    DeleteCellMoveDownDoubleIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftRightDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteRowDoubleIcon,
    DirectExportIcon,
    DollarIcon,
    DownBorderDoubleIcon,
    EuroIcon,
    ExportIcon,
    EyeOutlineIcon,
    FolderIcon,
    FontColorDoubleIcon,
    FontSizeIncreaseIcon,
    FontSizeReduceIcon,
    FreezeColumnIcon,
    FreezeRowIcon,
    FreezeToSelectedIcon,
    FunctionIcon,
    GridIcon,
    HeaderFooterIcon,
    HideDoubleIcon,
    HorizontalBorderDoubleIcon,
    HorizontallyIcon,
    HorizontalMergeIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    KeyboardIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalIcon,
    MaxIcon,
    MenuIcon,
    MergeAllIcon,
    MinIcon,
    MoreDownIcon,
    NoBorderIcon,
    NoColorDoubleIcon,
    NoRotationIcon,
    OrderIcon,
    OuterBorderDoubleIcon,
    OverflowIcon,
    PaintBucketDoubleIcon,
    PasteSpecialDoubleIcon,
    PercentIcon,
    PipingIcon,
    RedoIcon,
    ReduceDigitsIcon,
    ReduceDoubleIcon,
    ReduceIcon,
    RightBorderDoubleIcon,
    RightDoubleDiagonalIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    RmbIcon,
    RoubleIcon,
    ShortcutIcon,
    SlashIcon,
    StrikethroughIcon,
    SubscriptIcon,
    SumIcon,
    SuperscriptIcon,
    TruncationIcon,
    UnderlineIcon,
    UndoIcon,
    UnorderIcon,
    UpBorderDoubleIcon,
    VerticalBorderDoubleIcon,
    VerticalCenterIcon,
    VerticalIntegrationIcon,
    VerticalTextIcon,
};

export class ComponentManager extends Disposable {
    private _components: ComponentList = new Map();
    private _componentsReverse = new Map<ComponentType, string>();

    constructor() {
        super();

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }

        this.disposeWithMe(toDisposable(() => {
            for (const k in iconList) {
                this._components.delete(k);
                this._componentsReverse.delete(iconList[k]);
            }
        }));
    }

    register(name: string, component: ComponentType, options?: IComponentOptions): IDisposable {
        const { framework = 'react' } = options || {};

        if (framework === 'vue3' && !this._handler.vue3) {
            throw new Error('[ComponentManager] Vue3 support is no longer built-in since v0.9.0, please install @univerjs/ui-adapter-vue3 plugin.');
        }

        if (this._components.has(name)) {
            console.warn(`Component ${name} already exists.`);
        }

        this._components.set(name, {
            framework,
            component,
        });
        this._componentsReverse.set(component, name);

        return toDisposable(() => {
            this._components.delete(name);
            this._componentsReverse.delete(component);
        });
    }

    getKey(component: ComponentType) {
        return this._componentsReverse.get(component);
    }

    reactUtils: {
        createElement: typeof createElement;
        useEffect: typeof useEffect;
        useRef: typeof useRef;
    } = {
        createElement,
        useEffect,
        useRef,
    };

    private _handler: Record<string, (component: IComponent['component'], name?: string) => any> = {
        react: (component: IComponent['component']) => {
            return component;
        },
    };

    setHandler(framework: string, handler: (component: IComponent['component'], name?: string) => any) {
        this._handler[framework] = handler;
    }

    get(name: string) {
        if (!name) return;

        const value = this._components.get(name);

        if (!value) return;

        const frameworkHandler = this._handler[value.framework];

        if (!frameworkHandler) {
            throw new Error(`[ComponentManager] No handler found for framework: ${value.framework}`);
        }

        return frameworkHandler(value.component, name);
    }

    delete(name: string) {
        this._components.delete(name);
    }
}
