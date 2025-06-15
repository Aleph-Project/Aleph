import datetime

def parse_time_dim(played_at_str):
    # Convierte el string ISO a datetime
    dt = datetime.datetime.fromisoformat(played_at_str.replace("Z", "+00:00"))
    return {
        "id": int(dt.strftime("%Y%m%d")),  # o solo fecha si tu PK es así
        "date": dt.date(),
        "day": dt.day,
        "month": dt.month,
        "year": dt.year,
        "dayofweek": dt.isoweekday(),  # 1=lunes, 7=domingo
        "isweekend": dt.isoweekday() >= 6,
        "quarter": (dt.month - 1) // 3 + 1
    }