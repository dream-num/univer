import { IRenderManagerService } from '@univerjs/base-render';
import type { ISelectionWithStyle } from '@univerjs/base-sheets';
import { SelectionManagerService } from '@univerjs/base-sheets';
import type { ICommandInfo } from '@univerjs/core';
import { Disposable, ICommandService, IUniverInstanceService, ThemeService, Tools } from '@univerjs/core';
import { createIdentifier, Inject } from '@wendellhu/redi';

import { SetCellEditVisibleOperation } from '../../commands/operations/cell-edit.operation';
import { ISelectionRenderService } from '../selection/selection-render.service';
import { SelectionShape } from '../selection/selection-shape';
import { SheetSkeletonManagerService } from '../sheet-skeleton-manager.service';

export interface IMarkSelectionService {
    addShape(selection: ISelectionWithStyle): string | null;
    removeShape(id: string): void;
    removeAllShapes(): void;
}

const DEFAULT_Z_INDEX = 10000;
export const IMarkSelectionService = createIdentifier<IMarkSelectionService>('univer.mark-selection-service');

export class MarkSelectionService extends Disposable implements IMarkSelectionService {
    private _shapeMap: Map<string, SelectionShape> = new Map();

    constructor(
        @IUniverInstanceService private readonly _currentService: IUniverInstanceService,
        @IRenderManagerService private readonly _renderManagerService: IRenderManagerService,
        @ISelectionRenderService private readonly _selectionRenderService: ISelectionRenderService,
        @ICommandService private readonly _commandService: ICommandService,
        @Inject(SheetSkeletonManagerService) private readonly _sheetSkeletonManagerService: SheetSkeletonManagerService,
        @Inject(ThemeService) private readonly _themeService: ThemeService,
        @Inject(SelectionManagerService) private readonly _selectionManagerService: SelectionManagerService
    ) {
        super();
        this._addRemoveListener();
    }

    addShape(selection: ISelectionWithStyle, zIndex: number = DEFAULT_Z_INDEX): string | null {
        const workbook = this._currentService.getCurrentUniverSheetInstance();
        const { style } = selection;
        const { scene } = this._renderManagerService.getRenderById(workbook.getUnitId()) || {};

        const { rangeWithCoord, primaryWithCoord } =
            this._selectionRenderService.convertSelectionRangeToData(selection);
        const skeleton = this._sheetSkeletonManagerService.getCurrent()?.skeleton;
        if (!scene || !skeleton) return null;
        const { rowHeaderWidth, columnHeaderHeight } = skeleton;

        const control = new SelectionShape(scene, zIndex, false, this._themeService);

        control.update(rangeWithCoord, rowHeaderWidth, columnHeaderHeight, style, primaryWithCoord);
        const id = Tools.generateRandomId();
        this._shapeMap.set(id, control);
        return id;
    }

    removeShape(id: string): void {
        const shape = this._shapeMap.get(id);
        if (!shape) return;
        shape.dispose();
        this._shapeMap.delete(id);
    }

    removeAllShapes(): void {
        for (const shape of this._shapeMap.values()) {
            shape.dispose();
        }
        this._shapeMap.clear();
    }

    private _addRemoveListener() {
        const removeCommands = [SetCellEditVisibleOperation.id];
        this.disposeWithMe(
            this._commandService.onCommandExecuted((command: ICommandInfo) => {
                if (removeCommands.includes(command.id)) {
                    this.removeAllShapes();
                }
            })
        );
    }
}
