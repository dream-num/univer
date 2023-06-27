import { SheetContext, Sequence, Serializer } from '@univerjs/core';
import { FilterCriteria, IFilterCriteria } from './FilterCriteria';

export interface IFilterCriteriaColumn extends Sequence {
    column: number;
    criteria: IFilterCriteria;
}

export class FilterCriteriaColumn extends Serializer {
    private _criteria: FilterCriteria;

    private _column: number;

    private _context: SheetContext;

    static newInstance(sequence: IFilterCriteriaColumn): FilterCriteriaColumn {
        const criteriaColumn = new FilterCriteriaColumn();
        criteriaColumn._column = sequence.column;
        criteriaColumn._criteria = FilterCriteria.fromSequence(sequence.criteria);
        return criteriaColumn;
    }

    withContext(context: SheetContext): FilterCriteriaColumn {
        this._context = context;
        return this;
    }

    getColumn(): number {
        return this._column;
    }

    getContext(): SheetContext {
        return this._context;
    }

    getCriteria(): FilterCriteria {
        return this._criteria;
    }

    toSequence(): IFilterCriteriaColumn {
        return {
            ...this.toSequence(),
            criteria: this._criteria.toSequence(),
            column: this._column,
        };
    }
}
