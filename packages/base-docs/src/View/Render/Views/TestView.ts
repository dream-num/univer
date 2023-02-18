import { getColor, RegularPolygon, Documents, DocumentSkeleton, CustomObject, IPageRenderConfig, Transform, ptToPx, COLORS, Rect } from '@univerjs/base-render';
import { BaseView, CanvasViewRegistry } from '../BaseView';

const PAGE_VIEW_BACKGROUND = 'page_view_background';

export class PageView extends BaseView {
    zIndex = 3;

    viewKey = PAGE_VIEW_BACKGROUND;

    protected _initialize() {
        const scene = this.getScene();
        const context = this.getContext();

        const polygon = new RegularPolygon('TEXT_POLYGON_KEY_PREFIX_TEST', {
            pointsGroup: [
                [
                    { x: 100, y: 10 },
                    { x: 40, y: 180 },
                    { x: 190, y: 60 },
                    { x: 10, y: 60 },
                    { x: 160, y: 180 },
                ],
            ],
            fill: getColor(COLORS.black, 0.2),
            isTransformer: true,
        });

        // const object = scene.fuzzyMathObjects('__TestSelection__')[0];
        // const ctx = scene.getEngine()?.getCanvas().getGlobalContext();
        // object.onTransformChangeObservable.add((state) => {
        //     if (!ctx) {
        //         return;
        //     }
        //     Rect.drawWith(ctx, {
        //         left: object.left,
        //         top: object.top,
        //         width: object.width,
        //         height: object.height,
        //         strokeWidth: 1,
        //         stroke: 'rgba(198,198,198, 1)',
        //         fill: 'rgba(255,255,255, 1)',
        //         zIndex: 3,
        //     });
        // });
        scene.openTransformer();
        scene.addObjects([polygon]);
        scene.closeTransformer();
    }
}

CanvasViewRegistry.add(new PageView());
