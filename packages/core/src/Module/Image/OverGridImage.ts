import { Worksheet } from '../../Sheets/Domain';
import { ICellData } from '../../Interfaces';
import { Nullable } from '../../Shared';
// import {IObjectFullState, IShapeConfig, Shape} from "@univer/base-render/src";

// export interface IOverGridImageConfig extends IShapeConfig, IObjectFullState {

// }

// export class OverGridImage extends Shape<IOverGridImageConfig> {

export class OverGridImage {
    constructor() {
        // super();
    }

    setWidth(width: number): void {}

    setHeight(height: number): void {}

    getAltTextDescription(): string {
        return '';
    }

    getAltTextTitle(): string {
        return '';
    }

    getAnchorCell(): Nullable<Range> {
        return undefined;
    }

    getAnchorCellXOffset(): number {
        return 0;
    }

    getAnchorCellYOffset(): number {
        return 0;
    }

    getHeight(): number {
        return 0;
    }

    getInherentHeight(): number {
        return 0;
    }

    getInherentWidth(): number {
        return 0;
    }

    getSheet(): Nullable<Worksheet> {
        return null;
    }

    getUrl(): string {
        return '';
    }

    getWidth(): number {
        return 0;
    }

    remove(): void {}

    replace(url: string): Nullable<OverGridImage> {
        return null;
    }

    resetSize(): Nullable<OverGridImage> {}

    setAltTextDescription(description: string): Nullable<OverGridImage> {}

    setAltTextTitle(title: string): Nullable<OverGridImage> {}

    setAnchorCell(cell: ICellData): Nullable<OverGridImage> {}
}
