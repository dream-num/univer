import {
    AdjustHeight,
    AdjustWidth,
    AlignBottomSingle,
    AlignTopSingle,
    AllBorderSingle,
    AutoHeight,
    AutowrapSingle,
    BoldSingle,
    BrushSingle,
    CancelMergeSingle,
    ClearFormat,
    Copy,
    DeleteCellMoveDown,
    DeleteCellShiftRight,
    DeleteColumn,
    DeleteRow,
    DownBorder,
    FontColor,
    FunctionSingle,
    Hide,
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
    LeftInsertColumn,
    LeftJustifyingSingle,
    LeftRotationFortyFiveDegreesSingle,
    LeftRotationNinetyDegreesSingle,
    MergeAllSingle,
    NoBorderSingle,
    NoColor,
    NoRotationSingle,
    OuterBorder,
    OverflowSingle,
    PaintBucket,
    PasteSpecial,
    RedoSingle,
    Reduce,
    RightBorder,
    RightInsertColumn,
    RightJustifyingSingle,
    RightRotationFortyFiveDegreesSingle,
    RightRotationNinetyDegreesSingle,
    StrikethroughSingle,
    TruncationSingle,
    UnderlineSingle,
    UndoSingle,
    UpBorder,
    VerticalCenterSingle,
    VerticalIntegrationSingle,
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
            DownBorder,
            FontColor,
            FunctionSingle,
            HorizontallySingle,
            InnerBorder,
            ItalicSingle,
            KeyboardSingle,
            LeftBorder,
            LeftJustifyingSingle,
            LeftRotationFortyFiveDegreesSingle,
            LeftRotationNinetyDegreesSingle,
            MergeAllSingle,
            HorizontalMergeSingle,
            VerticalIntegrationSingle,
            CancelMergeSingle,
            NoBorderSingle,
            NoColor,
            NoRotationSingle,
            OuterBorder,
            OverflowSingle,
            PaintBucket,
            PasteSpecial,
            RedoSingle,
            RightBorder,
            RightJustifyingSingle,
            RightRotationFortyFiveDegreesSingle,
            RightRotationNinetyDegreesSingle,
            StrikethroughSingle,
            TruncationSingle,
            UnderlineSingle,
            UndoSingle,
            UpBorder,
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
            // DeleteCellShiftUp,
            DeleteCellShiftRight,
            // DeleteCellShiftLeft,
            DeleteCellMoveDown,
            Reduce,
            Hide,
            AutoHeight,
            AdjustHeight,
            AdjustWidth,
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
