import { LifecycleStages, runOnLifecycle } from '@univerjs/core';
import { createIdentifier } from '@wendellhu/redi';

export interface INumfmtController {
    openPanel(): void;
}
export const INumfmtController = createIdentifier<INumfmtController>('INumfmtController');
runOnLifecycle(LifecycleStages.Rendered, INumfmtController);
