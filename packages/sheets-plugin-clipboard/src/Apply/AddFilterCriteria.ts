import { Nullable } from '@univer/core';
import { FilterCriteriaColumn, IFilterCriteriaColumn } from '../Domain';
import { ClipboardPlugin } from '../ClipboardPlugin';

export function AddFilterCriteria(plugin: ClipboardPlugin, sheetId: string, criteriaColumn: Nullable<IFilterCriteriaColumn>) {
    const filterList = plugin.getFilterList();
    const filterModel = filterList.getFilter(sheetId);
    const criteriaModel = filterModel.getGroupModel();
    if (criteriaColumn) {
        criteriaModel[criteriaColumn.column] = FilterCriteriaColumn.fromSequence<FilterCriteriaColumn>(criteriaColumn).withContext(plugin.getContext());
    }
}
