import "@tensorflow/tfjs"
import '@tensorflow/tfjs-backend-webgl';
import { SpeechCommandRecognizer, create } from "@tensorflow-models/speech-commands"

export interface speechCommand {
    command: string;
    callback: () => void
}

class aquaASR {
    _recognizer: SpeechCommandRecognizer
    _init: boolean
    _commands: { [key: string]: speechCommand["callback"] }
    _last_command: string
    constructor(commands?: Array<speechCommand>) {
        this._recognizer = create('BROWSER_FFT');
        this._init = false
        this._commands = {};
        (commands || []).forEach(element => {
            this._commands[element.command] = element.callback;
        });
        this._last_command = ""
    }

    intialize = async () => {
        await this._recognizer.ensureModelLoaded()
        console.log(this._recognizer.wordLabels())
        this._init = true
    }

    argMax = (array: Float32Array) => {
        var largest = 0;
        var largest_index = -1;
        for (let index = 0; index < array.length; index++) {
            if (array[index] > largest) {
                largest = array[index]
                largest_index = index
            }
        }
        return largest_index;
    }

    listen = () => {
        this._recognizer.listen((result) => {
            const word = this._recognizer.wordLabels()[this.argMax(result.scores as Float32Array)]

            return new Promise<void>((resolve, reject) => {
                if (this._last_command != word) {
                    this._last_command = word;
                    try {
                        if (word in this._commands) {
                            this._commands[word]()
                            resolve()
                        }
                    } catch (error) {
                        reject()
                    }
                }
                resolve()
            })
        }, {
            includeSpectrogram: true,
            probabilityThreshold: 0.85
        });
    }

    stop = () => {
        if (this._recognizer.isListening())
            this._recognizer.stopListening()
    }
}

export default aquaASR