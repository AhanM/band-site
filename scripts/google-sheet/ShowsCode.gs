/**
 * Shows sheet (optional Apps Script — not required if the sheet is public)
 *
 * Sheet: https://docs.google.com/spreadsheets/d/1dcLfMqAUugD-Nwj8vtEszIh290NsMa1wsPISGxEeSwM/
 *
 * The site reads shows via Google's public gviz JSON feed when
 * GOOGLE_SHOWS_SHEET_ID is set in config.js. Keep sharing:
 *   Anyone with the link → Viewer
 *
 * Columns: Date | Venue | City | Ticket URL | Status | Display | Doors
 *
 * Status values (column E):
 *   on sale   — ticket link; button says "Tickets"
 *   door      — pay at the door; link is usually a flyer/IG; button says "Flyer"
 *   flyer     — promo/flyer link only; button says "Flyer"
 *   dm        — house show; button says "DM for address" if URL set
 *   tba       — no link yet
 *   sold out | cancelled
 */

var SHOWS_SPREADSHEET_ID = '1dcLfMqAUugD-Nwj8vtEszIh290NsMa1wsPISGxEeSwM';

function doGet() {
  var sheet = SpreadsheetApp.openById(SHOWS_SPREADSHEET_ID).getSheets()[0];
  var values = sheet.getDataRange().getValues();
  var headers = values.shift();
  var shows = values.map(function (row) {
    var obj = {};
    headers.forEach(function (h, i) {
      obj[String(h).toLowerCase().replace(/\s+/g, '_')] = row[i];
    });
    return obj;
  });
  return ContentService.createTextOutput(JSON.stringify({ ok: true, shows: shows }))
    .setMimeType(ContentService.MimeType.JSON);
}
