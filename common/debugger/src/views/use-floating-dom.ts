import { IUniverInstanceService, UniverInstanceType } from '@univerjs/core';
import { DocFloatDomController } from '@univerjs/docs-drawing-ui';
import { SheetCanvasFloatDomManagerService } from '@univerjs/sheets-drawing-ui';
import { useDependency } from '@univerjs/ui';

export function useFloatingDom(entryUnitType?: UniverInstanceType) {
    const univerInstanceService = useDependency(IUniverInstanceService);
    const floatDomService = entryUnitType === UniverInstanceType.UNIVER_SHEET ? useDependency(SheetCanvasFloatDomManagerService) : null;
    const floatDomController = entryUnitType === UniverInstanceType.UNIVER_DOC ? useDependency(DocFloatDomController) : null;

    const onSelect = () => {
        if (entryUnitType === UniverInstanceType.UNIVER_SHEET) {
            const currentSheet = univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_SHEET);
            if (!currentSheet) return;

            floatDomService?.addFloatDomToPosition({
                allowTransform: true,
                initPosition: {
                    startX: 200,
                    endX: 400,
                    startY: 200,
                    endY: 400,
                },
                componentKey: 'ImageDemo',
                data: {
                    aa: '128',
                },
            });
        } else if (entryUnitType === UniverInstanceType.UNIVER_DOC) {
            const currentDoc = univerInstanceService.getCurrentUnitOfType(UniverInstanceType.UNIVER_DOC);
            if (!currentDoc) return;

            floatDomController?.insertFloatDom({
                allowTransform: true,
                componentKey: 'ImageDemo',
                data: {
                    aa: '128',
                },
            }, {
                height: 300,
            });
        }
    };

    return {
        type: 'item' as const,
        children: '☁️ Create floating DOM',
        onSelect,
    };
}
