(function () {
    const listEl = document.getElementById('shows-list');
    const emptyEl = document.getElementById('shows-empty');
    const sheetId = window.GOOGLE_SHOWS_SHEET_ID || '';

    if (!listEl || !sheetId) {
        if (emptyEl) emptyEl.hidden = false;
        return;
    }

    const sheetUrl =
        'https://docs.google.com/spreadsheets/d/' +
        encodeURIComponent(sheetId) +
        '/gviz/tq?tqx=out:json';

    fetch(sheetUrl)
        .then(function (res) {
            if (!res.ok) throw new Error('Could not load shows');
            return res.text();
        })
        .then(parseGvizResponse)
        .then(function (rows) {
            const shows = rows
                .map(rowToShow)
                .filter(Boolean)
                .filter(isDisplayed)
                .filter(isUpcoming)
                .sort(function (a, b) {
                    return a.date - b.date;
                });

            if (!shows.length) {
                if (emptyEl) emptyEl.hidden = false;
                return;
            }

            if (emptyEl) emptyEl.hidden = true;
            listEl.hidden = false;
            listEl.innerHTML = '';
            shows.forEach(function (show) {
                listEl.appendChild(renderShow(show));
            });
        })
        .catch(function (err) {
            console.error(err);
            if (emptyEl) emptyEl.hidden = false;
        });

    function parseGvizResponse(text) {
        var match = text.match(/setResponse\(([\s\S]*)\);?\s*$/);
        if (!match) throw new Error('Invalid sheet response');
        var payload = JSON.parse(match[1]);
        return payload.table.rows || [];
    }

    function rowToShow(row) {
        var cells = row.c || [];
        var date = parseSheetDate(cells[0]);
        if (!date) return null;

        return {
            date: date,
            venue: cellText(cells[1]),
            city: cellText(cells[2]),
            ticketUrl: cellText(cells[3]),
            status: cellText(cells[4]).toLowerCase(),
            display: cellText(cells[5]).toLowerCase(),
            doors: cellText(cells[6]),
        };
    }

    function cellText(cell) {
        if (!cell) return '';
        if (cell.f != null && String(cell.f).trim() !== '') return String(cell.f).trim();
        if (cell.v != null && String(cell.v).trim() !== '') return String(cell.v).trim();
        return '';
    }

    function parseSheetDate(cell) {
        if (!cell) return null;
        if (cell.f) {
            var fromFormatted = new Date(cell.f + 'T12:00:00');
            if (!isNaN(fromFormatted.getTime())) return fromFormatted;
        }
        if (cell.v && String(cell.v).indexOf('Date(') === 0) {
            var parts = String(cell.v).replace(/^Date\(/, '').replace(/\)$/, '').split(',');
            if (parts.length >= 3) {
                return new Date(Number(parts[0]), Number(parts[1]), Number(parts[2]), 12);
            }
        }
        return null;
    }

    function isDisplayed(show) {
        return show.display === 'yes' || show.display === 'true' || show.display === '1';
    }

    function isUpcoming(show) {
        var today = new Date();
        today.setHours(0, 0, 0, 0);
        var showDay = new Date(show.date);
        showDay.setHours(0, 0, 0, 0);
        return showDay >= today;
    }

    function formatDate(date) {
        return date.toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
        });
    }

    function isInstagramUrl(url) {
        return /instagram\.com/i.test(url || '');
    }

    function getLinkButtonText(show) {
        var status = show.status;
        if (status === 'dm') {
            return 'DM for address';
        }
        if (status === 'door' || status === 'flyer') {
            return 'Flyer';
        }
        if (status === 'on sale') {
            return 'Tickets';
        }
        if (isInstagramUrl(show.ticketUrl)) {
            return 'Flyer';
        }
        return 'Tickets';
    }

    function getTicketDisplay(show) {
        var status = show.status;
        var url = show.ticketUrl;

        if (status === 'cancelled') {
            return { meta: ['Cancelled'], link: null };
        }
        if (status === 'sold out') {
            return { meta: ['Sold out'], link: null };
        }
        if (status === 'dm') {
            if (url) {
                return { meta: [], link: { href: url, text: getLinkButtonText(show) } };
            }
            return { meta: ['DM for address'], link: null };
        }
        if (url) {
            var meta = [];
            if (status === 'door') {
                meta.push('At the door');
            }
            return { meta: meta, link: { href: url, text: getLinkButtonText(show) } };
        }
        if (status === 'door') {
            return { meta: ['At the door'], link: null };
        }
        if (status === 'tba' || status === 'on sale') {
            return { meta: ['TBA'], link: null };
        }
        return { meta: [], link: null };
    }

    function renderShow(show) {
        var item = document.createElement('li');
        item.className = 'shows-item';

        var dateEl = document.createElement('p');
        dateEl.className = 'shows-item__date';
        dateEl.textContent = formatDate(show.date);
        item.appendChild(dateEl);

        var rowEl = document.createElement('div');
        rowEl.className = 'shows-item__row';

        var venueEl = document.createElement('p');
        venueEl.className = 'shows-item__venue';
        venueEl.textContent = show.venue;
        rowEl.appendChild(venueEl);

        if (show.city) {
            var cityEl = document.createElement('p');
            cityEl.className = 'shows-item__city';
            cityEl.textContent = show.city;
            rowEl.appendChild(cityEl);
        }

        item.appendChild(rowEl);

        var hasTime = show.doors && show.doors.toLowerCase() !== 'tbd';
        var ticket = getTicketDisplay(show);
        var statusLines = ticket.meta;

        if (hasTime || statusLines.length || ticket.link) {
            var footerEl = document.createElement('div');
            footerEl.className = 'shows-item__footer';

            if (hasTime || statusLines.length) {
                var metaBlock = document.createElement('div');
                metaBlock.className = 'shows-item__meta-block';

                if (hasTime) {
                    var timeEl = document.createElement('p');
                    timeEl.className = 'shows-item__time';
                    timeEl.textContent = show.doors;
                    metaBlock.appendChild(timeEl);
                }

                statusLines.forEach(function (line) {
                    var statusEl = document.createElement('p');
                    statusEl.className = 'shows-item__status';
                    statusEl.textContent = line;
                    metaBlock.appendChild(statusEl);
                });

                footerEl.appendChild(metaBlock);
            }

            if (ticket.link) {
                var link = document.createElement('a');
                link.className = 'shows-item__tickets';
                link.href = ticket.link.href;
                link.target = '_blank';
                link.rel = 'noopener noreferrer';
                link.textContent = ticket.link.text;
                footerEl.appendChild(link);
            }

            item.appendChild(footerEl);
        }

        return item;
    }
})();
