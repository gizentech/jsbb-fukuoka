// クラス名の変換関数

// スラッグから表示名に変換
export const classSlugToDisplay = (slug) => {
  const mapping = {
    'es': '学童',
    'jhs': '少年（中学生）',
    'a-class': 'A級',
    'b-class': 'B級',
    'c-class': 'C級',
    'girls': 'ガールズ',
    'others': 'その他',
    'all': 'すべて'
  };
  return mapping[slug] || slug;
};

// 表示名からスラッグに変換
export const classDisplayToSlug = (display) => {
  const mapping = {
    '学童': 'es',
    '少年（中学生）': 'jhs',
    '少年': 'jhs',  // 後方互換性のため
    'A級': 'a-class',
    'B級': 'b-class',
    'C級': 'c-class',
    'ガールズ': 'girls',
    'その他': 'others',
    'すべて': 'all'
  };
  return mapping[display] || display.toLowerCase();
};
