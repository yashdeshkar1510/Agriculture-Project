import json
import urllib.request

payload = {
    "email": "admin@local.com",
    "password": "Admin1234",
    "userRole": "admin"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/auth/login', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print(resp.read().decode('utf-8'))
except urllib.error.HTTPError as he:
    body = he.read().decode('utf-8')
    print('HTTPERROR:', he.code, body)
except Exception as e:
    print('ERROR:', e)
