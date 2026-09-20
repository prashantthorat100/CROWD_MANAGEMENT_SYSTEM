"""
Vari Smart Operations Platform — AI & Deep Learning Inference Service
Framework: FastAPI + OpenCV + Roboflow/YOLO + Scikit-Learn
Motto: SENSE -> PREDICT -> OPTIMIZE -> ACT
"""

import os
import sys
import datetime
from typing import List, Optional, Dict, Any
from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Query
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import HTMLResponse, StreamingResponse, JSONResponse, FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

# Import vision and detection pipeline
from detector import (
    process_crowd_image,
    generate_camera_stream,
    settings,
    alert_history,
    history_timeline,
    get_status,
    HAS_ROBOFLOW
)

app = FastAPI(
    title="Vari Smart Operations — AI & Analytics Service",
    description="Real-time Crowd Inference, Computer Vision, Density Scoring & Optimization API",
    version="1.1.0"
)

# Enable CORS for Frontend & Backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------
# STATIC ASSETS & SOC DASHBOARD MOUNT
# ------------------------------------------------------------
STATIC_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "static")
if os.path.exists(STATIC_DIR):
    app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")

# ------------------------------------------------------------
# DENSITY & RISK CALCULATION
# ------------------------------------------------------------
def calculate_density(current_count: int, capacity: int) -> float:
    if capacity <= 0:
        return 0.0
    return round((current_count / capacity) * 100.0, 2)

def determine_risk_level(density: float) -> str:
    if density < 60.0:
        return "SAFE"
    elif density <= 85.0:
        return "MODERATE"
    elif density <= 100.0:
        return "HIGH"
    else:
        return "CRITICAL"

# ------------------------------------------------------------
# SCHEMAS
# ------------------------------------------------------------
class DensityCheckRequest(BaseModel):
    zone_id: str
    zone_name: str
    current_count: int
    capacity: int

class DensityCheckResponse(BaseModel):
    zone_id: str
    zone_name: str
    current_count: int
    capacity: int
    density: float
    risk_level: str
    timestamp: str

class SettingsUpdate(BaseModel):
    confidence_threshold: Optional[float] = None
    nms_threshold: Optional[float] = None
    low_crowd: Optional[int] = None
    medium_crowd: Optional[int] = None
    high_crowd: Optional[int] = None
    sound_alarm: Optional[bool] = None

class AckAlert(BaseModel):
    alert_id: str

# ------------------------------------------------------------
# CORE ENDPOINTS
# ------------------------------------------------------------
@app.get("/")
def read_root():
    # If index.html is available, serve the SOC dashboard when accessed in browser
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "service": "Vari Smart Operations AI Service",
        "motto": "SENSE -> PREDICT -> OPTIMIZE -> ACT",
        "version": "1.1.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health",
        "soc_dashboard": "/soc"
    }

@app.get("/soc", response_class=HTMLResponse)
def serve_soc_dashboard():
    index_path = os.path.join(STATIC_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return HTMLResponse("<h2>SOC Dashboard static files not found.</h2>")

@app.get("/styles.css")
def serve_css():
    css_path = os.path.join(STATIC_DIR, "styles.css")
    if os.path.exists(css_path):
        return FileResponse(css_path, media_type="text/css")
    raise HTTPException(status_code=404, detail="CSS not found")

@app.get("/app.js")
def serve_js():
    js_path = os.path.join(STATIC_DIR, "app.js")
    if os.path.exists(js_path):
        return FileResponse(js_path, media_type="application/javascript")
    raise HTTPException(status_code=404, detail="JS not found")

@app.get("/crowd.jpg")
def serve_sample_img():
    img_path = os.path.join(STATIC_DIR, "crowd.jpg")
    if os.path.exists(img_path):
        return FileResponse(img_path, media_type="image/jpeg")
    raise HTTPException(status_code=404, detail="Sample image not found")

@app.get("/health")
def health_check():
    # Detect available ML/DL libraries
    has_cv2 = False
    try:
        import cv2
        has_cv2 = True
    except ImportError:
        pass

    has_sklearn = False
    try:
        import sklearn
        has_sklearn = True
    except ImportError:
        pass

    has_torch = False
    try:
        import torch
        has_torch = True
    except ImportError:
        pass

    has_yolo = False
    try:
        import ultralytics
        has_yolo = True
    except ImportError:
        pass

    return {
        "status": "healthy",
        "service": "ai-service",
        "python_version": sys.version,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z",
        "libraries": {
            "opencv": has_cv2,
            "roboflow_inference": HAS_ROBOFLOW,
            "scikit_learn": has_sklearn,
            "torch": has_torch,
            "ultralytics_yolo": has_yolo
        }
    }

@app.post("/api/density-check", response_model=DensityCheckResponse)
def check_density(payload: DensityCheckRequest):
    density = calculate_density(payload.current_count, payload.capacity)
    risk = determine_risk_level(density)
    return DensityCheckResponse(
        zone_id=payload.zone_id,
        zone_name=payload.zone_name,
        current_count=payload.current_count,
        capacity=payload.capacity,
        density=density,
        risk_level=risk,
        timestamp=datetime.datetime.utcnow().isoformat() + "Z"
    )

# ------------------------------------------------------------
# AI VISION & CROWD INFERENCE ENDPOINTS
# ------------------------------------------------------------
@app.post("/api/analyze")
async def analyze_image_endpoint(file: UploadFile = File(...)):
    """
    Accepts uploaded crowd image file, runs deep learning / OpenCV inference,
    NMS box suppression, spatial 5x5 heatmap calculation, and returns detections.
    """
    try:
        contents = await file.read()
        res = process_crowd_image(contents, filename=file.filename)
        return JSONResponse(content=res)
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

@app.post("/detect-crowd")
async def detect_crowd_endpoint(
    zone_id: str = Form("Z-GATE-2"),
    capacity: int = Form(1500),
    simulated_count: Optional[int] = Form(None),
    file: Optional[UploadFile] = File(None)
):
    """
    Dual-mode detection endpoint:
    - If an image file is provided, executes real computer vision inference.
    - If no file is provided, computes density from the specified or simulated count.
    """
    if file is not None:
        try:
            contents = await file.read()
            analysis = process_crowd_image(contents, filename=file.filename)
            count = analysis["count"]
            density = calculate_density(count, capacity)
            risk = determine_risk_level(density)
            return {
                "zone_id": zone_id,
                "count": count,
                "capacity": capacity,
                "density": density,
                "risk_level": risk,
                "processed_fps": 30.0,
                "is_simulated": False,
                "detections": analysis["predictions"],
                "annotated_image": analysis["annotated_image"],
                "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
            }
        except Exception as err:
            raise HTTPException(status_code=400, detail=f"Image processing error: {err}")

    # Fallback to simulated count
    count = simulated_count if simulated_count is not None else 850
    density = calculate_density(count, capacity)
    risk = determine_risk_level(density)
    return {
        "zone_id": zone_id,
        "count": count,
        "capacity": capacity,
        "density": density,
        "risk_level": risk,
        "processed_fps": 28.5,
        "detections": [],
        "is_simulated": True,
        "timestamp": datetime.datetime.utcnow().isoformat() + "Z"
    }

@app.get("/api/stream")
async def live_stream_endpoint(cam: int = Query(1, ge=1, le=4)):
    """
    Streams multi-camera CCTV MJPEG feed with real-time HUD annotations.
    """
    return StreamingResponse(
        generate_camera_stream(camera_id=cam),
        media_type="multipart/x-mixed-replace; boundary=frame"
    )

@app.get("/api/stats")
async def get_stats():
    counts = [item["count"] for item in history_timeline]
    current_count = counts[-1] if counts else 0
    peak_count = max(counts) if counts else 0
    avg_count = int(sum(counts) / len(counts)) if counts else 0
    current_status = get_status(current_count)
    
    return JSONResponse(content={
        "current_count": current_count,
        "peak_count": peak_count,
        "avg_count": avg_count,
        "status": current_status["status"],
        "status_message": current_status["message"],
        "status_color": current_status["color"],
        "total_alerts": len(alert_history),
        "unacknowledged_alerts": sum(1 for a in alert_history if not a["acknowledged"]),
        "timeline": history_timeline
    })

@app.get("/api/alerts")
async def get_alerts():
    return JSONResponse(content={"alerts": alert_history})

@app.post("/api/alerts/acknowledge")
async def acknowledge_alert(body: AckAlert):
    for a in alert_history:
        if a["id"] == body.alert_id:
            a["acknowledged"] = True
            return JSONResponse(content={"status": "success", "alert": a})
    raise HTTPException(status_code=404, detail="Alert ID not found")

@app.get("/api/settings")
async def get_settings():
    return JSONResponse(content=settings)

@app.post("/api/settings")
async def update_settings(update: SettingsUpdate):
    for key, val in update.dict(exclude_unset=True).items():
        if val is not None:
            settings[key] = val
    return JSONResponse(content={"status": "updated", "settings": settings})

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
