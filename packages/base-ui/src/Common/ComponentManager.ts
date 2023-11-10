import {
    AlignBottomSingle,
    AlignTopSingle,
    AllBorderSingle,
    AutowrapSingle,
    BoldSingle,
    BrushSingle,
    ClearFormat,
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

export interface ICustomComponent {
    name: string;
    props?: any;
}

export type ComponentList = Map<string, React.ForwardRefExoticComponent<any>>;

export class ComponentManager {
    private _componentList: ComponentList = new Map();

    constructor() {
        const iconList: Record<string, React.ForwardRefExoticComponent<any>> = {
            AlignBottomSingle,
            AlignTopSingle,
            AllBorderSingle,
            AutowrapSingle,
            BoldSingle,
            BrushSingle,
            Copy,
            ClearFormat,
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
