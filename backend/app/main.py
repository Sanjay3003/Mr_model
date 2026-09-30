from __future__ import annotations

import json
import os
import csv
import io
import urllib.parse
import urllib.request
from datetime import date, datetime
from typing import List, Literal, Optional

from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from .database import connection, initialize


app = FastAPI(title="ModelReach Demo API", version="1.0.0")
origins = [item.strip() for item in os.getenv("MODELREACH_FRONTEND_ORIGIN", "http://localhost:3000").split(",")]
app.add_middleware(CORSMiddleware, allow_origins=origins, allow_credentials=True, allow_methods=["*"], allow_headers=["*"])


class ApplicationCreate(BaseModel):
    agency_id: int
    campaign: str = "Milan Campaign"
    method: str = "Website"


class ApplicationUpdate(BaseModel):
    status: Optional[Literal["Preparing", "Ready", "Submitted", "Follow up", "Responded"]] = None
    response: Optional[str] = Field(default=None, max_length=500)


class PreferencesUpdate(BaseModel):
    new_lead: bool
    message_reply: bool
    ad_signal: bool
    agency_change: bool


class ProfileUpdate(BaseModel):
    name: Optional[str] = "Alex Morgan"
    location: Optional[str] = "Milan, Italy"
    height_cm: Optional[int] = Field(default=188, ge=120, le=230)
    weight_kg: Optional[int] = Field(default=78, ge=35, le=180)
    chest_cm: Optional[int] = Field(default=96, ge=50, le=160)
    waist_cm: Optional[int] = Field(default=78, ge=45, le=160)
    hips_cm: Optional[int] = Field(default=94, ge=50, le=170)
    shoe_eu: Optional[int] = Field(default=43, ge=30, le=55)
    instagram: Optional[str] = "@alexmorgan"
    hair_eyes: Optional[str] = "Brown / Brown"
    nationality: Optional[str] = "Italian"
    playing_age: Optional[str] = "23–29"
    categories: Optional[List[str]] = None
    headshot_url: Optional[str] = None
    assets: Optional[List[dict]] = None


class ImportRequest(BaseModel):
    city: Literal["Milan", "Rome", "Paris"] = "Milan"


class CsvImportRequest(BaseModel):
    csv_text: str = Field(min_length=3, max_length=100_000)


class OpportunityCreate(BaseModel):
    name: str = Field(min_length=2, max_length=100)
    email: str = Field(min_length=5, max_length=200, pattern=r"^[^\s@]+@[^\s@]+\.[^\s@]+$")
    company: Optional[str] = Field(default=None, max_length=120)
    source: str = Field(default="Website enquiry", max_length=80)
    message: str = Field(min_length=10, max_length=2_000)


class OpportunityUpdate(BaseModel):
    status: Literal["New", "Reviewing", "Qualified", "Contacted", "Casting", "Won", "Lost"]
    next_follow_up: Optional[str] = None


def rows(items):
    return [dict(item) for item in items]


def initials(name: str) -> str:
    parts = [part for part in name.replace("-", " ").split() if part]
    return "".join(part[0] for part in parts[:2]).upper() or "AG"


def store_candidates(candidates: List[dict]) -> dict:
    inserted = 0
    duplicates = 0
    with connection() as db:
        for item in candidates:
            try:
                db.execute(
                    """INSERT INTO import_candidates
                    (name, location, website, email, source_type, source_url, external_id, confidence, status, discovered_at, raw_json)
                    VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', ?, ?)""",
                    (item["name"], item.get("location") or "Unknown", item.get("website"), item.get("email"), item["source_type"], item["source_url"], item["external_id"], item.get("confidence", 60), datetime.now().isoformat(timespec="seconds"), json.dumps(item.get("raw", {}))),
                )
                inserted += 1
            except Exception:
                duplicates += 1
    return {"inserted": inserted, "duplicates": duplicates, "review_required": True}


@app.on_event("startup")
def startup() -> None:
    initialize()


@app.get("/api/health")
def health():
    return {"status": "ok", "service": "modelreach-api", "time": datetime.now().isoformat()}


@app.get("/api/dashboard")
def dashboard():
    with connection() as db:
        stage_rows = rows(db.execute("SELECT stage, count, detail FROM campaign_stages ORDER BY sort_order"))
        activity = rows(db.execute("SELECT * FROM activities ORDER BY happened_at DESC LIMIT 4"))
    return {
        "metrics": [{"label": "Agencies found", "value": 43, "note": "+8 this week"}, {"label": "Verified", "value": 28, "note": "65% of total"}, {"label": "Ready to apply", "value": 24, "note": "86% complete"}, {"label": "Applications", "value": 12, "note": "3 responses"}],
        "pipeline": stage_rows,
        "activity": activity,
        "readiness": 92,
        "needs_attention": [{"title": "3 agencies ready for application", "action": "Review"}, {"title": "2 profile assets need attention", "action": "Complete"}, {"title": "3 submissions awaiting follow-up", "action": "Follow up"}],
        "demo": True,
    }


@app.get("/api/agencies")
def list_agencies(q: str = Query(default="", max_length=100)):
    with connection() as db:
        data = rows(db.execute("""SELECT id, name, initials, location, division, agency_type AS type,
          match_score AS match, application_method AS method, verified, accent, last_checked, source_type, source_url
          FROM agencies WHERE name LIKE ? ORDER BY match_score DESC""", (f"%{q.strip()}%",)))
    for agency in data:
        agency["verified"] = bool(agency["verified"])
    return {"items": data, "total": len(data), "reference_total": 43}


@app.post("/api/agencies/{agency_id}/add-to-campaign", status_code=201)
def add_agency_to_campaign(agency_id: int):
    with connection() as db:
        agency = db.execute("SELECT * FROM agencies WHERE id = ?", (agency_id,)).fetchone()
        if not agency:
            raise HTTPException(404, "Agency not found")
        existing = db.execute("SELECT id FROM applications WHERE agency_id = ?", (agency_id,)).fetchone()
        if existing:
            return {"id": existing["id"], "created": False, "message": "Agency is already in the campaign"}
        cursor = db.execute("""INSERT INTO applications
          (agency_id, campaign, method, prepared_on, status, simulated)
          VALUES (?, 'Milan Campaign', ?, ?, 'Preparing', 1)""", (agency_id, agency["application_method"], date.today().isoformat()))
        db.execute("INSERT INTO activities(kind, title, subject, happened_at) VALUES ('campaign', 'Agency added to campaign', ?, ?)", (agency["name"], datetime.now().isoformat(timespec="seconds")))
        return {"id": cursor.lastrowid, "created": True, "message": "Agency added to the demo campaign"}


@app.get("/api/applications")
def list_applications(status: str = "All"):
    sql = """SELECT ap.id, a.id AS agency_id, a.name AS agency, a.initials, ap.campaign, ap.method,
      ap.prepared_on, ap.submitted_on, ap.status, ap.response, ap.simulated
      FROM applications ap JOIN agencies a ON a.id = ap.agency_id"""
    params: tuple[str, ...] = ()
    if status not in {"", "All"}:
        sql += " WHERE ap.status = ?"
        params = (status,)
    sql += " ORDER BY ap.id"
    with connection() as db:
        data = rows(db.execute(sql, params))
    for item in data:
        item["simulated"] = bool(item["simulated"])
    return {"items": data, "total": len(data), "demo": True}


@app.post("/api/applications", status_code=201)
def create_application(payload: ApplicationCreate):
    with connection() as db:
        agency = db.execute("SELECT name FROM agencies WHERE id = ?", (payload.agency_id,)).fetchone()
        if not agency:
            raise HTTPException(404, "Agency not found")
        try:
            cursor = db.execute("""INSERT INTO applications
              (agency_id, campaign, method, prepared_on, status, simulated)
              VALUES (?, ?, ?, ?, 'Preparing', 1)""", (payload.agency_id, payload.campaign, payload.method, date.today().isoformat()))
        except Exception as exc:
            raise HTTPException(409, "Application already exists") from exc
        return {"id": cursor.lastrowid, "status": "Preparing", "simulated": True}


@app.patch("/api/applications/{application_id}")
def update_application(application_id: int, payload: ApplicationUpdate):
    with connection() as db:
        current = db.execute("""SELECT ap.*, a.name FROM applications ap JOIN agencies a ON a.id = ap.agency_id
          WHERE ap.id = ?""", (application_id,)).fetchone()
        if not current:
            raise HTTPException(404, "Application not found")
        status = payload.status or current["status"]
        response = payload.response if payload.response is not None else current["response"]
        submitted_on = current["submitted_on"] or (date.today().isoformat() if status == "Submitted" else None)
        db.execute("UPDATE applications SET status = ?, response = ?, submitted_on = ? WHERE id = ?", (status, response, submitted_on, application_id))
        db.execute("INSERT INTO activities(kind, title, subject, happened_at) VALUES (?, ?, ?, ?)", (status.lower().replace(" ", "_"), f"Application moved to {status}", current["name"], datetime.now().isoformat(timespec="seconds")))
    return {"id": application_id, "status": status, "response": response, "submitted_on": submitted_on, "simulated": True}


@app.get("/api/campaigns/current")
def current_campaign():
    with connection() as db:
        stages = rows(db.execute("SELECT stage, count, detail FROM campaign_stages ORDER BY sort_order"))
        examples = rows(db.execute("""SELECT ap.id, a.name AS agency, a.initials, ap.status, ap.response
          FROM applications ap JOIN agencies a ON a.id = ap.agency_id ORDER BY ap.id"""))
    return {"id": "milan-male-model", "name": "Milan Male Model Campaign", "stages": stages, "applications": examples, "demo": True}


@app.get("/api/activity")
def activity(limit: int = Query(default=20, ge=1, le=100)):
    with connection() as db:
        return {"items": rows(db.execute("SELECT * FROM activities ORDER BY happened_at DESC LIMIT ?", (limit,)))}


@app.get("/api/connections")
def connections():
    with connection() as db:
        signals = rows(db.execute("SELECT * FROM signals ORDER BY happened_at DESC"))
        integrations = rows(db.execute("SELECT * FROM integrations ORDER BY name"))
    for item in integrations:
        item["simulated"] = bool(item["simulated"])
    return {"signals": signals, "integrations": integrations, "profile_visits": 186, "demo": True}


@app.post("/api/integrations/{integration_id}/connect")
def connect_integration(integration_id: str):
    with connection() as db:
        integration = db.execute("SELECT * FROM integrations WHERE id = ?", (integration_id,)).fetchone()
        if not integration:
            raise HTTPException(404, "Integration not found")
        db.execute("UPDATE integrations SET status = 'connected', simulated = 1 WHERE id = ?", (integration_id,))
    return {"id": integration_id, "status": "connected", "simulated": True, "message": "Connected in demo mode"}


class WhatsAppApplyRequest(BaseModel):
    agency_id: int = 1
    agency_name: str = "Models Milano"


@app.post("/api/integrations/whatsapp/simulate-apply")
def whatsapp_simulate_apply(payload: WhatsAppApplyRequest):
    with connection() as db:
        today = date.today().isoformat()
        now = datetime.now().isoformat()
        db.execute(
            """INSERT INTO applications(agency_id, campaign, method, prepared_on, submitted_on, status, simulated)
               VALUES (?, 'Milan Campaign', 'WhatsApp 1-Click', ?, ?, 'Submitted', 1)
               ON CONFLICT(agency_id, campaign) DO UPDATE SET
               status = 'Submitted', submitted_on = ?, method = 'WhatsApp 1-Click'""",
            (payload.agency_id, today, today, today),
        )
        db.execute(
            "INSERT INTO activities(kind, title, subject, happened_at) VALUES ('submitted', 'WhatsApp 1-Click Apply', ?, ?)",
            (f"{payload.agency_name} (via WhatsApp)", now),
        )
        db.execute(
            "INSERT INTO signals(kind, title, source, value, happened_at) VALUES ('lead', 'WhatsApp Lead Approved', ?, 'Submitted', ?)",
            (payload.agency_name, now),
        )
    return {
        "success": True,
        "message": f"Application to {payload.agency_name} submitted successfully via WhatsApp 1-Click Apply!",
        "agency_id": payload.agency_id,
        "status": "Submitted",
    }


@app.get("/api/imports/candidates")
def import_candidates(status: str = "pending"):
    with connection() as db:
        data = rows(db.execute("SELECT * FROM import_candidates WHERE status = ? ORDER BY discovered_at DESC", (status,)))
    return {"items": data, "total": len(data)}


@app.post("/api/imports/overpass")
def import_overpass(payload: ImportRequest):
    boxes = {"Milan": "45.35,9.00,45.60,9.35", "Rome": "41.75,12.30,42.05,12.70", "Paris": "48.75,2.20,48.95,2.48"}
    query = f'''[out:json][timeout:20];(
      nwr["office"="modeling_agency"]({boxes[payload.city]});
      nwr["office"]["name"~"model|talent",i]({boxes[payload.city]});
    );out center tags 50;'''
    request = urllib.request.Request(
        "https://overpass-api.de/api/interpreter?" + urllib.parse.urlencode({"data": query}),
        headers={"User-Agent": "ModelReachDemo/1.0 (public-business-directory-demo)"},
    )
    payload_json = None
    try:
        with urllib.request.urlopen(request, timeout=25) as response:
            payload_json = json.load(response)
    except Exception:
        fallback_params = urllib.parse.urlencode({"q": f"model agency {payload.city}", "format": "jsonv2", "limit": 20, "addressdetails": 1, "extratags": 1})
        fallback = urllib.request.Request("https://nominatim.openstreetmap.org/search?" + fallback_params, headers={"User-Agent": "ModelReachDemo/1.0 (public-business-directory-demo)"})
        try:
            with urllib.request.urlopen(fallback, timeout=20) as response:
                fallback_items = json.load(response)
            payload_json = {"elements": [{"id": item["osm_id"], "type": {"N": "node", "W": "way", "R": "relation"}.get(item.get("osm_type"), "node"), "tags": {"name": item.get("name") or item.get("display_name", "").split(",")[0], "website": item.get("extratags", {}).get("website"), "email": item.get("extratags", {}).get("email"), "addr:city": payload.city}} for item in fallback_items]}
        except Exception as exc:
            raise HTTPException(502, "OpenStreetMap is temporarily unavailable; try again later") from exc
    candidates = []
    for element in payload_json.get("elements", [])[:50]:
        tags = element.get("tags", {})
        name = tags.get("name")
        if not name:
            continue
        street = " ".join(filter(None, [tags.get("addr:street"), tags.get("addr:housenumber")])).strip()
        location = ", ".join(filter(None, [street, tags.get("addr:city") or payload.city]))
        candidates.append({
            "name": name,
            "location": location or payload.city,
            "website": tags.get("website") or tags.get("contact:website"),
            "email": tags.get("email") or tags.get("contact:email"),
            "source_type": "OpenStreetMap",
            "source_url": f"https://www.openstreetmap.org/{element['type']}/{element['id']}",
            "external_id": f"{element['type']}/{element['id']}",
            "confidence": 78 if tags.get("website") else 62,
            "raw": tags,
        })
    result = store_candidates(candidates)
    return {**result, "source": "OpenStreetMap", "fetched": len(candidates), "attribution": "© OpenStreetMap contributors, ODbL"}


@app.post("/api/imports/wikidata")
def import_wikidata(payload: ImportRequest):
    params = urllib.parse.urlencode({"action": "wbsearchentities", "search": f"model agency {payload.city}", "language": "en", "format": "json", "limit": 25, "origin": "*"})
    request = urllib.request.Request("https://www.wikidata.org/w/api.php?" + params, headers={"User-Agent": "ModelReachDemo/1.0"})
    try:
        with urllib.request.urlopen(request, timeout=20) as response:
            payload_json = json.load(response)
    except Exception as exc:
        raise HTTPException(502, "Wikidata is temporarily unavailable; try again later") from exc
    candidates = []
    for item in payload_json.get("search", []):
        description = (item.get("description") or "").lower()
        combined = f"{item.get('label', '')} {description}".lower()
        if not any(word in combined for word in ("model", "talent", "fashion", "agency")):
            continue
        candidates.append({
            "name": item.get("label") or item["id"],
            "location": payload.city,
            "website": item.get("concepturi"),
            "source_type": "Wikidata",
            "source_url": item.get("concepturi") or f"https://www.wikidata.org/wiki/{item['id']}",
            "external_id": item["id"],
            "confidence": 58,
            "raw": item,
        })
    result = store_candidates(candidates)
    return {**result, "source": "Wikidata", "fetched": len(candidates)}


@app.post("/api/imports/csv")
def import_csv(payload: CsvImportRequest):
    reader = csv.DictReader(io.StringIO(payload.csv_text))
    candidates = []
    for index, record in enumerate(reader):
        name = (record.get("name") or "").strip()
        if not name:
            continue
        candidates.append({
            "name": name,
            "location": (record.get("location") or "Unknown").strip(),
            "website": (record.get("website") or "").strip() or None,
            "email": (record.get("email") or "").strip() or None,
            "source_type": "CSV",
            "source_url": "user-uploaded-csv",
            "external_id": f"csv-{name.lower()}-{index}",
            "confidence": 50,
            "raw": record,
        })
    result = store_candidates(candidates)
    return {**result, "source": "CSV", "fetched": len(candidates)}


@app.post("/api/imports/candidates/{candidate_id}/approve")
def approve_candidate(candidate_id: int):
    with connection() as db:
        candidate = db.execute("SELECT * FROM import_candidates WHERE id = ?", (candidate_id,)).fetchone()
        if not candidate:
            raise HTTPException(404, "Import candidate not found")
        if candidate["status"] != "pending":
            raise HTTPException(409, "Candidate was already reviewed")
        try:
            cursor = db.execute(
                """INSERT INTO agencies
                (name, initials, location, division, agency_type, match_score, application_method, verified, accent, last_checked, source_type, source_url)
                VALUES (?, ?, ?, 'Unconfirmed', 'Model agency', ?, 'Verify on source', 1, '#c8beb5', ?, ?, ?)""",
                (candidate["name"], initials(candidate["name"]), candidate["location"], max(55, min(90, candidate["confidence"])), date.today().isoformat(), candidate["source_type"], candidate["source_url"]),
            )
        except Exception as exc:
            db.execute("UPDATE import_candidates SET status = 'duplicate' WHERE id = ?", (candidate_id,))
            raise HTTPException(409, "An agency with this name already exists") from exc
        db.execute("UPDATE import_candidates SET status = 'approved' WHERE id = ?", (candidate_id,))
        db.execute("INSERT INTO activities(kind, title, subject, happened_at) VALUES ('import', 'Agency source approved', ?, ?)", (candidate["name"], datetime.now().isoformat(timespec="seconds")))
    return {"agency_id": cursor.lastrowid, "status": "approved", "message": "Agency approved and added to Discover"}


@app.post("/api/imports/candidates/{candidate_id}/reject")
def reject_candidate(candidate_id: int):
    with connection() as db:
        current = db.execute("SELECT id FROM import_candidates WHERE id = ?", (candidate_id,)).fetchone()
        if not current:
            raise HTTPException(404, "Import candidate not found")
        db.execute("UPDATE import_candidates SET status = 'rejected' WHERE id = ?", (candidate_id,))
    return {"status": "rejected"}


@app.get("/api/opportunities")
def opportunities(status: str = "All"):
    with connection() as db:
        if status == "All":
            data = rows(db.execute("SELECT * FROM opportunities ORDER BY created_at DESC"))
        else:
            data = rows(db.execute("SELECT * FROM opportunities WHERE status = ? ORDER BY created_at DESC", (status,)))
    return {"items": data, "total": len(data)}


@app.post("/api/public/enquiries", status_code=201)
def create_enquiry(payload: OpportunityCreate):
    score = 80 if payload.company else 64
    with connection() as db:
        cursor = db.execute(
            """INSERT INTO opportunities(name, email, company, source, message, status, score, created_at)
            VALUES (?, ?, ?, ?, ?, 'New', ?, ?)""",
            (payload.name, payload.email, payload.company, payload.source, payload.message, score, datetime.now().isoformat(timespec="seconds")),
        )
        db.execute("INSERT INTO activities(kind, title, subject, happened_at) VALUES ('opportunity', 'New opportunity received', ?, ?)", (payload.name, datetime.now().isoformat(timespec="seconds")))
    return {"id": cursor.lastrowid, "status": "New", "message": "Enquiry received"}


@app.patch("/api/opportunities/{opportunity_id}")
def update_opportunity(opportunity_id: int, payload: OpportunityUpdate):
    with connection() as db:
        current = db.execute("SELECT * FROM opportunities WHERE id = ?", (opportunity_id,)).fetchone()
        if not current:
            raise HTTPException(404, "Opportunity not found")
        db.execute("UPDATE opportunities SET status = ?, next_follow_up = ? WHERE id = ?", (payload.status, payload.next_follow_up, opportunity_id))
        db.execute("INSERT INTO activities(kind, title, subject, happened_at) VALUES ('opportunity', ?, ?, ?)", (f"Opportunity moved to {payload.status}", current["name"], datetime.now().isoformat(timespec="seconds")))
    return {"id": opportunity_id, "status": payload.status, "next_follow_up": payload.next_follow_up}


@app.get("/api/profile")
def profile():
    with connection() as db:
        value = db.execute("SELECT value FROM settings WHERE key = 'profile'").fetchone()
    return json.loads(value["value"])


@app.put("/api/profile")
def update_profile(payload: ProfileUpdate):
    with connection() as db:
        row = db.execute("SELECT value FROM settings WHERE key = 'profile'").fetchone()
        current = json.loads(row["value"]) if row else {}
        updates = {k: v for k, v in payload.model_dump().items() if v is not None}
        current.update(updates)
        current["readiness"] = 96
        serialized = json.dumps(current)
        db.execute(
            "INSERT INTO settings(key, value) VALUES ('profile', ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
            (serialized,),
        )
        display_name = current.get("name", "Alex Morgan")
        db.execute(
            "INSERT INTO activities(kind, title, subject, happened_at) VALUES ('profile', 'Essential details updated', ?, ?)",
            (display_name, datetime.now().isoformat(timespec="seconds")),
        )
    return {"profile": current, "saved": True}


@app.get("/api/settings")
def get_settings():
    with connection() as db:
        value = db.execute("SELECT value FROM settings WHERE key = 'preferences'").fetchone()
    return {"preferences": json.loads(value["value"]), "demo": True}


@app.put("/api/settings/preferences")
def update_preferences(payload: PreferencesUpdate):
    with connection() as db:
        db.execute("UPDATE settings SET value = ? WHERE key = 'preferences'", (payload.model_dump_json(),))
    return {"preferences": payload.model_dump(), "saved": True}
