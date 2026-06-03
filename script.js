(function () {
    const listenWrap = document.querySelector('.listen-wrap');
    if (!listenWrap) return;

    const trigger = listenWrap.querySelector('.listen-trigger');
    const menu = listenWrap.querySelector('.listen-menu');
    const canHover = window.matchMedia('(hover: hover) and (pointer: fine)').matches;

    let openByClick = false;

    function setOpen(open) {
        openByClick = open;
        listenWrap.classList.toggle('is-open', open);
        trigger.setAttribute('aria-expanded', String(open));
    }

    function setHover(hover) {
        listenWrap.classList.toggle('is-hover', hover);
        if (canHover) {
            trigger.setAttribute('aria-expanded', String(hover || openByClick));
        }
    }

    if (canHover) {
        listenWrap.addEventListener('mouseenter', () => setHover(true));
        listenWrap.addEventListener('mouseleave', () => {
            setHover(false);
            setOpen(false);
        });
    }

    trigger.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const next = !openByClick;
        setOpen(next);
        if (!canHover) {
            listenWrap.classList.toggle('is-hover', next);
        }
    });

    document.addEventListener('click', (e) => {
        if (!listenWrap.contains(e.target)) {
            setHover(false);
            setOpen(false);
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            setHover(false);
            setOpen(false);
            trigger.focus();
        }
    });

    menu.addEventListener('click', (e) => {
        const link = e.target.closest('a[href="#"]');
        if (link) e.preventDefault();
    });
})();
