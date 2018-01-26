"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function throttle(func, delay, { leading = true, trailing = true } = {}) {
    let lastExec = -(delay + 1);
    let timeout;
    function wrapper(...args) {
        const elapsed = Number(new Date()) - lastExec;
        const exec = trail => () => {
            lastExec = trail ? -(delay + 1) : Number(new Date());
            func.apply(this, args);
            // timeout = null;
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        if (elapsed > delay) {
            if (leading) {
                exec(false)();
            }
            else {
                timeout = setTimeout(exec(true), delay);
            }
        }
        else if (trailing) {
            timeout = setTimeout(exec(true), delay - elapsed);
        }
    }
    return wrapper;
}
exports.default = throttle;
//# sourceMappingURL=throttle.js.map