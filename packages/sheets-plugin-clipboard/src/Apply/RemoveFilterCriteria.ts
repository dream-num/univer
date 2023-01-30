import { Nullable } from '@univerjs/core';
import { ClipboardPlugin } from '../ClipboardPlugin';
import { IFilterCriteriaColumn } from '../Domain';

export function RemoveFilterCriteria(plugin: ClipboardPlugin, sheetId: string, column: number): Nullable<IFilterCriteriaColumn> {
    const filterList = plugin.getFilterList();
    const filterModel = filterList.getFilter(sheetId);
    const criteriaModel = filterModel.getGroupModel();
    const criteria = criteriaModel[column];
    delete criteriaModel[column];
    return criteria.toSequence();
}
