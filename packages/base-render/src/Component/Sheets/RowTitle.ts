import { RowTitleLayout } from '.';
import { IBoundRect, Vector2 } from '../../Base/Vector2';
import { SpreadsheetSkeleton } from './SheetSkeleton';
import { SpreadsheetTitle } from './SheetComponent';
import { SheetRowTitleExtensionRegistry } from '../Extension';
import { fixLineWidthByScale, getScale } from '../../Base/Tools';

export class SpreadsheetRowTitle extends SpreadsheetTitle {
    private _rowTitleLayoutExtension: RowTitleLayout;

    constructor(oKey: string, spreadsheetSkeleton: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        // this._initialProps(props);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get rowTitleLayoutExtension() {
        return this._rowTitleLayoutExtension;
    }

    draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const parentScale = this.getParentScale();

        spreadsheetSkeleton.calculate(bounds);

        const scale = getScale(parentScale);

        const { columnTitleHeight } = spreadsheetSkeleton;

        ctx.translate(-0.5 / scale, fixLineWidthByScale(columnTitleHeight, scale) - 0.5 / scale);

        const extensions = this.getExtensionsByOrder();
        for (let extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    isHit(coord: Vector2) {
        const oCoord = this._getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowTitleWidth, columnTitleHeight } = skeleton;
        if (oCoord.x >= 0 && oCoord.x <= rowTitleWidth && oCoord.y > columnTitleHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension() {
        SheetRowTitleExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._rowTitleLayoutExtension = this.getExtensionByKey('DefaultRowTitleLayoutExtension') as RowTitleLayout;
    }
}
