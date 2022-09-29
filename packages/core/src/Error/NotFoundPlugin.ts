import { Error } from './Error';
import { Context } from '../Basics';

export class NotFoundPlugin extends Error {
    constructor(context: Context, msg = 'plugin not found') {
        super(context, msg);
    }
}
