import { getTranslateInSpreadContextWithPixelRatio } from '../../Basics/Draw';
import { fixLineWidthByScale, getScale } from '../../Basics/Tools';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { SheetRowHeaderExtensionRegistry } from '../Extension';
import { RowHeaderLayout } from './Extensions/RowHeaderLayout';
import { SpreadsheetHeader } from './SheetComponent';
import { SpreadsheetSkeleton } from './SheetSkeleton';

export class SpreadsheetRowHeader extends SpreadsheetHeader {
    private _rowHeaderLayoutExtension!: RowHeaderLayout;

    constructor(oKey: string, spreadsheetSkeleton?: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        // this._initialProps(props);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get rowHeaderLayoutExtension() {
        return this._rowHeaderLayoutExtension;
    }

    override draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const parentScale = this.getParentScale();

        spreadsheetSkeleton.calculate(bounds);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (segment.startRow === -1 && segment.endRow === -1) {
            return;
        }

        const scale = getScale(parentScale);

        const { columnHeaderHeight } = spreadsheetSkeleton;

        const { left: fixTranslateLeft, top: fixTranslateTop } = getTranslateInSpreadContextWithPixelRatio();

        ctx.translate(
            -fixTranslateLeft / scale,
            fixLineWidthByScale(columnHeaderHeight, scale) - fixTranslateTop / scale
        );

        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    override isHit(coord: Vector2) {
        const oCoord = this._getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        if (oCoord.x >= 0 && oCoord.x <= rowHeaderWidth && oCoord.y > columnHeaderHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension() {
        SheetRowHeaderExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._rowHeaderLayoutExtension = this.getExtensionByKey('DefaultRowHeaderLayoutExtension') as RowHeaderLayout;
    }
}
