import jwt
from datetime import datetime, timedelta
from django.contrib.auth.backends import BaseBackend

class JWTVerificationFailed(Exception):
    pass

def generate_jwt_token(user_data):
	payload = {
		'id_42': user_data['id'],
		'exp': datetime.utcnow() + timedelta(days=10),
		'iat': datetime.utcnow(),
	}
	return jwt.encode(payload, settings.SECRET_KEY, algorithm='HS256')

def verify_jwt_token(token):
	try:
		payload = jwt.decode(token, settings.SECRET_KEY, algorithms=['HS256'])
		return payload
	except jwt.ExpiredSignatureError:
		raise JWTVerificationFailed("Token has expired")
	except jwt.InvalidTokenError:
		raise JWTVerificationFailed("Invalid token")
	except Exception:
		raise JWTVerificationFailed("An unexpected error occurred during JWT verification")

class IntraAuthenticationBackend(BaseBackend):
	def authenticate(self, request, jwt_token, user_intra):
		if not isinstance(user_intra, dict):
			return None
		if jwt_token:
			user_data = verify_jwt_token(jwt_token)
			try:
				user = User.objects.get(id_42=user_data['id_42'])
			except User.DoesNotExist:
				user = User.objects.create_new_intra_user(user_intra)
			return user
		return None

	# def	get_user(self, user_if)
	# 	try:
	# 		return User.objects.get(id_42=user_id)
	# 	except User.DoesNotExist:
	# 		return None


def get_access_token(code: str):
    data = {
        "client_id": os.environ.get('CLIENT_ID'),
        "client_secret": os.environ.get('CLIENT_SECRET'),
        "grant_type": "authorization_code",
        "code": code,
        "redirect_uri": os.environ.get('REDIRECT_URI'),
        "scope": "identify"
    }
    headers = {'Content-Type': 'application/x-www-form-urlencoded'}
    response = requests.post("https://api.intra.42.fr/oauth/token", data=data, headers=headers)
    if not response.ok:
        raise ValueError(f'Fail to get token, check data:\nData = {data}')
    credentials = response.json()
    return credentials.get('access_token')

def exchange_code(code: str):
    access_token = get_access_token(code)
    user_info = get_user_info(access_token)
    return user_info