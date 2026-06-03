/**
 * Daisy's Room sign-up form → Google Sheet
 *
 * Sheet: https://docs.google.com/spreadsheets/d/12aKUx8iQupdmY2fnE96FmNcsOpqAAaiMylFwjSESs8w/
 *
 * Setup:
 * 1. Open that spreadsheet → Extensions → Apps Script
 * 2. Paste this file (replace any default code), Save
 * 3. Deploy → New deployment → Web app
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web app URL (ends in /exec) into config.js → GOOGLE_SHEET_URL
 */

var SPREADSHEET_ID = '12aKUx8iQupdmY2fnE96FmNcsOpqAAaiMylFwjSESs8w';

function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);

  try {
    var body = {};
    if (e.postData && e.postData.contents) {
      body = JSON.parse(e.postData.contents);
    } else if (e.parameter) {
      body = e.parameter;
    }

    var sheet = SpreadsheetApp.openById(SPREADSHEET_ID).getSheets()[0];

    if (sheet.getLastRow() === 0) {
      sheet.appendRow([
        'Timestamp',
        'Full Name',
        'Email',
        'Phone',
        'Country',
        'Email Consent',
        'List',
      ]);
    }

    sheet.appendRow([
      new Date(),
      body.full_name || '',
      body.email || '',
      body.phone || '',
      body.country || '',
      body.email_consent === 'yes' ? 'Yes' : 'No',
      body.list || '',
    ]);

    return ContentService.createTextOutput(
      JSON.stringify({ ok: true })
    ).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(
      JSON.stringify({ ok: false, error: String(error) })
    ).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}

function doGet() {
  return ContentService.createTextOutput(
    "Daisy's Room signup endpoint is running."
  ).setMimeType(ContentService.MimeType.TEXT);
}
