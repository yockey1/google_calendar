//取得したいgooglecalendarのメールアドレス、カレンダーの名前
const calendarTitleMap = {
    [PropertiesService.getScriptProperties().getProperty('your_name')]: "○○のカレンダー",
  };
  
  //line_groupが変わったときのみ変更
  const token = PropertiesService.getScriptProperties().getProperty('line_api_token');
  
  //メンバーが変わったときのみ変更
  const memberList = [
      {email: PropertiesService.getScriptProperties().getProperty('name'), name: 'name'},
    ];
