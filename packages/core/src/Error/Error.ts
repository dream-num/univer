import { SheetContext } from '../Basics';

class Error {
    private readonly message: string;

    constructor(context: SheetContext, msg: string) {
        this.message = msg;
    }
}

export { Error };
