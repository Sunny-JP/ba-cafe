import re

# 1. ここにWikiのテーブル行を貼り付けてください
wiki_data = """

"""

def generate_ts_file(raw_text, filename="converted_characters.txt"):
    # 列構成の定義 (インデックス, 終了インデックス, レーティング)
    # 0列目は名前なので除外、1列目からカウント
    col_definitions = [
        (1, 2, 'ss'),  # 高級贈り物 特大 (2列)
        (3, 4, 'sa'),  # 高級贈り物 大 (2列)
        (5, 7, 'na'),  # 通常贈り物 大 (3列)
        (8, 15, 'nb')  # 通常贈り物 中 (8列)
    ]

    lines = raw_text.strip().split('\n')
    formatted_output = []

    for line in lines:
        if not line.strip() or line.startswith('|~') or 'h' in line.split('|')[-1]:
            continue

        # セルに分割
        cells = [c.strip() for c in line.strip('|').split('|')]
        
        # キャラクター名の抽出
        name_match = re.search(r'\[\[([^\]]+)\]\]$', cells[0])
        name = name_match.group(1) if name_match else "unknown"
        
        # IDの生成 (適宜調整してください)
        char_id = name.lower().replace('（', '_').replace('）', '')

        # ギフトレーティングの解析
        gift_ratings = []
        for start, end, rating in col_definitions:
            for i in range(start, end + 1):
                if i < len(cells) and cells[i]:
                    # アイテム名の抽出
                    item_name = re.search(r',([^,)]+)\);', cells[i])
                    if item_name:
                        gift_ratings.append(f"      '{item_name.group(1)}': '{rating}',")

        # TypeScript形式の文字列組み立て
        char_block = [
            f"  {{",
            f"    id: '{char_id}',",
            f"    name: '{name}',",
            f"    giftRatings: {{",
            *gift_ratings,
            f"    }} as Record<string, keyof typeof GIFT_EXP>",
            f"  }},"
        ]
        formatted_output.append("\n".join(char_block))

    # ファイル書き出し
    with open(filename, "w", encoding="utf-8") as f:
        f.write("\n".join(formatted_output))
    
    print(f"成功: {filename} に書き出しました。")

if __name__ == "__main__":
    generate_ts_file(wiki_data)