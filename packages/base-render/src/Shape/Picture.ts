import { IShapeProps, Shape } from './Shape';

export interface IPictureProps extends IShapeProps {
    image?: HTMLImageElement;
    url?: string;
    success?: () => void;
    fail?: () => void;
    autoWidth?: boolean;
    autoHeight?: boolean;
}

export class Picture extends Shape<IPictureProps> {
    static drawWith(ctx: CanvasRenderingContext2D, picture: Picture) {
        if (picture._native.complete) {
            const { width, height } = picture;
            ctx.drawImage(picture._native, 0, 0, width, height);
        }
    }

    static fromURL(url: string, callback?: () => void): Picture {
        return new Picture({ url, success: callback });
    }

    protected _props: IPictureProps;

    protected _native: HTMLImageElement;

    protected _draw(ctx: CanvasRenderingContext2D) {
        Picture.drawWith(ctx, this);
    }

    protected _init(): void {
        if (this._props.autoWidth) {
            this.resize(this._native.width, undefined);
        }
        if (this._props.autoHeight) {
            this.resize(undefined, this._native.height);
        }
    }

    constructor(config: IPictureProps) {
        super(undefined, config);
        this._props = {
            autoWidth: true,
            autoHeight: true,
            ...config,
        };
        if (config.image) {
            this._native = config.image;
            this._init();
        } else if (config.url) {
            this._native = document.createElement('img');
            this._native.src = config.url;
            this._native.onload = () => {
                config.success?.();
                this._init();
                this.makeDirty(true);
            };
            this._native.onerror = () => {
                config.fail?.();
            };
        }
    }
}
