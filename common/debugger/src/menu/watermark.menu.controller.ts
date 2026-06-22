import { Disposable, Inject } from '@univerjs/core';
import { ComponentManager, IMenuManagerService } from '@univerjs/ui';
import { WatermarkPanel } from '../views/watermark/WatermarkPanel';
import { WatermarkPanelFooter } from '../views/watermark/WatermarkPanelFooter';

export const WATERMARK_PANEL = 'WATERMARK_PANEL';

export const WATERMARK_PANEL_FOOTER = 'WATERMARK_PANEL_FOOTER';

export class UniverWatermarkMenuController extends Disposable {
    constructor(
        @IMenuManagerService protected readonly _menuManagerService: IMenuManagerService,
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();
        this._initComponents();
    }

    private _initComponents() {
        ([
            [WATERMARK_PANEL, WatermarkPanel],
            [WATERMARK_PANEL_FOOTER, WatermarkPanelFooter],
        ] as const).forEach(([key, comp]) => {
            this.disposeWithMe(this._componentManager.register(key, comp));
        });
    }
}
