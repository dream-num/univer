import { Nullable } from '@univer/core';
import { FilterPlugin } from '../FilterPlugin';
import { IFilter } from '../Domain';

export function RemoveFilter(plugin: FilterPlugin, sheetId: string): Nullable<IFilter> {
    const filterList = plugin.getFilterList();
    const filterModel = filterList.getGroupModel();
    const filter = filterModel[sheetId];
    delete filterModel[sheetId];
    return filter.toSequence();
}
