import json
import urllib.request

payload = {
    "fullName": "Test User",
    "email": "testuser@example.com",
    "mobileNumber": "9999999999",
    "password": "Test1234",
    "confirmPassword": "Test1234",
    "userRole": "farmer"
}

data = json.dumps(payload).encode('utf-8')
req = urllib.request.Request('http://127.0.0.1:8000/auth/register', data=data, headers={'Content-Type': 'application/json'})
try:
    with urllib.request.urlopen(req, timeout=10) as resp:
        print('STATUS', resp.status)
        print(resp.read().decode('utf-8'))
except Exception as e:
    print('ERROR:', e)
