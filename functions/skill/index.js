const Alexa = require('alexa-sdk');
exports.handler = function(event, context, callback) {
	console.log(JSON.stringify(event));
	const alexa = Alexa.handler(event, context);
	alexa.dynamoDBTableName = 'BingoTable';
    //alexa.appId = process.env.ALEXA_APPLICATION_ID;
    //alexa.resources = languageStrings; 
    alexa.registerHandlers(handlers, gameHandlers, initHandlers);
    alexa.execute();
};

const keyCounter = 'counter';
const keyArray = 'array';
const keyIndex = 'index';
const sleep = '<break time="500ms"/>';

const states = {
	GAME: '_GAME',
	INIT: '_INIT'
};

const handlers = {
	'Unhandled': function () { 
		this.handler.state = states.GAME;
		this.emitWithState('LaunchRequest');
	},
	'SessionEndedRequest': function () {
		this.emit(':saveState', true);
	},
	'AMAZON.HelpIntent' : function() {
		this.handler.state = states.GAME;
		this.emit(':ask', 'このスキルは、ビンゴゲームをするためのものです。「スタート」というと、次の数字を出します。また、「読み上げ」と言うと、いつでも、現在までの数字を読み上げます。ビンゴゲームを最初から始めるには「初期化して」と言って下さい。では、始めましょう。「ビンゴスタート」って言って下さい');
	},
	'AMAZON.StopIntent' : function() {
		this.emit(':tell', '終了します。ゲームは記録されていますので、次回、続きから始められます。');
	},
	'AMAZON.CancelIntent' : function() {
		this.emit(':tell', 'キャンセルします。ゲームは記録されていますので、次回、続きから始められます。');
	}
};


const gameHandlers = Alexa.CreateStateHandler(states.GAME, {
	'LaunchRequest': function () {
		this.emit(':ask', guideMessage());
	},
	'InitIntent' : function() {
		this.handler.state = states.INIT;
		let output = '初期化すると全てのデータが失われます。初期化して宜しいですか？';
		this.emit(':ask', output, guideMessage());
	},
	'StartIntent' : function() {
		this.handler.state = states.GAME;
		if(!this.attributes[keyArray]) {
			this.attributes[keyArray] = createArray();
			this.attributes[keyIndex] = 0;
			this.attributes[keyCounter] = 0;
		}
		
		let array = this.attributes[keyArray];
		let index = this.attributes[keyIndex];
		let counter = Number(this.attributes[keyCounter]);

		let output = drumMessage() + exclamationMessage();
		output += '次の数字は、' + sleep + array[index] + 'です。' + sleep;
		index += 1;
		counter += 1;
		if (counter % 3 == 0) {
			output += '今までの数字を読み上げますか';
		} else {
			output += guideMessage();
		}
		this.attributes[keyIndex] = index;
		this.attributes[keyCounter] = counter;

		this.emit(':ask', output, guideMessage());
	},
	'AMAZON.YesIntent' : function() {
		let array = this.attributes[keyArray];
		let index = this.attributes[keyIndex];
		
		let output = '今まで出た数字は、';
		for(var i=0; i < index; i++) {
			output += array[i] + '、';
		}
		output += '以上です。' + guideMessage();
		this.attributes[keyCounter] = 0;
		this.emit(':ask', output, guideMessage());
	},
	'AMAZON.NoIntent' : function() {
		this.emit(':ask', guideMessage(), guideMessage());
	},
	'PreviousIntent' : function() {
		this.emitWithState('AMAZON.YesIntent');
	},
	'Unhandled': function () { 
		this.emit('LaunchRequest');
	},
	'SessionEndedRequest': function () {
		this.handler.state = '';
		this.emitWithState('SessionEndedRequest');
	},
	'AMAZON.HelpIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	},
	'AMAZON.StopIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	},
	'AMAZON.CancelIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	}
});

const initHandlers = Alexa.CreateStateHandler(states.INIT, {
	'AMAZON.YesIntent' : function() {
		this.attributes[keyArray] = createArray();
		this.attributes[keyIndex] = 0;
		this.attributes[keyCounter] = 0;
		this.handler.state = states.GAME;
		this.emit(':tell', '初期化しました');
	},
	'Unhandled': function () { 
		this.handler.state = states.GAME;
		this.emit(':ask', guideMessage(), guideMessage());
	},
	'SessionEndedRequest': function () {
		this.handler.state = '';
		this.emitWithState('SessionEndedRequest');
	},
	'AMAZON.HelpIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	},
	'AMAZON.StopIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	},
	'AMAZON.CancelIntent' : function() {
		this.handler.state = '';
		this.emitWithState(this.event.request.intent.name);
	}
});

function createArray() {
	let array = [];
	for( ; array.length < 99; ) {
		const n = Math.floor( Math.random() * 99) + 1;
		if (array.indexOf(n) == -1) {
			array.push(n);
		}
	}
	return array;
}

function random(list) {
	const index = Math.floor( Math.random() * list.length);
	return list[index];
}

function guideMessage() {
	const starts = ['次行ってみよー','スタート','ビンゴスタート','次'];
	const previous = ['読み上げ','出た数字を教えて','今までの数字を教えて','読み上げ'];
	return  '「' + random(starts) + '」、若しくは、「' + random(previous) + '」と言って下さい';
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
	return  random(exclamations) + '、';

}

function drumMessage() {
	const drums = [
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_trumpet_bugle_03.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_01.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_and_cymbal_02.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_01.mp3'/>",
		"<audio src='https://s3.amazonaws.com/ask-soundlibrary/musical/amzn_sfx_drum_comedy_02.mp3'/>"
	];		

	return  random(drums) + '、';

}






