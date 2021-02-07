const { App, ExpressReceiver } = require('@slack/bolt');

// リダイレクトなどでHTTP GETを使うため
const receiver = new ExpressReceiver({
  signingSecret: process.env.SLACK_SIGNING_SECRET
});
const app_express = receiver.app;

// OAuth認証の結果から取得したトークンなどを保持する
const user = {};
// Use handle redirects OAuth 
const REDIRECT_URI = "https://xxx-xxx.herokuapp.com/slack/oauth_redirect"

// Initializes your app with your bot token and signing secret
const app = new App({
  token: process.env.SLACK_BOT_TOKEN,
  receiver: receiver
});

// healtcheck
app_express.get("/", (_req, res) => {
  res.status(200).send("OK");
});

// Slack api の　OAuth & Permissions -> Redirect URLs に設定したパス
app_express.get("/slack/oauth_redirect", async (req, res) => {

  // doc: https://api.slack.com/methods/oauth.v2.access
  const data = await app.client.oauth.access({
    client_id: process.env.SLACK_CLIENT_ID,
    client_secret: process.env.SLACK_CLIENT_SECRET,
    code: req.query.code
  });

  // 本来はDBなどで管理すべき値。このアプリでは変数に入れるのでサーバーを再起動したら消える
  user[data.user_id] = {
    access_token: data.access_token,
    team_name: data.team_name
  };

  // 201 Created 
  res.status(201).send("Saved your token.");

});

app.command('/nikoniko', async ({ command, ack, say, respond }) => {
  await ack();
  await say({
    /* 
      Block Kit Builderで作ったものをほぼそのまま貼り付け
      アイコンはどの環境でも存在するものにするので任意でworkspace内で使いたいものを設定する
    */

    blocks: [
      {
        "type": "section",
        "text": {
          "type": "plain_text",
          "text": "今日の調子は?",
          "emoji": true
        }
      },
      {
        "type": "divider"
      },
      {
        "type": "actions",
        "elements": [
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":1:絶好調",
              "emoji": true
            },
            "value": ":1:",
            "action_id": "button_click1"
          }
          ,
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":2:好調",
              "emoji": true
            },
            "value": ":2:",
            "action_id": "button_click2"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":3:普通",
              "emoji": true
            },
            "value": ":3:",
            "action_id": "button_click3"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":4:不調",
              "emoji": true
            },
            "value": ":4:",
            "action_id": "button_click4"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":5:絶不調",
              "emoji": true
            },
            "value": ":5:",
            "action_id": "button_click5"
          },
          {
            "type": "button",
            "text": {
              "type": "plain_text",
              "text": ":6:死にそう",
              "emoji": true
            },
            "value": ":6:",
            "action_id": "button_click6"
          },
        ]
      },
      {
        "type": "section",
        "text": {
          "type": "mrkdwn",
          "text": "Set token for status change."
        },
        "accessory": {
          "type": "button",
          "text": {
            "type": "plain_text",
            "text": "Click Me",
            "emoji": true
          },
          "value": "add_token",
          "url": `https://slack.com/oauth/authorize?scope=identify+users.profile%3Awrite&client_id=${process.env.SLACK_CLIENT_ID}&redirect_uri=${REDIRECT_URI}`
        }
      }
    ]
  });
});

// どの調子のボタンを押してもここでハンドリングする
app.action(/button_click(1|2|3|4|5|6)/, async ({ action, body, client, ack, say }) => {
  // Acknowledge the action
  await ack();
  try {
    // OAuth認証の結果から取得したトークンを使って、選んだアイコンをステータスに設定する
    if(user[body.user.id]?.access_token) {
      // Call users.profile.set with the built-in client
      await client.users.profile.set({
        token: user[body.user.id]?.access_token,
        profile: JSON.stringify({
          status_emoji: action.value
        }),
      });
      await say(`<@${body.user.id}> Set the status icon to  ${action.value}`);
    } else {
      await say(`I'm sorry I don't have <@${body.user.id}> token`);
    }
  }
  catch (error) {
    console.error(error);
  }
});

(async () => {
  // Start your app
  await app.start(process.env.PORT || 3000);

  console.log('⚡️ Bolt app is running!');
})();