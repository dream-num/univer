import { IRangeData, GroupModel, Nullable, Serializer } from '@univerjs/core';
import { FilterCriteria } from './FilterCriteria';
import { FilterCriteriaColumn } from './FilterCriteriaColumn';
import { IFilter, IFilterCriteriaColumn } from '../IData/FilterType';

export class Filter extends Serializer implements GroupModel<{ [column: number]: FilterCriteriaColumn }> {
    private _range: IRangeData;

    private _sheetId: string;

    private _criteriaColumns: {
        [column: number]: FilterCriteriaColumn;
    };

    constructor(sheetId: string, range: IRangeData) {
        super();
        this._sheetId = sheetId;
        this._range = range;
        this._criteriaColumns = {};
    }

    static newInstance(sequence: IFilter): Filter {
        const filter = new Filter(sequence.sheetId, sequence.range);
        const criteriaColumns: any = {};
        for (const column in sequence.criteriaColumns) {
            criteriaColumns[column] = FilterCriteriaColumn.fromSequence(sequence.criteriaColumns[column]);
        }
        filter._criteriaColumns = criteriaColumns;
        return filter;
    }

    getColumnFilterCriteria(columnPosition: number): Nullable<FilterCriteria> {
        const criteriaColumn = this._criteriaColumns[columnPosition];
        if (criteriaColumn) {
            return criteriaColumn.getCriteria();
        }
        return null;
    }

    getGroupModel(): { [column: number]: FilterCriteriaColumn } {
        return this._criteriaColumns;
    }

    // setColumnFilterCriteria(columnPosition: number, criteriaColumn: FilterCriteriaColumn): void {
    //     const context = this.getContext();
    //     const commandManager = context.getCommandManager();
    //     const workbook = context.getWorkBook();
    //     const worksheet = workbook.getActiveSheet();
    //     if (worksheet) {
    //         const configure = {
    //             actionName: ACTION_NAMES.ADD_FILTER_CRITERIA_ACTION,
    //             sheetId: worksheet.getSheetId(),
    //             columnPosition,
    //             criteriaColumn: criteriaColumn.toSequence(),
    //         };
    //         const command = new Command(
    //             {
    //                 WorkBookUnit: workbook,
    //             },
    //             configure
    //         );
    //         commandManager.invoke(command);
    //     }
    // }

    override toSequence(): IFilter {
        const criteriaColumns: {
            [column: number]: IFilterCriteriaColumn;
        } = {};

        for (const column in this._criteriaColumns) {
            criteriaColumns[column] = this._criteriaColumns[column].toSequence();
        }

        return {
            ...this.toSequence(),
            sheetId: this._sheetId,
            range: this._range,
            criteriaColumns,
        };
    }
}
