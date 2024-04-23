function getEvents() {
  deleteUnusedSheets(); // 未使用のシートを削除
  var mySheet = prepareSheet(); // シートを取得・準備
  var startDate = new Date();
  startDate.setDate(startDate.getDate() - 2);
  startDate.setHours(0, 0, 0, 0);
  var endDate = new Date();
  endDate.setDate(endDate.getDate() + 90);
  endDate.setHours(23, 59, 59, 999);
  var calendars = CalendarApp.getAllCalendars();
  var headers = createHeaders(); // ヘッダー行を作成
  mySheet.appendRow(headers);
  var memberNames = extractMemberNames(); // メンバー名を抽出
  var headerRange = mySheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");
  processCalendarEvents(calendars, mySheet, startDate, endDate, memberNames); // カレンダーイベントを処理
  mySheet.setFrozenColumns(1);
  mySheet.setFrozenRows(1);
}

// 未使用のシートを削除 // ○○や△△と名づけられたシート以外を削除
function deleteUnusedSheets() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();
  for (var i = sheets.length - 1; i >= 0; i--) {
    var sheet = sheets[i];
    if (sheet.getName() !== "○○" && sheet.getName() !== "△△") {
      spreadsheet.deleteSheet(sheet);
    }
  }
}

// シートを取得・準備
function prepareSheet() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var mySheet = spreadsheet.getActiveSheet();
  mySheet.clearContents();
  mySheet.clearFormats();
  return mySheet;
}

// ヘッダー行を作成
function createHeaders() {
  var headers = ["イベントタイトル"];
  for (var i = 0; i < memberList.length; i++) {
    headers.push(memberList[i].name);
  }
  return headers;
}

// メンバー名を抽出
function extractMemberNames() {
  var memberNames = [];
  for (var i = 0; i < memberList.length; i++) {
    memberNames.push(memberList[i].name);
  }
  return memberNames;
}

// カレンダーイベントを処理
function processCalendarEvents(calendars, mySheet, startDate, endDate, memberNames) {
  for (var calendar of calendars) {
    var myEvents = calendar.getEvents(startDate, endDate);
    for (var evt of myEvents) {
      var rowData = prepareRowData(evt, memberNames);
      mySheet.appendRow(rowData);
    }
  }
}

// 行データを準備
function prepareRowData(evt, memberNames) {
  var startTime = evt.getStartTime();
  var dayOfWeek = WEEKDAY[startTime.getDay()];
  var rowData = [
    startTime.getMonth() + 1 + "/" + startTime.getDate() + "(" + dayOfWeek + ")" + " " + evt.getTitle(),
  ];
  for (var i = 0; i < memberNames.length; i++) {
    rowData.push("");
  }
  var guests = evt.getGuestList(true);
  for (var guest of guests) {
    var email = guest.getEmail();
    var displayName = getDisplayName(email);
    var status = guest.getGuestStatus();
    updateRowDataWithGuestStatus(rowData, memberNames, displayName, status);
  }
  return rowData;
}

// ゲストのステータスを元に行データを更新
function updateRowDataWithGuestStatus(rowData, memberNames, displayName, status) {
  if (displayName && memberNames.includes(displayName)) {
    switch (status) {
      case CalendarApp.GuestStatus.YES:
        rowData[memberNames.indexOf(displayName) + 1] = "〇";
        break;
      case CalendarApp.GuestStatus.NO:
        rowData[memberNames.indexOf(displayName) + 1] = "×";
        break;
      case CalendarApp.GuestStatus.MAYBE:
        rowData[memberNames.indexOf(displayName) + 1] = "?";
        break;
      case CalendarApp.GuestStatus.INVITED:
        rowData[memberNames.indexOf(displayName) + 1] = "未回答";
        break;
    }
  }
}

// メールアドレスに応じて表示名を取得
function getDisplayName(email) {
  for (var i = 0; i < memberList.length; i++) {
    if (email === memberList[i].email) {
      return memberList[i].name;
    }
  }
  return '';
}
