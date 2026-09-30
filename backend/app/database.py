from __future__ import annotations

import json
import os
import sqlite3
from contextlib import contextmanager
from pathlib import Path
from typing import Iterator


DEFAULT_DB = Path(__file__).resolve().parent.parent / "modelreach.db"


def database_path() -> Path:
    configured = os.getenv("MODELREACH_DATABASE")
    return Path(configured).expanduser().resolve() if configured else DEFAULT_DB


@contextmanager
def connection() -> Iterator[sqlite3.Connection]:
    db = sqlite3.connect(database_path())
    db.row_factory = sqlite3.Row
    db.execute("PRAGMA foreign_keys = ON")
    try:
        yield db
        db.commit()
    finally:
        db.close()


SCHEMA = """
CREATE TABLE IF NOT EXISTS agencies (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL UNIQUE,
  initials TEXT NOT NULL,
  location TEXT NOT NULL,
  division TEXT NOT NULL,
  agency_type TEXT NOT NULL,
  match_score INTEGER NOT NULL,
  application_method TEXT NOT NULL,
  verified INTEGER NOT NULL DEFAULT 1,
  accent TEXT NOT NULL,
  last_checked TEXT NOT NULL,
  source_type TEXT NOT NULL DEFAULT 'demo',
  source_url TEXT
);
CREATE TABLE IF NOT EXISTS applications (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  agency_id INTEGER NOT NULL REFERENCES agencies(id),
  campaign TEXT NOT NULL,
  method TEXT NOT NULL,
  prepared_on TEXT,
  submitted_on TEXT,
  status TEXT NOT NULL,
  response TEXT,
  simulated INTEGER NOT NULL DEFAULT 1,
  UNIQUE(agency_id, campaign)
);
CREATE TABLE IF NOT EXISTS campaign_stages (
  stage TEXT PRIMARY KEY,
  count INTEGER NOT NULL,
  detail TEXT NOT NULL,
  sort_order INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS activities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  subject TEXT NOT NULL,
  happened_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS signals (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  kind TEXT NOT NULL,
  title TEXT NOT NULL,
  source TEXT NOT NULL,
  value TEXT NOT NULL,
  happened_at TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS integrations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  status TEXT NOT NULL,
  simulated INTEGER NOT NULL DEFAULT 1
);
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
CREATE TABLE IF NOT EXISTS import_candidates (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  website TEXT,
  email TEXT,
  source_type TEXT NOT NULL,
  source_url TEXT NOT NULL,
  external_id TEXT NOT NULL,
  confidence INTEGER NOT NULL DEFAULT 60,
  status TEXT NOT NULL DEFAULT 'pending',
  discovered_at TEXT NOT NULL,
  raw_json TEXT,
  UNIQUE(source_type, external_id)
);
CREATE TABLE IF NOT EXISTS opportunities (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  source TEXT NOT NULL,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'New',
  score INTEGER NOT NULL DEFAULT 50,
  next_follow_up TEXT,
  created_at TEXT NOT NULL
);
"""


AGENCIES = [
    ("Models Milano", "MM", "Milan, Italy", "Men", "Fashion", 92, "Website form", 1, "#d7b8a4", "2026-09-29"),
    ("Row Model Management", "RM", "Milan, Italy", "Men", "Editorial", 88, "Email", 1, "#a9b5c2", "2026-09-29"),
    ("Monster Management", "MO", "Milan, Italy", "Men / Women", "Commercial", 84, "Email", 1, "#b9b1c9", "2026-09-29"),
    ("Fabbrica Milano", "FM", "Milan, Italy", "Men", "Fashion", 81, "Website form", 1, "#c9c1a9", "2026-09-29"),
    ("Independent Model Management", "IM", "Milan, Italy", "Men", "Model management", 78, "Email", 1, "#b3c4bd", "2026-09-29"),
    ("Special Management", "SM", "Milan, Italy", "Men / Women", "Commercial", 74, "Website form", 1, "#d2b7bc", "2026-09-29"),
]

OPPORTUNITIES = [
    ("Giulia Rossi", "giulia@example.demo", "Studio Ventuno", "Website enquiry", "Casting enquiry for a Milan editorial test.", "New", 82, "2026-10-01", "2026-09-30T09:15:00"),
    ("Luca Bianchi", "luca@example.demo", "Independent casting", "Instagram demo", "Requested portfolio and availability for October.", "Reviewing", 74, "2026-10-02", "2026-09-29T17:26:00"),
    ("Elena Conti", "elena@example.demo", "Linea Moda", "Referral", "Introduced by a photographer for an e-commerce brief.", "Qualified", 91, "2026-10-01", "2026-09-28T14:40:00"),
]


def seed_database(db: sqlite3.Connection) -> None:
    db.executescript(SCHEMA)
    agency_columns = {row["name"] for row in db.execute("PRAGMA table_info(agencies)")}
    if "source_type" not in agency_columns:
        db.execute("ALTER TABLE agencies ADD COLUMN source_type TEXT NOT NULL DEFAULT 'demo'")
    if "source_url" not in agency_columns:
        db.execute("ALTER TABLE agencies ADD COLUMN source_url TEXT")
    db.execute(
        "INSERT OR IGNORE INTO integrations(id, name, description, status, simulated) VALUES ('whatsapp', 'WhatsApp Direct Apply', '+39 349 812 4490 · Instant 1-click lead alerts & apply', 'connected', 1)"
    )
    if db.execute("SELECT COUNT(*) FROM agencies").fetchone()[0]:
        if not db.execute("SELECT COUNT(*) FROM opportunities").fetchone()[0]:
            db.executemany(
                """INSERT INTO opportunities
                (name, email, company, source, message, status, score, next_follow_up, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                OPPORTUNITIES,
            )
        return
    db.executemany(
        """INSERT INTO agencies
        (name, initials, location, division, agency_type, match_score, application_method, verified, accent, last_checked)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        AGENCIES,
    )
    ids = {row["name"]: row["id"] for row in db.execute("SELECT id, name FROM agencies")}
    applications = [
        (ids["Models Milano"], "Milan Campaign", "Website", "2026-09-29", None, "Ready", None, 1),
        (ids["Fabbrica Milano"], "Milan Campaign", "Website", "2026-09-28", "2026-09-28", "Submitted", None, 1),
        (ids["Monster Management"], "Milan Campaign", "Email", "2026-09-27", "2026-09-27", "Submitted", "Awaiting response", 1),
        (ids["Row Model Management"], "Milan Campaign", "Email", "2026-09-25", None, "Preparing", None, 1),
    ]
    db.executemany(
        """INSERT INTO applications
        (agency_id, campaign, method, prepared_on, submitted_on, status, response, simulated)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)""",
        applications,
    )
    db.executemany(
        "INSERT INTO campaign_stages(stage, count, detail, sort_order) VALUES (?, ?, ?, ?)",
        [("Discovered", 43, "New agency matches", 1), ("Verified", 24, "Profiles checked", 2), ("Ready", 18, "Assets complete", 3), ("Submitted", 12, "Simulated outreach", 4), ("Responses", 3, "Replies received", 5)],
    )
    db.executemany(
        "INSERT INTO activities(kind, title, subject, happened_at) VALUES (?, ?, ?, ?)",
        [("verified", "Agency verified", "Models Milano", "2026-09-29T10:42:00"), ("prepared", "Application prepared", "Fabbrica Milano", "2026-09-29T09:18:00"), ("submitted", "Submission simulated", "Monster Management", "2026-09-28T15:20:00"), ("response", "Response recorded", "Independent Model Management", "2026-09-27T12:05:00")],
    )
    db.executemany(
        "INSERT INTO signals(kind, title, source, value, happened_at) VALUES (?, ?, ?, ?, ?)",
        [("lead", "New lead", "Milan campaign lead form", "12", "2026-09-29T17:52:00"), ("message", "Message needs reply", "Instagram DM from Luca B.", "4", "2026-09-29T17:26:00"), ("ad", "Ad performance", "Male model portfolio ad", "+18%", "2026-09-29T16:00:00")],
    )
    db.executemany(
        "INSERT INTO integrations(id, name, description, status, simulated) VALUES (?, ?, ?, ?, 1)",
        [("meta", "Meta Business", "Instagram, Facebook and Ads Manager", "connected"), ("instagram", "Instagram profile", "@alexmorgan.demo · profile insights", "synced"), ("email", "Email inbox", "Replies and agency conversations", "synced")],
    )
    settings = {
        "profile": {"name": "Alex Morgan", "location": "Naples, Italy", "handle": "@alexmorgan.demo", "height_cm": 188, "weight_kg": 78, "chest_cm": 96, "waist_cm": 78, "hips_cm": 94, "shoe_eu": 43, "hair": "Brown", "eyes": "Brown", "categories": ["Fashion", "Editorial", "Commercial", "E-commerce"], "readiness": 92},
        "preferences": {"new_lead": True, "message_reply": True, "ad_signal": False, "agency_change": True},
    }
    db.executemany("INSERT INTO settings(key, value) VALUES (?, ?)", [(key, json.dumps(value)) for key, value in settings.items()])
    db.executemany(
        """INSERT INTO opportunities
        (name, email, company, source, message, status, score, next_follow_up, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
        OPPORTUNITIES,
    )


def initialize() -> None:
    path = database_path()
    path.parent.mkdir(parents=True, exist_ok=True)
    with connection() as db:
        seed_database(db)
