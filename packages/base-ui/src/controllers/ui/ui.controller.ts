import { createIdentifier } from '@wendellhu/redi';

export interface IWorkbenchOptions {
    container?: string | HTMLElement;
}

export interface IUIController {
    bootstrapWorkbench(options: IWorkbenchOptions): void;
}

export const IUIController = createIdentifier<IUIController>('univer.ui-controller');
