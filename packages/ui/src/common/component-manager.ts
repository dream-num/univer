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
import type { defineComponent } from 'vue';
import { toDisposable } from '@univerjs/core';
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
import { cloneElement, createElement, useEffect, useRef } from 'react';

type ComponentFramework = 'vue3' | 'react';

export interface IComponentOptions {
    framework?: ComponentFramework;
}

export interface IVue3Component<T extends Record<string, any> = Record<string, any>> {
    framework: 'vue3';
    component: ReturnType<typeof defineComponent<T>>;
}
export interface IReactComponent<T extends Record<string, any> = Record<string, any>> {
    framework: 'react';
    component: ForwardRefExoticComponent<T>;
};

export type ComponentType<T extends Record<string, any> = Record<string, any>> = ForwardRefExoticComponent<T> | ReturnType<typeof defineComponent>;

export type ComponentList = Map<string, IVue3Component | IReactComponent>;

export class ComponentManager {
    private _components: ComponentList = new Map();
    private _componentsReverse = new Map<ComponentType, string>();

    // eslint-disable-next-line max-lines-per-function
    constructor() {
        const iconList: Record<string, ForwardRefExoticComponent<any>> = {
            AddImageIcon,
            AlignBottomIcon,
            AlignTopIcon,
            AllBorderIcon,
            AmplifyIcon,
            AutowrapIcon,
            BoldIcon,
            BrushIcon,
            CopyDoubleIcon,
            ClearFormatDoubleIcon,
            DownBorderDoubleIcon,
            FontColorDoubleIcon,
            FunctionIcon,
            HorizontallyIcon,
            InnerBorderDoubleIcon,
            ItalicIcon,
            KeyboardIcon,
            MenuIcon,
            LeftBorderDoubleIcon,
            LeftJustifyingIcon,
            LeftRotationFortyFiveDegreesIcon,
            LeftRotationNinetyDegreesIcon,
            MergeAllIcon,
            HorizontalMergeIcon,
            VerticalIntegrationIcon,
            PipingIcon,
            CancelMergeIcon,
            NoBorderIcon,
            NoColorDoubleIcon,
            NoRotationIcon,
            OuterBorderDoubleIcon,
            OverflowIcon,
            PaintBucketDoubleIcon,
            PasteSpecialDoubleIcon,
            RedoIcon,
            RightBorderDoubleIcon,
            RightJustifyingIcon,
            AlignTextBothIcon,
            ReduceIcon,
            RightRotationFortyFiveDegreesIcon,
            RightRotationNinetyDegreesIcon,
            StrikethroughIcon,
            OrderIcon,
            UnorderIcon,
            SuperscriptIcon,
            SubscriptIcon,
            TruncationIcon,
            UnderlineIcon,
            UndoIcon,
            UpBorderDoubleIcon,
            VerticalBorderDoubleIcon,
            VerticalCenterIcon,
            VerticalTextIcon,
            InsertDoubleIcon,
            InsertCellDownDoubleIcon,
            InsertCellShiftRightDoubleIcon,
            InsertRowAboveDoubleIcon,
            InsertRowBelowDoubleIcon,
            LeftInsertColumnDoubleIcon,
            AdditionAndSubtractionIcon,
            RightInsertColumnDoubleIcon,
            DeleteColumnDoubleIcon,
            DeleteRowDoubleIcon,
            DeleteCellShiftUpDoubleIcon,
            DeleteCellShiftRightDoubleIcon,
            DeleteCellShiftLeftDoubleIcon,
            DeleteCellMoveDownDoubleIcon,
            ReduceDoubleIcon,
            HideDoubleIcon,
            HorizontalBorderDoubleIcon,
            AutoHeightDoubleIcon,
            AutoWidthDoubleIcon,
            AdjustHeightDoubleIcon,
            AdjustWidthDoubleIcon,
            AvgIcon,
            CntIcon,
            MaxIcon,
            MinIcon,
            SumIcon,
            CancelFreezeIcon,
            FreezeColumnIcon,
            FreezeRowIcon,
            GridIcon,
            HeaderFooterIcon,
            FreezeToSelectedIcon,
            CodeIcon,
            FontSizeIncreaseIcon,
            FontSizeReduceIcon,
            BackSlashIcon,
            LeftDoubleDiagonalIcon,
            LeftTridiagonalIcon,
            SlashIcon,
            RightDoubleDiagonalIcon,
            DirectExportIcon,
            FolderIcon,
            ExportIcon,
            ConditionsDoubleIcon,
            RmbIcon,
            MoreDownIcon,
            AddDigitsIcon,
            ReduceDigitsIcon,
            PercentIcon,
            EuroIcon,
            RoubleIcon,
            DollarIcon,
            EyeOutlineIcon,
        };

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }
    }

    register(name: string, component: ComponentType, options?: IComponentOptions): IDisposable {
        const { framework = 'react' } = options || {};

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

    get(name: string) {
        if (!name) return;

        const value = this._components.get(name);

        if (value?.framework === 'react') {
            return value.component;
        } else if (value?.framework === 'vue3') {
            // TODO: slot support
            // eslint-disable-next-line ts/no-explicit-any, react/no-clone-element
            return (props: Record<string, any>) => cloneElement(
                createElement(VueComponentWrapper, {
                    component: value.component,
                    props,
                })
            );
        } else {
            // throw new Error(`ComponentManager: Component ${name} not found.`);
        }
    }

    delete(name: string) {
        this._components.delete(name);
    }
}

async function renderVue3Component(VueComponent: ReturnType<typeof defineComponent>, element: HTMLElement, args: Record<string, any>) {
    try {
        const { h, render } = await import('vue');
        const vnode = h(VueComponent, args);
        const container = document.createElement('div');

        document.body.appendChild(container);
        render(vnode, element);

        return () => {
            document.body.removeChild(container);
        };
    } catch (error) {
        console.warn('Vue3 component render error', error);
    }
}

export function VueComponentWrapper(options: { component: ReturnType<typeof defineComponent>; props: Record<string, any> }) {
    const domRef = useRef(null);
    const { component, props } = options;

    useEffect(() => {
        if (!domRef.current) return;

        const render = renderVue3Component(component, domRef.current, props);

        return () => {
            render.then((d) => d?.());
        };
    }, [props]);

    return createElement('div', { ref: domRef });
}
