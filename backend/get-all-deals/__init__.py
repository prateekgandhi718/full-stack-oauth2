import json
import logging

import azure.functions as func

from ..shared.okta import okta_token_required

def main(req: func.HttpRequest) -> func.HttpResponse:
    return _main(req)

@okta_token_required(user_info=True)
def _main(req: func.HttpRequest, user=None) -> func.HttpResponse:
    try:
        logging.info('Python HTTP trigger function processed a request.')
        name = req.params.get('name')
        response_data = {
            "providedName": name,
            "userInfo": user['id'],
            "message": "Fetched the data successfully."
        }
        return func.HttpResponse(json.dumps(response_data), status_code=200, mimetype="application/json")
    except Exception as e:
        error_message = f"An error occured: {str(e)}"
        logging.exception(error_message)
        response_data = {
            "providedName": None,
            "message": error_message
        }
