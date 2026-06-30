// ═══════════════════════════════════════════════════════════════
// PACIFIC ELITE RIDES — Google Apps Script Webhook
// ═══════════════════════════════════════════════════════════════
//
// ІНСТРУКЦІЯ (5 кроків):
//
// 1. Відкрий свою Google Таблицю
// 2. Extensions → Apps Script
// 3. Видали весь код що там є і встав цей файл
// 4. Змін SHEET_ID нижче на ID своєї таблиці
//    (ID — це частина URL між /d/ та /edit:
//     https://docs.google.com/spreadsheets/d/ТУТ_ID/edit)
// 5. Натисни Deploy → New Deployment → Web App
//    - Execute as: Me
//    - Who has access: Anyone
//    → Скопіюй URL що з'явиться — вставиш в booking.html
// ═══════════════════════════════════════════════════════════════

var SHEET_ID = "ТУТ_ВСТАВ_ID_ТАБЛИЦІ"; // ← ЗАМІНИТИ!
var SHEET_NAME = "Bookings";

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var ss = SpreadsheetApp.openById(SHEET_ID);
    var sheet = ss.getSheetByName(SHEET_NAME);

    // Генеруємо ID для нового запису
    var lastRow = sheet.getLastRow();
    var newId = "PER-" + String(lastRow).padStart(3, "0");

    // Додаємо рядок
    sheet.appendRow([
      newId,                           // A: ID
      data.rideDate   || "",           // B: Date
      data.rideTime   || "",           // C: Time
      data.serviceType|| "",           // D: Service
      data.vehicle    || "",           // E: Vehicle
      data.passengers || "",           // F: Pax
      data.flight     || "",           // G: Flight #
      data.clientName || "",           // H: Client Name
      data.clientPhone|| "",           // I: Phone
      data.clientEmail|| "",           // J: Email
      data.pickup     || "",           // K: Pickup
      data.dropoff    || "",           // L: Dropoff
      data.stops      || "",           // M: Stops
      data.payment    || "",           // N: Payment
      "",                              // O: Price (заповниш вручну)
      "New",                           // P: Status (за замовчуванням New)
      data.notes      || "",           // Q: Notes
    ]);

    // Підсвічуємо новий рядок золотим щоб було помітно
    var newRow = sheet.getLastRow();
    sheet.getRange(newRow, 1, 1, 17)
      .setBackground("#FDF6E3")
      .setFontWeight("bold");

    // Відповідь
    return ContentService
      .createTextOutput(JSON.stringify({ status: "ok", id: newId }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

// Тест — можна запустити вручну в Apps Script щоб перевірити
function testInsert() {
  var fake = {
    postData: {
      contents: JSON.stringify({
        rideDate: "2026-07-10",
        rideTime: "10:00 AM",
        serviceType: "Airport Transfer",
        vehicle: "Suburban",
        passengers: "2",
        flight: "AA123",
        clientName: "Test Client",
        clientPhone: "(619) 555-0000",
        clientEmail: "test@test.com",
        pickup: "SAN Airport",
        dropoff: "La Jolla, CA",
        stops: "",
        payment: "Card",
        notes: "Test booking"
      })
    }
  };
  var result = doPost(fake);
  Logger.log(result.getContent());
}
