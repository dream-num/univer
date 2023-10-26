import { IKeyValue } from '@univerjs/core';
import { Copy24, PasteSpecial24 } from '@univerjs/icons';

import {
    BorderDashDot,
    BorderDashDotDot,
    BorderDashed,
    BorderDotted,
    BorderHair,
    BorderMedium,
    BorderMediumDashDot,
    BorderMediumDashDotDot,
    BorderMediumDashed,
    BorderThick,
    BorderThin,
} from '../Components/BorderLine';
import {
    BackIcon,
    BoldIcon,
    BottomBorderIcon,
    BottomVerticalIcon,
    BrIcon,
    CenterAlignIcon,
    CenterVerticalIcon,
    CutIcon,
    DeleteLineIcon,
    FillColorIcon,
    FormatPainterIcon,
    ForwardIcon,
    FullBorderIcon,
    FxIcon,
    InnerBorderIcon,
    ItalicIcon,
    LeftAlignIcon,
    LeftBorderIcon,
    MergeIcon,
    NoneBorderIcon,
    OuterBorderIcon,
    OverflowIcon,
    RightAlignIcon,
    RightBorderIcon,
    ShortcutIcon,
    StripingBorderIcon,
    TextColorIcon,
    TextRotateAngleDownIcon,
    TextRotateAngleUpIcon,
    TextRotateIcon,
    TextRotateRotationDownIcon,
    TextRotateRotationUpIcon,
    TextRotateVerticalIcon,
    TopBorderIcon,
    TopVerticalIcon,
    UnderLineIcon,
    VerticalBorderIcon,
} from '../Components/Icon';

export interface ICustomComponent {
    name: string;
    props?: IKeyValue;
}

export type ComponentList = Map<string, Function>;

export class ComponentManager {
    private _componentList: ComponentList = new Map();

    constructor() {
        const iconList: Record<string, Function> = {
            ForwardIcon,
            BackIcon,
            FormatPainterIcon,
            BoldIcon,
            ItalicIcon,
            DeleteLineIcon,
            UnderLineIcon,
            TextColorIcon,
            FillColorIcon,
            MergeIcon,
            TopBorderIcon,
            BottomBorderIcon,
            LeftBorderIcon,
            RightBorderIcon,
            NoneBorderIcon,
            FullBorderIcon,
            OuterBorderIcon,
            InnerBorderIcon,
            StripingBorderIcon,
            VerticalBorderIcon,
            LeftAlignIcon,
            CenterAlignIcon,
            RightAlignIcon,
            TopVerticalIcon,
            CenterVerticalIcon,
            BottomVerticalIcon,
            OverflowIcon,
            BrIcon,
            CutIcon,
            ShortcutIcon,
            TextRotateIcon,
            TextRotateAngleUpIcon,
            TextRotateAngleDownIcon,
            TextRotateVerticalIcon,
            TextRotateRotationUpIcon,
            TextRotateRotationDownIcon,
            BorderThin,
            BorderHair,
            BorderDotted,
            BorderDashed,
            BorderDashDot,
            BorderDashDotDot,
            BorderMedium,
            BorderMediumDashed,
            BorderMediumDashDot,
            BorderMediumDashDotDot,
            BorderThick,
            FxIcon,

            Copy24,
            PasteSpecial24,
        };

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }
    }

    register(name: string, component: any) {
        this._componentList.set(name, component);
    }

    get(name: string) {
        return this._componentList.get(name);
    }

    delete(name: string) {
        this._componentList.delete(name);
    }
}
