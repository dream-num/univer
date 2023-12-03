import type { Nullable } from '@univerjs/core';
import type { Documents, Engine, IRenderManagerService, Scene } from '@univerjs/engine-render';

export interface IDocObjectParam {
    document: Documents;
    scene: Scene;
    engine: Engine;
}

export function getEditorObject(
    unitId: Nullable<string>,
    renderManagerService: IRenderManagerService
): Nullable<IDocObjectParam> {
    if (unitId == null) {
        return;
    }

    const currentRender = renderManagerService.getRenderById(unitId);

    if (currentRender == null) {
        return;
    }

    const { mainComponent, scene, engine } = currentRender;

    const document = mainComponent as Documents;

    return {
        document,
        scene,
        engine,
    };
}
