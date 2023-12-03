import type { Documents, Engine, IRenderManagerService, Scene } from '@univerjs/engine-render';
import type { IUniverInstanceService, Nullable } from '@univerjs/core';

export interface IDocObjectParam {
    document: Documents;
    scene: Scene;
    engine: Engine;
}

export function getDocObject(
    univerInstanceService: IUniverInstanceService,
    renderManagerService: IRenderManagerService
): Nullable<IDocObjectParam> {
    const documentModel = univerInstanceService.getCurrentUniverDocInstance();

    const unitId = documentModel.getUnitId();

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

export function getDocObjectById(
    unitId: string,
    renderManagerService: IRenderManagerService
): Nullable<IDocObjectParam> {
    const currentRender = renderManagerService.getRenderById(unitId);

    if (currentRender == null) {
        return;
    }

    const { components, mainComponent, scene, engine } = currentRender;

    const document = mainComponent as Documents;

    return {
        document,
        scene,
        engine,
    };
}
