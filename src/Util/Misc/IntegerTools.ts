
// convert two shorts into an integer id
export function makeInt(x:number, y:number):number {
    //0xFFFF = 65535
    return (x << 16) | (y & 0xFFFF);
}
