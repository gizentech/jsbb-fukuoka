import requests
import json
import logging

# HTTPリクエストのデバッグログを有効化
logging.basicConfig(level=logging.DEBUG)

def fetch_tournaments(category=None):
    # NewtCMS API設定
    SPACE_UID = 'jsbb-kurume'
    TOKEN = 'vdfn4Mdxq2GaU2YMDW1dTIBB7fdgKGLV-pQZfufNZbs'
    
    # リクエストヘッダーの設定
    headers = {
        'Authorization': f'Bearer {TOKEN}',
        'Content-Type': 'application/json'
    }
    
    try:
        # 大会マスター情報を取得（tour-create）
        # 初めに直接 tour-create を試す
        master_url = f'https://{SPACE_UID}.cdn.newt.so/v1/tour-create'
        print(f"Requesting URL: {master_url}")
        
        master_response = requests.get(
            master_url,
            headers=headers,
            timeout=10
        )
        
        app_uid = None
        # エラーの場合、appUidを含むパスを試す
        if not master_response.ok:
            print(f"First attempt failed with status {master_response.status_code}, trying with appUid...")
            # 適切なアプリ名を推測
            for app_uid_try in ['tournament', 'tour']:
                app_uid = app_uid_try
                master_url = f'https://{SPACE_UID}.cdn.newt.so/v1/{app_uid}/tour-create'
                print(f"Trying URL: {master_url}")
                
                master_response = requests.get(
                    master_url,
                    headers=headers,
                    timeout=10
                )
                
                if master_response.ok:
                    print(f"Success with URL: {master_url}")
                    break
            
            if not master_response.ok:
                master_response.raise_for_status()
        
        # マスターデータの解析
        master_data = master_response.json()
        all_masters = master_data.get('items', [])
        
        # レスポンスの詳細情報を表示
        print(f"マスターデータのレスポンス: {json.dumps(master_data, indent=2, ensure_ascii=False)}")
        print(f"取得したマスター数: {len(all_masters)}")
        
        # すべてのカテゴリー情報を収集
        available_categories = set()
        for master in all_masters:
            # クラス/カテゴリー情報を確認
            class_info = master.get('class')
            if class_info:
                if isinstance(class_info, list):
                    for c in class_info:
                        available_categories.add(c)
                elif isinstance(class_info, str):
                    classes = [c.strip() for c in class_info.split(',')]
                    for c in classes:
                        available_categories.add(c)
                else:
                    available_categories.add(str(class_info))
        
        print(f"利用可能なカテゴリー: {available_categories}")
        
        # カテゴリーが指定されていない場合はすべてのマスターを返す
        filtered_masters = []
        if category:
            # カテゴリーでフィルタリング
            for master in all_masters:
                if not master.get('class'):
                    continue
                    
                if isinstance(master['class'], list):
                    if category in master['class']:
                        filtered_masters.append(master)
                elif isinstance(master['class'], str):
                    classes = [c.strip() for c in master['class'].split(',')]
                    if category in classes:
                        filtered_masters.append(master)
                elif str(master['class']) == category:
                    filtered_masters.append(master)
        else:
            filtered_masters = all_masters
        
        print(f"フィルタリング後のマスター数: {len(filtered_masters)}")
        
        # 大会情報を取得
        tournaments = []
        for master in filtered_masters:
            try:
                # masterのIDを使って、関連する大会情報を取得
                tournament_url = None
                if app_uid:
                    tournament_url = f"https://{SPACE_UID}.cdn.newt.so/v1/{app_uid}/tournament?tournament._id={master['_id']}"
                else:
                    tournament_url = f"https://{SPACE_UID}.cdn.newt.so/v1/tournament?tournament._id={master['_id']}"
                
                print(f"Fetching tournament data: {tournament_url}")
                
                tour_response = requests.get(tournament_url, headers=headers, timeout=10)
                
                tournament_info = {
                    'id': master['_id'],
                    'tournamentId': master.get('id', ''),
                    'title1': master.get('tournament-name', ''),
                    'title2': '',
                    'class': master.get('class', ''),
                    'thumbnail': master.get('cover-img', {}).get('src', '/images/tournament-bg.webp'),
                    'updatedAt': master['_sys'].get('updatedAt', '')
                }
                
                if tour_response.ok:
                    tour_data = tour_response.json()
                    tour_items = tour_data.get('items', [])
                    
                    if tour_items:
                        # 最新の大会情報を取得
                        latest_tour = max(tour_items, key=lambda x: x['_sys']['updatedAt'])
                        tournament_info['title2'] = f"第{latest_tour.get('tournament-no', '')}回"
                        tournament_info['latestTournament'] = latest_tour
                else:
                    print(f"Failed to fetch tournament data: {tour_response.status_code} {tour_response.text}")
                
                tournaments.append(tournament_info)
            
            except Exception as e:
                print(f"Error fetching tournament for master {master['_id']}: {e}")
                tournament_info = {
                    'id': master['_id'],
                    'tournamentId': master.get('id', ''),
                    'title1': master.get('tournament-name', ''),
                    'title2': '',
                    'class': master.get('class', ''),
                    'thumbnail': master.get('cover-img', {}).get('src', '/images/tournament-bg.webp'),
                    'updatedAt': master['_sys'].get('updatedAt', ''),
                    'error': str(e)
                }
                tournaments.append(tournament_info)
        
        # 更新日でソート
        tournaments.sort(key=lambda x: x['updatedAt'], reverse=True)
        
        # 結果の表示
        print("\n取得したトーナメント情報:")
        print(json.dumps(tournaments, indent=2, ensure_ascii=False))
        
        return tournaments
    
    except requests.exceptions.RequestException as e:
        print(f'Error fetching tournaments from NewtCMS: {e}')
        if hasattr(e, 'response'):
            print(f'Response status code: {e.response.status_code}')
            print(f'Response text: {e.response.text}')
            print(f'Request URL: {e.response.url}')
        return []

if __name__ == "__main__":
    print("まずはカテゴリーを確認するためにすべてのデータを取得します")
    all_tournaments = fetch_tournaments()
    
    if all_tournaments:
        print("\nすべてのトーナメント一覧:")
        for tournament in all_tournaments:
            print(f"大会名: {tournament['title1']} {tournament['title2']}")
            print(f"カテゴリー: {tournament['class']}")
            print(f"更新日: {tournament['updatedAt']}")
            print("---")
    else:
        print("トーナメントデータが見つかりませんでした。")
    
    # 特定のカテゴリーでデータを取得する場合はこちらを使用
    # category = "senior"  # 取得したいカテゴリーを指定
    # print(f"\nFetching tournament data for category: {category}")
    # tournaments = fetch_tournaments(category)
    # 
    # if tournaments:
    #     print("\nトーナメント一覧:")
    #     for tournament in tournaments:
    #         print(f"大会名: {tournament['title1']} {tournament['title2']}")
    #         print(f"カテゴリー: {tournament['class']}")
    #         print(f"更新日: {tournament['updatedAt']}")
    #         print("---")
    # else:
    #     print(f"カテゴリー '{category}' のトーナメントデータが見つかりませんでした。")