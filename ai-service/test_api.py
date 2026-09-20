import sys
import os
import requests

# Fix Windows console utf-8 output printing
if hasattr(sys.stdout, 'reconfigure'):
    sys.stdout.reconfigure(encoding='utf-8')

BASE_URL = os.getenv("AI_SERVICE_URL", "http://127.0.0.1:8000")
SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))

POSSIBLE_CROWD_IMAGES = [
    os.path.join(SCRIPT_DIR, "crowd.jpg"),
    os.path.join(SCRIPT_DIR, "..", "data", "images", "crowd.jpg"),
    "crowd.jpg"
]

CROWD_IMG = None
for p in POSSIBLE_CROWD_IMAGES:
    if os.path.exists(p):
        CROWD_IMG = p
        break

def test_api():
    print("==================================================")
    print(f"  TESTING VARI SMART OPS AI SERVICE AT {BASE_URL}")
    print("==================================================")
    
    # 1. Test Health / Root index
    print("\n[1/6] Testing GET /health & GET / ...")
    r_health = requests.get(BASE_URL + "/health")
    assert r_health.status_code == 200, f"Health endpoint failed: {r_health.status_code}"
    health_data = r_health.json()
    print(f"  [OK] Health probe passed! Status: {health_data.get('status')}")

    r_root = requests.get(BASE_URL + "/")
    assert r_root.status_code in [200, 307], f"Root endpoint returned {r_root.status_code}"
    print("  [OK] Root endpoint returned active response")

    # 2. Test /api/density-check (Vari Platform specific)
    print("\n[2/6] Testing POST /api/density-check ...")
    r_density = requests.post(BASE_URL + "/api/density-check", json={
        "zone_id": "Z-GATE-1",
        "zone_name": "Main Gate",
        "current_count": 1200,
        "capacity": 1000
    })
    assert r_density.status_code == 200
    density_res = r_density.json()
    print(f"  [OK] Density calculated: {density_res['density']}% (Risk: {density_res['risk_level']})")

    # 3. Test /api/stats
    print("\n[3/6] Testing GET /api/stats ...")
    r_stats = requests.get(BASE_URL + "/api/stats")
    assert r_stats.status_code == 200
    stats = r_stats.json()
    print(f"  [OK] Stats success! Current count: {stats['current_count']}, Status: {stats['status']}")

    # 4. Test /api/alerts
    print("\n[4/6] Testing GET /api/alerts ...")
    r_alerts = requests.get(BASE_URL + "/api/alerts")
    assert r_alerts.status_code == 200
    alerts = r_alerts.json().get("alerts", [])
    print(f"  [OK] Alerts retrieved! Total alert history items: {len(alerts)}")

    # 5. Test /api/analyze with crowd.jpg
    print(f"\n[5/6] Testing POST /api/analyze with {CROWD_IMG} ...")
    if CROWD_IMG and os.path.exists(CROWD_IMG):
        with open(CROWD_IMG, "rb") as f:
            files = {"file": ("crowd.jpg", f, "image/jpeg")}
            r_analyze = requests.post(BASE_URL + "/api/analyze", files=files)
        
        assert r_analyze.status_code == 200, f"Analysis failed: {r_analyze.text}"
        res = r_analyze.json()
        print("  [OK] AI Inference Analysis complete!")
        print(f"    - People Detected     : {res['count']}")
        print(f"    - Status               : {res['status']} ({res['message']})")
        print(f"    - Raw Detections       : {res['predictions_raw']}")
        print(f"    - Filtered Detections  : {res['predictions_filtered']}")
        print(f"    - Base64 Output Image  : Received {len(res['annotated_image'])} characters")
        print(f"    - Spatial Grid Matrix  : {len(res['density_grid'])}x{len(res['density_grid'][0])} grid")
    else:
        print("  [WARN] crowd.jpg not found for analysis test.")

    # 6. Test /api/settings update
    print("\n[6/6] Testing POST /api/settings update ...")
    r_settings = requests.post(BASE_URL + "/api/settings", json={"high_crowd": 95, "sound_alarm": True})
    assert r_settings.status_code == 200
    print("  [OK] Settings updated successfully!")

    print("\n==================================================")
    print("     ALL API ENDPOINT VERIFICATION TESTS PASSED!")
    print("==================================================")

if __name__ == "__main__":
    try:
        test_api()
    except Exception as e:
        print(f"\n[FAIL] VERIFICATION TEST FAILED: {e}")
        sys.exit(1)
