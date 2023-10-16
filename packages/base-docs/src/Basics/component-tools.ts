import { Documents, Engine, IRenderManagerService, Scene } from '@univerjs/base-render';
import { IUniverInstanceService, Nullable } from '@univerjs/core';

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

    const { components, mainComponent, scene, engine } = currentRender;

    const document = mainComponent as Documents;

    return {
        document,
        scene,
        engine,
    };
}
