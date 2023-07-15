import { ColumnTitleLayout } from './Extensions/ColumnTitleLayout';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { SpreadsheetSkeleton } from './SheetSkeleton';
import { SpreadsheetTitle } from './SheetComponent';
import { SheetColumnTitleExtensionRegistry } from '../Extension';
import { fixLineWidthByScale, getScale } from '../../Basics/Tools';

export class SpreadsheetColumnTitle extends SpreadsheetTitle {
    private _columnTitleLayoutExtension: ColumnTitleLayout;

    constructor(oKey: string, spreadsheetSkeleton: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        // this._initialProps(props);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get columnTitleLayoutExtension() {
        return this._columnTitleLayoutExtension;
    }

    override draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const parentScale = this.getParentScale();

        spreadsheetSkeleton.calculate(bounds);

        const scale = getScale(parentScale);

        const { rowTitleWidth } = spreadsheetSkeleton;

        ctx.translate(fixLineWidthByScale(rowTitleWidth, scale) - 0.5 / scale, -0.5 / scale);

        const extensions = this.getExtensionsByOrder();
        for (let extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    override isHit(coord: Vector2) {
        const oCoord = this._getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowTitleWidth, columnTitleHeight } = skeleton;
        if (oCoord.x > rowTitleWidth && oCoord.y >= 0 && oCoord.y <= columnTitleHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension() {
        SheetColumnTitleExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._columnTitleLayoutExtension = this.getExtensionByKey('DefaultColumnTitleLayoutExtension') as ColumnTitleLayout;
    }
}
