import requests


import requests
from concurrent.futures import ThreadPoolExecutor

from colors import WARNING_COLORS

BASE_URL = "https://api.weather.gov"


def get_active_alerts():
    url = f"{BASE_URL}/alerts/active"
    response = requests.get(url)
    response.raise_for_status()
    data = response.json()
    alerts = data["features"]

    # Use thread pool to fetch zone geometry in parallel
    with ThreadPoolExecutor(max_workers=10) as executor:
        futures = [executor.submit(enrich_alert, alert) for alert in alerts]
        alerts = [f.result() for f in futures]

    return alerts


def enrich_alert(alert):
    if not alert.get("geometry"):
        zones = alert["properties"].get("affectedZones", [])
        for zone_url in zones[:3]:
            try:
                zone = requests.get(zone_url).json()
                if zone.get("geometry"):
                    alert["geometry"] = zone["geometry"]
                    break
            except Exception:
                continue

    # Attach color based on alert type (event)
    event = alert["properties"].get("event")
    color = WARNING_COLORS.get(event, "#808080")  # default gray
    alert["properties"]["color"] = color

    return alert
