export interface ISize {
    width?: number;
    height?: number;
}

export interface IScale {
    scaleX?: number;
    scaleY?: number;
}

export interface IOffset {
    left?: number;
    top?: number;
}

export interface ITransformState extends IOffset, ISize, IScale {
    angle?: number;
    skewX?: number;
    skewY?: number;
    flipX?: boolean;
    flipY?: boolean;
}
