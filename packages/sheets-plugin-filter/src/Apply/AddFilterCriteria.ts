import { Nullable } from '@univer/core';
import { FilterCriteriaColumn, IFilterCriteriaColumn } from '../Domain';
import { FilterPlugin } from '../FilterPlugin';

export function AddFilterCriteria(plugin: FilterPlugin, sheetId: string, criteriaColumn: Nullable<IFilterCriteriaColumn>) {
    const filterList = plugin.getFilterList();
    const filterModel = filterList.getFilter(sheetId);
    const criteriaModel = filterModel.getGroupModel();
    if (criteriaColumn) {
        criteriaModel[criteriaColumn.column] = FilterCriteriaColumn.fromSequence<FilterCriteriaColumn>(criteriaColumn).withContext(plugin.getContext());
    }
}
