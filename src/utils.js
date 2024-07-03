export function triggerPixel(url) {
    return new Promise((resolve) => {
        const img = new Image();
        img.addEventListener('load', resolve);
        img.addEventListener('error', resolve);
        img.src = url;
    })
}

export function triggerIframe(url) {
    let frame = document.createElement('iframe');
    Object.entries({
        frameborder: 0,
        scrolling: 'no',
        marginheight: 0,
        marginwidth: 0,
        TOPMARGIN: 0,
        LEFTMARGIN: 0,
        allowtransparency: 'true',
        width: 0,
        height: 0,
    }).forEach(([attr, val]) => {
        frame.setAttribute(attr, val);
    });
    frame.id = `sync_${Date.now()}`;
    frame.src = url;
    return new Promise((resolve) => {
        frame.onload = resolve;
        document.body.appendChild(frame);
    })
}

export function isValidURL(url) {
    try {
        new URL(url);
        return true;
    } catch (e) {
        return false;
    }
}
