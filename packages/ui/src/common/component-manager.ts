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
import type React from 'react';
import type { defineComponent } from 'vue';
import { toDisposable } from '@univerjs/core';

import {
    AddDigitsSingle,
    AdjustHeight,
    AdjustWidth,
    AlignBottomSingle,
    AlignTextBothSingle,
    AlignTopSingle,
    AllBorderSingle,
    AmplifySingle,
    AutoHeight,
    AutoWidth,
    AutowrapSingle,
    AvgSingle,
    BackSlashSingle,
    BoldSingle,
    BrushSingle,
    CancelFreezeSingle,
    CancelMergeSingle,
    ClearFormat,
    CntSingle,
    CodeSingle,
    Conditions,
    ContentSingle16,
    Copy,
    DeleteCellMoveDown,
    DeleteCellShiftLeft,
    DeleteCellShiftRight,
    DeleteCellShiftUp,
    DeleteColumn,
    DeleteRow,
    DirectExportSingle,
    DollarSingle,
    DownBorder,
    EuroSingle,
    ExportSingle,
    EyeOutlineSingle,
    FolderSingle,
    FontColor,
    FontSizeIncreaseSingle,
    FontSizeReduceSingleSingle,
    FreezeColumnSingle,
    FreezeRowSingle,
    FreezeToSelectedSingle,
    FunctionSingle,
    GridSingle,
    HeaderFooterSingle,
    Hide,
    HorizontalBorder,
    HorizontallySingle,
    HorizontalMergeSingle,
    InnerBorder,
    Insert,
    InsertCellDown,
    InsertCellShiftRight,
    InsertRowAbove,
    InsertRowBelow,
    ItalicSingle,
    KeyboardSingle,
    LeftBorder,
    LeftDoubleDiagonalSingle,
    LeftInsertColumn,
    LeftJustifyingSingle,
    LeftRotationFortyFiveDegreesSingle,
    LeftRotationNinetyDegreesSingle,
    LeftTridiagonalSingle,
    MaxSingle,
    MenuSingle24,
    MergeAllSingle,
    MinSingle,
    MoreDownSingle,
    NoBorderSingle,
    NoColor,
    NoRotationSingle,
    OrderSingle,
    OuterBorder,
    OverflowSingle,
    PaintBucket,
    PasteSpecial,
    PercentSingle,
    PipingSingle,
    RedoSingle,
    Reduce,
    ReduceDigitsSingle,
    ReduceSingle,
    RightBorder,
    RightDoubleDiagonalSingle,
    RightInsertColumn,
    RightJustifyingSingle,
    RightRotationFortyFiveDegreesSingle,
    RightRotationNinetyDegreesSingle,
    RmbSingle,
    RoubleSingle,
    SlashSingle,
    StrikethroughSingle,
    SubscriptSingle,
    SumSingle,
    SuperscriptSingle,
    TruncationSingle,
    UnderlineSingle,
    UndoSingle,
    UnorderSingle,
    UpBorder,
    VerticalBorder,
    VerticalCenterSingle,
    VerticalIntegrationSingle,
    VerticalTextSingle,
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
    component: React.ForwardRefExoticComponent<T>;
};

export type ComponentType<T extends Record<string, any> = Record<string, any>> = React.ForwardRefExoticComponent<T> | ReturnType<typeof defineComponent>;

export type ComponentList = Map<string, IVue3Component | IReactComponent>;

export class ComponentManager {
    private _components: ComponentList = new Map();
    private _componentsReverse = new Map<ComponentType, string>();

    // eslint-disable-next-line max-lines-per-function
    constructor() {
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            AlignBottomSingle,
            AlignTopSingle,
            AllBorderSingle,
            AmplifySingle,
            AutowrapSingle,
            BoldSingle,
            BrushSingle,
            Copy,
            ClearFormat,
            DownBorder,
            FontColor,
            FunctionSingle,
            HorizontallySingle,
            InnerBorder,
            ItalicSingle,
            KeyboardSingle,
            ContentSingle16,
            LeftBorder,
            LeftJustifyingSingle,
            LeftRotationFortyFiveDegreesSingle,
            LeftRotationNinetyDegreesSingle,
            MergeAllSingle,
            HorizontalMergeSingle,
            VerticalIntegrationSingle,
            PipingSingle,
            CancelMergeSingle,
            NoBorderSingle,
            NoColor,
            NoRotationSingle,
            OuterBorder,
            OverflowSingle,
            PaintBucket,
            PasteSpecial,
            MenuSingle24,
            RedoSingle,
            RightBorder,
            RightJustifyingSingle,
            AlignTextBothSingle,
            ReduceSingle,
            RightRotationFortyFiveDegreesSingle,
            RightRotationNinetyDegreesSingle,
            StrikethroughSingle,
            OrderSingle,
            UnorderSingle,
            SuperscriptSingle,
            SubscriptSingle,
            TruncationSingle,
            UnderlineSingle,
            UndoSingle,
            UpBorder,
            VerticalBorder,
            VerticalCenterSingle,
            VerticalTextSingle,
            Insert,
            InsertCellDown,
            InsertCellShiftRight,
            InsertRowAbove,
            InsertRowBelow,
            LeftInsertColumn,
            RightInsertColumn,
            DeleteColumn,
            DeleteRow,
            DeleteCellShiftUp,
            DeleteCellShiftRight,
            DeleteCellShiftLeft,
            DeleteCellMoveDown,
            Reduce,
            Hide,
            HorizontalBorder,
            AutoHeight,
            AutoWidth,
            AdjustHeight,
            AdjustWidth,
            AvgSingle,
            CntSingle,
            MaxSingle,
            MinSingle,
            SumSingle,
            CancelFreezeSingle,
            FreezeColumnSingle,
            FreezeRowSingle,
            GridSingle,
            HeaderFooterSingle,
            FreezeToSelectedSingle,
            CodeSingle,
            FontSizeIncreaseSingle,
            FontSizeReduceSingleSingle,
            BackSlashSingle,
            LeftDoubleDiagonalSingle,
            LeftTridiagonalSingle,
            SlashSingle,
            RightDoubleDiagonalSingle,
            DirectExportSingle,
            FolderSingle,
            ExportSingle,
            Conditions,
            RmbSingle,
            MoreDownSingle,
            AddDigitsSingle,
            ReduceDigitsSingle,
            PercentSingle,
            EuroSingle,
            RoubleSingle,
            DollarSingle,
            EyeOutlineSingle,
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
            return (props: any) => cloneElement(
                createElement(VueComponentWrapper, {
                    component: value.component,
                    props: {
                        ...props,
                    },
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
