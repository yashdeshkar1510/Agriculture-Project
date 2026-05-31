from datetime import datetime, timezone
from typing import Any

from database.connection import get_audit_collection


async def log_action(actor: str, action: str, resource: str, details: Any | None = None) -> None:
    coll = get_audit_collection()
    doc = {
        "actor": actor,
        "action": action,
        "resource": resource,
        "details": details,
        "created_at": datetime.now(timezone.utc),
    }
    await coll.insert_one(doc)
