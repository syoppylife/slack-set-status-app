# SlackSetStatusApp
 You can set the status by inviting this app to the channel

 このアプリはHeroku上で動作する前提です。
 ローカルで実行する場合はプロキシの設定や.envの追加をしてください。

## Usage

### アプリケーションのサーバーへのデプロイ
- Useage on Heroku
    - Please refer [Deploying to Heroku](https://slack.dev/bolt-js/deployments/heroku)
- Get App Url
    - [Sign in](https://dashboard.heroku.com/apps) and select an application　-> 
Click the Open app button


### Slackアプリケーションの作成
- Go to [Slack API Pages](https://api.slack.com/apps) and Click the Create New App

### Slackアプリケーションの設定
- Features -> OAuth Tokens & Redirect URLs
    - Scopes -> Bot Token Scopes -> Add an OAuth Scope 「commands」
        - Requires 「chat:write」 except for workspaces you own.

    - Redirect URLs -> Set the App Url and Click the Add New Redirect URL
        - For example, Heroku：https://xxx-xxx.herokuapp.com/slack/oauth_redirect
        - [Please check here for details](https://api.slack.com/authentication/oauth-v2)

    - Interactivity & Shortcuts
        - Turn it on and set the Request URL
            - For example, Heroku：https://xxx-xxx.herokuapp.com/slack/events

    - Slash Commands
        - Set the command you like.  But, it can't be handled unless the following is changed.
        ```js
        app.command('/nikoniko', async ({ command, ack, say, respond }) => {
        ```

### Herokuの環境変数の設定
```bash
heroku config:set SLACK_SIGNING_SECRET=<your-signing-secret>
heroku config:set SLACK_BOT_TOKEN=xoxb-<your-bot-token>
heroku config:set SLACK_CLIENT_ID=<your-client-id>
heroku config:set SLACK_CLIENT_SECRET=<your-client-secret>
```

You see Slack API pages, and go to 「Basic Information」and「OAuth & Permissions」-> Bot User OAuth Access Token, It is Starts with 「xoxb-」


### アプリのチャンネルへの招待
- Slackアプリケーションの設定時に既にWorkspaceにインストールされていると思うので、Slackの任意のチャンネル内にて「チャンネル詳細」->「その他」->「アプリを追加する」を選択してアプリを追加します。
![operating](https://raw.githubusercontent.com/wiki/syoppylife/slack-set-status-app/images/operating.gif)
