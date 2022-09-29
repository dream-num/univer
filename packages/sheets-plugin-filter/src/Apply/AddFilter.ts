import { Nullable } from '@univer/core';
import { Filter, IFilter } from '../Domain';
import { FilterPlugin } from '../FilterPlugin';

export function AddFilter(plugin: FilterPlugin, sheetId: string, filter: Nullable<IFilter>) {
    const filterList = plugin.getFilterList();
    if (filter) {
        filterList.addFilter(sheetId, Filter.fromSequence<Filter>(filter).withContext(plugin.getContext()));
    }
}
