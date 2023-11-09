import { getTranslateInSpreadContextWithPixelRatio } from '../../basics/draw';
import { fixLineWidthByScale, getScale } from '../../basics/tools';
import { IBoundRect, Vector2 } from '../../basics/vector2';
import { SheetColumnHeaderExtensionRegistry } from '../extension';
import { ColumnHeaderLayout } from './extensions/column-header-layout';
import { SpreadsheetHeader } from './sheet-component';
import { SpreadsheetSkeleton } from './sheet-skeleton';

export class SpreadsheetColumnHeader extends SpreadsheetHeader {
    private _columnHeaderLayoutExtension!: ColumnHeaderLayout;

    constructor(oKey: string, spreadsheetSkeleton?: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);

        this._initialDefaultExtension();

        this.makeDirty(true);
    }

    get columnHeaderLayoutExtension() {
        return this._columnHeaderLayoutExtension;
    }

    override draw(ctx: CanvasRenderingContext2D, bounds?: IBoundRect) {
        const spreadsheetSkeleton = this.getSkeleton();
        if (!spreadsheetSkeleton) {
            return;
        }
        const parentScale = this.getParentScale();

        spreadsheetSkeleton.calculate(bounds);

        const segment = spreadsheetSkeleton.rowColumnSegment;

        if (segment.startColumn === -1 && segment.endColumn === -1) {
            return;
        }

        const scale = getScale(parentScale);

        const { rowHeaderWidth } = spreadsheetSkeleton;

        const { left: fixTranslateLeft, top: fixTranslateTop } = getTranslateInSpreadContextWithPixelRatio();

        ctx.translate(fixLineWidthByScale(rowHeaderWidth, scale) - fixTranslateLeft / scale, -fixTranslateTop / scale);

        const extensions = this.getExtensionsByOrder();
        for (const extension of extensions) {
            extension.draw(ctx, parentScale, spreadsheetSkeleton);
        }
    }

    override isHit(coord: Vector2): boolean {
        const oCoord = this._getInverseCoord(coord);
        const skeleton = this.getSkeleton();
        if (!skeleton) {
            return false;
        }
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;
        if (oCoord.x > rowHeaderWidth && oCoord.y >= 0 && oCoord.y <= columnHeaderHeight) {
            return true;
        }
        return false;
    }

    private _initialDefaultExtension() {
        SheetColumnHeaderExtensionRegistry.getData().forEach((extension) => {
            this.register(extension);
        });
        this._columnHeaderLayoutExtension = this.getExtensionByKey(
            'DefaultColumnHeaderLayoutExtension'
        ) as ColumnHeaderLayout;
    }
}
