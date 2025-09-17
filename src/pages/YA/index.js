// pages/YA/index.js
import Image from 'next/image';
import Head from 'next/head';
import { useState, useEffect } from 'react';
import styles from './ya.module.css';

const structuredData = {
  "@context": "https://schema.org",
  "@type": "Event",
  "name": "野球場であそぼ！野球感謝祭2025",
  "alternateName": ["久留米野球感謝祭", "親子野球体験イベント", "久留米市民野球祭"],
  "description": "久留米市野球連盟主催の親子向け無料野球イベント。久留米市野球場で開催される市民感謝祭。ティーボール、ストラックアウト、ベースボール5などの野球体験プログラム。幼稚園児から小学3年生まで参加可能。",
  "startDate": "2025-11-09T09:00:00+09:00",
  "endDate": "2025-11-09T17:00:00+09:00",
  "eventStatus": "https://schema.org/EventScheduled",
  "eventAttendanceMode": "https://schema.org/OfflineEventAttendanceMode",
  "location": {
    "@type": "Place",
    "name": "久留米市野球場",
    "alternateName": ["クルメシヤキュウジョウ", "久留米球場"],
    "address": {
      "@type": "PostalAddress",
      "streetAddress": "東櫛原町173",
      "addressLocality": "久留米市",
      "addressRegion": "福岡県",
      "postalCode": "830-0003",
      "addressCountry": "JP"
    },
    "geo": {
      "@type": "GeoCoordinates",
      "latitude": "33.3196",
      "longitude": "130.5083"
    }
  },
  "organizer": {
    "@type": "Organization",
    "name": "久留米市野球連盟",
    "telephone": "0942-38-8333",
    "email": "zennan-fukuoka@aqua.plala.or.jp"
  },
  "isAccessibleForFree": true,
  "maximumAttendeeCapacity": 300,
  "offers": {
    "@type": "Offer",
    "price": "0",
    "priceCurrency": "JPY",
    "availability": "https://schema.org/InStock",
    "url": "https://baseball-event.vercel.app/"
  }
};

const faqData = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": [
    {
      "@type": "Question",
      "name": "参加費はかかりますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "参加費は完全無料です。また、参加者全員に参加賞もプレゼントいたします。"
      }
    },
    {
      "@type": "Question",
      "name": "雨天の場合はどうなりますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "雨天の場合は中止となります。開催可否は久留米市野球連盟の公式ウェブサイトでお知らせいたします。"
      }
    },
    {
      "@type": "Question",
      "name": "駐車場はありますか？",
      "acceptedAnswer": {
        "@type": "Answer",
        "text": "久留米市野球場には無料駐車場を完備しております。お車でお越しいただけます。"
      }
    }
  ]
};

export default function YaPage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // ローディング時間を2.5秒に設定
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <>
      <Head>
        <title>野球場であそぼ！野球感謝祭2025 | 久留米市野球場 親子無料野球体験イベント | ティーボール・ストラックアウト・ベースボール5</title>
        <meta name="description" content="【2025年11月9日開催】久留米市野球場で親子が楽しめる無料野球イベント！ティーボール・ストラックアウト・ベースボール5体験。幼稚園児・保育園児・小学1-3年生対象。久留米市野球連盟主催の市民感謝祭。参加費無料・参加賞あり・先着300名募集中！" />
        
        {/* keywords部分を空白に */}
         <meta name="keywords" content="野球場であそぼ,野球感謝祭,久留米市野球場,親子野球,無料野球イベント,ティーボール,ストラックアウト,ベースボール5,久留米市野球連盟,野球体験,キッズ野球,幼児野球,子供野球教室,久留米イベント,福岡県野球,親子参加,野球場見学,野球体験教室,少年野球,学童野球,野球イベント2025,久留米スポーツ,野球大会,野球祭り,野球フェスティバル,ジュニア野球,ファミリー野球,野球初心者,野球入門,野球場開放,市民野球,地域野球,コミュニティ野球,野球普及,スポーツ振興,久留米市民,福岡県民,九州野球,筑後地区,野球連盟,JSBB,軟式野球,硬式野球,野球指導,野球教室,野球クリニック,野球スクール,野球アカデミー,野球キャンプ,野球合宿,野球練習,野球技術,野球ルール,野球用具,野球グローブ,野球バット,野球ボール,野球ユニフォーム,野球帽子,スポーツイベント,体育祭,運動会,スポーツフェスティバル,アウトドアイベント,ファミリーイベント,親子レクリエーション,親子体験,親子参加型,親子で楽しむ,家族参加,家族イベント,子育て支援,青少年育成,健全育成,スポーツ教育,体力向上,運動能力,チームワーク,協調性,社会性,コミュニケーション,礼儀作法,マナー,しつけ,教育,成長,発達,健康,体力,運動,フィットネス,エクササイズ,アクティビティ,レジャー,娯楽,遊び,ゲーム,競技,試合,大会,トーナメント,リーグ,チーム,クラブ,サークル,同好会,愛好会,仲間,友達,交流,親睦,コミュニティ,地域交流,世代交流,異世代交流,国際交流,文化交流,スポーツ交流,野球交流,技術交流,情報交流,経験交流,知識交流,学習,習得,上達,向上,成長,進歩,発展,普及,啓発,啓蒙,宣伝,広報,PR,マーケティング,プロモーション,キャンペーン,イベント企画,イベント運営,イベント管理,イベント会社,イベント業界,スポーツ業界,野球業界,エンターテイメント,娯楽産業,レジャー産業,観光,観光地,観光スポット,名所,見どころ,グルメ,特産品,お土産,記念品,プレゼント,ギフト,贈り物,景品,賞品,参加賞,記念品,グッズ,商品,販売,購入,買い物,ショッピング,通販,オンライン,インターネット,ウェブサイト,ホームページ,ブログ,SNS,Facebook,Twitter,Instagram,YouTube,動画,写真,画像,投稿,シェア,拡散,口コミ,評判,レビュー,感想,体験談,レポート,記事,ニュース,情報,データ,統計,分析,調査,研究,論文,資料,文献,書籍,雑誌,新聞,メディア,マスコミ,報道,取材,インタビュー,対談,座談会,講演,セミナー,ワークショップ,研修,講習,教室,スクール,学校,幼稚園,保育園,小学校,中学校,高校,大学,専門学校,塾,予備校,家庭教師,個人指導,グループ指導,チーム指導,コーチング,ティーチング,指導法,教育法,練習法,トレーニング法,上達法,技術指導,戦術指導,メンタル指導,フィジカル指導,テクニカル指導,基礎,基本,応用,発展,初級,中級,上級,プロ,アマチュア,社会人,学生,子供,大人,男性,女性,男女,性別,年齢,世代,ジュニア,シニア,ベテラン,新人,初心者,経験者,上級者,エキスパート,プロフェッショナル,スペシャリスト,エース,スター,ヒーロー,チャンピオン,優勝者,入賞者,メダリスト,記録保持者,殿堂入り,レジェンド,伝説,歴史,伝統,文化,精神,魂,心,気持ち,感情,情熱,熱意,やる気,モチベーション,目標,夢,希望,願い,想い,気持ち,心境,心理,メンタル,精神力,集中力,持久力,瞬発力,反射神経,動体視力,判断力,決断力,実行力,行動力,積極性,自主性,主体性,自立性,協調性,社会性,人間性,人格,性格,個性,特徴,特色,魅力,良さ,素晴らしさ,楽しさ,面白さ,興味深さ,価値,意義,重要性,必要性,有用性,効果,効能,メリット,利点,長所,強み,特技,得意,才能,能力,技術,技能,スキル,ノウハウ,知識,経験,実績,成果,結果,効果,影響,変化,成長,発達,進歩,向上,改善,改革,革新,イノベーション,創造,創作,発明,開発,研究,実験,検証,確認,証明,立証,実証,論証,説明,解説,説明会,説明資料,案内,ガイド,マニュアル,手順,方法,やり方,進め方,取り組み方,考え方,姿勢,態度,行動,実践,活動,取り組み,努力,頑張り,挑戦,チャレンジ,冒険,体験,経験,思い出,記憶,印象,感動,興奮,喜び,楽しみ,嬉しさ,満足,充実,達成感,成就感,爽快感,清々しさ,気持ちよさ,快適,心地よさ,安心,安全,信頼,信用,評価,評判,人気,支持,応援,声援,エール,励まし,サポート,支援,協力,連携,協働,共同,共催,主催,後援,協賛,スポンサー,パートナー,仲間,チームメイト,ライバル,競争相手,対戦相手,敵,味方,友人,知人,先輩,後輩,同期,同級生,同世代,仲間意識,連帯感,一体感,結束,団結,チームワーク,協力,連携,協調,調和,バランス,均衡,安定,持続,継続,発展,成長,拡大,普及,浸透,定着,根付く,広がる,伝わる,伝える,伝承,継承,受け継ぐ,引き継ぐ,託す,委ねる,任せる,頼む,依頼,要請,お願い,申し込み,申請,応募,参加,参画,加入,入会,登録,手続き,受付,案内,誘導,サポート,お手伝い,ボランティア,奉仕,貢献,社会貢献,地域貢献,還元,恩返し,感謝,お礼,謝意,敬意,尊敬,敬服,感服,感心,感嘆,驚き,びっくり,感動,涙,泣く,笑う,笑顔,微笑み,にっこり,嬉しい,楽しい,面白い,興味深い,魅力的,素晴らしい,最高,最良,最適,ベスト,ナンバーワン,一番,トップ,リーダー,先頭,最前線,先進,最新,新しい,フレッシュ,新鮮,斬新,革新的,画期的,画期的,歴史的,記念すべき,特別,貴重,重要,大切,かけがえのない,唯一,オンリーワン,ユニーク,独特,個性的,オリジナル,独自,自分らしい,らしさ,持ち味,味,風味,香り,匂い,臭い,音,声,音楽,歌,メロディー,リズム,テンポ,ビート,楽器,演奏,パフォーマンス,ショー,イベント,催し,行事,祭り,フェスティバル,カーニバル,パレード,行進,デモンストレーション,実演,披露,発表,公開,展示,展覧,博覧,見学,観察,観賞,鑑賞,楽しむ,味わう,堪能,満喫,エンジョイ,リラックス,くつろぐ,のんびり,ゆっくり,マイペース,自分のペース,自由,気楽,気軽,カジュアル,フランク,フレンドリー,親しみやすい,優しい,温かい,暖かい,ほっとする,癒し,ヒーリング,リフレッシュ,リセット,リスタート,再開,復活,復帰,カムバック,戻る,帰る,故郷,ふるさと,地元,出身地,生まれ故郷,実家,家族,両親,父,母,兄弟,姉妹,親戚,親族,血縁,縁,つながり,絆,結び,結びつき,関係,関わり,接点,出会い,巡り合い,縁,運命,宿命,必然,偶然,奇跡,幸運,ラッキー,ついている,恵まれている,幸せ,幸福,喜び,嬉しさ,楽しさ,面白さ,興味,関心,好奇心,探究心,向上心,上達したい,うまくなりたい,強くなりたい,勝ちたい,優勝したい,一番になりたい,認められたい,褒められたい,喜ばれたい,役に立ちたい,貢献したい,恩返ししたい,感謝したい,お礼したい,プレゼントしたい,贈りたい,与えたい,分けたい,分かち合いたい,共有したい,一緒に,みんなで,仲間と,チームで,グループで,クラスで,学校で,職場で,家庭で,地域で,社会で,国で,世界で,地球で,宇宙で,未来で,将来で,これから,今後,先々,長期,短期,一時的,永続的,恒久的,永遠,無限,限りない,果てしない,広がる,拡がる,延びる,伸びる,続く,継続,持続,維持,保持,保存,保管,管理,運営,経営,マネジメント,リーダーシップ,指導力,統率力,組織力,団結力,結束力,一致団結,心を一つに,力を合わせて,協力して,連携して,共に,ともに,一緒に,みんなで,全員で,チーム一丸となって,野球を愛する,野球が好き,野球ファン,野球少年,野球少女,野球キッズ,野球ジュニア,野球ファミリー,野球一家,野球馬鹿,野球狂,野球マニア,野球オタク,野球通,野球博士,野球評論家,野球解説者,野球指導者,野球コーチ,野球監督,野球選手,プロ野球選手,アマチュア野球選手,社会人野球選手,大学野球選手,高校野球選手,中学野球選手,少年野球選手,学童野球選手,軟式野球選手,硬式野球選手,野球部,野球チーム,野球クラブ,野球サークル,野球同好会,野球愛好会,野球団,野球連盟,野球協会,野球組織,野球団体,野球機関,野球施設,野球場,球場,スタジアム,ドーム,アリーナ,球技場,運動場,グラウンド,フィールド,コート,ダイヤモンド,内野,外野,マウンド,ホームベース,ベース,塁,一塁,二塁,三塁,本塁,打席,バッターボックス,ピッチャーマウンド,キャッチャーボックス,コーチボックス,ダッグアウト,ベンチ,ブルペン,ファウルゾーン,観客席,スタンド,外野席,内野席,特別席,VIP席,ボックス席,自由席,指定席,シーズンシート,年間パス,入場券,チケット,観戦,応援,声援,エール,コール,歌,チャント,横断幕,のぼり,旗,バナー,プラカード,看板,ポスター,パンフレット,プログラム,ガイドブック,案内書,説明書,資料,情報,データ,記録,成績,結果,スコア,得点,点数,勝敗,勝利,敗北,引き分け,延長,サヨナラ,逆転,大逆転,完封,完投,完全試合,ノーヒットノーラン,サイクルヒット,ホームラン,満塁ホームラン,グランドスラム,三振,四球,死球,盗塁,牽制,バント,スクイズ,エンドラン,ヒットエンドラン,送りバント,犠牲バント,犠牲フライ,併殺,ダブルプレー,トリプルプレー,ゲッツー,アウト,セーフ,ファール,ストライク,ボール,デッドボール,暴投,パスボール,エラー,失策,守備,攻撃,投手,捕手,一塁手,二塁手,三塁手,遊撃手,左翼手,中堅手,右翼手,指名打者,代打,代走,代投,交代,選手交代,投手交代,守備交代,打順,スタメン,スターティングメンバー,先発,中継ぎ,抑え,クローザー,セットアッパー,ワンポイント,左の中継ぎ,右の中継ぎ,左のワンポイント,右のワンポイント,左キラー,右キラー,代打の切り札,守備固め,走塁要員,スイッチヒッター,二刀流,投打二刀流,エース,四番,主将,キャプテン,副主将,チームリーダー,精神的支柱,大黒柱,頼れる存在,期待の星,将来有望,ホープ,新星,彗星,新人王,最優秀選手,MVP,首位打者,本塁打王,打点王,盗塁王,最優秀投手,勝利投手,セーブ王,最優秀防御率,ゴールデングラブ,守備職人,鉄壁の守備,華麗な守備,美技,ファインプレー,スーパープレー,神業,職人技,匠の技,プロの技,一流の技,超一流,一級品,最高級,プレミアム,スペシャル,エクセレント,パーフェクト,100点満点,満点,最高点,最高評価,絶賛,大好評,大人気,話題,注目,脚光,スポットライト,クローズアップ,フィーチャー,特集,特別企画,限定,期間限定,数量限定,先着限定,会員限定,招待,特別招待,VIP招待,無料招待,ご招待,お招き,お誘い,ご案内,ご紹介,ご推薦,おすすめ,イチオシ,一押し,太鼓判,保証,安心,安全,信頼,実績,経験,ベテラン,老舗,伝統,格式,権威,名門,一流,超一流,トップクラス,ハイレベル,高水準,質の高い,上質,優良,良質,高品質,最高品質,プレミアム品質,こだわり,厳選,選りすぐり,精選,特選,一級品,逸品,名品,傑作,力作,大作,話題作,注目作,期待作,人気作,ベストセラー,ロングセラー,定番,スタンダード,王道,正統派,本格派,本物,真正,オーセンティック,ジェニュイン,リアル,本当,真実,事実,現実,実際,実在,存在,確実,確実性,確かさ,間違いない,疑いない,確信,自信,信念,信条,理念,思想,哲学,価値観,世界観,人生観,宗教観,死生観,美意識,センス,感性,感覚,直感,インスピレーション,ひらめき,アイデア,発想,着想,創造力,想像力,表現力,芸術性,クリエイティブ,創作,作品,芸術,アート,美術,文学,音楽,演劇,映画,写真,絵画,彫刻,工芸,デザイン,ファッション,建築,庭園,造園,ランドスケープ,景観,風景,自然,環境,エコ,エコロジー,環境保護,自然保護,地球環境,温暖化,気候変動,持続可能,サステナブル,SDGs,社会貢献,CSR,ボランティア,奉仕活動,慈善活動,チャリティー,募金,寄付,支援,援助,救援,救助,助け,手助け,サポート,バックアップ,フォロー,ケア,介護,看護,医療,健康,ヘルス,フィットネス,ウェルネス,美容,ダイエット,痩身,減量,シェイプアップ,ボディメイク,筋トレ,筋力トレーニング,ウエイトトレーニング,有酸素運動,無酸素運動,ストレッチ,ヨガ,ピラティス,エアロビクス,ダンス,ダンササイズ,ズンバ,アクアビクス,水泳,ランニング,ジョギング,ウォーキング,散歩,ハイキング,登山,トレッキング,サイクリング,自転車,バイク,オートバイ,車,自動車,電車,地下鉄,バス,タクシー,船,飛行機,交通,交通機関,アクセス,行き方,道順,ルート,経路,地図,案内図,看板,標識,サイン,マーク,記号,シンボル,ロゴ,マスコット,キャラクター,イメージキャラクター,公式キャラクター,ゆるキャラ,着ぐるみ,コスプレ,仮装,変装,扮装,演技,パフォーマンス,ショー,エンターテイメント,娯楽,遊び,ゲーム,おもちゃ,玩具,ホビー,趣味,特技,得意分野,専門分野,専門知識,専門技術,プロフェッショナル,エキスパート,スペシャリスト,権威,第一人者,第一線,最前線,先端,最先端,先進,最新,ニュー,フレッシュ,新鮮,斬新,革新,革命,改革,変革,進化,発展,成長,向上,野球場であそぼ,野球感謝祭,久留米市野球場,親子野球,無料野球イベント,ティーボール,ストラックアウト,ベースボール5,久留米市野球連盟,野球体験,キッズ野球,幼児野球,子供野球教室,久留米イベント,福岡県野球,親子参加,野球場見学,野球体験教室,少年野球,学童野球,野球イベント2025,久留米スポーツ,野球大会,野球祭り,野球フェスティバル,ジュニア野球,ファミリー野球,野球初心者,野球入門,野球場開放,市民野球,地域野球,コミュニティ野球,野球普及,スポーツ振興,久留米市民,福岡県民,九州野球,筑後地区野球,軟式野球,硬式野球,JSBB,全日本軟式野球連盟,福岡県軟式野球連盟,久留米野球,筑後野球,筑紫野球,大牟田野球,柳川野球,八女野球,筑前野球,朝倉野球,小郡野球,うきは野球,みやま野球,大川野球,中間野球,宗像野球,古賀野球,福津野球,糸島野球,那珂川野球,宇美野球,篠栗野球,志免野球,須恵野球,新宮野球,久山野球,粕屋野球,芦屋野球,水巻野球,岡垣野球,遠賀野球,小竹野球,鞍手野球,桂川野球,筑前野球,東峰野球,大刀洗野球,大木野球,広川野球,香春野球,添田野球,糸田野球,川崎野球,大任野球,赤村野球,福智野球,苅田野球,みやこ野球" />
        
        {/* Open Graph */}
        <meta property="og:title" content="野球場であそぼ！野球感謝祭2025 | 久留米市野球場で親子野球体験" />
        <meta property="og:description" content="2025年11月9日開催！久留米市野球場で親子が楽しめる無料野球イベント。ティーボール、ストラックアウト、ベースボール5体験。参加費無料・参加賞あり。" />
        <meta property="og:type" content="event" />
        <meta property="og:url" content="https://kurume.jsbb-fukuoka.com/YA" />
        <meta property="og:image" content="https://kurume.jsbb-fukuoka.com/images/ya-logo.webp" />
        <meta property="og:site_name" content="久留米市野球連盟" />
        <meta property="og:locale" content="ja_JP" />
        
        {/* Twitter Card */}
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="野球場であそぼ！野球感謝祭2025 | 久留米市野球場" />
        <meta name="twitter:description" content="2025年11月9日開催！親子で楽しむ無料野球イベント。ティーボール、ストラックアウト、ベースボール5体験。" />
        <meta name="twitter:image" content="https://kurume.jsbb-fukuoka.com/images/ya-logo.webp" />
        
        {/* 地域関連 */}
        <meta name="geo.region" content="JP-40" />
        <meta name="geo.placename" content="久留米市" />
        <meta name="geo.position" content="33.3196;130.5083" />
        <meta name="ICBM" content="33.3196, 130.5083" />
        
        {/* 言語・地域 */}
        <meta name="language" content="ja" />
        <meta name="coverage" content="小郡市,鳥栖市,筑後市,筑紫野市,大牟田市,久留米市, 福岡県, 九州" />
        <meta name="distribution" content="local" />
        <meta name="target" content="久留米,久留米event,イベント,久留米市民, 福岡県民, 野球ファミリー" />
        
        {/* robots */}
        <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1" />
        <meta name="googlebot" content="index, follow" />
        
        {/* 構造化データ */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        
        {/* FAQ構造化データ */}
        <script 
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }}
        />
        
        {/* LocalBusiness構造化データ */}
        <script type="application/ld+json">
          {`
            {
              "@context": "https://schema.org",
              "@type": "LocalBusiness",
              "name": "久留米市野球連盟",
              "description": "福岡県久留米市の野球連盟。野球大会の開催、青少年の健全育成、地域スポーツ振興を目的とした活動を行っています。",
              "url": "https://kurume.jsbb-fukuoka.com",
              "telephone": "0942-38-8333",
              "email": "zennan-fukuoka@aqua.plala.or.jp",
              "address": {
                "@type": "PostalAddress",
                "streetAddress": "東櫛原町173",
                "addressLocality": "久留米市",
                "addressRegion": "福岡県",
                "postalCode": "830-0003",
                "addressCountry": "JP"
              },
              "geo": {
                "@type": "GeoCoordinates",
                "latitude": "33.3196",
                "longitude": "130.5083"
              },
              "openingHours": "Mo-Fr 10:00-16:00",
              "priceRange": "無料"
            }
          `}
        </script>

        {/* Canonical URL */}
        <link rel="canonical" href="https://kurume.jsbb-fukuoka.com/YA" />
        <link rel="alternate" hrefLang="ja" href="https://kurume.jsbb-fukuoka.com/YA" />
      </Head>
      
      {/* ローディングスクリーン */}
      {isLoading && (
        <div className={styles.loadingScreen}>
          <div className={styles.loadingContent}>
            <Image
              src="/images/ya-logo.webp"
              alt="野球場であそぼ！野球感謝祭2025"
              width={1000}
              height={300}
              className={styles.loadingLogo}
              priority
            />
            <div className={styles.loadingText}>読み込み中...</div>
            <div className={styles.loadingSpinner}></div>
          </div>
        </div>
      )}
      
      <div className={`${styles.yaPage} ${isLoading ? styles.hidden : styles.visible}`}>
        <div className={styles.container}>
          {/* 左側：A4画像 */}
          <div className={styles.leftPanel}>
            <Image
              src="/images/ya-poster.webp"
              alt="野球場であそぼ！野球感謝祭2025ポスター 久留米市野球場 親子野球イベント"
              width={595}
              height={842}
              className={styles.poster}
              priority
            />
          </div>

          {/* 右側：コンテンツ */}
          <div className={styles.rightPanel}>
            {/* ヘッダー */}
            <header className={styles.header}>
              <div className={styles.logoContainer}>
                <Image
                  src="/images/ya-logo.webp"
                  alt="野球場であそぼ！野球感謝祭2025 公式ロゴ 久留米市野球連盟主催"
                  width={1000}
                  height={300}
                  className={styles.logo}
                  priority
                />
              </div>
              <p className={styles.eventDate}>
                <time dateTime="2025-11-09">2025年11月9日開催</time>
              </p>
              <div className={styles.organizers}>
                <p>
                  <strong>主催：</strong>
                  <a href="https://kurume.jsbb-fukuoka.com" target="_blank" rel="noopener noreferrer">久留米市野球連盟</a>
                </p>
                <p>
                  　　　<a href="https://kurume-kitarc.com/" target="_blank" rel="noopener noreferrer">久留米北ロータリークラブ</a>
                </p>
                <p>
                  <strong>共催：</strong>
                  <a href="https://www.city.kurume.fukuoka.jp/index.html" target="_blank" rel="noopener noreferrer">久留米市</a>
                </p>
                <p>
                  　　　<a href="https://www.city.kurume.fukuoka.jp/1060manabi/2020kyouiku/3070kyouikuiinkai/" target="_blank" rel="noopener noreferrer">久留米市教育委員会</a>
                </p>
                <p>
                  　　　<a href="https://kurumetaikyo.or.jp/" target="_blank" rel="noopener noreferrer">（公財）久留米市スポーツ協会</a>
                </p>
                <p>
                  　　　<a href="https://fukuoka-hbf.jp/" target="_blank" rel="noopener noreferrer">福岡県高等学校野球連盟</a>
                </p>
                <p>
                  　　　<a href="https://shisetsu.mizuno.jp/m-7411" target="_blank" rel="noopener noreferrer">久留米総合スポーツセンター</a>
                </p>
                <p>
                  <strong>主管：</strong>野球感謝祭実行委員会
                </p>
              </div>
            </header>

            {/* 申し込みボタン */}
            <div className={styles.applicationButton}>
              <a 
                href="https://baseball-event.vercel.app/" 
                target="_blank" 
                rel="noopener noreferrer"
                className={styles.applyBtn}
                aria-label="野球場であそぼ！野球感謝祭2025 参加申し込みフォーム"
              >
                参加申し込みはこちら
              </a>
            </div>

            {/* メインコンテンツ */}
            <main className={styles.mainContent}>
              {/* イベント概要 */}
              <section className={styles.section} itemScope itemType="https://schema.org/Event">
                <h1>野球場であそぼ！久留米市親子野球感謝祭2025</h1>
                <h2>イベント概要</h2>
                <p>久留米市では、「スポーツを楽しむ街久留米」をテーマに、普段野球場に入る機会のない親子を対象とした市民感謝祭を開催します。この<strong>無料野球イベント</strong>では、<strong>ティーボール</strong>、<strong>ストラックアウト</strong>、<strong>ベースボール5</strong>などの野球体験プログラムをお楽しみいただけます。参加者全員に<strong>参加賞</strong>もございます。</p>
                <p>久留米市野球場の広大なフィールドで、お子様が野球の楽しさを体感できる貴重な機会です。野球初心者のお子様でも安心してご参加いただけます。</p>
              </section>

              {/* 日時と会場 */}
              <section className={styles.section} itemScope itemType="https://schema.org/Place">
                <h2>開催日時・会場情報</h2>
                <p><strong>開催日時:</strong> <time dateTime="2025-11-09" itemProp="startDate">令和7年11月9日(日)</time></p>
                <p><strong>開催会場:</strong> <span itemProp="name">久留米市野球場</span>（福岡県久留米市東櫛原町173）</p>
                <p><strong>アクセス:</strong> JR久留米駅からバス約15分、西鉄久留米駅からバス約10分</p>
                <p><strong>駐車場:</strong> リバーサイドパークをご利用ください。久留米市野球場及び久留米アリーナには駐車出来ません。</p>
                <p>雨天の場合は、久留米市野球連盟の公式ウェブサイトでお知らせいたします。</p>
              </section>

              {/* 参加対象 */}
              <section className={styles.section}>
                <h2>参加対象・定員</h2>
                <ul>
                  <li><strong>幼稚園児・保育園児</strong>とその保護者様</li>
                  <li><strong>小学校1年生から3年生</strong>とその保護者様</li>
                </ul>
                <p><strong>募集定員:</strong> 先着300名様</p>
                <p><strong>参加費:</strong> 無料</p>
                <p><strong>服装:</strong> 運動しやすい服装、運動靴着用でお越しください</p>
              </section>

              {/* イベント内容 */}
              <section className={styles.section}>
                <h2>野球体験プログラム詳細</h2>
                <p>当日は、久留米市野球場の広大なフィールドで、野球の楽しさを体感できる多彩なプログラムをご用意しています。</p>
                
                <div className={styles.programs}>
                  <div className={styles.program}>
                    <h3>午前の部 (受付9:00、開始9:30〜12:00)</h3>
                    <ul>
                      <li><strong>親子ティーボール</strong> </li>
                      <li><strong>ストラックアウト</strong></li>
                    </ul>
                  </div>
                  
                  <div className={styles.program}>
                    <h3>午後の部 (13:00〜16:00)</h3>
                    <ul>
                      <li><strong>ベースボール5</strong></li>
                      <li><strong>キャッチボールクラシック</strong></li>
                      <li><strong>古希野球チーム vs 学童チーム</strong></li>
                    </ul>
                  </div>
                </div>
                
                <p><strong>特典:</strong> 参加者全員に記念品をプレゼント！写真撮影コーナーも設置予定です。</p>
              </section>

              {/* 協賛企業 - 修正版 */}
              <section className={styles.section}>
                <h2>協賛企業・団体</h2>
                <p>本イベントは以下の企業・団体様のご協賛により開催されています。</p>
                <div className={styles.sponsors}>
                  <a href="https://www.chikugin.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>株式会社筑邦銀行</a>
                  <a href="https://www.shinkin.co.jp/chikugo/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>筑後信用金庫</a>
                  <a href="https://www.ekimae-r-e.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>株式会社駅前不動産</a>
                  <a href="https://kumintv.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>株式会社CRCCメディア</a>
                  <a href="http://www.kyodo-photo.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>株式会社共同写真企画</a>
                  <a href="https://www.tanakaai.com/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>田中藍株式会社</a>
                  <a href="https://www.marunaga.com/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>丸永製菓株式会社</a>
                  <a href="https://www.welltec.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>北原ウェルテック株式会社</a>
                  <a href="https://www.sompo-japan.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>損害保険ジャパン株式会社</a>
                  <a href="https://www.dai-ichi-life.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>第一生命保険株式会社</a>
                  <a href="https://www.aioinissaydowa.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>あいおいニッセイ同和損保株式会社</a>
                  <a href="https://corp.mizuno.com/jp" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>ミズノ株式会社</a>
                  <a href="https://www.naigai-rubber.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>内外ゴム株式会社</a>
                  <a href="https://www.nagase-kenko.com/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>ナガセケンコー株式会社</a>
                  <a href="https://marus-ball.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>マルエス株式会社</a>
                  <a href="https://www.shokou.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>昭光株式会社</a>
                  <a href="https://www.kanetani.co.jp/" target="_blank" rel="noopener noreferrer" className={styles.sponsorLink}>株式会社カネタニ</a>
                </div>
              </section>

              {/* お問い合わせ */}
              <section className={styles.section} itemScope itemType="https://schema.org/ContactPoint">
                <h2>お問い合わせ・事務局</h2>
                <div className={styles.contact}>
                  <p><strong itemProp="name">久留米市野球連盟 事務局</strong></p>
                  <p><strong>電話:</strong> <a href="tel:0942-38-8333" itemProp="telephone">0942-38-8333</a></p>
                  <p><strong>FAX:</strong> <span itemProp="faxNumber">0942-27-6332</span></p>
                  <p><strong>メール:</strong> <a href="mailto:zennan-fukuoka@aqua.plala.or.jp" itemProp="email">zennan-fukuoka@aqua.plala.or.jp</a></p>
                  <p><strong>受付時間:</strong> <time itemProp="hoursAvailable">10:00〜16:00</time> (火曜・日曜・祝日を除く)</p>
                  <p><strong>所在地:</strong> <span itemProp="address">〒830-0003 福岡県久留米市東櫛原町173</span></p>
                </div>
              </section>
            </main>
          </div>
        </div>
      </div>
    </>
  );
}