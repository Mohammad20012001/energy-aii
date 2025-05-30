/**
 * Professional Embedded Map System - High Performance
 * نظام الخرائط المدمج الاحترافي - أداء عالي
 */

class EmbeddedMapSystem {
    constructor() {
        this.embeddedMap = null;
        this.fullMap = null;
        this.isModalOpen = false;
        this.mapLayers = {};
        this.markerClusters = {};
        this.currentBasemap = 'geographic';
        this.layerGroups = {};
        this.isLoading = false;
        this.init();
    }

    init() {
        // تهيئة الخريطة المدمجة
        this.initEmbeddedMap();

        // إعداد مستمعي الأحداث
        this.setupEventListeners();
    }

    initEmbeddedMap() {
        try {
            // إنشاء الخريطة المدمجة مع تحسينات الأداء
            this.embeddedMap = L.map('embedded-map', {
                zoomControl: false,
                scrollWheelZoom: false,
                doubleClickZoom: false,
                dragging: false,
                touchZoom: false,
                boxZoom: false,
                keyboard: false,
                attributionControl: false,
                preferCanvas: true, // تحسين الأداء
                renderer: L.canvas() // استخدام Canvas للرسم السريع
            }).setView([31.9539, 35.9106], 9);

            // إضافة طبقة جغرافية عالية الجودة مع تحسين التحميل
            const geographicLayer = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
                attribution: '© Esri',
                maxZoom: 18,
                tileSize: 256,
                updateWhenZooming: false, // تحسين الأداء
                updateWhenIdle: true,
                keepBuffer: 2
            });

            geographicLayer.addTo(this.embeddedMap);

            // إضافة علامات محسنة
            this.addOptimizedMarkers(this.embeddedMap);

            console.log('High-performance embedded map initialized');
        } catch (error) {
            console.error('Error initializing embedded map:', error);
        }
    }

    initFullMap() {
        try {
            this.showLoadingIndicator();

            // إنشاء الخريطة الكاملة مع تحسينات الأداء
            this.fullMap = L.map('full-map', {
                preferCanvas: true,
                renderer: L.canvas(),
                zoomControl: false
            }).setView([31.9539, 35.9106], 9);

            // إنشاء طبقات الخرائط المختلفة
            this.createMapLayers();

            // إضافة طبقة افتراضية
            this.mapLayers[this.currentBasemap].addTo(this.fullMap);

            // إنشاء مجموعات الطبقات
            this.createLayerGroups();

            // إضافة أدوات التحكم المتقدمة
            this.addAdvancedControls();

            // إضافة مقياس المسافة
            L.control.scale({
                position: 'bottomleft',
                metric: true,
                imperial: false
            }).addTo(this.fullMap);

            this.hideLoadingIndicator();
            console.log('Professional full map initialized');
        } catch (error) {
            console.error('Error initializing full map:', error);
            this.hideLoadingIndicator();
        }
    }

    createMapLayers() {
        // طبقة الأقمار الصناعية عالية الجودة
        this.mapLayers.satellite = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 18,
            name: 'Satellite'
        });

        // طبقة الشوارع العربية
        this.mapLayers.streets = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenStreetMap',
            maxZoom: 19,
            name: 'Streets'
        });

        // طبقة جغرافية مع أسماء عربية
        this.mapLayers.geographic = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}', {
            attribution: '© Esri',
            maxZoom: 19,
            name: 'Geographic'
        });

        // طبقة التضاريس
        this.mapLayers.terrain = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
            attribution: '© OpenTopoMap',
            maxZoom: 17,
            name: 'Terrain'
        });

        // طبقة مظلمة للوضع الليلي
        this.mapLayers.dark = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
            attribution: '© CARTO',
            maxZoom: 19,
            name: 'Dark'
        });
    }

    createLayerGroups() {
        // مجموعة محطات الطاقة الشمسية
        this.layerGroups.solar = L.layerGroup();

        // مجموعة محطات طاقة الرياح
        this.layerGroups.wind = L.layerGroup();

        // مجموعة محطات الطاقة النووية
        this.layerGroups.nuclear = L.layerGroup();

        // مجموعة محطات الطاقة المائية
        this.layerGroups.hydro = L.layerGroup();



        // مجموعة شبكة الكهرباء
        this.layerGroups.grid = L.layerGroup();

        // إضافة البيانات لكل مجموعة
        this.populateLayerGroups();

        // إضافة المجموعات للخريطة
        Object.values(this.layerGroups).forEach(group => {
            group.addTo(this.fullMap);
        });
    }

    populateLayerGroups() {
        // مشاريع الطاقة الشمسية في الشرق الأوسط
        const solarStations = [
            // الأردن
            { lat: 31.9539, lng: 35.9106, name: 'Amman Solar Complex', capacity: '50 MW', status: 'Active', efficiency: '22%', country: 'Jordan' },
            { lat: 32.5556, lng: 35.8511, name: 'Irbid Solar Farm', capacity: '30 MW', status: 'Active', efficiency: '21%', country: 'Jordan' },
            { lat: 30.3285, lng: 35.4444, name: 'Aqaba Solar Station', capacity: '75 MW', status: 'Active', efficiency: '23%', country: 'Jordan' },
            { lat: 31.1801, lng: 36.4014, name: 'Karak Solar Project', capacity: '40 MW', status: 'Active', efficiency: '20%', country: 'Jordan' },

            // الإمارات العربية المتحدة
            { lat: 24.4539, lng: 54.3773, name: 'Mohammed bin Rashid Al Maktoum Solar Park', capacity: '5000 MW', status: 'Active', efficiency: '24%', country: 'UAE' },
            { lat: 24.0581, lng: 55.2090, name: 'Noor Abu Dhabi', capacity: '1177 MW', status: 'Active', efficiency: '23%', country: 'UAE' },
            { lat: 25.0657, lng: 55.1713, name: 'Al Dhafra Solar PV', capacity: '2000 MW', status: 'Active', efficiency: '25%', country: 'UAE' },

            // السعودية
            { lat: 24.0889, lng: 44.6851, name: 'Sakaka Solar Project', capacity: '300 MW', status: 'Active', efficiency: '22%', country: 'Saudi Arabia' },
            { lat: 25.9667, lng: 43.8167, name: 'Sudair Solar Project', capacity: '1500 MW', status: 'Under Construction', efficiency: '24%', country: 'Saudi Arabia' },
            { lat: 26.0667, lng: 50.5577, name: 'Al-Faisaliah Solar Plant', capacity: '600 MW', status: 'Active', efficiency: '23%', country: 'Saudi Arabia' },

            // مصر
            { lat: 27.2579, lng: 31.6056, name: 'Benban Solar Park', capacity: '1650 MW', status: 'Active', efficiency: '21%', country: 'Egypt' },
            { lat: 25.6872, lng: 32.6396, name: 'Kom Ombo Solar Plant', capacity: '200 MW', status: 'Active', efficiency: '20%', country: 'Egypt' },

            // المغرب
            { lat: 30.9335, lng: -6.9370, name: 'Noor Ouarzazate', capacity: '580 MW', status: 'Active', efficiency: '22%', country: 'Morocco' },
            { lat: 31.6295, lng: -7.9811, name: 'Noor Midelt', capacity: '800 MW', status: 'Under Construction', efficiency: '24%', country: 'Morocco' },

            // إسرائيل
            { lat: 30.8760, lng: 34.7925, name: 'Ashalim Solar Thermal Power Station', capacity: '121 MW', status: 'Active', efficiency: '23%', country: 'Israel' },
            { lat: 31.2001, lng: 34.8516, name: 'Ketura Sun', capacity: '60 MW', status: 'Active', efficiency: '21%', country: 'Israel' },

            // العراق
            { lat: 33.3128, lng: 44.3615, name: 'Baghdad Solar Project', capacity: '120 MW', status: 'Under Construction', efficiency: '20%', country: 'Iraq' },
            { lat: 36.3489, lng: 43.1189, name: 'Mosul Solar Farm', capacity: '80 MW', status: 'Planned', efficiency: '21%', country: 'Iraq' },

            // الكويت
            { lat: 29.3375, lng: 47.6581, name: 'Shagaya Renewable Energy Park', capacity: '70 MW', status: 'Active', efficiency: '22%', country: 'Kuwait' },
            { lat: 29.0469, lng: 48.0048, name: 'Al-Abdaliyah Solar Plant', capacity: '50 MW', status: 'Active', efficiency: '21%', country: 'Kuwait' },

            // قطر
            { lat: 25.4052, lng: 51.4934, name: 'Al Kharsaah Solar PV Power Plant', capacity: '800 MW', status: 'Active', efficiency: '24%', country: 'Qatar' },

            // عمان
            { lat: 23.5859, lng: 58.4059, name: 'Ibri Solar IPP', capacity: '500 MW', status: 'Active', efficiency: '23%', country: 'Oman' },
            { lat: 22.9068, lng: 59.5200, name: 'Dhofar Wind Farm', capacity: '50 MW', status: 'Active', efficiency: '22%', country: 'Oman' }
        ];

        // مشاريع طاقة الرياح في الشرق الأوسط
        const windStations = [
            // الأردن
            { lat: 32.0833, lng: 36.9167, name: 'Mafraq Wind Farm', capacity: '80 MW', status: 'Active', turbines: 40, country: 'Jordan' },
            { lat: 31.7333, lng: 36.2167, name: 'Zarqa Wind Station', capacity: '60 MW', status: 'Active', turbines: 30, country: 'Jordan' },
            { lat: 31.5000, lng: 36.8000, name: 'Eastern Desert Wind Park', capacity: '100 MW', status: 'Planned', turbines: 50, country: 'Jordan' },

            // مصر
            { lat: 27.2379, lng: 33.8116, name: 'Gulf of Suez Wind Farm', capacity: '580 MW', status: 'Active', turbines: 300, country: 'Egypt' },
            { lat: 27.0469, lng: 33.6317, name: 'Zafarana Wind Farm', capacity: '545 MW', status: 'Active', turbines: 700, country: 'Egypt' },
            { lat: 27.1167, lng: 33.7500, name: 'Ras Ghareb Wind Farm', capacity: '262.5 MW', status: 'Active', turbines: 175, country: 'Egypt' },

            // المغرب
            { lat: 35.1681, lng: -5.2665, name: 'Tarfaya Wind Farm', capacity: '301 MW', status: 'Active', turbines: 131, country: 'Morocco' },
            { lat: 32.2540, lng: -9.2371, name: 'Midelt Wind Project', capacity: '180 MW', status: 'Active', turbines: 90, country: 'Morocco' },

            // تركيا
            { lat: 40.1431, lng: 26.4018, name: 'Bandırma Wind Power Plant', capacity: '135 MW', status: 'Active', turbines: 45, country: 'Turkey' },
            { lat: 39.9334, lng: 32.8597, name: 'Ankara Wind Farm', capacity: '90 MW', status: 'Active', turbines: 30, country: 'Turkey' },

            // إيران
            { lat: 37.4419, lng: 49.7662, name: 'Manjil Wind Farm', capacity: '91 MW', status: 'Active', turbines: 92, country: 'Iran' },
            { lat: 36.2061, lng: 59.6363, name: 'Khaf Wind Farm', capacity: '300 MW', status: 'Active', turbines: 150, country: 'Iran' },

            // العراق
            { lat: 31.9686, lng: 45.7781, name: 'Al-Zubair Wind Project', capacity: '100 MW', status: 'Planned', turbines: 50, country: 'Iraq' },

            // الكويت
            { lat: 29.3375, lng: 47.6581, name: 'Shagaya Wind Farm', capacity: '10 MW', status: 'Active', turbines: 5, country: 'Kuwait' },

            // إسرائيل
            { lat: 32.7940, lng: 35.0423, name: 'Golan Heights Wind Farm', capacity: '6 MW', status: 'Active', turbines: 3, country: 'Israel' }
        ];

        // مشاريع الطاقة النووية
        const nuclearStations = [
            // الإمارات
            { lat: 24.5262, lng: 52.8781, name: 'Barakah Nuclear Power Plant', capacity: '5600 MW', status: 'Active', reactors: 4, country: 'UAE' },

            // تركيا
            { lat: 36.1167, lng: 28.2167, name: 'Akkuyu Nuclear Power Plant', capacity: '4800 MW', status: 'Under Construction', reactors: 4, country: 'Turkey' },

            // إيران
            { lat: 30.0372, lng: 48.8158, name: 'Bushehr Nuclear Power Plant', capacity: '1000 MW', status: 'Active', reactors: 1, country: 'Iran' }
        ];

        // مشاريع الطاقة المائية
        const hydroStations = [
            // تركيا
            { lat: 38.7312, lng: 31.6067, name: 'Atatürk Dam', capacity: '2400 MW', status: 'Active', type: 'Hydroelectric', country: 'Turkey' },
            { lat: 37.5167, lng: 38.8000, name: 'Ilısu Dam', capacity: '1200 MW', status: 'Active', type: 'Hydroelectric', country: 'Turkey' },

            // إيران
            { lat: 32.6539, lng: 48.4043, name: 'Karun-3 Dam', capacity: '400 MW', status: 'Active', type: 'Hydroelectric', country: 'Iran' },
            { lat: 35.7219, lng: 50.9939, name: 'Latian Dam', capacity: '80 MW', status: 'Active', type: 'Hydroelectric', country: 'Iran' },

            // العراق
            { lat: 36.6167, lng: 42.8167, name: 'Mosul Dam', capacity: '750 MW', status: 'Active', type: 'Hydroelectric', country: 'Iraq' },
            { lat: 34.0522, lng: 44.4939, name: 'Haditha Dam', capacity: '660 MW', status: 'Active', type: 'Hydroelectric', country: 'Iraq' },

            // سوريا
            { lat: 35.9500, lng: 38.5500, name: 'Tabqa Dam', capacity: '880 MW', status: 'Active', type: 'Hydroelectric', country: 'Syria' },

            // لبنان
            { lat: 33.8547, lng: 35.8623, name: 'Litani River Project', capacity: '190 MW', status: 'Active', type: 'Hydroelectric', country: 'Lebanon' }
        ];

        // إضافة العلامات المحسنة
        this.addAdvancedMarkers(solarStations, 'solar', '☀️', '#FF6B35');
        this.addAdvancedMarkers(windStations, 'wind', '💨', '#00A8E8');
        this.addAdvancedMarkers(nuclearStations, 'nuclear', '⚛️', '#9C27B0');
        this.addAdvancedMarkers(hydroStations, 'hydro', '💧', '#2196F3');
    }



    addOptimizedMarkers(map) {
        // علامات محسنة للخريطة المدمجة
        const quickMarkers = [
            { lat: 31.9539, lng: 35.9106, type: 'solar' },
            { lat: 32.0833, lng: 36.9167, type: 'wind' },
            { lat: 30.3285, lng: 35.4444, type: 'solar' }
        ];

        quickMarkers.forEach(marker => {
            const icon = marker.type === 'solar' ? '☀️' : '💨';
            const color = marker.type === 'solar' ? '#FF6B35' : '#00A8E8';

            L.circleMarker([marker.lat, marker.lng], {
                radius: 8,
                fillColor: color,
                color: '#fff',
                weight: 2,
                opacity: 1,
                fillOpacity: 0.8
            }).addTo(map);
        });
    }

    addAdvancedMarkers(stations, type, icon, color) {
        stations.forEach(station => {
            const marker = L.marker([station.lat, station.lng], {
                icon: L.divIcon({
                    className: `energy-marker ${type}`,
                    html: `<div class="marker-icon" style="background: ${color}">${icon}</div>`,
                    iconSize: [35, 35],
                    iconAnchor: [17, 17]
                })
            });

            // نافذة منبثقة احترافية
            const popupContent = this.createAdvancedPopup(station, type);
            marker.bindPopup(popupContent, {
                maxWidth: 300,
                className: 'custom-popup'
            });

            // إضافة للمجموعة المناسبة
            marker.addTo(this.layerGroups[type]);
        });
    }

    createAdvancedPopup(station, type) {
        const statusColor = station.status === 'Active' ? '#4CAF50' :
                           station.status === 'Under Construction' ? '#FF9800' : '#2196F3';

        const typeIcon = type === 'solar' ? '☀️' :
                        type === 'wind' ? '💨' :
                        type === 'nuclear' ? '⚛️' : '💧';

        return `
            <div class="advanced-popup">
                <div class="popup-header">
                    <h4>${typeIcon} ${station.name}</h4>
                    <span class="status-badge" style="background: ${statusColor}">${station.status}</span>
                </div>
                <div class="popup-content">
                    <div class="info-row">
                        <span class="label">Country:</span>
                        <span class="value">🏛️ ${station.country}</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Type:</span>
                        <span class="value">${type.charAt(0).toUpperCase() + type.slice(1)} Energy</span>
                    </div>
                    <div class="info-row">
                        <span class="label">Capacity:</span>
                        <span class="value">⚡ ${station.capacity}</span>
                    </div>
                    ${station.efficiency ? `
                        <div class="info-row">
                            <span class="label">Efficiency:</span>
                            <span class="value">📊 ${station.efficiency}</span>
                        </div>
                    ` : ''}
                    ${station.turbines ? `
                        <div class="info-row">
                            <span class="label">Turbines:</span>
                            <span class="value">🌪️ ${station.turbines}</span>
                        </div>
                    ` : ''}
                    ${station.reactors ? `
                        <div class="info-row">
                            <span class="label">Reactors:</span>
                            <span class="value">🔬 ${station.reactors}</span>
                        </div>
                    ` : ''}
                    ${station.type ? `
                        <div class="info-row">
                            <span class="label">System:</span>
                            <span class="value">🏗️ ${station.type}</span>
                        </div>
                    ` : ''}
                    <div class="popup-actions">
                        <button class="popup-btn" onclick="window.embeddedMapSystem.showStationDetails('${station.name}')">
                            📋 View Details
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    addEnergyMarkers(map) {
        // علامات محطات الطاقة الشمسية
        const solarIcon = L.divIcon({
            className: 'energy-marker solar',
            html: '<div class="marker-icon">☀️</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // علامات محطات طاقة الرياح
        const windIcon = L.divIcon({
            className: 'energy-marker wind',
            html: '<div class="marker-icon">💨</div>',
            iconSize: [30, 30],
            iconAnchor: [15, 15]
        });

        // محطات الطاقة الشمسية في الأردن
        const solarStations = [
            { lat: 31.9539, lng: 35.9106, name: 'Amman Solar Plant', capacity: '50 MW' },
            { lat: 32.5556, lng: 35.8511, name: 'Irbid Solar Farm', capacity: '30 MW' },
            { lat: 30.3285, lng: 35.4444, name: 'Aqaba Solar Station', capacity: '75 MW' },
            { lat: 31.1801, lng: 36.4014, name: 'Karak Solar Project', capacity: '40 MW' }
        ];

        // محطات طاقة الرياح
        const windStations = [
            { lat: 32.0833, lng: 36.9167, name: 'Mafraq Wind Farm', capacity: '80 MW' },
            { lat: 31.7333, lng: 36.2167, name: 'Zarqa Wind Station', capacity: '60 MW' }
        ];

        // إضافة علامات الطاقة الشمسية
        solarStations.forEach(station => {
            L.marker([station.lat, station.lng], { icon: solarIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="energy-popup">
                        <h4>${station.name}</h4>
                        <p><strong>Type:</strong> Solar Energy</p>
                        <p><strong>Capacity:</strong> ${station.capacity}</p>
                        <p><strong>Status:</strong> Active</p>
                    </div>
                `);
        });

        // إضافة علامات طاقة الرياح
        windStations.forEach(station => {
            L.marker([station.lat, station.lng], { icon: windIcon })
                .addTo(map)
                .bindPopup(`
                    <div class="energy-popup">
                        <h4>${station.name}</h4>
                        <p><strong>Type:</strong> Wind Energy</p>
                        <p><strong>Capacity:</strong> ${station.capacity}</p>
                        <p><strong>Status:</strong> Active</p>
                    </div>
                `);
        });
    }

    addAdvancedControls() {
        if (!this.fullMap) return;

        // إضافة أدوات التحكم في الطبقات المحسنة مع إمكانية الطي
        const layerControl = L.control.layers(this.mapLayers, this.layerGroups, {
            position: 'topright',
            collapsed: true
        }).addTo(this.fullMap);

        // إضافة أدوات التحكم المخصصة المصغرة
        const controlsDiv = L.DomUtil.create('div', 'compact-controls');
        controlsDiv.innerHTML = `
            <div class="compact-panel">
                <div class="panel-header" id="toggle-panel">
                    <span class="panel-icon">⚙️</span>
                    <span class="panel-title">Controls</span>
                    <span class="collapse-icon">▼</span>
                </div>
                <div class="panel-content" id="panel-content">
                    <div class="compact-section">
                        <div class="section-title">🗺️ Layers</div>
                        <div class="compact-buttons">
                            <button class="compact-btn" data-layer="satellite" title="Satellite">🛰️</button>
                            <button class="compact-btn" data-layer="streets" title="Streets">🗺️</button>
                            <button class="compact-btn active" data-layer="geographic" title="Geographic">🌍</button>
                            <button class="compact-btn" data-layer="terrain" title="Terrain">🏔️</button>
                            <button class="compact-btn" data-layer="dark" title="Dark">🌙</button>
                        </div>
                    </div>
                    <div class="compact-section">
                        <div class="section-title">⚡ Energy</div>
                        <div class="compact-toggles">
                            <label class="mini-toggle" title="Solar Energy">
                                <input type="checkbox" id="toggle-solar" checked>
                                <span class="mini-slider">☀️</span>
                            </label>
                            <label class="mini-toggle" title="Wind Energy">
                                <input type="checkbox" id="toggle-wind" checked>
                                <span class="mini-slider">💨</span>
                            </label>
                            <label class="mini-toggle" title="Nuclear Energy">
                                <input type="checkbox" id="toggle-nuclear" checked>
                                <span class="mini-slider">⚛️</span>
                            </label>
                            <label class="mini-toggle" title="Hydro Energy">
                                <input type="checkbox" id="toggle-hydro" checked>
                                <span class="mini-slider">💧</span>
                            </label>
                        </div>
                    </div>
                    <div class="compact-section">
                        <div class="section-title">🛠️ Tools</div>
                        <div class="compact-tools">
                            <button class="tool-icon" id="reset-view" title="Reset View">🏠</button>
                            <button class="tool-icon" id="fullscreen-toggle" title="Fullscreen">⛶</button>
                            <button class="tool-icon" id="export-map" title="Export">📷</button>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // إضافة التحكم إلى الخريطة
        const customControl = L.Control.extend({
            onAdd: function() {
                return controlsDiv;
            }
        });

        new customControl({ position: 'topleft' }).addTo(this.fullMap);

        // إضافة مستمعي الأحداث
        this.setupAdvancedControlEvents();

        // إضافة أدوات التكبير المخصصة
        L.control.zoom({
            position: 'bottomright'
        }).addTo(this.fullMap);
    }

    setupAdvancedControlEvents() {
        // إضافة وظيفة طي/فتح القائمة
        const togglePanel = document.getElementById('toggle-panel');
        const panelContent = document.getElementById('panel-content');
        const collapseIcon = document.querySelector('.collapse-icon');

        if (togglePanel && panelContent) {
            togglePanel.addEventListener('click', () => {
                panelContent.classList.toggle('collapsed');
                collapseIcon.textContent = panelContent.classList.contains('collapsed') ? '▶' : '▼';
            });
        }

        // تبديل طبقات الخريطة
        document.querySelectorAll('.compact-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const layer = e.target.dataset.layer;
                this.switchMapLayer(layer);

                // تحديث الأزرار النشطة
                document.querySelectorAll('.compact-btn').forEach(b => b.classList.remove('active'));
                e.target.classList.add('active');
            });
        });

        // تبديل طبقات الطاقة
        document.getElementById('toggle-solar').addEventListener('change', (e) => {
            this.toggleEnergyLayer('solar', e.target.checked);
        });

        document.getElementById('toggle-wind').addEventListener('change', (e) => {
            this.toggleEnergyLayer('wind', e.target.checked);
        });

        document.getElementById('toggle-nuclear').addEventListener('change', (e) => {
            this.toggleEnergyLayer('nuclear', e.target.checked);
        });

        document.getElementById('toggle-hydro').addEventListener('change', (e) => {
            this.toggleEnergyLayer('hydro', e.target.checked);
        });





        // أدوات إضافية
        document.getElementById('reset-view').addEventListener('click', () => {
            this.fullMap.setView([31.9539, 35.9106], 9);
        });

        document.getElementById('fullscreen-toggle').addEventListener('click', () => {
            this.toggleFullscreen();
        });

        document.getElementById('export-map').addEventListener('click', () => {
            this.exportMap();
        });
    }

    switchMapLayer(layerName) {
        // إزالة الطبقة الحالية
        if (this.mapLayers[this.currentBasemap]) {
            this.fullMap.removeLayer(this.mapLayers[this.currentBasemap]);
        }

        // إضافة الطبقة الجديدة
        if (this.mapLayers[layerName]) {
            this.mapLayers[layerName].addTo(this.fullMap);
            this.currentBasemap = layerName;
        }
    }

    toggleEnergyLayer(type, show) {
        if (this.layerGroups[type]) {
            if (show) {
                this.layerGroups[type].addTo(this.fullMap);
            } else {
                this.fullMap.removeLayer(this.layerGroups[type]);
            }
        }
    }

    toggleFullscreen() {
        const modal = document.getElementById('mapModal');
        if (!document.fullscreenElement) {
            modal.requestFullscreen().catch(err => {
                console.log('Fullscreen not supported');
            });
        } else {
            document.exitFullscreen();
        }
    }

    exportMap() {
        // تصدير الخريطة كصورة (يتطلب مكتبة إضافية في التطبيق الحقيقي)
        alert('Export functionality would be implemented with additional libraries like html2canvas');
    }

    showLoadingIndicator() {
        const modal = document.getElementById('mapModal');
        if (modal) {
            const loader = document.createElement('div');
            loader.className = 'map-loader';
            loader.innerHTML = `
                <div class="loader-content">
                    <div class="spinner"></div>
                    <p>Loading Professional Map...</p>
                </div>
            `;
            modal.appendChild(loader);
        }
    }

    hideLoadingIndicator() {
        const loader = document.querySelector('.map-loader');
        if (loader) {
            loader.remove();
        }
    }

    showStationDetails(stationName) {
        // عرض تفاصيل المحطة في نافذة منفصلة
        alert(`Detailed information for ${stationName} would be displayed here`);
    }

    setupEventListeners() {
        // زر توسيع الخريطة
        const expandBtn = document.getElementById('expandMapBtn');
        if (expandBtn) {
            expandBtn.addEventListener('click', () => {
                this.openMapModal();
            });
        }

        // زر إغلاق النافذة المنبثقة
        const closeBtn = document.getElementById('closeMapModal');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.closeMapModal();
            });
        }

        // إغلاق النافذة عند النقر خارجها
        const modal = document.getElementById('mapModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.closeMapModal();
                }
            });
        }

        // إغلاق النافذة بمفتاح Escape
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isModalOpen) {
                this.closeMapModal();
            }
        });
    }

    openMapModal() {
        const modal = document.getElementById('mapModal');
        if (modal) {
            modal.classList.add('active');
            document.body.style.overflow = 'hidden';
            this.isModalOpen = true;

            // تهيئة الخريطة الكاملة إذا لم تكن موجودة
            if (!this.fullMap) {
                setTimeout(() => {
                    this.initFullMap();
                }, 100);
            } else {
                // إعادة تحديد حجم الخريطة
                setTimeout(() => {
                    this.fullMap.invalidateSize();
                }, 100);
            }
        }
    }

    closeMapModal() {
        const modal = document.getElementById('mapModal');
        if (modal) {
            modal.classList.remove('active');
            document.body.style.overflow = '';
            this.isModalOpen = false;
        }
    }

    // تحديث الخريطة عند تغيير حجم النافذة
    handleResize() {
        if (this.embeddedMap) {
            this.embeddedMap.invalidateSize();
        }
        if (this.fullMap && this.isModalOpen) {
            this.fullMap.invalidateSize();
        }
    }
}

// تهيئة نظام الخرائط عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    // التأكد من تحميل Leaflet
    if (typeof L !== 'undefined') {
        window.embeddedMapSystem = new EmbeddedMapSystem();

        // إضافة مستمع لتغيير حجم النافذة
        window.addEventListener('resize', () => {
            if (window.embeddedMapSystem) {
                window.embeddedMapSystem.handleResize();
            }
        });
    } else {
        console.error('Leaflet library not loaded');
    }
});
