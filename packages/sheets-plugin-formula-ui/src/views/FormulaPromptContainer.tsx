import React from 'react';

import { HelpFunction } from './prompt/help-function/HelpFunction';
import { SearchFunction } from './prompt/search-function/SearchFunction';

export function RenderFormulaPromptContent() {
    return (
        <>
            <SearchFunction />
            <HelpFunction />
        </>
    );
}
