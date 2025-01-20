/**
 * 判断两个矩形是否相交
 * @param {DOMRect} rect1 - 第一个矩形
 * @param {DOMRect} rect2 - 第二个矩形
 * @returns {boolean} - 如果相交返回 true，否则返回 false
 */
export const isIntersecting = (rect1: DOMRect, rect2: DOMRect) => {
    return !(
        rect1.right < rect2.left ||
        rect1.left > rect2.right ||
        rect1.bottom < rect2.top ||
        rect1.top > rect2.bottom
    );
}

export const clamp = (num: number, min: number, max: number) => {
    return Math.min(Math.max(num, min), max)
}
