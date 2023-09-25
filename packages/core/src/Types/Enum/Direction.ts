/**
 * Direction: Top/Bottom/Left/Right
 */
export enum Direction {
    LEFT,
    RIGHT,
    UP,
    DOWN,
}

export function getReverseDirection(direction: Direction): Direction {
    switch (direction) {
        case Direction.LEFT:
            return Direction.RIGHT;
        case Direction.RIGHT:
            return Direction.LEFT;
        case Direction.UP:
            return Direction.DOWN;
        case Direction.DOWN:
            return Direction.UP;
    }
}
