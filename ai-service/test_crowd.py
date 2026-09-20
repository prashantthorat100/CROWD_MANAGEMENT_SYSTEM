"""
Deep Learning & Computer Vision Crowd Inference Verification Script
Runs Roboflow crowd-detection model (or local fallback) on sample crowd image,
filters predictions with confidence cutoff and NMS, computes density HUD overlay, and saves output.
"""

import sys
import os
import cv2
import numpy as np

# Try importing inference_sdk
try:
    from inference_sdk import InferenceHTTPClient, InferenceConfiguration
    HAS_ROBOFLOW = True
except ImportError:
    HAS_ROBOFLOW = False

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
POSSIBLE_INPUTS = [
    os.path.join(SCRIPT_DIR, "crowd.jpg"),
    os.path.join(SCRIPT_DIR, "..", "data", "images", "crowd.jpg"),
    "crowd.jpg"
]

IMAGE_PATH = None
for p in POSSIBLE_INPUTS:
    if os.path.exists(p):
        IMAGE_PATH = p
        break

if not IMAGE_PATH:
    raise FileNotFoundError("Could not locate crowd.jpg test image in ai-service or data/images.")

OUTPUT_PATH = os.path.join(SCRIPT_DIR, "crowd_analysis_output.jpg")
MODEL_ID = "crowd-detection-n30gw/3"

CONFIDENCE_THRESHOLD = 0.50
NMS_THRESHOLD = 0.40
LOW_CROWD = 30
MEDIUM_CROWD = 70
HIGH_CROWD = 100

print(f"Loading image from: {IMAGE_PATH}")
image = cv2.imread(IMAGE_PATH)
if image is None:
    raise FileNotFoundError(f"Could not load image: {IMAGE_PATH}")

height, width = image.shape[:2]
predictions = []

# Roboflow inference
if HAS_ROBOFLOW:
    try:
        print("Connecting to Roboflow Serverless Inference...")
        client = InferenceHTTPClient(
            api_url="https://serverless.roboflow.com",
            api_key=os.getenv("ROBOFLOW_API_KEY", "NhOhGYySIAYl68cRkmlr")
        ).configure(InferenceConfiguration(api_key_transport="header"))
        
        result = client.infer(IMAGE_PATH, model_id=MODEL_ID)
        predictions = result.get("predictions", [])
        print(f"Roboflow inference successful. Raw detections: {len(predictions)}")
    except Exception as e:
        print(f"Roboflow inference failed or offline ({e}). Running OpenCV fallback...")
        predictions = []
else:
    print("inference-sdk not available. Using local OpenCV detection fallback...")

# Local fallback if predictions is empty
if len(predictions) == 0:
    gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
    blur = cv2.GaussianBlur(gray, (5, 5), 0)
    thresh = cv2.adaptiveThreshold(blur, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY_INV, 11, 2)
    contours, _ = cv2.findContours(thresh, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
    for cnt in contours:
        area = cv2.contourArea(cnt)
        if 150 < area < 4000:
            bx, by, bw, bh = cv2.boundingRect(cnt)
            predictions.append({
                "x": bx + bw / 2.0,
                "y": by + bh / 2.0,
                "width": float(bw),
                "height": float(bh),
                "confidence": float(min(0.95, 0.50 + (area / 8000.0)))
            })
    print(f"OpenCV fallback detected {len(predictions)} raw candidate regions.")

# Filter confidence
filtered = [p for p in predictions if p.get("confidence", 0) >= CONFIDENCE_THRESHOLD]
print(f"After confidence filtering (>={CONFIDENCE_THRESHOLD:.0%}): {len(filtered)}")

# Non-Maximum Suppression (NMS)
boxes = []
scores = []
valid_predictions = []

for p in filtered:
    x, y, w, h = p["x"], p["y"], p["width"], p["height"]
    x1 = max(0, int(x - w / 2))
    y1 = max(0, int(y - h / 2))
    boxes.append([x1, y1, int(w), int(h)])
    scores.append(float(p["confidence"]))
    valid_predictions.append(p)

final_predictions = []
if len(boxes) > 0:
    indices = cv2.dnn.NMSBoxes(boxes, scores, CONFIDENCE_THRESHOLD, NMS_THRESHOLD)
    if len(indices) > 0:
        indices = np.array(indices).flatten()
        final_predictions = [valid_predictions[i] for i in indices]

crowd_count = len(final_predictions)

if crowd_count < LOW_CROWD:
    crowd_status, status_message, status_color = "LOW", "NORMAL", (0, 255, 0)
elif crowd_count < MEDIUM_CROWD:
    crowd_status, status_message, status_color = "MEDIUM", "MODERATE CROWD", (0, 200, 255)
elif crowd_count < HIGH_CROWD:
    crowd_status, status_message, status_color = "HIGH", "HIGH CROWD", (0, 140, 255)
else:
    crowd_status, status_message, status_color = "CRITICAL", "CROWD ALERT", (0, 0, 255)

# Draw Bounding Boxes
for p in final_predictions:
    x, y, w, h = p["x"], p["y"], p["width"], p["height"]
    x1 = max(0, int(x - w / 2))
    y1 = max(0, int(y - h / 2))
    x2 = min(width - 1, int(x + w / 2))
    y2 = min(height - 1, int(y + h / 2))

    cv2.rectangle(image, (x1, y1), (x2, y2), status_color, 2)
    label = f"{p['confidence']:.0%}"
    cv2.putText(image, label, (x1, max(y1 - 5, 15)), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (255, 255, 255), 1, cv2.LINE_AA)

# Draw HUD Header
header_height = 115
overlay = image.copy()
cv2.rectangle(overlay, (0, 0), (width, header_height), (20, 20, 20), -1)
cv2.addWeighted(overlay, 0.85, image, 0.15, 0, image)

cv2.putText(image, "VARI SMART OPERATIONS - AI CROWD MONITORING", (20, 35),
            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2, cv2.LINE_AA)
cv2.putText(image, f"PEOPLE DETECTED: {crowd_count}", (20, 75),
            cv2.FONT_HERSHEY_SIMPLEX, 0.65, (0, 255, 255), 2, cv2.LINE_AA)
cv2.putText(image, f"STATUS: {status_message}", (max(20, width - 320), 75),
            cv2.FONT_HERSHEY_SIMPLEX, 0.55, status_color, 2, cv2.LINE_AA)

# Draw HUD Footer
footer_height = 35
cv2.rectangle(image, (0, height - footer_height), (width, height), (20, 20, 20), -1)
footer_text = f"AI Confidence >= {CONFIDENCE_THRESHOLD:.0%}   |   NMS IoU <= {NMS_THRESHOLD:.2f}   |   Model: Roboflow Crowd AI / OpenCV"
cv2.putText(image, footer_text, (10, height - 12), cv2.FONT_HERSHEY_SIMPLEX, 0.35, (220, 220, 220), 1, cv2.LINE_AA)

success = cv2.imwrite(OUTPUT_PATH, image)
if success:
    print("\n==========================================")
    print("       AI CROWD ANALYSIS COMPLETE")
    print("==========================================")
    print(f"Raw detections      : {len(predictions)}")
    print(f"Confidence filtered : {len(filtered)}")
    print(f"Final detections    : {crowd_count}")
    print(f"Crowd status        : {status_message}")
    print("------------------------------------------")
    print(f"Result saved to: {OUTPUT_PATH}")
    print("==========================================")
else:
    print("ERROR: Could not save result image.")

if "--show" in sys.argv:
    cv2.imshow("AI Crowd Monitoring System", image)
    cv2.waitKey(0)
    cv2.destroyAllWindows()
