exports.event = {
    "responseId": "3686dd14-4d9b-488d-9b0c-8acc0e743e7d",
    "queryResult": {
        "queryText": "1961年1月1 日",
        "parameters": {
            "year": 1961,
            "month": 1,
            "day": 1,
            "test": "test"
        },
        "allRequiredParamsPresent": true,
        "outputContexts": [
            {
                "name": "projects/mysample-d6081/agent/sessions/1527381158509/contexts/actions_capability_screen_output",
                "parameters": {
                    "day.original": "1",
                    "test": "test",
                    "month": 1,
                    "year": 1961,
                    "month.original": "1",
                    "test.original": "",
                    "year.original": "1961",
                    "day": 1
                }
            },
            {
                "name": "projects/mysample-d6081/agent/sessions/1527381158509/contexts/actions_capability_audio_output",
                "parameters": {
                    "day.original": "1",
                    "test": "test",
                    "month": 1,
                    "year": 1961,
                    "month.original": "1",
                    "test.original": "",
                    "year.original": "1961",
                    "day": 1
                }
            },
            {
                "name": "projects/mysample-d6081/agent/sessions/1527381158509/contexts/google_assistant_input_type_keyboard",
                "parameters": {
                    "day.original": "1",
                    "test": "test",
                    "month": 1,
                    "year": 1961,
                    "month.original": "1",
                    "test.original": "",
                    "year.original": "1961",
                    "day": 1
                }
            },
            {
                "name": "projects/mysample-d6081/agent/sessions/1527381158509/contexts/actions_capability_web_browser",
                "parameters": {
                    "day.original": "1",
                    "test": "test",
                    "month": 1,
                    "year": 1961,
                    "month.original": "1",
                    "test.original": "",
                    "year.original": "1961",
                    "day": 1
                }
            },
            {
                "name": "projects/mysample-d6081/agent/sessions/1527381158509/contexts/actions_capability_media_response_audio",
                "parameters": {
                    "day.original": "1",
                    "test": "test",
                    "month": 1,
                    "year": 1961,
                    "month.original": "1",
                    "test.original": "",
                    "year.original": "1961",
                    "day": 1
                }
            }
        ],
        "intent": {
            "name": "projects/mysample-d6081/agent/intents/d619d44c-f703-482e-98eb-f0beef599756",
            "displayName": "CalcIntent"
        },
        "intentDetectionConfidence": 1,
        "diagnosticInfo": {},
        "languageCode": "ja"
    },
    "originalDetectIntentRequest": {
        "source": "google",
        "version": "2",
        "payload": {
            "isInSandbox": true,
            "surface": {
                "capabilities": [
                    {
                        "name": "actions.capability.AUDIO_OUTPUT"
                    },
                    {
                        "name": "actions.capability.SCREEN_OUTPUT"
                    },
                    {
                        "name": "actions.capability.MEDIA_RESPONSE_AUDIO"
                    },
                    {
                        "name": "actions.capability.WEB_BROWSER"
                    }
                ]
            },
            "inputs": [
                {
                    "rawInputs": [
                        {
                            "query": "1961年1月1 日",
                            "inputType": "KEYBOARD"
                        }
                    ],
                    "arguments": [
                        {
                            "rawText": "1961年1月1 日",
                            "textValue": "1961年1月1 日",
                            "name": "text"
                        }
                    ],
                    "intent": "actions.intent.TEXT"
                }
            ],
            "user": {
                "lastSeen": "2018-05-27T00:31:20Z",
                "locale": "ja-JP",
                "userId": "ABwppHFrUB7nCKcrAecp1OfVeierTn_qGM5kCOSykpLwvdGEPIGVz8qzXJQyj12bJcAm1lbX7K25KGarlbs"
            },
            "conversation": {
                "conversationId": "1527381158509",
                "type": "ACTIVE",
                "conversationToken": "[]"
            },
            "availableSurfaces": [
                {
                    "capabilities": [
                        {
                            "name": "actions.capability.AUDIO_OUTPUT"
                        },
                        {
                            "name": "actions.capability.SCREEN_OUTPUT"
                        },
                        {
                            "name": "actions.capability.WEB_BROWSER"
                        }
                    ]
                }
            ]
        }
    },
    "session": "projects/mysample-d6081/agent/sessions/1527381158509"
}


exports.response =  {
  
}
