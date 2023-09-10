import { createIdentifier } from '@wendellhu/redi';

export interface IWorkbenchOptions {
    container?: string | HTMLElement;

    outerLeft?: boolean;
    innerLeft?: boolean;
    header?: boolean;
    infoBar?: boolean;
    toolbar?: boolean;
    footer?: boolean;
}

export interface IUIController {
    bootstrapWorkbench(options: IWorkbenchOptions): void;
}

export const IUIController = createIdentifier<IUIController>('univer.ui-controller');
