"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const Alexa = require("ask-sdk");
let skill;
// ■大きく変わったのはステートとアトリビュートの実装
// ステートの扱い方
// ステートによって処理が違うのは、AMAZON.YesIntentだけなので、
//YesIntentは、STATEによって違うハンドラを用意する　共に最後にSTATは消しておく
//InitIntentでstates.INITを入れる
// Stop Cancel Helpなどステートごとに複数書いていたハンドラは全部共通化しました。
// セッションアトリビュートの扱い
// 計画に別れた
// // 永続化情報の取得
// async function getAttrbutes(handlerInput: Alexa.HandlerInput):Promise<{[key: string]: any}> {
// 	return await handlerInput.attributesManager.getPersistentAttributes();
// }
// // 永続化情報の保存
// async function setAttrbutes(handlerInput: Alexa.HandlerInput, attributes:{[key: string]: any}): Promise<void> {
// 	handlerInput.attributesManager.setPersistentAttributes(attributes);
// 	await handlerInput.attributesManager.savePersistentAttributes();
// }
// 下記で挟む
// let attributes = await getAttrbutes(handlerInput); // 取得
// await setAttrbutes(handlerInput, attributes); // 保存
// STATEだけセッション情報にした
// let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
// sessionAttributes.state = 'INIT';
// handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
// 変数名の間違いがエラーとなるのはもちろん
//未使用の変数や関数でワーニング表示されたり
//型の不一致がエラーとなったり
// null undefinedとなる可能性のあるデータを参照していたりするとワーニングが発生する
//非常に移植もスムーズです。
// 恐らく JavaScript -> JavaScriptより安全に移行できたかも知れません。
// ちょっとバージョンアップ
const sleep = '<break time="500ms"/>';
exports.handler = function (event, context) {
    return __awaiter(this, void 0, void 0, function* () {
        console.log(JSON.stringify(event));
        if (!skill) {
            skill = Alexa.SkillBuilders.standard()
                .addRequestHandlers(LaunchRequestHandler, InitIntentHandler, StartIntentHandler, YesIntentHandler, NoIntentHandler, HelpIntentHandler, StopIntentHandler, CancelIntentHandler, SessionEndedRequestHandler)
                .addErrorHandlers(ErrorHandler)
                .withTableName('BingoTableV2') // これを追加（テーブル名）
                .withAutoCreateTable(true) //テーブル作成もスキルから行う場合は、これも追加
                .create();
        }
        return skill.invoke(event, context);
    });
};
const LaunchRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(guideMessage())
            .reprompt(guideMessage())
            .getResponse();
    }
};
const InitIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'InitIntent';
    },
    handle(handlerInput) {
        let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
        sessionAttributes.state = 'INIT';
        handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
        const speechText = '初期化すると全てのデータが失われます。初期化して宜しいですか？';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const StartIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'StartIntent';
    },
    handle(handlerInput) {
        return __awaiter(this, void 0, void 0, function* () {
            let attributes = yield getAttrbutes(handlerInput); // 取得
            if (!attributes.array) {
                attributes.array = createArray();
                attributes.index = 0;
                attributes.counter = 0;
            }
            let array = attributes.array;
            let index = attributes.index;
            let counter = Number(attributes.counter);
            let speechText = drumMessage() + exclamationMessage();
            speechText += '次の数字は、' + sleep + array[index] + 'です。' + sleep;
            index += 1;
            counter += 1;
            if (counter % 3 == 0) {
                speechText += '今までの数字を読み上げますか';
            }
            else {
                speechText += guideMessage();
            }
            attributes.index = index;
            attributes.counter = counter;
            yield setAttrbutes(handlerInput, attributes); // 保存
            return handlerInput.responseBuilder
                .speak(speechText)
                .reprompt(guideMessage())
                .getResponse();
        });
    }
};
const YesIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && (handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent' || handlerInput.requestEnvelope.request.intent.name === 'PreviousIntent');
    },
    handle(handlerInput) {
        return __awaiter(this, void 0, void 0, function* () {
            let isInit = false;
            // ステートの取得
            let sessionAttributes = handlerInput.attributesManager.getSessionAttributes();
            if (sessionAttributes.state == 'INIT') { // ステートの確認
                isInit = true;
            }
            // ステートの初期化
            sessionAttributes.state = '';
            handlerInput.attributesManager.setSessionAttributes(sessionAttributes);
            if (isInit) {
                let attributes = yield getAttrbutes(handlerInput); // 取得
                attributes.array = createArray();
                attributes.index = 0;
                attributes.counter = 0;
                yield setAttrbutes(handlerInput, attributes); // 保存
                return handlerInput.responseBuilder
                    .speak('初期化しました')
                    .reprompt(guideMessage())
                    .getResponse();
            }
            else {
                let attributes = yield getAttrbutes(handlerInput); // 取得
                let array = attributes.array;
                let index = attributes.index;
                let speechText = '';
                if (index > 0) {
                    speechText += '今まで出た数字は、';
                    for (var i = 0; i < index; i++) {
                        speechText += array[i] + '、';
                    }
                    speechText += '以上です。';
                }
                else {
                    speechText += 'まだ、出た数字はありません。';
                }
                speechText += guideMessage();
                attributes.counter = 0;
                yield setAttrbutes(handlerInput, attributes); // 保存
                return handlerInput.responseBuilder
                    .speak(speechText)
                    .reprompt(guideMessage())
                    .getResponse();
            }
        });
    }
};
const NoIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder
            .speak(guideMessage())
            .reprompt(guideMessage())
            .getResponse();
    }
};
const HelpIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
    },
    handle(handlerInput) {
        const speechText = 'このスキルは、ビンゴゲームをするためのものです。「スタート」というと、次の数字を出します。また、「読み上げ」と言うと、いつでも、現在までの数字を読み上げます。ビンゴゲームを最初から始めるには「初期化して」と言って下さい。では、始めましょう。「ビンゴスタート」って言って下さい';
        return handlerInput.responseBuilder
            .speak(speechText)
            .reprompt(speechText)
            .getResponse();
    }
};
const StopIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
    },
    handle(handlerInput) {
        const speechText = '終了します。ゲームは記録されていますので、次回、続きから始められます。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const CancelIntentHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'IntentRequest'
            && handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
    },
    handle(handlerInput) {
        const speechText = 'キャンセルします。ゲームは記録されていますので、次回、続きから始められます。';
        return handlerInput.responseBuilder
            .speak(speechText)
            .getResponse();
    }
};
const SessionEndedRequestHandler = {
    canHandle(handlerInput) {
        return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
    },
    handle(handlerInput) {
        return handlerInput.responseBuilder.getResponse();
    }
};
const ErrorHandler = {
    canHandle(handlerInput, error) {
        return true;
    },
    handle(handlerInput, error) {
        console.log('ERROR' + error.message);
        return handlerInput.responseBuilder
            .getResponse();
    }
};
// 永続化情報の取得
function getAttrbutes(handlerInput) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield handlerInput.attributesManager.getPersistentAttributes();
    });
}
// 永続化情報の保存
function setAttrbutes(handlerInput, attributes) {
    return __awaiter(this, void 0, void 0, function* () {
        handlerInput.attributesManager.setPersistentAttributes(attributes);
        yield handlerInput.attributesManager.savePersistentAttributes();
    });
}
function guideMessage() {
    const starts = ['次行ってみよー', 'スタート', 'ビンゴスタート', '次'];
    const previous = ['読み上げ', '出た数字を教えて', '今までの数字を教えて', '読み上げ'];
    return '「' + random(starts) + '」、若しくは、「' + random(previous) + '」と言って下さい';
}
function random(list) {
    const index = Math.floor(Math.random() * list.length);
    return list[index];
}
function exclamationMessage() {
    const exclamations = [
        '<say-as interpret-as="interjection">やっほう</say-as>',
        '<say-as interpret-as="interjection">むふふ</say-as>',
        '<say-as interpret-as="interjection">あいたた</say-as>',
        '<say-as interpret-as="interjection">あいたたた</say-as>',
        '<say-as interpret-as="interjection">あちち</say-as>',
        '<say-as interpret-as="interjection">あちゃあ</say-as>',
        '<say-as interpret-as="interjection">あのう</say-as>',
        '<say-as interpret-as="interjection">あら</say-as>',
        '<say-as interpret-as="interjection">あらら</say-as>',
        '<say-as interpret-as="interjection">ありゃ</say-as>',
        '<say-as interpret-as="interjection">あれれ</say-as>',
        '<say-as interpret-as="interjection">イェイ</say-as>',
        '<say-as interpret-as="interjection">いひひ</say-as>',
        '<say-as interpret-as="interjection">うーんと</say-as>',
        '<say-as interpret-as="interjection">うっひゃあ</say-as>',
        '<say-as interpret-as="interjection">うっひょう</say-as>',
        '<say-as interpret-as="interjection">うふふ</say-as>',
        '<say-as interpret-as="interjection">うわ〜</say-as>',
        '<say-as interpret-as="interjection">え〜と</say-as>',
        '<say-as interpret-as="interjection">えーとー</say-as>',
        '<say-as interpret-as="interjection">ええいっ</say-as>',
        '<say-as interpret-as="interjection">えへっ</say-as>',
        '<say-as interpret-as="interjection">おおー</say-as>',
        '<say-as interpret-as="interjection">おっと</say-as>',
        '<say-as interpret-as="interjection">おめでとう</say-as>',
        '<say-as interpret-as="interjection">お疲れ様です</say-as>',
        '<say-as interpret-as="interjection">きゃ〜</say-as>',
        '<say-as interpret-as="interjection">ごめんなさい</say-as>',
        '<say-as interpret-as="interjection">こらっ</say-as>',
        '<say-as interpret-as="interjection">さあて</say-as>',
        '<say-as interpret-as="interjection">すみません</say-as>',
        '<say-as interpret-as="interjection">それでは</say-as>',
        '<say-as interpret-as="interjection">ちちんぷいぷい</say-as>',
        '<say-as interpret-as="interjection">でへへ</say-as>',
        '<say-as interpret-as="interjection">てへ</say-as>',
        '<say-as interpret-as="interjection">ドンマイ</say-as>',
        '<say-as interpret-as="interjection">なるほど</say-as>',
        '<say-as interpret-as="interjection">万歳</say-as>',
        '<say-as interpret-as="interjection">ひひひ</say-as>',
        '<say-as interpret-as="interjection">ピンポーン</say-as>',
        '<say-as interpret-as="interjection">ふふふ</say-as>',
        '<say-as interpret-as="interjection">ふふっ</say-as>',
        '<say-as interpret-as="interjection">へへへっ</say-as>',
        '<say-as interpret-as="interjection">ほほほ</say-as>',
        '<say-as interpret-as="interjection">やった</say-as>',
        '<say-as interpret-as="interjection">やっほう</say-as>',
        '<say-as interpret-as="interjection">やれやれ</say-as>',
        '<say-as interpret-as="interjection">よいしょ</say-as>',
        '<say-as interpret-as="interjection">よっこらしょ</say-as>',
        '<say-as interpret-as="interjection">ルンルン</say-as>',
        '<say-as interpret-as="interjection">わ〜い</say-as>',
        '<say-as interpret-as="interjection">わぁ</say-as>',
        '<say-as interpret-as="interjection">わあーっ</say-as>',
        '<say-as interpret-as="interjection">んーと</say-as>',
        'でちゃった',
        '興奮しますねー',
        'はいっ',
        '落ち着いて、落ち着いて',
        'でたー',
        'きたー',
        'でっでました',
        'ええーほんとに良いのでしょうかー',
        'ちょっとおにいさん、遂に出ましたよー'
    ];
    return random(exclamations) + '、';
}
function drumMessage() {
    const drums = [
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_trumpet_bugle_03.mp3'/>",
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_01.mp3'/>",
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_02.mp3'/>",
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_01.mp3'/>",
        "<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_02.mp3'/>"
    ];
    return random(drums) + '、';
}
function createArray() {
    let array = [];
    for (; array.length < 99;) {
        const n = Math.floor(Math.random() * 99) + 1;
        if (array.indexOf(n) == -1) {
            array.push(n);
        }
    }
    return array;
}
//# sourceMappingURL=index.js.map