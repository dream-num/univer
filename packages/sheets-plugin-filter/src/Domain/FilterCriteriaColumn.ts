import { Sequence, Serializer } from '@univerjs/core';

import { IFilterCriteriaColumn } from '../IData/FilterType';
import { FilterCriteria } from './FilterCriteria';

export class FilterCriteriaColumn extends Serializer {
    private _criteria: FilterCriteria;

    private _column: number;

    static newInstance(sequence: IFilterCriteriaColumn): FilterCriteriaColumn {
        const criteriaColumn = new FilterCriteriaColumn();
        criteriaColumn._column = sequence.column;
        criteriaColumn._criteria = FilterCriteria.fromSequence(sequence.criteria as Sequence) as unknown as FilterCriteria;
        return criteriaColumn;
    }

    getColumn(): number {
        return this._column;
    }

    getCriteria(): FilterCriteria {
        return this._criteria;
    }

    override toSequence(): IFilterCriteriaColumn {
        return {
            ...this.toSequence(),
            criteria: this._criteria.toSequence(),
            column: this._column,
        };
    }
}
