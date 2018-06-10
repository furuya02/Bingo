import * as Alexa from 'ask-sdk';
import { RequestEnvelope　} from 'ask-sdk-model';
 
let skill: Alexa.Skill;

//TODO この実装が不明
	// STATE - GAME
	// 'PreviousIntent' : function() {
	// 	this.emitWithState('AMAZON.YesIntent');
	// },

　
// ■大きく変わったのはステートとアトリビュートの実装

// ステートの扱い方
// ステートによって処理が違うのは、AMAZON.YesIntentだけなので、
//YesIntentは、STATEによって違うハンドラを用意する　共に最後にSTATは消しておく
//InitIntentでstates.INITを入れる

// Stop Cancel Helpなどステートごとに複数書いていたハンドラは全部共通化しました。

// セッションアトリビュートの扱い
// 計画に別れた

// 変数名の間違いがエラーとなるのはもちろん
//未使用の変数や関数でワーニング表示されたり
//型の不一致がエラーとなったり
// null undefinedとなる可能性のあるデータを参照していたりするとワーニングが発生する

//非常に移植もスムーズです。
// 恐らく JavaScript -> JavaScriptより安全に移行できたかも知れません。

// ちょっとバージョンアップ
 
const keyCounter = 'counter';
const keyArray = 'array';
const keyIndex = 'index';
const sleep = '<break time="500ms"/>';

exports.handler = async function (event: RequestEnvelope, context: any) {
	console.log(JSON.stringify(event));
	if (!skill) {
		skill = Alexa.SkillBuilders.custom()
		  .addRequestHandlers(
			LaunchRequestHandler,
			InitIntentHandler,
			StartIntentHandler,
			YesIntentHandler,
			NoIntentHandler,
			HelpIntentHandler,
			StopIntentHandler,
			CancelIntentHandler,
			SessionEndedRequestHandler)
		  .addErrorHandlers(ErrorHandler)
//		  alexa.dynamoDBTableName = 'BingoTable'; TODO
		  .create();
	}
	return skill.invoke(event,　context);
}
 
const LaunchRequestHandler: Alexa.RequestHandler = {
    canHandle(handlerInput: Alexa.HandlerInput) {
      	return handlerInput.requestEnvelope.request.type === 'LaunchRequest';
  },
  handle(handlerInput: Alexa.HandlerInput) {
    return handlerInput.responseBuilder
          .speak(guideMessage())
          .reprompt(guideMessage())
          .getResponse();
	}
}

const InitIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'InitIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		//this.handler.state = states.INIT; // TODO これ必要

		const speechText = '初期化すると全てのデータが失われます。初期化して宜しいですか？';
		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	}
};

const StartIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'StartIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		// アトリビュートの扱いを変更 TODO
		if(!this.attributes[keyArray]) {
			this.attributes[keyArray] = createArray();
			this.attributes[keyIndex] = 0;
			this.attributes[keyCounter] = 0;
		}
		let array = this.attributes[keyArray];
		let index = this.attributes[keyIndex];
		let counter = Number(this.attributes[keyCounter]);
	
		let speechText = drumMessage() + exclamationMessage();
		speechText += '次の数字は、' + sleep + array[index] + 'です。' + sleep;
		index += 1;
		counter += 1;
		if (counter % 3 == 0) {
			speechText += '今までの数字を読み上げますか';
		} else {
			speechText += guideMessage();
		}

		// アトリビュートの扱いを変更 TODO
		this.attributes[keyIndex] = index;
		this.attributes[keyCounter] = counter;
	
		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(guideMessage())
			.getResponse();
	}
};

const YesIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.YesIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		let isInit = false;
		if(true){ // ステートの確認
			isInit = true;
		}
		// TODO ここでStateを削除する			

		if(isInit) {
			// TODO アトリビュートの扱い
			this.attributes[keyArray] = createArray();
			this.attributes[keyIndex] = 0;
			this.attributes[keyCounter] = 0;

			return handlerInput.responseBuilder
				.speak('初期化しました')
				.reprompt(guideMessage())
				.getResponse();

		} else {
			// TODO アトリビュートの扱い
			let array = this.attributes[keyArray];
			let index = this.attributes[keyIndex];
			
			let speechText = '今まで出た数字は、';
			for(var i=0; i < index; i++) {
				speechText += array[i] + '、';
			}
			speechText += '以上です。' + guideMessage();
			this.attributes[keyCounter] = 0;

			return handlerInput.responseBuilder
				.speak(speechText)
				.reprompt(guideMessage())
				.getResponse();
		}
	}
};

const NoIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.NoIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.responseBuilder
			.speak(guideMessage())
			.reprompt(guideMessage())
			.getResponse();
	}
};

const HelpIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.HelpIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 'このスキルは、ビンゴゲームをするためのものです。「スタート」というと、次の数字を出します。また、「読み上げ」と言うと、いつでも、現在までの数字を読み上げます。ビンゴゲームを最初から始めるには「初期化して」と言って下さい。では、始めましょう。「ビンゴスタート」って言って下さい';
		return handlerInput.responseBuilder
			.speak(speechText)
			.reprompt(speechText)
			.getResponse();
	}
};
   
const StopIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.StopIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = '終了します。ゲームは記録されていますので、次回、続きから始められます。';
		return handlerInput.responseBuilder
			.speak(speechText)
			.getResponse();
	}
};

const CancelIntentHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'IntentRequest'
			&& handlerInput.requestEnvelope.request.intent.name === 'AMAZON.CancelIntent';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		const speechText = 'キャンセルします。ゲームは記録されていますので、次回、続きから始められます。';
		return handlerInput.responseBuilder
			.speak(speechText)
			.getResponse();
	}
};

const SessionEndedRequestHandler: Alexa.RequestHandler = {
	canHandle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.requestEnvelope.request.type === 'SessionEndedRequest';
	},
	handle(handlerInput: Alexa.HandlerInput) {
		return handlerInput.responseBuilder // TODO これでいいのか？
			.getResponse();
	}
};

const ErrorHandler: Alexa.ErrorHandler  = {
  canHandle(handlerInput: Alexa.HandlerInput, error: Error) {
      return true;
  },
  handle(handlerInput: Alexa.HandlerInput, error: Error) {
	  console.log('ERROR' + error.message)
      return handlerInput.responseBuilder
          .getResponse();
  }
}

function guideMessage():string {
	const starts = ['次行ってみよー','スタート','ビンゴスタート','次'];
	const previous = ['読み上げ','出た数字を教えて','今までの数字を教えて','読み上げ'];
	return  '「' + random(starts) + '」、若しくは、「' + random(previous) + '」と言って下さい';
}

function random(list: string[]): string {
	const index = Math.floor( Math.random() * list.length);
	return list[index];
}

function exclamationMessage(): string {
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
	return  random(exclamations) + '、';

}

function drumMessage(): string {
	const drums = [
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_trumpet_bugle_03.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_01.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_02.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_01.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_02.mp3'/>"
	];		
	return  random(drums) + '、';
}

function createArray(): number[] {
	let array = [];
	for( ; array.length < 99; ) {
		const n = Math.floor( Math.random() * 99) + 1;
		if (array.indexOf(n) == -1) {
			array.push(n);
		}
	}
	return array;
}

