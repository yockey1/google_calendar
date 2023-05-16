function getEvents() {

  createBlankSheetAndDeleteOthers();  // シートを削除

  var mySheet = SpreadsheetApp.getActiveSheet(); // シートを取得  
  mySheet.clearContents();
  mySheet.clearFormats();

  var startDate = new Date(); // 開始日
  startDate.setDate(startDate.getDate() - 2); // 2日前の日付を設定
  startDate.setHours(0, 0, 0, 0);

  var endDate = new Date(); // 終了日
  endDate.setDate(endDate.getDate() + 30); // 30日後の日付を設定
  endDate.setHours(23, 59, 59, 999);

  var calendars = CalendarApp.getAllCalendars();

  var member = [];

  for (var i = 0; i < memberList.length; i++) {
    member.push(memberList[i].name);
  }

  var headers = [
    "イベントタイトル",
  ];
  for (var i = 0; i < member.length; i++) {
    headers.push(member[i]);
  }

  mySheet.appendRow(headers);

  var headerRange = mySheet.getRange(1, 1, 1, headers.length);
  headerRange.setFontWeight("bold");

  for (var calendar of calendars) {
    var myEvents = calendar.getEvents(startDate, endDate);

    for (var evt of myEvents) {
      let startTime = evt.getStartTime();
      let dayOfWeek = WEEKDAY[startTime.getDay()];
      let rowData = [
        startTime.getMonth() + 1 + "/" + startTime.getDate() + "(" + dayOfWeek + ")" + " " + evt.getTitle(),
      ];
      for (var i = 0; i < member.length; i++) {
        rowData.push("");
      }


      let guests = evt.getGuestList();
      for (var guest of guests) {
        var email = guest.getEmail();
        var displayName = getDisplayName(email);
        var status = guest.getGuestStatus();

        if (displayName) {
          switch (status) {
            case CalendarApp.GuestStatus.YES:
              if (member.includes(displayName)) {
                rowData[member.indexOf(displayName) + 1] = "〇";
              }
              break;
            case CalendarApp.GuestStatus.NO:
              if (member.includes(displayName)) {
                rowData[member.indexOf(displayName) + 1] = "×";
              }
              break;
            case CalendarApp.GuestStatus.MAYBE:
              if (member.includes(displayName)) {
                rowData[member.indexOf(displayName) + 1] = "?";
              }
              break;
            case CalendarApp.GuestStatus.INVITED:
              if (member.includes(displayName)) {
                rowData[member.indexOf(displayName) + 1] = "?";
              }
              break;
          }
        }
      }
      mySheet.appendRow(rowData);
    }
  }
  mySheet.setFrozenColumns(1);
  mySheet.setFrozenRows(1);

  //var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();  
  //var commentSheet = spreadsheet.insertSheet('comment');
}

function getDisplayName(email) {

  // メールアドレスに応じて表示名を返す
  for (var i = 0; i < memberList.length; i++) {
    if (email === memberList[i].email) {
      return memberList[i].name;
    }
  }
  // 該当するメールアドレスがない場合は空文字を返す
  return '';
}

// ○○と名づけられたシート以外を削除
function createBlankSheetAndDeleteOthers() {
  var spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  var sheets = spreadsheet.getSheets();

  for (var i = sheets.length - 1; i >= 0; i--) {
    var sheet = sheets[i];
    if (sheet.getName() !== "○○") {
      spreadsheet.deleteSheet(sheet);
    }
  }

}
