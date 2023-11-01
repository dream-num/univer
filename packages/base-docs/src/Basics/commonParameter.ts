class CommonParameter {
    cursor: number = 0;

    reset() {
        this.cursor = 0;
        return this;
    }

    moveCursor(pos: number) {
        this.cursor += pos;
    }
}

export default CommonParameter;
