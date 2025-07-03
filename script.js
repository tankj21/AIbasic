// 人力車ナビ - JavaScript

// グローバル変数
let map;
let geocoder;
let directionsService;
let directionsRenderer;
let startMarker, endMarker;
let spotMarkers = [];
let preferences = {
    gradientWeight: 50,
    sceneryWeight: 70,
    touristWeight: 60
};

// スポットデータベース（実際の実装では外部APIから取得）
const spotsDatabase = [
    {
        id: 1,
        name: '浅草寺',
        type: '寺院',
        lat: 35.7148,
        lng: 139.7967,
        sceneryScore: 9,
        description: '東京最古の寺院、雷門で有名'
    },
    {
        id: 2,
        name: '東京スカイツリー',
        type: 'タワー',
        lat: 35.7101,
        lng: 139.8107,
        sceneryScore: 8,
        description: '高さ634mの電波塔'
    },
    {
        id: 3,
        name: '上野公園',
        type: '公園',
        lat: 35.7164,
        lng: 139.7744,
        sceneryScore: 8,
        description: '桜の名所として有名'
    },
    {
        id: 4,
        name: '隅田川',
        type: '河川',
        lat: 35.7061,
        lng: 139.7872,
        sceneryScore: 7,
        description: '東京湾に注ぐ一級河川'
    },
    {
        id: 5,
        name: '築地場外市場',
        type: '市場',
        lat: 35.6654,
        lng: 139.7707,
        sceneryScore: 6,
        description: '新鮮な海産物で有名'
    },
    {
        id: 6,
        name: '皇居東御苑',
        type: '庭園',
        lat: 35.6850,
        lng: 139.7586,
        sceneryScore: 9,
        description: '旧江戸城の本丸跡'
    },
    {
        id: 7,
        name: '銀座',
        type: '商業地区',
        lat: 35.6762,
        lng: 139.7631,
        sceneryScore: 7,
        description: '高級ショッピング街'
    },
    {
        id: 8,
        name: '日本橋',
        type: '橋',
        lat: 35.6838,
        lng: 139.7740,
        sceneryScore: 6,
        description: '江戸時代からの歴史ある橋'
    },
    {
        id: 9,
        name: '雷門',
        type: '観光名所',
        lat: 35.706678,
        lng: 139.791125,
        sceneryScore: 9,
        description: '浅草寺の入り口にある大きな門'
    },
    {
        id:10,
        name: '花やしき',
        type: '遊園地',
        lat: 35.715461,
        lng: 139.794678,
        sceneryScore: 9,
        description: '日本最古の遊園地、レトロな雰囲気が魅力'
    },
    {
        id: 11,
        name: '浅草演芸ホール',
        type: '劇場',
        lat: 35.7134959,
        lng: 139.7929631,
        sceneryScore: 8,
        description: '落語や漫才などの伝統芸能を楽しめる場所'
    }
];

// Google Maps初期化
function initMap() {
    // 地図の初期設定
    map = new google.maps.Map(document.getElementById('map'), {
        zoom: 14,
        center: { lat: 35.7148, lng: 139.7967 }, // 浅草中心
        mapTypeId: 'roadmap',
        styles: [
            {
                featureType: 'poi',
                elementType: 'labels.text',
                stylers: [{ visibility: 'on' }]
            }
        ]
    });

    // サービスの初期化
    geocoder = new google.maps.Geocoder();
    directionsService = new google.maps.DirectionsService();
    directionsRenderer = new google.maps.DirectionsRenderer({
        polylineOptions: {
            strokeColor: '#667eea',
            strokeWeight: 4,
            strokeOpacity: 0.8
        }
    });
    directionsRenderer.setMap(map);

    // 地図クリックイベント
    map.addListener('click', function(e) {
        handleMapClick(e.latLng);
    });

    // スポット表示
    displaySpots();
    
    // オートコンプリートの設定
    setupAutocomplete();
}

// オートコンプリート設定
function setupAutocomplete() {
    const startInput = document.getElementById('start');
    const destinationInput = document.getElementById('destination');
    
    setupInputAutocomplete(startInput, 'startSuggestions');
    setupInputAutocomplete(destinationInput, 'destinationSuggestions');
}

function setupInputAutocomplete(input, suggestionsId) {
    const suggestions = document.getElementById(suggestionsId);
    
    input.addEventListener('input', function() {
        const query = this.value.toLowerCase();
        if (query.length < 2) {
            suggestions.style.display = 'none';
            return;
        }
        
        const matches = spotsDatabase.filter(spot => 
            spot.name.toLowerCase().includes(query) ||
            spot.type.toLowerCase().includes(query)
        ).slice(0, 5);
        
        if (matches.length > 0) {
            suggestions.innerHTML = matches.map(spot => 
                `<div class="autocomplete-suggestion" onclick="selectSpot('${input.id}', '${spot.name}')">${spot.name} (${spot.type})</div>`
            ).join('');
            suggestions.style.display = 'block';
        } else {
            suggestions.style.display = 'none';
        }
    });
    
    document.addEventListener('click', function(e) {
        if (!input.contains(e.target) && !suggestions.contains(e.target)) {
            suggestions.style.display = 'none';
        }
    });
}

function selectSpot(inputId, spotName) {
    document.getElementById(inputId).value = spotName;
    document.getElementById(inputId + 'Suggestions').style.display = 'none';
}

// スポット表示
function displaySpots() {
    const spotsList = document.getElementById('spotsList');
    
    // 景観スコア順にソート
    const sortedSpots = [...spotsDatabase].sort((a, b) => b.sceneryScore - a.sceneryScore);
    
    spotsList.innerHTML = sortedSpots.map(spot => `
        <div class="spot-item" onclick="focusOnSpot(${spot.lat}, ${spot.lng}, '${spot.name}')">
            <div class="spot-info">
                <div class="spot-name">${spot.name}</div>
                <div class="spot-type">${spot.type}</div>
            </div>
            <div class="spot-score">${spot.sceneryScore}/10</div>
        </div>
    `).join('');

    // スポットマーカーを地図に追加
    spotsDatabase.forEach(spot => {
        const marker = new google.maps.Marker({
            position: { lat: spot.lat, lng: spot.lng },
            map: map,
            title: spot.name,
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="#667eea">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                        <circle cx="12" cy="9" r="3" fill="white"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(20, 20)
            }
        });

        const infoWindow = new google.maps.InfoWindow({
            content: `
                <div>
                    <h3>${spot.name}</h3>
                    <p><strong>種類:</strong> ${spot.type}</p>
                    <p><strong>景観スコア:</strong> ${spot.sceneryScore}/10</p>
                    <p>${spot.description}</p>
                </div>
            `
        });

        marker.addListener('click', function() {
            infoWindow.open(map, marker);
        });

        spotMarkers.push(marker);
    });
}

// スポットにフォーカス
function focusOnSpot(lat, lng, name) {
    map.setCenter({ lat, lng });
    map.setZoom(16);
    
    // 該当するマーカーの情報ウィンドウを開く
    const spot = spotsDatabase.find(s => s.name === name);
    if (spot) {
        const marker = spotMarkers.find(m => 
            m.getPosition().lat() === lat && m.getPosition().lng() === lng
        );
        if (marker) {
            google.maps.event.trigger(marker, 'click');
        }
    }
}

// 地図クリック処理
function handleMapClick(latLng) {
    const startInput = document.getElementById('start');
    const destinationInput = document.getElementById('destination');
    
    if (!startInput.value) {
        setLocation(latLng, 'start');
    } else if (!destinationInput.value) {
        setLocation(latLng, 'destination');
    }
}

// 場所設定
function setLocation(latLng, type) {
    // 逆ジオコーディングで住所を取得
    geocoder.geocode({ location: latLng }, function(results, status) {
        if (status === 'OK' && results[0]) {
            const address = results[0].formatted_address;
            document.getElementById(type).value = address;
        } else {
            const locationName = `${latLng.lat().toFixed(4)}, ${latLng.lng().toFixed(4)}`;
            document.getElementById(type).value = locationName;
        }
    });
    
    if (type === 'start') {
        if (startMarker) startMarker.setMap(null);
        startMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: '出発地',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="green">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 30)
            }
        });
    } else {
        if (endMarker) endMarker.setMap(null);
        endMarker = new google.maps.Marker({
            position: latLng,
            map: map,
            title: '目的地',
            icon: {
                url: 'data:image/svg+xml;charset=UTF-8,' + encodeURIComponent(`
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="red">
                        <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7z"/>
                    </svg>
                `),
                scaledSize: new google.maps.Size(30, 30)
            }
        });
    }
}

// スライダー値更新
function updateSliderValue(type, value) {
    document.getElementById(type + 'Value').textContent = value;
    preferences[type + 'Weight'] = parseInt(value);
}

// ルート探索メイン関数
async function findRoute() {
    const startInput = document.getElementById('start').value;
    const destinationInput = document.getElementById('destination').value;
    
    if (!startInput || !destinationInput) {
        alert('出発地と目的地を入力してください');
        return;
    }

    const btn = document.getElementById('findRoute');
    btn.disabled = true;
    btn.textContent = '🔄 計算中...';
    
    try {
        // Google Maps Directions APIを使用してルート計算
        const request = {
            origin: startInput,
            destination: destinationInput,
            travelMode: google.maps.TravelMode.WALKING,
            avoidHighways: true,
            avoidTolls: true,
            optimizeWaypoints: true
        };

        // 景観重視の場合は経由地に観光スポットを追加
        if (preferences.touristWeight > 70) {
            request.waypoints = getNearbyWaypoints(startInput, destinationInput);
        }

        directionsService.route(request, function(result, status) {
            if (status === 'OK') {
                directionsRenderer.setDirections(result);
                
                // ルート情報を更新
                updateRouteStats(result);
                
                // 地図の表示範囲を調整
                const bounds = new google.maps.LatLngBounds();
                result.routes[0].legs.forEach(leg => {
                    bounds.extend(leg.start_location);
                    bounds.extend(leg.end_location);
                });
                map.fitBounds(bounds);
                
            } else {
                throw new Error('ルートが見つかりませんでした: ' + status);
            }
        });
        
    } catch (error) {
        console.error('ルート計算エラー:', error);
        alert('ルートを計算できませんでした: ' + error.message);
    } finally {
        btn.disabled = false;
        btn.textContent = '🔍 ルートを探す';
    }
}

// 近くの経由地を取得（観光地重視の場合）
function getNearbyWaypoints(start, destination) {
    // 簡単な実装：スコアの高いスポットを経由地として追加
    const highScoreSpots = spotsDatabase
        .filter(spot => spot.sceneryScore >= 8)
        .slice(0, 2)
        .map(spot => ({
            location: new google.maps.LatLng(spot.lat, spot.lng),
            stopover: true
        }));
    
    return highScoreSpots;
}

// ルート統計更新
function updateRouteStats(result) {
    const route = result.routes[0];
    let totalDistance = 0;
    let totalDuration = 0;
    
    route.legs.forEach(leg => {
        totalDistance += leg.distance.value;
        totalDuration += leg.duration.value;
    });
    
    // 人力車特有の計算
    const distance = totalDistance / 1000; // km
    const baseDuration = totalDuration / 60; // minutes
    
    // 坂道や景観を考慮した時間調整
    const gradientPenalty = preferences.gradientWeight / 100 * 0.3;
    const sceneryBonus = preferences.sceneryWeight / 100 * 0.2;
    const adjustedDuration = baseDuration * (1 + gradientPenalty - sceneryBonus);
    
    // 模擬的な値（実際は標高データAPIを使用）
    const elevation = Math.floor(Math.random() * 50) + 10;
    const sceneryScore = calculateSceneryScore(route);
    
    document.getElementById('distance').textContent = distance.toFixed(1) + 'km';
    document.getElementById('duration').textContent = Math.round(adjustedDuration) + '分';
    document.getElementById('elevation').textContent = elevation + 'm';
    document.getElementById('sceneryScore').textContent = sceneryScore.toFixed(1) + '/10';
    
    document.getElementById('routeInfo').style.display = 'block';
}

// 景観スコア計算
function calculateSceneryScore(route) {
    let totalScore = 0;
    let pointCount = 0;
    
    // ルート上の各点について、近くのスポットのスコアを考慮
    route.legs.forEach(leg => {
        leg.steps.forEach(step => {
            const stepLocation = step.start_location;
            
            spotsDatabase.forEach(spot => {
                const spotLocation = new google.maps.LatLng(spot.lat, spot.lng);
                const distance = google.maps.geometry.spherical.computeDistanceBetween(
                    stepLocation, spotLocation
                );
                
                // 500m以内のスポットの影響を考慮
                if (distance < 500) {
                    const influence = 1 - (distance / 500);
                    totalScore += spot.sceneryScore * influence;
                    pointCount += influence;
                }
            });
        });
    });
    
    return pointCount > 0 ? totalScore / pointCount : 5.0;
}

// Google Maps API読み込み完了後の初期化
window.initMap = initMap;