import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import type { IFloatDom, IFloatDomLayout } from '@univerjs/ui';
import { getDrawingShapeKeyByDrawingSearch } from '@univerjs/drawing';
import { IRenderManagerService } from '@univerjs/engine-render';
import { CanvasFloatDomService } from '@univerjs/ui';
import { CustomRangeLoading, FloatDomContentBoxProbe } from './component';

const FLOAT_DOM_CONTENT_BOX_FIXTURE_ID = 'float-dom-content-box-probe';
/* eslint-disable-next-line node/prefer-global/process */
const IS_E2E: boolean = !!process.env.IS_E2E;

interface IFloatDomContentBoxFixture {
    id: string;
    setContentBox: (contentBox: NonNullable<IFloatDom['contentBox']>) => void;
    setBorder: (border: boolean) => void;
    enableRotateHandle: () => void;
    getTransformerGeometry: () => {
        drawing: { left: number; top: number; width: number; height: number; angle: number };
        controls: Array<{ key: string; left: number; top: number; width: number; height: number; angle: number }>;
    };
    getLayout: () => IFloatDomLayout | undefined;
}

function exposeFloatDomContentBoxFixture(univer: Univer, fixture: IFloatDomContentBoxFixture): void {
    window.floatDomContentBoxFixture = fixture;
    univer.onDispose(() => {
        if (window.floatDomContentBoxFixture === fixture) {
            window.floatDomContentBoxFixture = undefined;
        }
    });
}

function installFloatDomContentBoxFixture(univer: Univer, univerAPI: FUniver): void {
    if (!IS_E2E || !new URLSearchParams(window.location.search).has('float-dom-content-box')) {
        return;
    }

    univerAPI.registerComponent('FloatDomContentBoxProbe', FloatDomContentBoxProbe);
    const worksheet = univerAPI.getActiveWorkbook()!.getActiveSheet();
    const disposable = worksheet.addFloatDomToPosition({
        componentKey: 'FloatDomContentBoxProbe',
        initPosition: {
            startX: 120,
            startY: 100,
            endX: 600,
            endY: 420,
        },
        data: { border: false },
        allowTransform: true,
        eventPassThrough: true,
    }, FLOAT_DOM_CONTENT_BOX_FIXTURE_ID);
    if (!disposable) {
        throw new Error('Failed to create FloatDom content-box e2e fixture');
    }

    const canvasFloatDomService = univer.__getInjector().get(CanvasFloatDomService);
    const renderManagerService = univer.__getInjector().get(IRenderManagerService);
    const getDrawingAndScene = () => {
        const workbook = univerAPI.getActiveWorkbook()!;
        const scene = renderManagerService.getRenderById(workbook.getId())?.scene;
        const rect = scene?.getObject(getDrawingShapeKeyByDrawingSearch({
            unitId: workbook.getId(),
            subUnitId: worksheet.getSheetId(),
            drawingId: disposable.id,
        }));
        if (!rect || !scene) {
            throw new Error('Failed to locate FloatDom transformer fixture');
        }
        return { rect, scene };
    };
    const fixture: IFloatDomContentBoxFixture = {
        id: disposable.id,
        setContentBox: (contentBox) => canvasFloatDomService.updateFloatDom(disposable.id, { contentBox }),
        setBorder: (border) => worksheet.updateFloatDom(disposable.id, { data: { border } }),
        enableRotateHandle: () => {
            const { rect, scene } = getDrawingAndScene();
            rect.transformerConfig = { ...rect.transformerConfig, rotateEnabled: true };
            scene.getTransformerByCreate()?.refreshControls();
        },
        getTransformerGeometry: () => {
            const { rect, scene } = getDrawingAndScene();
            const toGeometry = (object: typeof rect) => ({
                key: object.oKey,
                left: object.left,
                top: object.top,
                width: object.width,
                height: object.height,
                angle: object.angle,
            });
            return {
                drawing: toGeometry(rect),
                controls: scene.getAllObjects()
                    .filter((object) => object.oKey.includes('__SpreadsheetTransformer'))
                    .map((object) => toGeometry(object))
                    .sort((a, b) => a.key.localeCompare(b.key)),
            };
        },
        getLayout: () => {
            const layer = canvasFloatDomService.domLayers.find(([id]) => id === disposable.id)?.[1];
            let layout: IFloatDomLayout | undefined;
            layer?.position$.subscribe((value) => {
                layout = value;
            }).unsubscribe();
            return layout;
        },
    };
    exposeFloatDomContentBoxFixture(univer, fixture);
}

export function insertFloatDom(univer: Univer, univerAPI: FUniver) {
    univerAPI.addEvent(univerAPI.Event.LifeCycleChanged, ({ stage }) => {
        if (stage === univerAPI.Enum.LifecycleStages.Steady) {
            univerAPI.registerComponent('CustomRangeLoading', CustomRangeLoading);

            const fWorkbook = univerAPI.getActiveWorkbook()!;
            const fWorksheet = fWorkbook.getActiveSheet();
            const fRange = fWorksheet.getRange('A1:C3');
            const disposable = fWorksheet.addFloatDomToRange(fRange, { componentKey: 'CustomRangeLoading' }, {}, 'myRangeLoading');
            console.warn('Float DOM', disposable);
            installFloatDomContentBoxFixture(univer, univerAPI);
            // remove float dom
            // if (disposable) {
            //     disposable.dispose();
            //     //or
            //     fWorksheet.removeFloatDom(disposable.id);
            // }
        }
    });
}

declare global {
    // eslint-disable-next-line ts/naming-convention
    interface Window {
        floatDomContentBoxFixture?: IFloatDomContentBoxFixture;
    }
}
