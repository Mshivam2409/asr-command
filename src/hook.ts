import * as React from 'react'
import { useEffect } from 'react'
import SpeechRecognition, {
    useSpeechRecognition
} from 'react-speech-recognition'
import useSound from 'use-sound'
import { useReactMediaRecorder, StatusMessages } from "react-media-recorder";
import useCountDown from 'react-countdown-hook';
import aquaASR from './inference';

export interface opts {
    audio: {
        buzzin: string
        buzzout: string
    }
    timeout: number
    isReady: boolean
    onAudioData: (data: Array<number>, ...params: Array<any>) => void
    onBuzzin: (...params: Array<any>) => void
    onComplete: (answer: string, audioBlob: Blob, ...params: Array<any>) => void
}

const useOnlineAnswering = (options: opts): [string[], boolean, SpeechRecognition, StatusMessages, number, aquaASR] => {
    const [answer, setAnswer] = React.useState<Array<string>>([])
    const [listening, setListening] = React.useState<boolean>(false)
    const [audioBlob, setAudioBlob] = React.useState<Blob>();
    const [finished, setFinished] = React.useState<boolean>(true)
    const [playBuzzin] = useSound(options.audio.buzzin)
    const [playBuzzout] = useSound(options.audio.buzzout)
    const [timeLeft, { start, reset }] = useCountDown(options.timeout, 100);

    const recognizer = useSpeechRecognition()

    const {
        status,
        startRecording,
        stopRecording,
    } = useReactMediaRecorder({
        audio: true,
        onStop: ((_: string, blob: Blob) => {
            setAudioBlob(blob)
        })
    });


    // SpeechRecognition.startListening()

    const complete = () => {
        if (recognizer.finalTranscript.length > 0 && audioBlob) {
            var transcript = recognizer.finalTranscript;
            SpeechRecognition.stopListening()
            options.onComplete(
                transcript
                    .split(' ').slice(0, -1).join(' ')
                    .toLowerCase()
                    .replace("go".toLowerCase(), '')
                    .replace("stop".toLowerCase(), '')
                    .replace(/[^\w\s]|_/g, ''),
                audioBlob
            )
        }
        if (audioBlob)
            setFinished(false)
    }


    const commands = [
        {
            command: "go",
            callback: () => {
                console.log(options.isReady && finished, options.isReady, finished)
                if (options.isReady && finished) {
                    setFinished(false)
                    recognizer.resetTranscript()
                    SpeechRecognition.startListening({ continuous: true })
                    reset()
                    start()
                    console.log('Buzzed In')
                    options.onBuzzin()
                    playBuzzin()
                    startRecording()
                    setAnswer([])
                    setListening(true)
                }

            },
        },
        {

            command: "stop",
            callback: () => {
                console.log("Stopped")
                if (listening && !finished) {
                    stopRecording()
                }
            },
        }
    ]
    const commandRecognizer = new aquaASR(commands)


    useEffect(() => {
        if (timeLeft === 100) {
            if (listening && !finished) {
                stopRecording()
            }
        }
    }, [timeLeft])

    useEffect(() => {
        complete()
    }, [audioBlob])


    return [answer, listening, SpeechRecognition, status, timeLeft, commandRecognizer]
}

export default useOnlineAnswering;