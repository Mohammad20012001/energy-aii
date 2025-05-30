/* ===== ENERGY.AI ADVANCED MAP TOOLS ===== */

class AdvancedMapTools {
    constructor() {
        this.map = null;
        this.currentTool = null;
        this.shapes = [];
        this.measurements = [];
        this.isDrawing = false;
        this.currentShape = null;
        this.drawingLayer = null;
        this.init();
    }

    init() {
        console.log('🗺️ Advanced Map Tools initialized');
        this.setupDrawingLayer();
        this.setupEventListeners();
    }

    setupDrawingLayer() {
        if (typeof L !== 'undefined') {
            this.drawingLayer = L.layerGroup();
        }
    }

    setupEventListeners() {
        // مستمعي أحداث أدوات الرسم
        document.addEventListener('click', (e) => {
            if (e.target.closest('.map-tool-btn')) {
                const tool = e.target.closest('.map-tool-btn').dataset.tool;
                this.selectTool(tool);
            }
        });

        // مستمعي أحداث لوحة المفاتيح
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.cancelCurrentDrawing();
            }
        });
    }

    setMap(map) {
        this.map = map;
        if (this.drawingLayer && this.map) {
            this.drawingLayer.addTo(this.map);
            this.setupMapEventListeners();
        }
    }

    setupMapEventListeners() {
        if (!this.map) return;

        this.map.on('click', (e) => {
            if (this.currentTool && this.isDrawing) {
                this.handleMapClick(e);
            }
        });

        this.map.on('mousemove', (e) => {
            if (this.isDrawing && this.currentShape) {
                this.updateCurrentShape(e);
            }
        });
    }

    selectTool(toolName) {
        // إلغاء الأداة الحالية
        this.cancelCurrentDrawing();
        
        // تحديد الأداة الجديدة
        this.currentTool = toolName;
        this.isDrawing = false;
        
        // تحديث واجهة المستخدم
        this.updateToolButtons();
        
        // تغيير مؤشر الفأرة
        this.updateMapCursor();
        
        console.log(`🔧 Tool selected: ${toolName}`);
    }

    updateToolButtons() {
        const toolButtons = document.querySelectorAll('.map-tool-btn');
        toolButtons.forEach(btn => {
            btn.classList.remove('active');
            if (btn.dataset.tool === this.currentTool) {
                btn.classList.add('active');
            }
        });
    }

    updateMapCursor() {
        if (!this.map) return;

        const mapContainer = this.map.getContainer();
        
        switch (this.currentTool) {
            case 'polygon':
                mapContainer.style.cursor = 'crosshair';
                break;
            case 'rectangle':
                mapContainer.style.cursor = 'crosshair';
                break;
            case 'circle':
                mapContainer.style.cursor = 'crosshair';
                break;
            case 'measure':
                mapContainer.style.cursor = 'crosshair';
                break;
            default:
                mapContainer.style.cursor = '';
        }
    }

    handleMapClick(e) {
        switch (this.currentTool) {
            case 'polygon':
                this.handlePolygonClick(e);
                break;
            case 'rectangle':
                this.handleRectangleClick(e);
                break;
            case 'circle':
                this.handleCircleClick(e);
                break;
            case 'measure':
                this.handleMeasureClick(e);
                break;
        }
    }

    handlePolygonClick(e) {
        if (!this.isDrawing) {
            // بدء رسم مضلع جديد
            this.startPolygon(e.latlng);
        } else {
            // إضافة نقطة جديدة للمضلع
            this.addPolygonPoint(e.latlng);
        }
    }

    startPolygon(latlng) {
        this.isDrawing = true;
        this.currentShape = {
            type: 'polygon',
            points: [latlng],
            layer: null
        };
        
        // إنشاء مضلع مؤقت
        this.updatePolygonDisplay();
    }

    addPolygonPoint(latlng) {
        this.currentShape.points.push(latlng);
        this.updatePolygonDisplay();
    }

    updatePolygonDisplay() {
        if (!this.currentShape || this.currentShape.type !== 'polygon') return;

        // إزالة الطبقة السابقة
        if (this.currentShape.layer) {
            this.drawingLayer.removeLayer(this.currentShape.layer);
        }

        // إنشاء مضلع جديد
        if (this.currentShape.points.length >= 2) {
            this.currentShape.layer = L.polygon(this.currentShape.points, {
                color: '#ff7200',
                fillColor: '#ff7200',
                fillOpacity: 0.2,
                weight: 2
            });
            
            this.drawingLayer.addLayer(this.currentShape.layer);
        }
    }

    finishPolygon() {
        if (!this.currentShape || this.currentShape.points.length < 3) return;

        // حساب المساحة
        const area = this.calculatePolygonArea(this.currentShape.points);
        
        // إضافة popup مع المعلومات
        const popup = L.popup()
            .setContent(`
                <div class="shape-info">
                    <h4>🔷 مضلع</h4>
                    <p><strong>المساحة:</strong> ${area.toFixed(2)} م²</p>
                    <p><strong>النقاط:</strong> ${this.currentShape.points.length}</p>
                    <button onclick="advancedMapTools.deleteShape(${this.shapes.length})">حذف</button>
                </div>
            `);
        
        this.currentShape.layer.bindPopup(popup);
        
        // حفظ الشكل
        this.shapes.push({
            ...this.currentShape,
            area: area,
            id: this.shapes.length
        });
        
        // إنهاء الرسم
        this.finishDrawing();
    }

    calculatePolygonArea(points) {
        if (points.length < 3) return 0;
        
        // استخدام خوارزمية Shoelace لحساب المساحة
        let area = 0;
        for (let i = 0; i < points.length; i++) {
            const j = (i + 1) % points.length;
            area += points[i].lat * points[j].lng;
            area -= points[j].lat * points[i].lng;
        }
        area = Math.abs(area) / 2;
        
        // تحويل إلى متر مربع (تقريبي)
        return area * 111320 * 111320 * Math.cos(points[0].lat * Math.PI / 180);
    }

    handleRectangleClick(e) {
        if (!this.isDrawing) {
            this.startRectangle(e.latlng);
        } else {
            this.finishRectangle(e.latlng);
        }
    }

    startRectangle(latlng) {
        this.isDrawing = true;
        this.currentShape = {
            type: 'rectangle',
            startPoint: latlng,
            endPoint: latlng,
            layer: null
        };
    }

    updateCurrentShape(e) {
        if (!this.currentShape) return;

        if (this.currentShape.type === 'rectangle') {
            this.currentShape.endPoint = e.latlng;
            this.updateRectangleDisplay();
        }
    }

    updateRectangleDisplay() {
        if (!this.currentShape || this.currentShape.type !== 'rectangle') return;

        // إزالة الطبقة السابقة
        if (this.currentShape.layer) {
            this.drawingLayer.removeLayer(this.currentShape.layer);
        }

        // إنشاء مستطيل جديد
        const bounds = L.latLngBounds(this.currentShape.startPoint, this.currentShape.endPoint);
        this.currentShape.layer = L.rectangle(bounds, {
            color: '#ff7200',
            fillColor: '#ff7200',
            fillOpacity: 0.2,
            weight: 2
        });
        
        this.drawingLayer.addLayer(this.currentShape.layer);
    }

    finishRectangle(endPoint) {
        this.currentShape.endPoint = endPoint;
        this.updateRectangleDisplay();
        
        // حساب المساحة
        const bounds = L.latLngBounds(this.currentShape.startPoint, this.currentShape.endPoint);
        const area = this.calculateRectangleArea(bounds);
        
        // إضافة popup
        const popup = L.popup()
            .setContent(`
                <div class="shape-info">
                    <h4>⬜ مستطيل</h4>
                    <p><strong>المساحة:</strong> ${area.toFixed(2)} م²</p>
                    <button onclick="advancedMapTools.deleteShape(${this.shapes.length})">حذف</button>
                </div>
            `);
        
        this.currentShape.layer.bindPopup(popup);
        
        // حفظ الشكل
        this.shapes.push({
            ...this.currentShape,
            area: area,
            id: this.shapes.length
        });
        
        this.finishDrawing();
    }

    calculateRectangleArea(bounds) {
        const ne = bounds.getNorthEast();
        const sw = bounds.getSouthWest();
        
        // حساب المسافة بالمتر
        const width = this.calculateDistance(sw, L.latLng(sw.lat, ne.lng));
        const height = this.calculateDistance(sw, L.latLng(ne.lat, sw.lng));
        
        return width * height;
    }

    calculateDistance(latlng1, latlng2) {
        // استخدام صيغة Haversine لحساب المسافة
        const R = 6371000; // نصف قطر الأرض بالمتر
        const dLat = (latlng2.lat - latlng1.lat) * Math.PI / 180;
        const dLng = (latlng2.lng - latlng1.lng) * Math.PI / 180;
        const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
                Math.cos(latlng1.lat * Math.PI / 180) * Math.cos(latlng2.lat * Math.PI / 180) *
                Math.sin(dLng/2) * Math.sin(dLng/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        return R * c;
    }

    cancelCurrentDrawing() {
        if (this.currentShape && this.currentShape.layer) {
            this.drawingLayer.removeLayer(this.currentShape.layer);
        }
        
        this.isDrawing = false;
        this.currentShape = null;
        this.currentTool = null;
        
        this.updateToolButtons();
        this.updateMapCursor();
    }

    finishDrawing() {
        this.isDrawing = false;
        this.currentShape = null;
        this.updateMapCursor();
    }

    deleteShape(shapeId) {
        const shape = this.shapes[shapeId];
        if (shape && shape.layer) {
            this.drawingLayer.removeLayer(shape.layer);
            this.shapes.splice(shapeId, 1);
            
            // إعادة ترقيم الأشكال
            this.shapes.forEach((shape, index) => {
                shape.id = index;
            });
        }
    }

    clearAllShapes() {
        this.shapes.forEach(shape => {
            if (shape.layer) {
                this.drawingLayer.removeLayer(shape.layer);
            }
        });
        
        this.shapes = [];
        this.cancelCurrentDrawing();
    }

    exportShapes() {
        const exportData = {
            timestamp: new Date().toISOString(),
            shapes: this.shapes.map(shape => ({
                type: shape.type,
                area: shape.area,
                points: shape.points || [shape.startPoint, shape.endPoint]
            }))
        };
        
        const dataStr = JSON.stringify(exportData, null, 2);
        const dataBlob = new Blob([dataStr], {type: 'application/json'});
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `energy-map-shapes-${Date.now()}.json`;
        link.click();
        
        console.log('📊 Shapes exported successfully');
    }

    // دوال مساعدة
    getTotalArea() {
        return this.shapes.reduce((total, shape) => total + (shape.area || 0), 0);
    }

    getShapeCount() {
        return this.shapes.length;
    }

    getShapesByType(type) {
        return this.shapes.filter(shape => shape.type === type);
    }
}

// تهيئة أدوات الخريطة المتقدمة
document.addEventListener('DOMContentLoaded', function() {
    window.advancedMapTools = new AdvancedMapTools();
});

// تصدير الفئة للاستخدام العام
window.AdvancedMapTools = AdvancedMapTools;
