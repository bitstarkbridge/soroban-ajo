"""
Ajo API — Python (requests) examples
"""

import time
import requests

BASE_URL = "http://localhost:3001"


class AjoClient:
    def __init__(self, base_url=BASE_URL):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})

    def authenticate(self, public_key: str) -> str:
        res = self.session.post(f"{self.base_url}/api/auth/token", json={"publicKey": public_key})
        res.raise_for_status()
        token = res.json()["token"]
        self.session.headers.update({"Authorization": f"Bearer {token}"})
        return token

    def _request(self, method: str, path: str, **kwargs) -> dict:
        res = self.session.request(method, f"{self.base_url}{path}", **kwargs)

        if res.status_code == 429:
            retry_after = int(res.headers.get("Retry-After", 60))
            time.sleep(retry_after)
            return self._request(method, path, **kwargs)  # retry once

        if not res.ok:
            err = res.json()
            raise Exception(f"[{err.get('code', res.status_code)}] {err.get('error', 'Unknown error')}")

        return res.json()

    def get(self, path: str, params: dict = None) -> dict:
        return self._request("GET", path, params=params)

    def post(self, path: str, body: dict = None) -> dict:
        return self._request("POST", path, json=body)

    def patch(self, path: str, body: dict = None) -> dict:
        return self._request("PATCH", path, json=body)

    def delete(self, path: str) -> dict:
        return self._request("DELETE", path)


# ─── Usage examples ───────────────────────────────────────────────────────────

if __name__ == "__main__":
    client = AjoClient()

    # Authenticate
    client.authenticate("GABC...XYZ")

    # ── Groups ──────────────────────────────────────────────────────────────────

    # List groups
    data = client.get("/api/groups", params={"page": 1, "limit": 10})
    print("Groups:", data["groups"])

    # Create group
    result = client.post("/api/groups", {
        "name": "Monthly Savers",
        "contributionAmount": 500_000_000,
        "frequency": 30,
        "maxMembers": 10,
    })
    group_id = result["group"]["id"]
    print("Created group:", group_id)

    # Join group
    client.post(f"/api/groups/{group_id}/join", {"walletAddress": "GABC...XYZ"})

    # Contribute
    client.post(f"/api/groups/{group_id}/contribute", {
        "amount": 500_000_000,
        "txHash": "abc123...",
    })

    # ── Goals ───────────────────────────────────────────────────────────────────

    result = client.post("/api/goals", {
        "title": "Emergency Fund",
        "category": "EMERGENCY",
        "targetAmount": 10_000_000_000,
        "deadline": "2026-12-31T00:00:00.000Z",
        "isPublic": False,
    })
    goal_id = result["goal"]["id"]
    print("Created goal:", goal_id)

    # Affordability check
    affordability = client.post("/api/goals/affordability", {
        "targetAmount": 10_000_000_000,
        "deadline": "2026-12-31T00:00:00.000Z",
        "monthlyIncome": 5_000_000_000,
        "monthlyExpenses": 3_000_000_000,
    })
    print("Affordable:", affordability["affordable"])

    # ── Gamification ────────────────────────────────────────────────────────────

    stats = client.get("/api/gamification/stats")
    print(f"Level: {stats['data']['level']} | Points: {stats['data']['points']}")

    leaderboard = client.get("/api/gamification/leaderboard", params={"limit": 10})
    print("Top user:", leaderboard["data"][0])

    client.post("/api/gamification/login")

    # ── Referrals ───────────────────────────────────────────────────────────────

    ref = client.post("/api/referrals/generate")
    print("Referral code:", ref["code"])

    validation = client.post("/api/referrals/validate", {"code": "AJO-XYZ123"})
    print("Code valid:", validation["valid"])

    # ── Disputes ────────────────────────────────────────────────────────────────

    dispute = client.post("/api/disputes", {
        "groupId": group_id,
        "type": "non_payment",
        "summary": "Member has not contributed for 2 cycles",
        "evidence": [{"type": "text", "content": "No payment since Jan 2026"}],
    })
    dispute_id = dispute["dispute"]["id"]
    print("Dispute filed:", dispute_id)

    client.post(f"/api/disputes/{dispute_id}/vote", {"vote": "in_favor"})

    # ── KYC ─────────────────────────────────────────────────────────────────────

    kyc = client.get("/api/kyc/status")
    print("KYC level:", kyc["status"]["level"])

    # ── Analytics ───────────────────────────────────────────────────────────────

    client.post("/api/analytics", {
        "type": "group_joined",
        "userId": "GABC...XYZ",
        "groupId": group_id,
    })

    export_job = client.post("/api/analytics/export", {
        "format": "csv",
        "dateRange": {
            "start": "2026-01-01T00:00:00.000Z",
            "end": "2026-03-31T00:00:00.000Z",
        },
        "includeMetrics": True,
    })
    print("Export job:", export_job["exportId"])
