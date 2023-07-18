/**
 * Properties of Image
 */
export interface IImageProperties {
    contentUrl: string;
    sourceUrl?: string;
    brightness?: number;
    contrast?: number;
    transparency?: number;
    cropProperties?: ICropProperties;
    angle?: number;
}

/**
 * Properties of crop image
 */
export interface ICropProperties {
    offsetLeft: number;
    offsetRight: number;
    offsetTop: number;
    offsetBottom: number;
    angle: number;
}
