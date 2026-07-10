// ═══════════════════════════════════════════════════════════════
// PACIFIC ELITE RIDES — Google Apps Script Webhook
// ═══════════════════════════════════════════════════════════════
// Встав ID своєї таблиці нижче (між /d/ та /edit в URL)

var SHEET_ID   = "18_CzYKm24OGdjvnFqixjknvNNzbQksBnZr6Yyv1KKjQ";
var SHEET_NAME = "Bookings";

// ── Отримує запит з сайту і додає рядок ──────────────────────
function doPost(e) {
  try {
    var data  = JSON.parse(e.postData.contents);
    var sheet = getSheet();
    if (!sheet) return error("Sheet not found: " + SHEET_NAME);

    var id = "PER-" + String(sheet.getLastRow()).padStart(3, "0");

    sheet.appendRow([
      id,
      data.rideDate    || "",
      data.rideTime    || "",
      data.serviceType || "",
      data.vehicle     || "",
      data.passengers  || "",
      data.flight      || "",
      data.clientName  || "",
      data.clientPhone || "",
      data.clientEmail || "",
      data.pickup      || "",
      data.dropoff     || "",
      data.stops       || "",
      data.payment     || "",
      "",
      "New",
      data.notes       || "",
    ]);

    // Підсвічуємо новий рядок золотим
    var row = sheet.getLastRow();
    sheet.getRange(row, 1, 1, 17).setBackground("#FDF6E3");

    return ok({ id: id });
  } catch(err) {
    return error(err.toString());
  }
}

// ── Тест: запусти вручну щоб перевірити скрипт ───────────────
function testInsert() {
  var ss     = SpreadsheetApp.openById(SHEET_ID);
  var sheets = ss.getSheets().map(function(s) { return s.getName(); });
  Logger.log("Аркуші в таблиці: " + JSON.stringify(sheets));

  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    Logger.log('ПОМИЛКА: аркуш "' + SHEET_NAME + '" не знайдено!');
    Logger.log('Доступні аркуші: ' + JSON.stringify(sheets));
    return;
  }

  sheet.appendRow([
    "PER-TEST",
    "2026-07-05", "10:00 AM",
    "Airport Transfer", "Suburban", "2", "AA1234",
    "Test Client", "(619) 555-0000", "test@test.com",
    "SAN Airport", "La Jolla, CA", "", "Card", "75", "New", "Тестовий запис"
  ]);

  var row = sheet.getLastRow();
  sheet.getRange(row, 1, 1, 17).setBackground("#FDF6E3");

  Logger.log("УСПІХ! Рядок додано у рядок #" + row);
}

// ── Хелпери ───────────────────────────────────────────────────
function getSheet() {
  return SpreadsheetApp.openById(SHEET_ID).getSheetByName(SHEET_NAME);
}

function ok(data) {
  return ContentService
    .createTextOutput(JSON.stringify(Object.assign({ status: "ok" }, data)))
    .setMimeType(ContentService.MimeType.JSON);
}

function error(msg) {
  return ContentService
    .createTextOutput(JSON.stringify({ status: "error", message: msg }))
    .setMimeType(ContentService.MimeType.JSON);
}
