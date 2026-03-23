"use client";

import React from 'react';

export const OVERLAY_CONTENTS: Record<string, { title: string; body: React.ReactNode }> = {
  about: {
    title: "About",
    body: (
      <div className="space-y-4 font-normal">
        <p>
          「Cafe Timer」は、ゲーム『ブルーアーカイブ』のカフェ機能を支援する非公式ファンメイドツールです。<br />
          生徒さんのカフェ訪問タイミングを通知でお知らせし、先生方の業務をサポートします。
        </p>
        <h2 className="text-xl font-bold mt-8 mb-4 text-foreground">主な機能</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>生徒さんの再タップ可能タイミングのカウントダウン</li>
          <li>生徒さんの訪問タイミング（4:00/16:00 JST）のカウントダウン</li>
          <li>招待券のクールタイム管理</li>
          <li>タップ履歴のカレンダー表示</li>
        </ul>
        <h2 className="text-xl font-bold mt-8 mb-4 text-foreground">対応プラットフォーム</h2>
        <p>
          PCおよびスマートフォンの最新ブラウザで動作します。<br />
          PWAに対応しているため、ホーム画面に追加してアプリのように使うことができます。
        </p>
      </div>
    ),
  },
  guide: {
    title: "使い方ガイド",
    body: (
      <div className="space-y-6 font-normal">
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟦 カフェタイマーの使い方
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>Next Tap:</strong> 生徒さんと触れ合うことができるまでの時間をカウントダウンします。「Tap」ボタンを押すと履歴が記録され、カウントダウンが始まります。
            </li>
            <li>
              <strong>Next Call:</strong> 生徒さんを招待するチケット（招待券）のクールタイムを管理します。使用した時刻にボタンを押すと、次の使用可能時刻までのカウントダウンが始まります。
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟨 Tap履歴の使い方
          </h2>
          <ul className="list-disc pl-5 space-y-2">
            <li>
              <strong>SAVE IMAGE:</strong> Tap履歴を月ごとに画像で保存できます。SNSへの投稿などにご利用いただけます。
            </li>
          </ul>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟦 履歴と同期
          </h2>
          <p>
            Discordログインにより、タップ履歴がサーバーに保存されます。
            同じアカウントでログインすると、PCやスマホなど異なる端末でも同じデータを共有・同期できます。
          </p>
        </section>
        <section>
          <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟨 通知設定について
          </h2>
          <p className="mb-4">
            メニュー内の「通知設定」から、生徒さんと触れ合える時刻をプッシュ通知でお知らせします。
            4:00/16:00 JSTについては、時刻が固定されている&負荷軽減のため、通知を行いません。<br />
          </p>
          <div className="bg-blue-500/10 border border-blue-500/50 rounded-lg p-4 text-sm mb-4">
            <p className="font-bold mb-2">ℹ️ お願い</p>
            <p>
              通知登録されている端末数が増加すると、運営者の大人のカードの出番がやってきてしまいます。
            </p>
            <p className="mt-1">
              通知登録は1ユーザーあたり2端末までを目安とし、通知が不要な端末は都度登録解除していただくよう、何卒ご協力をお願いいたします。
            </p>
          </div>
          <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-4 text-sm">
            <p className="font-bold mb-2">⚠️ 通知設定がうまくいかない場合</p>
            <p>
              AdGuard や uBlock Origin などの広告ブロック（コンテンツブロッカー）機能を使用している場合、通知システムが「トラッキング」と誤認され、許可ダイアログが表示されないことがあります。
            </p>
            <p className="mt-1">
              通知設定を行う際は、このサイト（ドメイン）を許可リストに追加するか、一時的に機能をOFFにしてからページを再読み込み・通知設定を行ってください。
            </p>
          </div>
        </section>
      </div>
    ),
  },
  faq: {
    title: "FAQ",
    body: (
      <div className="space-y-4 font-normal">
        <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟦 機能
        </h2>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: 記録を間違えてタップしてしまいました。削除できますか？</h3>
          <p className="font-normal text-sm">
            A: Tap履歴を個別に編集・削除することはできません。データベースへの接続増加を伴うため、現時点では実装予定はありません。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: 追加招待券には対応しますか？</h3>
          <p className="font-normal text-sm">
            A: 今のところは対応していません。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: ゲーム内でタップしたら自動で反映されますか？</h3>
          <p className="font-normal text-sm">
            A: 本サイトはゲーム内のデータに一切アクセスしていません。ゲーム内カフェでのタップ後は、こちらでも手動でTapボタンを押してください。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: Tap履歴のエクスポートはできますか？</h3>
          <p className="font-normal text-sm">
            A: テキストデータなどによるエクスポートは、今のところは対応していません。SNSなどへの共有は、月ごとの画像エクスポート機能をご使用ください。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: The history calendar doesn't match the dates I actually tapped.</h3>
          <p className="font-normal text-sm">
            A: The historical calendar considers the period from 4:00 AM to 3:59 AM the following day (Japan Standard Time) as one day. If you reside in a country using a time zone different from UTC+9, please understand this may not match the actual date you use.</p>
        </div>

        <h2 className="text-xl font-bold mb-3 text-foreground border-b border-muted pb-2">
            🟨 システム
        </h2>
        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: オフラインでも利用できますか？</h3>
          <p className="font-normal text-sm">
            A: 利用できません。インターネットに接続が必要です。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: ゲーム内部のデータを使用していますか？</h3>
          <p className="font-normal text-sm">
            A: 本サイトはゲーム「ブルーアーカイブ」内のいかなるアセットも使用していません。また、ゲームデータにもアクセスしていませんので、本サイトがゲーム内のアカウントに影響を与えることはありません。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: アプリを閉じてもタイマー・チケットは維持されますか？</h3>
          <p className="font-normal text-sm">
            A: はい、維持されます。時間はサーバー側に保存されているため、ブラウザを閉じたり、別の端末からアクセスしたりしても、最新の状態が反映されます。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: データのバックアップは必要ですか？</h3>
          <p className="font-normal text-sm">
            A: ログインに使用しているDiscordアカウントに紐づいてクラウド上に保存されるため、ログアウトしてもデータが消えることはありません。ただし、データの永久保存については保証しておりませんので、各自で別途記録しておくことをおすすめします。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: 複数の端末で同時に使えますか？</h3>
          <p className="font-normal text-sm">
            A: 複数端末でお使いいただけますが、複数端末での同時操作はデータの不整合を引き起こす可能性があります。データの整合性を保つために、他方の端末では再読み込みを行ってから操作を開始してください。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: 1つの端末で複数アカウントを管理できますか？</h3>
          <p className="font-normal text-sm">
            A: 可能ですが、本サイトはアカウントを切り替えて使うシステムを実装していませんので、都度ログアウト・ログインが必要となります。また、通知機能は端末ごとに管理されており、1つの端末につき1つのアカウントのみ通知を受信できますのでご了承ください。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: このサービスは無料で使えますか？</h3>
          <p className="font-normal text-sm">
            A: はい、すべての機能を無料でご利用いただけます。ただし、個人開発のサービスであるため、予告なく仕様変更やサービス停止を行う可能性がある点はあらかじめご了承ください。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: 通知が届きません。</h3>
          <p className="font-normal text-sm">
            A: ブラウザの設定で通知が「許可」になっているかご確認ください。また、本サイトの通知設定をやり直してみてください（使い方ガイドのページも参照）。ご利用の端末に起因する通知の不着は、申し訳ありませんが対応いたしかねます。利用規約にもある通り、通知は必ず届くことを保証しておりません。</p>
        </div>

        <div className="flex flex-col gap-1">
          <h3 className="font-bold text-foreground">
            Q: Discord以外のログイン方法はありますか？</h3>
          <p className="font-normal text-sm">
            A: 現在はDiscord認証のみに対応しています。本サイトはアカウントを切り替えて使用する設計になっていないため、他の認証システムを導入する予定もありません。</p>
        </div>
      </div>
    ),
  },
  terms: {
    title: "利用規約",
    body: (
      <div className="space-y-4 font-normal text-sm">
        <p>この利用規約は、本ウェブサイト上で提供するサービス（以下、「本サービス」といいます。）の利用条件を定めるものです。</p>

        <h3 className="font-bold text-foreground mt-6">1. 免責事項</h3>
        <ul className="list-disc pl-5">
          <li>本サービスは現状有姿で提供され、その機密性、完全性、可用性を保証するものではありません。</li>
          <li>本サービスの利用により生じた損害（ゲーム内での損失、データ消失など）について、運営者は一切の責任を負いません。</li>
          <li>通知機能はブラウザや設定、端末、ネットワーク環境等に依存するため、確実に届くことを保証するものではありません。</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">2. 禁止事項</h3>
        <ul className="list-disc pl-5">
          <li>本サービスのサーバーに過度な負荷をかける行為</li>
          <li>不正アクセス行為</li>
          <li>本サービスを営利目的に使用する行為</li>
          <li>日本国における法令に反する行為</li>
          <li>その他、運営者が不適切と判断する行為</li>
          <li>禁止事項に違反した場合は、アカウント及び保存されたデータの削除、IPアドレス遮断などの相当な措置を行うことがあります。</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">3. サービスの変更・停止</h3>
        <ul className="list-disc pl-5">
          <li>運営者は、ユーザーに通知することなく、本サービスの内容を変更または提供を中止することができるものとします。</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">4. 著作権</h3>
        <ul className="list-disc pl-5">
          <li>本サービスは個人によって制作された非公式ツールであり、株式会社Yostar、NEXON Games、およびその他の関連団体とは一切関係ありません。</li>
          <li>本サービス中の『ブルーアーカイブ』に関係するデータ等の著作権は、株式会社Yostar、NEXON Games、およびその他の権利者に帰属します。</li>
          <li>本サービスのファビコンおよびアプリアイコンは、<a href="https://www.flaticon.com/free-icons/coffee-break" title="coffee break icons" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">Freepik社</a> のライセンスの下で使用しています。</li>
        </ul>
        
        <p className="text-right">2026年2月8日 発効</p>
      </div>
    ),
  },
  privacy: {
    title: "プライバシーポリシー",
    body: (
      <div className="space-y-4 font-normal text-sm">
        <p>当サイトは、ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシーを定めます。</p>

        <h3 className="font-bold text-foreground mt-6">1. 収集する情報</h3>
        <ul className="list-disc pl-5">
          <li><b>認証情報</b>: Discordログイン時に提供されるユーザーID、メールアドレス、プロフィール画像URL。これらはユーザーの識別とデータ保存のためにのみ使用されます。</li>
          <li><b>利用データ</b>: タイマーのタップ履歴、設定情報。</li>
          <li><b>通知トークン</b>: プッシュ通知を送信するために必要なトークン。</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">2. 利用目的</h3>
        <ul className="list-disc pl-5">
          <li>本サービスの提供・運営のため</li>
          <li>通知機能の提供のため</li>
          <li>アクセス解析による利便性向上のため</li>
          <li>不正アクセスの防止のため</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">3. アクセス解析ツール</h3>
        <p>
          当サイトでは、サービスの改善を目的として以下のツールを利用し、個人を特定できない匿名のトラフィックデータを収集しています。
        </p>
        <ul className="list-disc pl-5">
          <li><b>Google Analytics</b>: Cookieを使用してサイトの利用状況を収集するために使用されます。</li>
          <li><b>Cloudflare Browser Insights</b>: サイトのパフォーマンスや接続状況を分析するために使用されます。</li>
        </ul>

        <h3 className="font-bold text-foreground mt-6">4. 第三者への提供</h3>
        <p>当サイトは、法令に基づく場合を除き、予めユーザーの同意を得ることなく第三者に個人情報を提供することはありません。ただし、本サービスの基盤としてSupabaseを使用しており、データはSupabaseのサーバー上で管理されます。</p>

        <h3 className="font-bold text-foreground mt-6">5. データの削除</h3>
        <p>ユーザーは設定画面の「データ削除」ボタンから、いつでも自身の全データをサーバーから完全に削除することができます。なお、アクセス解析によって収集された匿名情報については、本操作の対象外となります。</p>
      </div>
    ),
  },
  operator: {
    title: "運営者情報・変更履歴",
    body: (() => {
      const updateLogs = [
        { date: '2026-02-08', content: '初回リリース' },
      ];

      return (
        <div className="space-y-4 font-normal">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-foreground border-b border-muted pb-1">運営代表・開発</h3>
              <p className="font-normal">
                さにー<span className="ml-2 mr-1">X:</span><a href="https://x.com/156miyako" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">@156miyako</a><br />
                <span className="ml-11 mr-1">HP:</span><a href="https://rabbit1.cc" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">https://rabbit1.cc</a>
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <h3 className="font-bold text-foreground border-b border-muted pb-1">開発協力</h3>
              <p className="font-normal">
                ハチか<span className="ml-2 mr-1">X:</span><a href="https://x.com/bite_sour_sweet" target="_blank" rel="noopener noreferrer" className="hover:underline text-blue-400">@bite_sour_sweet</a>
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-1 pb-2">
            <h3 className="font-bold text-foreground border-b border-muted pb-1">変更履歴</h3>
            <div className="bg-background/50 rounded-md p-1.5 max-h-48 overflow-y-auto space-y-2 text-sm">
              {updateLogs.map((log, index) => (
                <div key={index} className="flex gap-3 border-b border-muted/30 pb-1.5 last:border-0">
                  <span className="font-mono shrink-0">{log.date}</span>
                  <p className="text-foreground/80">{log.content}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <h3 className="font-bold text-foreground border-b border-muted pb-1">連絡先・フィードバック</h3>
            <p className="text-sm leading-relaxed">
              不具合報告やご要望は、 
              <a href="https://github.com/Sunny-JP/ba-cafe" target="_blank" rel="noopener noreferrer" className="mx-1 hover:underline text-blue-400">
                GitHub
              </a> 
              または X (Twitter) までお願いいたします。
              個人開発のため全てのご意見への対応は難しい場合がありますが、Pull Requestなど積極的に受け付けています。特にWeb開発経験をお持ちの方は、ご協力いただけると幸いです。
            </p>
          </div>
        </div>
      );
    })(),
  },
};