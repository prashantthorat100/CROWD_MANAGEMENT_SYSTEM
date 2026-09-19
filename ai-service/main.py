"""
Vari Smart Operations Platform — AI & Deep Learning Inference Service
Framework: FastAPI + OpenCV + YOLO + Scikit-Learn
Motto: SENSE -> PREDICT -> OPTIMIZE -> ACT
"""

from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import datetime
import sys
import os

app = FastAPI(
    title="Vari Smart Operations — AI & Analytics Service",
    description="Inference, density scoring, risk classification, crowd prediction & optimization API",
    version="1.0.0"
)

# Enable CORS for Frontend & Backend communication
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Risk Threshold Logic from Project Specs
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

# Schemas
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

class DetectionResponse(BaseModel):
    count: int
    density: float
    risk_level: str
    processed_fps: float
    detections: List[Dict[str, Any]]
    is_simulated: bool
    timestamp: str

@app.get("/")
def read_root():
    return {
        "service": "Vari Smart Operations AI Service",
        "motto": "SENSE -> PREDICT -> OPTIMIZE -> ACT",
        "version": "1.0.0",
        "status": "online",
        "docs": "/docs",
        "health": "/health"
    }

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

@app.post("/detect-crowd", response_model=DetectionResponse)
def detect_crowd_placeholder(
    zone_id: str = Form("Z-GATE-2"),
    capacity: int = Form(1500),
    simulated_count: Optional[int] = Form(1080)
):
    """
    Phase 0/3 endpoint stub: In Phase 3, this receives video frames or video stream,
    runs YOLO person detection (COCO class 0), and returns precise counts & bounding boxes.
    """
    count = simulated_count if simulated_count is not None else 850
    density = calculate_density(count, capacity)
    risk = determine_risk_level(density)

    return DetectionResponse(
        count=count,
        density=density,
        risk_level=risk,
        processed_fps=28.5,
        detections=[],
        is_simulated=True,
        timestamp=datetime.datetime.utcnow().isoformat() + "Z"
    )

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
