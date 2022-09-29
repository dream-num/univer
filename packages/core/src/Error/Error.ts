import { Context } from '../Basics';

class Error {
    private readonly message: string;

    constructor(context: Context, msg: string) {
        this.message = msg;
    }
}

export { Error };
