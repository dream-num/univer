import { HelpFunction } from './prompt/help-function/HelpFunction';
import { SearchFunction } from './prompt/search-function/SearchFunction';

export function RenderFormulaContent() {
    return (
        <>
            <SearchFunction />
            <HelpFunction />
        </>
    );
}
