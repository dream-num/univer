import { EVENT_TYPE, getColor, Rect, Scene } from '@univerjs/base-render';
import { SheetPlugin } from '../../../SheetPlugin';
import { BaseView } from '../BaseView';

export class TestView extends BaseView {
    protected _initialize() {
        const scene = this.getScene();
        const rect1 = new Rect('green', {
            top: 100,
            left: 100,
            width: 250,
            height: 180,
            radius: 10,
            angle: 45,
            fill: getColor([10, 128, 99], 0.8),
            zIndex: 11,
        });
        rect1.on(EVENT_TYPE.PointerEnter, () => {
            console.log('EVENT_TYPE.POINTERENTER_111');
            // this.fill = 'rgba(10,128,199, 0.8)';
            rect1.setProps({
                fill: getColor([10, 128, 199], 0.8),
            });
        });
        rect1.on(EVENT_TYPE.PointerLeave, () => {
            console.log('EVENT_TYPE.POINTERLEAVE_222');
            // this.fill = 'rgba(10,128,99, 0.8)';
            rect1.setProps({
                fill: getColor([10, 128, 99], 0.8),
            });
        });

        const rect2 = new Rect('blue', {
            top: 150,
            left: 500,
            width: 350,
            height: 280,
            radius: 10,
            fill: 'rgba(10,11,99, 0.8)',
            zIndex: 12,
        });
        rect2.on(EVENT_TYPE.PointerEnter, () => {
            // this.fill = 'rgba(102,111,99, 0.8)';
            rect2.setProps({
                fill: getColor([102, 111, 99], 0.8),
            });
        });
        rect2.on(EVENT_TYPE.PointerLeave, () => {
            // this.fill = 'rgba(10,11,99, 0.8)';
            rect2.setProps({
                fill: getColor([10, 11, 99], 0.8),
            });
        });

        const rect3 = new Rect('purple', {
            top: 0,
            left: 37.5,
            width: 250,
            height: 220,
            radius: 10,
            strokeWidth: 20,
            stroke: getColor([102, 111, 99], 0.8),
            fill: getColor([100, 11, 99], 0.8),
            zIndex: 13,
        });
        rect3.on(EVENT_TYPE.PointerEnter, () => {
            // this.fill = 'rgba(120,11,19, 0.8)';
            rect3.setProps({
                fill: getColor([120, 11, 19], 0.8),
            });
        });
        rect3.on(EVENT_TYPE.PointerLeave, () => {
            // this.fill = 'rgba(100,11,99, 0.8)';
            rect3.setProps({
                fill: getColor([100, 11, 99], 0.8),
            });
        });

        scene.addObjects([rect1, rect2, rect3]);
    }
}

// CanvasViewRegistry.add(TestView);
export class TestViewFactory {
    /**
     * Generate TestView Instance
     * @param scene
     * @param plugin
     * @returns
     */
    create(scene: Scene, plugin: SheetPlugin): TestView {
        return new TestView().initialize(scene, plugin);
    }
}
// CanvasViewRegistry.add(new TestViewFactory());
