import { Observable } from '@univerjs/core';
import { CURSOR_TYPE, RENDER_CLASS_TYPE } from './Basics/Const';
import { ITransformChangeState } from './Basics/Interfaces';
import { IEvent } from './Basics/IEvents';

export abstract class ThinEngine<T> {
    onInputChangedObservable = new Observable<IEvent>();

    onTransformChangeObservable = new Observable<ITransformChangeState>();

    private _scenes: { [sceneKey: string]: T } = {};

    private _activeScene: T | null = null;

    get classType() {
        return RENDER_CLASS_TYPE.ENGINE;
    }

    get activeScene() {
        return this._activeScene;
    }

    get width() {
        return 0;
    }

    get height() {
        return 0;
    }

    getScenes() {
        return this._scenes;
    }

    getScene(sceneKey: string): T | null {
        return this._scenes[sceneKey];
    }

    hasScene(sceneKey: string): boolean {
        return sceneKey in this._scenes;
    }

    addScene(sceneInstance: T): T {
        const sceneKey = (sceneInstance as any).sceneKey;
        if (this.hasScene(sceneKey)) {
            console.warn('Scenes has similar key, it will be covered');
        }
        // const newScene = new Scene(this);
        this._scenes[sceneKey] = sceneInstance;
        return sceneInstance;
    }

    setActiveScene(sceneKey: string): T | null {
        const scene = this.getScene(sceneKey);
        if (scene) {
            this._activeScene = scene;
        }
        return scene;
    }

    hasActiveScene(): boolean {
        return this._activeScene != null;
    }

    dispose() {
        const scenes = this.getScenes();
        const sceneKeys = Object.keys(scenes);
        sceneKeys.forEach((key) => {
            (scenes[key] as any).dispose();
        });
    }

    remainScene(key: string) {
        const scenes = this.getScenes();
        if (scenes[key]) {
            const scene = scenes[key];
            delete scenes[key];
            return scene;
        }
    }

    clearCanvas() {}

    getCanvas() {}

    getCanvasElement() {}

    setCanvasCursor(val: CURSOR_TYPE) {}
}
