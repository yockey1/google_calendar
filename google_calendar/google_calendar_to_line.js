function notifyEvent() {
  const calendars = CalendarApp.getAllCalendars();
  const tomorrow = getTomorrowFormatted();

  for (const calendar of calendars) {
    const calendarName = calendarTitleMap[calendar.getId()];
    if (!calendarName) continue;

    const events = calendar.getEventsForDay(getTomorrow());
    if (events.length === 0) continue;

    for (const event of events) {

      /*      
            ○○や△△がイベント名や詳細に含まれるときのみlineに通知したい場合
            const title = event.getTitle();
            const description = event.getDescription() || '';
           console.log(description)
            if (!title.includes('○○') && !description.includes('○○') && !title.includes('△△') && !description.includes('△△')) {
              continue;
            }
      */

      let message = createMessage(event, tomorrow, calendarName);
      console.log(message);
      sendToLine(message);
    }
  }
}
function sendToLine(message) {
  const options = {
    method: 'post',
    headers: { Authorization: `Bearer ${token}` },
    payload: `message=${message}`,
  };

  UrlFetchApp.fetch('https://notify-api.line.me/api/notify', options);
}
function getTomorrow() {
  const dt = new Date();
  dt.setDate(dt.getDate() + 1);
  return dt;
}

function getTomorrowFormatted() {
  const dt = getTomorrow();
  const weekdayIndex = dt.getDay();
  const formattedDate = Utilities.formatDate(dt, 'Asia/Tokyo', `M/d(${WEEKDAY[weekdayIndex]})`);
  return formattedDate;
}

function createMessage(event, tomorrow, calendarName) {
  let title = event.getTitle();
  let time = `時間：${toTimeText(event.getStartTime())} - ${toTimeText(event.getEndTime())}`;
  let location = event.getLocation() ? `場所：${event.getLocation()}\n\n` : '';
  let description = event.getDescription() ? `参考：\n${event.getDescription()}\n\n` : '';
  let text = `明日の${title}の参加可否に変更等ある人はリアクションをお願いします。\n参加👍遅刻😍欠席😭早退😲遅刻かつ早退😆`;

  let attendees = event.getGuestList().filter(function (attendant) {
    return attendant.getGuestStatus() === CalendarApp.GuestStatus.YES;
  }).map(function (attendant) {
    return getDisplayName(attendant.getEmail());
  }).join(',');

  let maybees = event.getGuestList().filter(function (attendant) {
    return attendant.getGuestStatus() === CalendarApp.GuestStatus.MAYBE;
  }).map(function (attendant) {
    return getDisplayName(attendant.getEmail());
  }).join(',');

  let absentees = event.getGuestList().filter(function (attendant) {
    return attendant.getGuestStatus() === CalendarApp.GuestStatus.NO;
  }).map(function (attendant) {
    return getDisplayName(attendant.getEmail());
  }).join(',');

  let invitees = event.getGuestList().filter(function (attendant) {
    return attendant.getGuestStatus() === CalendarApp.GuestStatus.INVITED;
  }).map(function (attendant) {
    return getDisplayName(attendant.getEmail());
  }).join(',');

  function getDisplayName(email) {

    // メールアドレスに応じて表示名を返す
    for (var i = 0; i < memberList.length; i++) {
      if (email === memberList[i].email) {
        return memberList[i].name;
      }
    }
    // 該当するメールアドレスがない場合は空文字を返す
    return `\n + ${ees}`;
  }


  let message1 = [
    `【明日${tomorrow}の予定】\n`,
    `タイトル：${title}\n`,
    `${time}\n`,
    `${location}`,
    `${description}`,
    `${text}`,
  ].join('');

  let message2 = [
    `参加: ${attendees}`,
    `欠席: ${absentees}`,
    `未定: ${maybees}`,
    `未回答: ${invitees}`
  ].join('\n');

  let message = `<${calendarName}>\n\n${message1}\n\n${message2}`;

  if (calendarName) {
    return message;
  }

  function toTimeText(str) {
    return Utilities.formatDate(str, 'Asia/Tokyo', 'HH:mm');
  }
}
