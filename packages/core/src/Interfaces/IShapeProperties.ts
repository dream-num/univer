import { BorderStyleTypes } from '../Enum/BorderStyleTypes';
import { IColorStyle } from './IStyleData';

/**
 * ShapeProperties
 */
export interface IShapeProperties {
    shapeBackgroundFill: IColorStyle;
    radius?: number;
    outline?: IOutline;
    // shadow: IShadow;
    // link: ILink;
    // contentAlignment: ContentAlignment;
    // autoFit: IAutoFit;
}

export interface IOutline {
    outlineFill: IColorStyle;
    weight: number;
    dashStyle?: BorderStyleTypes;
}
