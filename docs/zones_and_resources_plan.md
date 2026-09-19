# Vari Smart Operations — Planning & Specification Document

> **Phase 0 Deliverable:** Operational Zones, Resource Stations, Sanitation Zones, and Volunteer Roster for Simulation & Seed Data.

---

## 1. Monitored Crowd Zones

Coordinates centered around a representative pilgrimage corridor (Pandharpur / Alandi corridor reference: Lat ~17.6775, Lng ~75.3275).

| Zone ID | Zone Name | Capacity | Baseline Count | Typical Role / Description | Coordinates (Lat, Lng) |
|:---|:---|:---|:---|:---|:---|
| `Z-GATE-1` | **North Gate (Gate 1)** | 1,200 | 450 (37.5%) | Primary pedestrian entry from riverbank | 17.6782, 75.3245 |
| `Z-GATE-2` | **East Gate (Gate 2)** | 1,500 | 1,080 (72.0%) | Main transit gate from bus hub *(Surge Demo)* | 17.6795, 75.3280 |
| `Z-GATE-3` | **South Gate (Gate 3)** | 1,800 | 740 (41.1%) | Auxiliary bypass entry / overflow gate | 17.6750, 75.3265 |
| `Z-TEMPLE` | **Temple Courtyard** | 2,500 | 1,850 (74.0%) | Core sanctum queue and waiting enclosure | 17.6775, 75.3275 |
| `Z-MAIN-RD` | **Pradakshina Road** | 3,000 | 1,600 (53.3%) | Main circular procession route | 17.6765, 75.3300 |
| `Z-PARK-W` | **West Parking Complex** | 1,000 | 320 (32.0%) | Vehicle drop-off and gathering plaza | 17.6740, 75.3220 |

---

## 2. Food & Water Resource Stations

| Station ID | Station Name | Type | Capacity (Units/L) | Current Level | Status | Coordinates (Lat, Lng) |
|:---|:---|:---|:---|:---|:---|:---|
| `RES-WTR-01` | **Water Point Alpha (Gate 1)** | Water | 5,000 L | 4,200 L (84%) | `normal` | 17.6780, 75.3248 |
| `RES-WTR-02` | **Water Point Beta (Gate 2)** | Water | 6,000 L | 1,350 L (22.5%) | `shortage` *(Low trigger)* | 17.6792, 75.3278 |
| `RES-WTR-03` | **Water Point Gamma (Gate 3)** | Water | 5,000 L | 4,500 L (90%) | `surplus` *(Transfer donor)* | 17.6752, 75.3262 |
| `RES-WTR-04` | **Temple Hydration Hub** | Water | 8,000 L | 5,800 L (72.5%) | `normal` | 17.6773, 75.3272 |
| `RES-FOOD-01` | **Annadanam Hall 1 (North)** | Food | 3,000 Pkts | 2,400 Pkts (80%) | `normal` | 17.6788, 75.3250 |
| `RES-FOOD-02` | **Annadanam Hall 2 (South)** | Food | 3,000 Pkts | 1,950 Pkts (65%) | `normal` | 17.6748, 75.3260 |

---

## 3. Waste & Sanitation Zones

| Sanitation ID | Zone Covered | Capacity (Kg/Vol) | Waste Fill % | Last Cleaned | Priority | Assigned Team |
|:---|:---|:---|:---|:---|:---|:---|
| `SAN-01` | East Gate Corridor | 500 kg | **88%** | 3.5 hrs ago | `high` *(Alert trigger)* | Team Clean-Alpha |
| `SAN-02` | Temple Queue Area | 800 kg | 45% | 45 mins ago | `low` | Team Clean-Bravo |
| `SAN-03` | Pradakshina West | 600 kg | 62% | 1.5 hrs ago | `medium` | Team Clean-Gamma |
| `SAN-04` | Main Parking Plaza | 400 kg | 30% | 2.0 hrs ago | `low` | Team Clean-Delta |

---

## 4. Volunteer Roster (16 Simulated Volunteers)

| Volunteer ID | Name | Primary Skill | Location (Lat, Lng) | Status | Assigned Task / Zone |
|:---|:---|:---|:---|:---|:---|
| `VOL-01` | Rohan Deshmukh | Crowd Control | 17.6790, 75.3275 | `available` | Ready for Gate 2 surge |
| `VOL-02` | Priya Patil | Medical / First Aid | 17.6785, 75.3270 | `available` | Near East Gate |
| `VOL-03` | Amit Kulkarni | Crowd Control | 17.6798, 75.3285 | `available` | Outer Gate 2 perimeter |
| `VOL-04` | Snehal Shinde | Logistics / Water | 17.6754, 75.3260 | `available` | Near Gate 3 water hub |
| `VOL-05` | Vikram Joshi | Crowd Control | 17.6778, 75.3270 | `on_duty` | Temple courtyard |
| `VOL-06` | Pooja Pawar | Crowd Control | 17.6780, 75.3240 | `available` | Near Gate 1 |
| `VOL-07` | Rahul Gade | Logistics / Food | 17.6786, 75.3252 | `on_duty` | Annadanam Hall 1 |
| `VOL-08` | Anjali More | First Aid | 17.6772, 75.3278 | `available` | Temple central station |
| `VOL-09` | Sachin Jadhav | Crowd Control | 17.6791, 75.3282 | `available` | Near East Gate |
| `VOL-10` | Tanvi Bhosale | Sanitation Coord | 17.6793, 75.3276 | `available` | Near East Gate sanitation |
| `VOL-11` | Omkar Gaikwad | Crowd Control | 17.6751, 75.3268 | `available` | Gate 3 corridor |
| `VOL-12` | Deepa Sonawane | Logistics / Water | 17.6770, 75.3270 | `available` | Central transit |
| `VOL-13` | Nilesh Salunkhe | Crowd Control | 17.6766, 75.3298 | `on_duty` | Pradakshina road |
| `VOL-14` | Swati Chavan | First Aid | 17.6742, 75.3225 | `available` | Parking Medical tent |
| `VOL-15` | Mahesh Kale | Crowd Control | 17.6788, 75.3278 | `available` | Near East Gate |
| `VOL-16` | Gauri Sawant | Logistics / Food | 17.6750, 75.3258 | `available` | Annadanam Hall 2 |

---

## 5. Dashboard Layout Sketch

```
+-----------------------------------------------------------------------------------------+
| [LOGO] VARI SMART OPERATIONS      [LIVE STATUS: NORMAL]   [SIMULATION DATA ONLY BADGE]  |
+-------------------+---------------------------------------------------------------------+
| SIDEBAR           | TOP STAT CARDS:                                                     |
| - Overview        | [Total Crowd: 6,040] [Avg Density: 57%] [Alerts: 2] [Volunteers: 16]|
| - Live Map        +-----------------------------------+---------------------------------+
| - Crowd Zones     | REAL-TIME MAP (Leaflet)           | ZONE DENSITY BARS & SURGE CHART |
| - Volunteers      | - Color-coded markers for zones   | - Gate 1: 37% (SAFE)            |
| - Resources       | - Gate pins with live capacity    | - Gate 2: 72% -> Surge target   |
| - Sanitation      | - Water points & Sanitation bins  | - Temple: 74% (MODERATE)        |
| - Alerts          +-----------------------------------+---------------------------------+
| - Simulation [HOT]| AI RECOMMENDATIONS & ACTIONS      | ACTIVE ALERTS PANEL             |
|                   | [!] Divert Gate 2 to Gate 3       | [CRITICAL] Gate 2 reaching 103% |
|                   | [!] Transfer 1000L Water G3 -> G2 | [WARNING] Bin SAN-01 at 88%     |
|                   | [Action: Dispatch 4 Volunteers]   | [INFO] Water point 2 low        |
+-------------------+---------------------------------------------------------------------+
```
