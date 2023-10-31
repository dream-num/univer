import {
    AlignBottomSingle,
    AlignTopSingle,
    AllBorderSingle,
    AutowrapSingle,
    BoldSingle,
    BrushSingle,
    Copy,
    DownBorderSingle,
    FontColor,
    HorizontallySingle,
    InnerBorderSingle,
    ItalicSingle,
    KeyboardSingle,
    LeftBorderSingle,
    LeftJustifyingSingle,
    LeftRotationFortyFiveDegreesSingle,
    LeftRotationNinetyDegreesSingle,
    MergeCellSingle,
    NoBorderSingle,
    NoRotationSingle,
    OuterBorderSingle,
    OverflowSingle,
    PaintBucket,
    PasteSpecial,
    RedoSingle,
    RightBorderSingle,
    RightJustifyingSingle,
    RightRotationFortyFiveDegreesSingle,
    RightRotationNinetyDegreesSingle,
    StrikethroughSingle,
    TruncationSingle,
    UnderlineSingle,
    UndoSingle,
    UpBorderSingle,
    VerticalCenterSingle,
    VerticalTextSingle,
} from '@univerjs/icons';

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

export interface ICustomComponent {
    name: string;
    props?: any;
}

export type ComponentList = Map<string, Function>;

export class ComponentManager {
    private _componentList: ComponentList = new Map();

    constructor() {
        const iconList: Record<string, Function> = {
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

            AlignBottomSingle,
            AlignTopSingle,
            AllBorderSingle,
            AutowrapSingle,
            BoldSingle,
            BrushSingle,
            Copy,
            DownBorderSingle,
            FontColor,
            HorizontallySingle,
            InnerBorderSingle,
            ItalicSingle,
            KeyboardSingle,
            LeftBorderSingle,
            LeftJustifyingSingle,
            LeftRotationFortyFiveDegreesSingle,
            LeftRotationNinetyDegreesSingle,
            MergeCellSingle,
            NoBorderSingle,
            NoRotationSingle,
            OuterBorderSingle,
            OverflowSingle,
            PaintBucket,
            PasteSpecial,
            RedoSingle,
            RightBorderSingle,
            RightJustifyingSingle,
            RightRotationFortyFiveDegreesSingle,
            RightRotationNinetyDegreesSingle,
            StrikethroughSingle,
            TruncationSingle,
            UnderlineSingle,
            UndoSingle,
            UpBorderSingle,
            VerticalCenterSingle,
            VerticalTextSingle,
        };

        for (const k in iconList) {
            this.register(k, iconList[k]);
        }
    }

    register(name: string, component: any) {
        if (this._componentList.has(name)) {
            console.warn(`Component ${name} already exists.`);
        }
        this._componentList.set(name, component);
    }

    get(name: string) {
        return this._componentList.get(name);
    }

    delete(name: string) {
        this._componentList.delete(name);
    }
}
