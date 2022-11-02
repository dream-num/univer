import { Error } from './Error';
import { SheetContext } from '../Basics';

export class NotFoundPlugin extends Error {
    constructor(context: SheetContext, msg = 'plugin not found') {
        super(context, msg);
    }
}
