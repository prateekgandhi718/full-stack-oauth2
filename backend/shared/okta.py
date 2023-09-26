import asyncio
import functools
import json
import platform
import time

import jwt
from azure.functions import HttpRequest, HttpResponse
from okta_jwt_verifier import AccessTokenVerifier


if platform.system() == 'Windows':
    asyncio.set_event_loop_policy(asyncio.WindowsSelectorEventLoopPolicy())


@functools.cache
def get_user_id(email: str):
    # Execute a query to fetch the user email from the users table in the database.
    return 901 #returning a sample user id.


def okta_token_required(function=None, user_info=False):
    def decorator(func):
        @functools.wraps(func)
        def wrapper(req: HttpRequest, *args, **kwargs) -> HttpResponse:
            auth_header_parts = req.headers.get('Authorization', '').split(' ')

            if len(auth_header_parts) != 2:
                return HttpResponse("No Access token found.", status_code=401)
            
            token = auth_header_parts[1]
            token_payload = jwt.decode(token, options={"verify_signature": False})
            # check if the token has expired
            current_time = int(time.time())
            if token_payload.get('exp') and token_payload['exp'] <= current_time + 30:
                message = {
                    'messageCode': 'TE401', 'MessageDescription':  'Token Expired'
                }
                return HttpResponse(
                    json.dumps(message),
                    status_code=401,
                    mimetype="application/json"
                )

            verifier = AccessTokenVerifier(issuer=token_payload['iss'])

            try:
                asyncio.run(verifier.verify(token))

            except Exception:
                return HttpResponse("Invalid access token", status_code=401)
            
            if user_info:
                user_id = get_user_id(token_payload['sub'])

                if user_id is None:
                    return HttpResponse("User is not found in the system.", status_code=403)
                
								# adding user attribute in the kwargs so that we can access it inside your api.
                kwargs['user'] = {
                    'id': user_id,
                    'email': token_payload['sub']
                }
            
            return func(req, *args, **kwargs)
        return wrapper
    
    if function is not None:
        return decorator(function)
    
    return decorator