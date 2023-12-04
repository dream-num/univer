import { BorderStyleTypes, BorderType } from '@univerjs/core';
import type { IDisposable } from '@wendellhu/redi';
import { BehaviorSubject } from 'rxjs';

export interface IBorderInfo {
    type: BorderType;
    color: string;
    style: BorderStyleTypes;
    activeBorderType: boolean; // When you click on the border type, then click on the color and style, it should take effect immediately.
}

/**
 * This service is for managing settings border style status.
 */
export class BorderStyleManagerService implements IDisposable {
    private readonly _borderInfo: IBorderInfo = {
        type: BorderType.ALL,
        color: '#000000',
        style: BorderStyleTypes.THIN,
        activeBorderType: false,
    };

    private readonly _borderInfo$ = new BehaviorSubject<IBorderInfo>(this._borderInfo);

    // eslint-disable-next-line @typescript-eslint/member-ordering
    readonly borderInfo$ = this._borderInfo$.asObservable();

    dispose(): void {
        this._borderInfo$.complete();
    }

    setType(type: BorderType): void {
        this._borderInfo.type = type;
        this.setActiveBorderType(true);
        this.refresh();
    }

    setColor(color: string): void {
        this._borderInfo.color = color;
        this.refresh();
    }

    setStyle(style: BorderStyleTypes): void {
        this._borderInfo.style = style;
        this.refresh();
    }

    setActiveBorderType(status: boolean) {
        this._borderInfo.activeBorderType = status;
    }

    getBorderInfo(): Readonly<IBorderInfo> {
        return this._borderInfo;
    }

    private refresh(): void {
        this._borderInfo$.next(this._borderInfo);
    }
}
