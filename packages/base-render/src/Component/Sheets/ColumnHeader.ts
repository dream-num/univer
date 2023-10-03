import { getTranslateInSpreadContextWithPixelRatio } from '../../Basics/Draw';
import { fixLineWidthByScale, getScale } from '../../Basics/Tools';
import { IBoundRect, Vector2 } from '../../Basics/Vector2';
import { Engine } from '../../Engine';
import { SheetColumnHeaderExtensionRegistry } from '../Extension';
import { ColumnHeaderLayout } from './Extensions/ColumnHeaderLayout';
import { SpreadsheetHeader } from './SheetComponent';
import { SpreadsheetSkeleton } from './SheetSkeleton';

export class SpreadsheetColumnHeader extends SpreadsheetHeader {
    private _columnHeaderLayoutExtension!: ColumnHeaderLayout;

    constructor(oKey: string, spreadsheetSkeleton?: SpreadsheetSkeleton) {
        super(oKey, spreadsheetSkeleton);
        // this._initialProps(props);

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

        const engine = this.getScene().getEngine() as Engine;

        const fixTranslate = getTranslateInSpreadContextWithPixelRatio(engine.getPixelRatio());

        ctx.translate(fixLineWidthByScale(rowHeaderWidth, scale) - fixTranslate / scale, -fixTranslate / scale);

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
