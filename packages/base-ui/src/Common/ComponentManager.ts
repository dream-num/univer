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
    ForwardIcon,
    FullBorderIcon,
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

export class ComponentManager {
    private _componentList: Map<string, any> = new Map();

    constructor() {
        const iconList = {
            ForwardIcon,
            BackIcon,
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
            TextRotateIcon,
            TextRotateAngleUpIcon,
            TextRotateAngleDownIcon,
            TextRotateVerticalIcon,
            TextRotateRotationUpIcon,
            TextRotateRotationDownIcon,
        };

        for (let k in iconList) {
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
