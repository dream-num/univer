import { EVENT_TYPE, IWheelEvent, Layer, Rect, Scene, SceneViewer, ScrollBar, Viewport } from '@univer/base-render';
import { EventState } from '@univer/core';
import { SheetPlugin } from '../../../SheetPlugin';
import { BaseView, CanvasViewRegistry } from '../BaseView';

export class SceneViewerTestView extends BaseView {
    protected _initialize() {
        const mainScene = this.getScene();

        const sv = new SceneViewer('sceneViewer1', {
            left: 200,
            top: 200,
            width: 150,
            height: 150,
            zIndex: 10,
        });
        const scene = new Scene('testSceneViewer', sv, {
            width: 800,
            height: 800,
        });
        const viewMain = new Viewport('sceneViewerMain', scene, {
            left: 30,
            top: 30,
            bottom: 0,
            right: 0,
            isWheelPreventDefaultX: true,
        });
        scene.addViewport(viewMain).attachControl();
        const scrollbar = new ScrollBar(viewMain, {
            mainScene,
        });

        // 鼠标滚轮缩放
        scene.on(EVENT_TYPE.wheel, (evt: unknown, state: EventState) => {
            const e = evt as IWheelEvent;
            if (e.ctrlKey) {
                const deltaFactor = Math.abs(e.deltaX);
                let scrollNum = deltaFactor < 40 ? 0.05 : deltaFactor < 80 ? 0.02 : 0.01;
                scrollNum *= e.deltaY > 0 ? -1 : 1;
                if (scene.scaleX < 1) {
                    scrollNum /= 2;
                }

                if (scene.scaleX + scrollNum > 4) {
                    scene.scale(4, 4);
                } else if (scene.scaleX + scrollNum < 0.1) {
                    scene.scale(0.1, 0.1);
                } else {
                    scene.scaleBy(scrollNum, scrollNum);
                    e.preventDefault();
                }
            } else {
                viewMain.onMouseWheel(e, state);
            }
        });

        const rect3 = new Rect('purple1', {
            top: 37.5,
            left: 37.5,
            width: 250,
            height: 220,
            radius: 10,
            strokeWidth: 20,
            stroke: 'rgba(102,111,99, 0.8)',
            fill: 'rgba(100,110,99, 0.8)',
            zIndex: 3,
        });
        rect3.on(EVENT_TYPE.PointerEnter, () => {
            // this.fill = 'rgba(220,11,19, 0.8)';
            console.log('PointerEnter11112312313123132');
            rect3.setProps({
                fill: 'rgba(220,11,19, 0.8)',
            });
            rect3.makeDirty(true);
        });
        rect3.on(EVENT_TYPE.PointerLeave, () => {
            console.log('PointerLeave11112312313123132');
            // this.fill = 'rgba(100,110,99, 0.8)';
            rect3.setProps({
                fill: 'rgba(100,110,99, 0.8)',
            });
            rect3.makeDirty(true);
        });

        scene.addLayer(new Layer(scene, [rect3]));

        mainScene.addObject(sv);
    }
}

// CanvasViewRegistry.add(SceneViewerTestView);

export class SceneViewerTestViewFactory {
    /**
     * Generate SceneViewerTestView Instance
     * @param scene
     * @param plugin
     * @returns
     */
    create(scene: Scene, plugin: SheetPlugin): SceneViewerTestView {
        return new SceneViewerTestView().initialize(scene, plugin);
    }
}
CanvasViewRegistry.add(new SceneViewerTestViewFactory());
