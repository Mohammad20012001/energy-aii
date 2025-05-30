/* ===== ENERGY.MAP PROFESSIONAL FEATURES ===== */

class XMapFeatures {
    constructor() {
        this.isInitialized = false;
        this.currentTool = null;
        this.pvgisData = null;
        this.solarPanels = [];
        this.inverters = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.initializeFeatures();
        console.log('🗺️ Energy.map Professional Features initialized');
        this.isInitialized = true;
    }

    setupEventListeners() {
        // مستمعي أحداث ميزات Energy.map
        document.addEventListener('click', (e) => {
            if (e.target.closest('.xmap-feature-icon')) {
                const feature = e.target.closest('.xmap-feature-icon');
                this.handleFeatureClick(feature);
            }
        });

        // مستمعي أحداث بطاقة Energy.map
        document.addEventListener('click', (e) => {
            if (e.target.closest('.xmap-card')) {
                this.handleXMapCardClick(e);
            }
        });
    }

    handleFeatureClick(featureElement) {
        const featureType = this.getFeatureType(featureElement);
        
        switch (featureType) {
            case 'pvgis':
                this.activatePVGIS();
                break;
            case 'area':
                this.activateAreaAnalysis();
                break;
            case 'solar':
                this.activateSolarCalculations();
                break;
            case 'export':
                this.activateExportReports();
                break;
            case 'geospatial':
                this.activateGeospatialIntelligence();
                break;
            case 'satellite':
                this.activateSatelliteImagery();
                break;
        }
    }

    getFeatureType(element) {
        if (element.classList.contains('pvgis-icon')) return 'pvgis';
        if (element.title?.includes('Area')) return 'area';
        if (element.title?.includes('Solar')) return 'solar';
        if (element.title?.includes('Export')) return 'export';
        if (element.title?.includes('Geospatial')) return 'geospatial';
        if (element.title?.includes('Satellite')) return 'satellite';
        
        // تحديد النوع بناءً على الأيقونة
        const icon = element.querySelector('ion-icon');
        if (icon) {
            const iconName = icon.getAttribute('name');
            switch (iconName) {
                case 'sunny': return 'pvgis';
                case 'shapes': return 'area';
                case 'calculator': return 'solar';
                case 'download': return 'export';
                case 'globe': return 'geospatial';
                case 'satellite': return 'satellite';
            }
        }
        
        return 'unknown';
    }

    activatePVGIS() {
        this.showFeatureNotification('🌞 تم تفعيل نظام PVGIS للطاقة الشمسية');
        this.currentTool = 'pvgis';
        
        // تفعيل وضع PVGIS
        this.enablePVGISMode();
    }

    enablePVGISMode() {
        // إنشاء واجهة PVGIS
        this.createPVGISInterface();
        
        // تفعيل أدوات PVGIS
        this.setupPVGISTools();
    }

    createPVGISInterface() {
        // إزالة الواجهة السابقة إن وجدت
        const existingInterface = document.querySelector('.pvgis-interface');
        if (existingInterface) {
            existingInterface.remove();
        }

        // إنشاء واجهة PVGIS جديدة
        const pvgisInterface = document.createElement('div');
        pvgisInterface.className = 'pvgis-interface';
        pvgisInterface.innerHTML = `
            <div class="pvgis-panel">
                <div class="pvgis-header">
                    <h3>🌞 PVGIS Solar Analysis</h3>
                    <button class="close-pvgis" onclick="xMapFeatures.closePVGIS()">×</button>
                </div>
                <div class="pvgis-content">
                    <div class="pvgis-controls">
                        <label>نوع اللوح الشمسي:</label>
                        <select id="panelType">
                            <option value="crystalline">بلوري (Crystalline)</option>
                            <option value="thin-film">رقيق (Thin Film)</option>
                            <option value="cis">CIS</option>
                        </select>
                        
                        <label>قدرة النظام (kW):</label>
                        <input type="number" id="systemPower" value="1" min="0.1" step="0.1">
                        
                        <label>زاوية الميل (درجة):</label>
                        <input type="number" id="tiltAngle" value="30" min="0" max="90">
                        
                        <label>زاوية الاتجاه (درجة):</label>
                        <input type="number" id="azimuthAngle" value="180" min="0" max="360">
                        
                        <button class="calculate-btn" onclick="xMapFeatures.calculatePVGIS()">
                            حساب الإنتاج
                        </button>
                    </div>
                    <div class="pvgis-results" id="pvgisResults">
                        <p>اختر موقعاً على الخريطة لبدء التحليل</p>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(pvgisInterface);
        
        // إضافة الأنماط
        this.addPVGISStyles();
    }

    addPVGISStyles() {
        if (document.querySelector('#pvgis-styles')) return;

        const styles = document.createElement('style');
        styles.id = 'pvgis-styles';
        styles.textContent = `
            .pvgis-interface {
                position: fixed;
                top: 20px;
                right: 20px;
                width: 350px;
                background: rgba(0, 0, 0, 0.9);
                border: 2px solid #ff7200;
                border-radius: 15px;
                z-index: 10000;
                backdrop-filter: blur(15px);
                box-shadow: 0 15px 35px rgba(0, 0, 0, 0.3);
            }
            
            .pvgis-panel {
                padding: 20px;
                color: white;
            }
            
            .pvgis-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 15px;
                padding-bottom: 10px;
                border-bottom: 1px solid rgba(255, 114, 0, 0.3);
            }
            
            .pvgis-header h3 {
                margin: 0;
                color: #ff7200;
                font-size: 16px;
            }
            
            .close-pvgis {
                background: none;
                border: none;
                color: #ff7200;
                font-size: 20px;
                cursor: pointer;
                padding: 5px;
                border-radius: 50%;
                transition: all 0.3s ease;
            }
            
            .close-pvgis:hover {
                background: rgba(255, 114, 0, 0.2);
            }
            
            .pvgis-controls {
                margin-bottom: 15px;
            }
            
            .pvgis-controls label {
                display: block;
                margin: 10px 0 5px 0;
                font-size: 12px;
                color: #ff7200;
            }
            
            .pvgis-controls input,
            .pvgis-controls select {
                width: 100%;
                padding: 8px;
                border: 1px solid rgba(255, 114, 0, 0.3);
                border-radius: 5px;
                background: rgba(255, 255, 255, 0.1);
                color: white;
                font-size: 12px;
            }
            
            .calculate-btn {
                width: 100%;
                padding: 10px;
                background: linear-gradient(135deg, #ff7200 0%, #ff9500 100%);
                border: none;
                border-radius: 8px;
                color: white;
                font-weight: 500;
                cursor: pointer;
                margin-top: 15px;
                transition: all 0.3s ease;
            }
            
            .calculate-btn:hover {
                transform: scale(1.02);
                box-shadow: 0 5px 15px rgba(255, 114, 0, 0.3);
            }
            
            .pvgis-results {
                background: rgba(255, 114, 0, 0.1);
                border: 1px solid rgba(255, 114, 0, 0.3);
                border-radius: 8px;
                padding: 15px;
                font-size: 12px;
                line-height: 1.4;
            }
            
            @media (max-width: 768px) {
                .pvgis-interface {
                    width: 300px;
                    right: 10px;
                    top: 10px;
                }
            }
        `;

        document.head.appendChild(styles);
    }

    setupPVGISTools() {
        // تفعيل النقر على الخريطة لاختيار الموقع
        if (window.leafletMap) {
            window.leafletMap.on('click', (e) => {
                if (this.currentTool === 'pvgis') {
                    this.selectPVGISLocation(e.latlng);
                }
            });
        }
    }

    selectPVGISLocation(latlng) {
        // إزالة العلامة السابقة
        if (this.pvgisMarker) {
            window.leafletMap.removeLayer(this.pvgisMarker);
        }

        // إضافة علامة جديدة
        this.pvgisMarker = L.marker(latlng, {
            icon: L.divIcon({
                html: '<div style="background: #ffeb3b; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 8px rgba(0,0,0,0.3);"></div>',
                iconSize: [20, 20],
                iconAnchor: [10, 10]
            })
        }).addTo(window.leafletMap);

        this.selectedLocation = latlng;
        
        // تحديث النتائج
        document.getElementById('pvgisResults').innerHTML = `
            <p><strong>الموقع المحدد:</strong></p>
            <p>خط العرض: ${latlng.lat.toFixed(4)}°</p>
            <p>خط الطول: ${latlng.lng.toFixed(4)}°</p>
            <p>انقر على "حساب الإنتاج" للحصول على التحليل</p>
        `;
    }

    calculatePVGIS() {
        if (!this.selectedLocation) {
            this.showFeatureNotification('⚠️ يرجى اختيار موقع على الخريطة أولاً');
            return;
        }

        // محاكاة حساب PVGIS
        const panelType = document.getElementById('panelType').value;
        const systemPower = parseFloat(document.getElementById('systemPower').value);
        const tiltAngle = parseFloat(document.getElementById('tiltAngle').value);
        const azimuthAngle = parseFloat(document.getElementById('azimuthAngle').value);

        // حساب تقديري للإنتاج (محاكاة)
        const baseProduction = 1200; // kWh/kW/year للأردن
        const tiltFactor = Math.cos(Math.abs(tiltAngle - 30) * Math.PI / 180);
        const azimuthFactor = Math.cos(Math.abs(azimuthAngle - 180) * Math.PI / 180);
        
        const annualProduction = baseProduction * systemPower * tiltFactor * azimuthFactor;
        const monthlyProduction = annualProduction / 12;
        const dailyProduction = annualProduction / 365;

        // عرض النتائج
        document.getElementById('pvgisResults').innerHTML = `
            <div class="pvgis-calculation-results">
                <h4>🔋 نتائج التحليل الشمسي</h4>
                <div class="result-item">
                    <strong>الإنتاج السنوي:</strong> ${annualProduction.toFixed(0)} kWh
                </div>
                <div class="result-item">
                    <strong>الإنتاج الشهري:</strong> ${monthlyProduction.toFixed(0)} kWh
                </div>
                <div class="result-item">
                    <strong>الإنتاج اليومي:</strong> ${dailyProduction.toFixed(1)} kWh
                </div>
                <div class="result-item">
                    <strong>عامل الأداء:</strong> ${(tiltFactor * azimuthFactor * 100).toFixed(1)}%
                </div>
                <div class="result-item">
                    <strong>التوفير السنوي:</strong> ${(annualProduction * 0.1).toFixed(0)} دينار
                </div>
            </div>
        `;

        this.showFeatureNotification('✅ تم حساب الإنتاج الشمسي بنجاح');
    }

    activateAreaAnalysis() {
        this.showFeatureNotification('📐 تم تفعيل تحليل المساحات');
        this.currentTool = 'area';
        
        // تفعيل أدوات الرسم للمساحات
        if (window.advancedMapTools) {
            window.advancedMapTools.handleToolClick('polygon');
        }
    }

    activateSolarCalculations() {
        this.showFeatureNotification('🔢 تم تفعيل حاسبة الطاقة الشمسية');
        this.currentTool = 'solar';
    }

    activateExportReports() {
        this.showFeatureNotification('📊 تم تفعيل تصدير التقارير');
        this.exportCurrentAnalysis();
    }

    activateGeospatialIntelligence() {
        this.showFeatureNotification('🌍 تم تفعيل الذكاء الجغرافي المكاني');
        this.currentTool = 'geospatial';
    }

    activateSatelliteImagery() {
        this.showFeatureNotification('🛰️ تم تفعيل صور الأقمار الصناعية');
        
        // تغيير إلى طبقة الأقمار الصناعية
        if (window.toggleMapView) {
            // البحث عن طبقة الأقمار الصناعية وتفعيلها
            this.switchToSatelliteLayer();
        }
    }

    switchToSatelliteLayer() {
        if (window.mapBaseLayers && window.leafletMap) {
            // إزالة الطبقة الحالية
            window.leafletMap.eachLayer(function(layer) {
                if (layer._url) {
                    window.leafletMap.removeLayer(layer);
                }
            });
            
            // إضافة طبقة الأقمار الصناعية
            if (window.mapBaseLayers["Satellite Ultra"]) {
                window.mapBaseLayers["Satellite Ultra"].addTo(window.leafletMap);
                this.showFeatureNotification('🛰️ تم التبديل إلى صور الأقمار الصناعية');
            }
        }
    }

    exportCurrentAnalysis() {
        // إنشاء تقرير تحليل
        const report = {
            timestamp: new Date().toISOString(),
            location: this.selectedLocation || 'غير محدد',
            analysis: 'Energy.map Professional Analysis',
            features: ['PVGIS Integration', 'Area Analysis', 'Solar Calculations']
        };

        // تحويل إلى JSON وتنزيل
        const dataStr = JSON.stringify(report, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-map-analysis-${Date.now()}.json`;
        link.click();
        
        this.showFeatureNotification('📁 تم تصدير التقرير بنجاح');
    }

    closePVGIS() {
        const pvgisInterface = document.querySelector('.pvgis-interface');
        if (pvgisInterface) {
            pvgisInterface.remove();
        }
        
        // إزالة العلامة
        if (this.pvgisMarker && window.leafletMap) {
            window.leafletMap.removeLayer(this.pvgisMarker);
        }
        
        this.currentTool = null;
        this.selectedLocation = null;
    }

    handleXMapCardClick(event) {
        // إضافة تأثيرات بصرية عند النقر
        const card = event.target.closest('.xmap-card');
        if (card) {
            card.classList.add('clicked');
            setTimeout(() => {
                card.classList.remove('clicked');
            }, 300);
        }
    }

    showFeatureNotification(message) {
        // إزالة الإشعار السابق
        const existing = document.querySelector('.xmap-notification');
        if (existing) {
            existing.remove();
        }
        
        // إنشاء إشعار جديد
        const notification = document.createElement('div');
        notification.className = 'xmap-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <span class="notification-text">${message}</span>
            </div>
        `;
        
        // إضافة الأنماط
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff7200;
            border-radius: 25px;
            padding: 12px 20px;
            color: white;
            font-size: 14px;
            font-weight: 500;
            z-index: 10001;
            backdrop-filter: blur(15px);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            animation: slideDown 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        // إزالة الإشعار بعد 3 ثوان
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.animation = 'slideUp 0.3s ease-in';
                setTimeout(() => notification.remove(), 300);
            }
        }, 3000);
    }

    initializeFeatures() {
        // تهيئة الميزات الأساسية
        this.setupFeatureAnimations();
        this.loadFeatureData();
    }

    setupFeatureAnimations() {
        // إضافة رسوم متحركة للميزات
        const style = document.createElement('style');
        style.textContent = `
            .xmap-card.clicked {
                transform: scale(0.98);
                transition: transform 0.1s ease;
            }
            
            .xmap-notification {
                animation: slideDown 0.3s ease-out;
            }
            
            @keyframes slideDown {
                from {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
            }
            
            @keyframes slideUp {
                from {
                    transform: translateX(-50%) translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateX(-50%) translateY(-100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }

    loadFeatureData() {
        // تحميل بيانات الميزات (محاكاة)
        console.log('📊 Loading Energy.map feature data...');
        
        // محاكاة تحميل البيانات
        setTimeout(() => {
            console.log('✅ Energy.map features data loaded successfully');
        }, 1000);
    }
}

// تهيئة ميزات Energy.map عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    window.xMapFeatures = new XMapFeatures();
});

// تصدير للاستخدام العام
window.XMapFeatures = XMapFeatures;
