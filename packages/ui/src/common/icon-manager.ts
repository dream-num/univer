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
import type { ComponentType, CSSProperties, ForwardRefExoticComponent, MouseEventHandler, RefAttributes } from 'react';
import { Disposable, ILogService, toDisposable } from '@univerjs/core';
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
    BackSlashDoubleIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    ClearFormatDoubleIcon,
    CntIcon,
    CodeIcon,
    ConditionsDoubleIcon,
    CopyDoubleIcon,
    CutIcon,
    DeleteCellMoveDownDoubleIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftRightDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteRowDoubleIcon,
    DirectExportIcon,
    DollarIcon,
    DownBorderDoubleIcon,
    DownloadImageIcon,
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
    IncreaseIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    KeyboardIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalDoubleIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalDoubleIcon,
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
    RightDoubleDiagonalDoubleIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    RmbIcon,
    RoubleIcon,
    ShortcutIcon,
    SlashDoubleIcon,
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

/**
 * Extra color channels consumed by Univer icon components.
 */
export interface IIconExtendProps {
    colorChannel1: string;
}

/**
 * Common props that IconManager-managed icons receive when rendered by UI components.
 */
export interface IIconProps {
    className?: string;
    style?: CSSProperties;
    extend?: IIconExtendProps;
    onClick?: MouseEventHandler<SVGSVGElement>;
}

/**
 * React component type accepted by IconManager.
 */
export type IconType = ComponentType<IIconProps> | ForwardRefExoticComponent<IIconProps & RefAttributes<SVGElement>>;

/**
 * Icon name to icon component map used for batch registration.
 */
export type IconMap = Record<string, IconType>;

/**
 * Runtime icon registry storage.
 */
export type IconList = Map<string, IconType>;

const iconList: Record<string, IconType> = {
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
    BackSlashDoubleIcon,
    BoldIcon,
    BrushIcon,
    CancelFreezeIcon,
    CancelMergeIcon,
    ClearFormatDoubleIcon,
    CntIcon,
    CodeIcon,
    ConditionsDoubleIcon,
    CopyDoubleIcon,
    CutIcon,
    DeleteCellMoveDownDoubleIcon,
    DeleteCellShiftLeftDoubleIcon,
    DeleteCellShiftRightDoubleIcon,
    DeleteCellShiftUpDoubleIcon,
    DeleteColumnDoubleIcon,
    DeleteRowDoubleIcon,
    DirectExportIcon,
    DollarIcon,
    DownBorderDoubleIcon,
    DownloadImageIcon,
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
    IncreaseIcon,
    InnerBorderDoubleIcon,
    InsertCellDownDoubleIcon,
    InsertCellShiftRightDoubleIcon,
    InsertDoubleIcon,
    InsertRowAboveDoubleIcon,
    InsertRowBelowDoubleIcon,
    ItalicIcon,
    KeyboardIcon,
    LeftBorderDoubleIcon,
    LeftDoubleDiagonalDoubleIcon,
    LeftInsertColumnDoubleIcon,
    LeftJustifyingIcon,
    LeftRotationFortyFiveDegreesIcon,
    LeftRotationNinetyDegreesIcon,
    LeftTridiagonalDoubleIcon,
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
    RightDoubleDiagonalDoubleIcon,
    RightInsertColumnDoubleIcon,
    RightJustifyingIcon,
    RightRotationFortyFiveDegreesIcon,
    RightRotationNinetyDegreesIcon,
    RmbIcon,
    RoubleIcon,
    ShortcutIcon,
    SlashDoubleIcon,
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

const EmptyIcon: IconType = () => null;

/**
 * Registers and resolves toolbar/menu icons by name.
 *
 * `get()` is render-safe and returns an empty icon when the name is missing. Use `has()`
 * when the caller needs to know whether an icon was actually registered.
 */
export class IconManager extends Disposable {
    private _icons: IconList = new Map();

    constructor(@ILogService private readonly _logService: ILogService) {
        super();

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }

        this.disposeWithMe(toDisposable(() => {
            for (const k in iconList) {
                this._icons.delete(k);
            }
        }));
    }

    /**
     * Check whether an icon name is currently registered.
     *
     * Prefer this for existence checks because `get()` always returns a renderable icon.
     */
    has(name: string): boolean {
        return this._icons.has(name);
    }

    private _register(name: string, icon: IconType): IDisposable {
        if (this._icons.has(name)) {
            this._logService.warn('[IconManager]', `Icon ${name} already exists.`);
        }

        this._icons.set(name, icon);

        return toDisposable(() => {
            this._icons.delete(name);
        });
    }

    /**
     * Register one icon by name.
     *
     * The returned disposable removes this registration when disposed.
     */
    register(name: string, icon: IconType): IDisposable;

    /**
     * Register a batch of icons.
     *
     * The returned disposable removes every icon registered by this call when disposed.
     */
    register(icons: IconMap): IDisposable;
    register(nameOrIcons: string | IconMap, icon?: IconType): IDisposable {
        if (typeof nameOrIcons === 'string') {
            return this._register(nameOrIcons, icon!);
        }

        const disposables: IDisposable[] = [];

        for (const name in nameOrIcons) {
            disposables.push(this._register(name, nameOrIcons[name]));
        }

        return toDisposable(() => {
            disposables.forEach((disposable) => disposable.dispose());
        });
    }

    /**
     * Resolve an icon by name.
     *
     * Missing names are reported through the log service and return an empty component so
     * render paths can safely use the result as `<Icon />`.
     */
    get(name: string): IconType {
        const icon = this._icons.get(name);

        if (icon) {
            return icon;
        } else {
            this._logService.warn('[IconManager]', `Icon ${name} does not exist.`);
            return EmptyIcon;
        }
    }

    /**
     * Remove an icon registration if it exists.
     */
    delete(name: string) {
        this._icons.delete(name);
    }
}
