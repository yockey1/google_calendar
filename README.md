# google_calendar

all of the codes are written in google app script
For details on use, check wiki

## google_calendar_to_line.js
次の日のgoogle calendarの予定を取得して、前日にlineに通知する。（gasでトリガーを設定する必要あり）
誰が参加し不参加であるかも同時に通知する。

## google_calendar_to_spreadsheet.js
2日前から、30日後までの予定と、それぞれの予定に対する出欠状況をスプレッドシートに一覧表示する
app scriptでトリガーを設定したら、一時間ごとなどで自動更新ができる

## variable.js
メンバーの名簿、lineのapiトークンをここに書く
