import folium

# 浅草の観光スポットデータ（仮）
spots = [
    {"name": "浅草寺", "lat": 35.7148, "lng": 139.7967, "score": 5, "category": "寺社"},
    {"name": "雷門", "lat": 35.7101, "lng": 139.7966, "score": 5, "category": "門"},
    {"name": "花やしき", "lat": 35.7143, "lng": 139.7946, "score": 3, "category": "遊園地"},
    {"name": "仲見世通り", "lat": 35.7112, "lng": 139.7965, "score": 2, "category": "商店街"},
    {"name": "隅田公園", "lat": 35.7123, "lng": 139.7987, "score": 4, "category": "公園"},
    {"name": "浅草文化観光センター", "lat": 35.7104, "lng": 139.7969, "score": 4, "category": "施設"}
]

# 地図を作成（浅草寺を中心に）
m = folium.Map(location=[35.7148, 139.7967], zoom_start=16)

# 各スポットにマーカーを追加
for spot in spots:
    popup_text = f"{spot['name']}<br>カテゴリ: {spot['category']}<br>人力車適性: ★{spot['score']}"
    folium.Marker(
        location=[spot["lat"], spot["lng"]],
        popup=popup_text,
        tooltip=spot["name"],
        icon=folium.Icon(color="blue" if spot["score"] >= 4 else "gray")
    ).add_to(m)

# 仮ルート（雷門 → 仲見世通り → 浅草寺 → 隅田公園）
route = [
    [35.7101, 139.7966],  # 雷門
    [35.7112, 139.7965],  # 仲見世通り
    [35.7148, 139.7967],  # 浅草寺
    [35.7123, 139.7987]   # 隅田公園
]
folium.PolyLine(route, color="red", weight=4, opacity=0.8).add_to(m)

# HTMLファイルとして保存
m.save("asakusa_rickshaw_map.html")
print("マップを 'asakusa_rickshaw_map.html' に保存しました！")
