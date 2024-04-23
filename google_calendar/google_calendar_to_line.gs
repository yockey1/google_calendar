function notifyEvent() {
  const tomorrow = getTomorrow();
  const formattedTomorrow = getFormattedDate(tomorrow);

  CalendarApp.getAllCalendars().forEach(calendar => {
    const calendarName = calendarTitleMap[calendar.getId()];
    if (!calendarName) return;

    const events = calendar.getEventsForDay(tomorrow);
    if (events.length === 0) return;

    events.forEach(event => {
      // if (shouldNotify(event)) {
        const message = createMessage(event, formattedTomorrow, calendarName);
        console.log(message);
        sendToLine(message);
      // }
    });
  });
}
//○○や△△がイベント名や詳細に含まれるときのみlineに通知したい場合
// function shouldNotify(event) {
//   const title = event.getTitle();
//   const description = event.getDescription() || '';
//   const keywords = ['○○', '△△'];

//   return keywords.some(keyword => title.includes(keyword) || description.includes(keyword));
// }

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

function getFormattedDate(date) {
  const weekdayIndex = date.getDay();
  return Utilities.formatDate(date, 'Asia/Tokyo', `M/d(${WEEKDAY[weekdayIndex]})`);
}

function createMessage(event, tomorrow, calendarName) {
  const title = event.getTitle();
  const time = `時間：${toTimeText(event.getStartTime())} - ${toTimeText(event.getEndTime())}`;
  const location = event.getLocation() ? `場所：${event.getLocation()}\n\n` : '';
  const description = event.getDescription() ? `参考：\n${event.getDescription()}\n\n` : '';
  const text = `明日の${title}の参加可否に変更等ある人はリアクションをお願いします。\n参加👍遅刻😍欠席😭早退😲遅刻かつ早退😆途中不在🙏`;

  const attendees = getAttendees(event, CalendarApp.GuestStatus.YES);
  const maybees = getAttendees(event, CalendarApp.GuestStatus.MAYBE);
  const absentees = getAttendees(event, CalendarApp.GuestStatus.NO);
  const invitees = getAttendees(event, CalendarApp.GuestStatus.INVITED);

  const message1 = [
    `【明日${tomorrow}の予定】\n`,
    `タイトル：${title}\n`,
    `${time}\n`,
    `${location}`,
    `${description}`,
    `${text}`,
  ].join('');

  const message2 = [
    `参加: ${attendees}`,
    `欠席: ${absentees}`,
    `未定: ${maybees}`,
    `未回答: ${invitees}`
  ].join('\n');

  const message = `<${calendarName}>\n\n${message1}\n\n${message2}`;

  return message;
}

function toTimeText(str) {
  return Utilities.formatDate(str, 'Asia/Tokyo', 'HH:mm');
}

function getAttendees(event, status) {
  return event.getGuestList()
    .filter(attendant => attendant.getGuestStatus() === status)
    .map(attendant => getDisplayName(attendant.getEmail()))
    .filter(Boolean)
    .join(',');
}

// メールアドレスに応じて表示名を返す
function getDisplayName(email) {
  const member = memberList.find(member => member.email === email);
  return member ? member.name : '';  //該当するメールアドレスがない場合は空データを返す
}
