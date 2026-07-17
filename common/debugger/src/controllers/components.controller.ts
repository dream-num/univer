import { Disposable, Inject } from '@univerjs/core';
import { ComponentManager } from '@univerjs/ui';
import { AIButton, FloatButton } from '../components/FloatButton';
import { ImageDemo } from '../components/Image';
import { RangeLoading } from '../components/RangeLoading';
// @ts-ignore
// import VueComponent from '../components/VueComponent.vue';
// import { CounterComponent } from '../components/WebComponent';
import { WatermarkPanel } from '../views/watermark/WatermarkPanel';
import { WatermarkPanelFooter } from '../views/watermark/WatermarkPanelFooter';

export const WATERMARK_PANEL = 'WATERMARK_PANEL';
export const WATERMARK_PANEL_FOOTER = 'WATERMARK_PANEL_FOOTER';

export class ComponentsController extends Disposable {
    constructor(
        @Inject(ComponentManager) private readonly _componentManager: ComponentManager
    ) {
        super();

        this._registerComponents();
    }

    private _registerComponents(): void {
        ([
            ['ImageDemo', ImageDemo],
            ['RangeLoading', RangeLoading],
            ['FloatButton', FloatButton],
            ['AIButton', AIButton],
            [WATERMARK_PANEL, WatermarkPanel],
            [WATERMARK_PANEL_FOOTER, WatermarkPanelFooter],
        ] as const).forEach(([key, component]) => {
            this.disposeWithMe(this._componentManager.register(key, component));
        });

        // this.disposeWithMe(this._componentManager.register('VueComponent', VueComponent, {
        //     framework: 'vue3',
        // }));

        // this.disposeWithMe(this._componentManager.register('counter-component', CounterComponent, {
        //     framework: 'web-component',
        // }));
    }
}
