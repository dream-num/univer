import { BorderStyleTypes, BorderType } from '@univerjs/core';

export interface IBorderInfo {
    type: BorderType;
    color: string;
    style: BorderStyleTypes;
}

/**
 * This service is for managing settings border style status.
 */
export class BorderStyleManagerService {
    private readonly _borderInfo: IBorderInfo = {
        type: BorderType.ALL,
        color: '#000000',
        style: BorderStyleTypes.THIN,
    };

    setColor(color: string): void {
        this._borderInfo.color = color;
    }

    setStyle(style: BorderStyleTypes): void {
        this._borderInfo.style = style;
    }

    getBorderInfo(): Readonly<IBorderInfo> {
        return this._borderInfo;
    }
}
