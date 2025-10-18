import React, { useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import Button from '../components/Button';
import Card from '../components/Card';
import { ChapterInfo, MCQQuestion, QuizSet } from './ChapterSets';

interface QuizAutoRunProps {
  session: {
    set: QuizSet;
    questions: MCQQuestion[];
    chapterInfo: ChapterInfo;
  };
  onExit: () => void;
  onContinueToQuiz: () => void;
  onReplay?: () => void;
}

interface SpeechSegmentMetadata {
  type: 'question' | 'option' | 'answer' | 'explanation';
  index?: number;
}

interface SpeechSegment {
  text: string;
  lang?: string;
  payload?: SpeechSegmentMetadata;
}

const DEFAULT_DELAY_SECONDS = 5;

const supportsSpeech = typeof window !== 'undefined' && 'speechSynthesis' in window;

type NarrationOptions = {
  voice?: SpeechSynthesisVoice | null;
  rate: number;
  volume: number;
  onSegmentStart?: (payload: SpeechSegmentMetadata | null) => void;
};

const speakSegments = async (
  segments: SpeechSegment[],
  synth: SpeechSynthesis | null,
  options: NarrationOptions
) => {
  if (!segments.length) {
    return;
  }

  const { voice, rate, volume, onSegmentStart } = options;

  if (!synth || !supportsSpeech) {
    // Fallback: approximate timing and trigger callbacks for UI feedback
    for (let index = 0; index < segments.length; index += 1) {
      const segment = segments[index];
      onSegmentStart?.(segment.payload ?? null);
      const words = segment.text.split(' ').length;
      const approxMs = Math.max(words * 280, 900);
      // eslint-disable-next-line no-await-in-loop
      await new Promise((resolve) => setTimeout(resolve, approxMs));
    }
    onSegmentStart?.(null);
    return;
  }

  await new Promise<void>((resolve) => {
    let index = 0;

    const speakNext = () => {
      if (index >= segments.length) {
        onSegmentStart?.(null);
        resolve();
        return;
      }

      const segment = segments[index];
      const utterance = new SpeechSynthesisUtterance(segment.text);
      if (segment.lang) {
        utterance.lang = segment.lang;
      }
      if (voice) {
        utterance.voice = voice;
      }
      utterance.rate = Math.max(0.5, Math.min(rate, 2));
      utterance.pitch = 1.0;
      utterance.volume = Math.max(0, Math.min(volume, 1));
      utterance.onstart = () => {
        onSegmentStart?.(segment.payload ?? null);
      };
      utterance.onend = () => {
        index += 1;
        speakNext();
      };
      utterance.onerror = () => {
        index += 1;
        speakNext();
      };
      synth.speak(utterance);
    };

    speakNext();
  });
};

const stopSpeech = (synth: SpeechSynthesis | null) => {
  if (!synth || !supportsSpeech) {
    return;
  }
  synth.cancel();
};

const QuizAutoRun: React.FC<QuizAutoRunProps> = ({ session, onExit, onContinueToQuiz, onReplay }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const runtimeSession = session ?? (location.state as QuizAutoRunProps['session'] | undefined);

  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasCompleted, setHasCompleted] = useState(false);
  const [isPreparing, setIsPreparing] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [speechRate, setSpeechRate] = useState(1);
  const [speechVolume, setSpeechVolume] = useState(1);
  const [audioError, setAudioError] = useState<string | null>(supportsSpeech ? null : 'Voice playback not supported in this browser.');
  const [activeSegment, setActiveSegment] = useState<SpeechSegmentMetadata | null>(null);
  const synthRef = useRef<SpeechSynthesis | null>(supportsSpeech ? window.speechSynthesis : null);
  const delayRef = useRef<NodeJS.Timeout | null>(null);
  const cancelledRef = useRef(false);
  const volumeMemoryRef = useRef(1);

  if (!runtimeSession) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050921] text-white">
        <div className="text-center space-y-4">
          <p className="text-xl">Auto run preview is unavailable.</p>
          <Button onClick={() => navigate('/chapter-sets')} variant="primary">
            Back to chapter sets
          </Button>
        </div>
      </div>
    );
  }

  const { questions, set } = runtimeSession;
  const totalQuestions = questions.length;
  const autoRunOptions = set.autoRunConfig ?? { enabled: true };
  const delaySeconds = autoRunOptions.delaySeconds ?? DEFAULT_DELAY_SECONDS;

  const segmentsForQuestion = useMemo(() => {
    return questions.map((question) => {
      const segments: SpeechSegment[] = [
        {
          text: `Question ${question.id}: ${question.question}`,
          payload: { type: 'question' }
        }
      ];

      (question.options ?? []).slice(0, 4).forEach((option, index) => {
        const label = String.fromCharCode(65 + index);
        segments.push({
          text: `${label}. ${option}`,
          payload: { type: 'option', index }
        });
      });

      if (autoRunOptions.readCorrectAnswer) {
        const correctIndex = Number(question.correctAnswer);
        if (!Number.isNaN(correctIndex)) {
          const letter = String.fromCharCode(65 + correctIndex);
          segments.push({
            text: `Correct answer: option ${letter}.`,
            payload: { type: 'answer', index: correctIndex }
          });
        }
      }

      if (autoRunOptions.readExplanation && question.explanation) {
        segments.push({
          text: `Explanation: ${question.explanation}`,
          payload: { type: 'explanation' }
        });
      }

      return segments;
    });
  }, [questions, autoRunOptions.readCorrectAnswer, autoRunOptions.readExplanation]);

  const resetPlayback = () => {
    cancelledRef.current = true;
    stopSpeech(synthRef.current);
    if (delayRef.current) {
      clearTimeout(delayRef.current);
      delayRef.current = null;
    }
    cancelledRef.current = false;
    setActiveSegment(null);
  };

  useEffect(() => {
    return () => {
      resetPlayback();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!supportsSpeech) {
      return undefined;
    }

    const updateVoices = () => {
      const voiceList = window.speechSynthesis.getVoices();
      setVoices(voiceList);
    };

    updateVoices();
    window.speechSynthesis.onvoiceschanged = updateVoices;

    return () => {
      if ('speechSynthesis' in window) {
        window.speechSynthesis.onvoiceschanged = null;
      }
    };
  }, []);

  useEffect(() => {
    if (!selectedVoice && voices.length) {
      const englishVoice = voices.find((voice) => voice.lang?.toLowerCase().startsWith('en')) ?? voices[0];
      if (englishVoice) {
        setSelectedVoice(englishVoice.name);
      }
    }
  }, [voices, selectedVoice]);

  const resolvedVoice = useMemo(() => {
    if (!selectedVoice) {
      return null;
    }
    return voices.find((voice) => voice.name === selectedVoice) ?? null;
  }, [voices, selectedVoice]);

  useEffect(() => {
    if (!isPlaying || hasCompleted) {
      return;
    }

    let disposed = false;

    const runSequence = async () => {
      setIsPreparing(true);
      try {
        await speakSegments(segmentsForQuestion[currentQuestion] ?? [], synthRef.current, {
          voice: resolvedVoice,
          rate: speechRate,
          volume: speechVolume,
          onSegmentStart: setActiveSegment
        });
      } catch (error) {
        setAudioError('Unable to play narration. Try a different browser or voice setting.');
        setIsPlaying(false);
        setIsPreparing(false);
        setActiveSegment(null);
        return;
      }
      if (disposed || cancelledRef.current) {
        setIsPreparing(false);
        return;
      }
      setIsPreparing(false);

      if (currentQuestion >= totalQuestions - 1) {
        setHasCompleted(true);
        setIsPlaying(false);
        setActiveSegment(null);
        return;
      }

      delayRef.current = setTimeout(() => {
        setActiveSegment(null);
        setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions - 1));
      }, delaySeconds * 1000);
    };

    runSequence();

    return () => {
      disposed = true;
      if (delayRef.current) {
        clearTimeout(delayRef.current);
        delayRef.current = null;
      }
      stopSpeech(synthRef.current);
    };
  }, [currentQuestion, delaySeconds, hasCompleted, isPlaying, segmentsForQuestion, totalQuestions, resolvedVoice, speechRate, speechVolume]);

  const handlePlay = () => {
    resetPlayback();
    setHasCompleted(false);
    if (!supportsSpeech) {
      setAudioError('Voice playback not supported. Showing guided highlights instead.');
    } else {
      setAudioError(null);
    }
    setIsPlaying(true);
  };

  const handlePause = () => {
    resetPlayback();
    setIsPlaying(false);
    setActiveSegment(null);
  };

  const handleRestart = () => {
    resetPlayback();
    setCurrentQuestion(0);
    setHasCompleted(false);
    setAudioError(null);
    setIsPlaying(true);
    if (onReplay) {
      onReplay();
    }
  };

  const progress = ((currentQuestion + (hasCompleted ? 1 : 0)) / totalQuestions) * 100;

  const question = questions[currentQuestion];
  const isMuted = speechVolume <= 0;
  const isQuestionNarrated = activeSegment?.type === 'question';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#050921] via-[#131b3a] to-[#1b1b24] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-10 left-10 text-7xl">✨</div>
        <div className="absolute top-24 right-24 text-6xl">🎧</div>
        <div className="absolute bottom-32 left-1/3 text-8xl">🧠</div>
        <div className="absolute bottom-12 right-12 text-6xl">📚</div>
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        <div className="max-w-6xl mx-auto w-full px-6 pt-12">
          <div className="absolute inset-0 pointer-events-none auto-run-radial-glow" aria-hidden />
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 relative">
            <div>
              <p className="text-sm uppercase tracking-[0.3em] text-blue-300">Auto Run Preview</p>
              <h1 className="text-3xl md:text-4xl font-bold text-white mt-2">
                {runtimeSession.chapterInfo.subject} · {runtimeSession.chapterInfo.chapter}
              </h1>
              <p className="text-blue-200 mt-3 max-w-xl">
                Sit back and listen. Every question, option and answer will be narrated automatically. When you are ready, jump into the live quiz experience.
              </p>
            </div>
            <div className="flex flex-wrap gap-3 justify-end">
              <Button
                onClick={() => {
                  if (onExit) {
                    onExit();
                  } else {
                    navigate('/quiz-instructions', { state: runtimeSession });
                  }
                }}
                variant="outline"
                className="border-blue-500 text-blue-200 hover:bg-blue-500/10"
              >
                Back to instructions
              </Button>
              <Button
                onClick={() => {
                  if (onContinueToQuiz) {
                    onContinueToQuiz();
                  } else {
                    navigate('/theme-picker', { state: runtimeSession });
                  }
                }}
                variant="primary"
                className="bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
              >
                Start interactive quiz
              </Button>
            </div>
          </div>

          <div className="mt-8">
            <div className="flex flex-wrap items-center justify-between gap-3 text-sm text-blue-200 mb-2">
              <span>
                Question {Math.min(currentQuestion + 1, totalQuestions)} of {totalQuestions}
              </span>
              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.25em] text-blue-300">
                <div className={`auto-run-wave ${isPlaying ? 'auto-run-wave-active' : ''} ${isPreparing ? 'auto-run-wave-preparing' : ''}`}>
                  <span />
                  <span />
                  <span />
                </div>
                <span>{isPreparing ? 'Preparing narration' : isPlaying ? 'Live narration' : 'Paused'}</span>
              </div>
              <span>{Math.round(progress)}% narrated</span>
            </div>
            <div className="h-2 rounded-full bg-white/10 overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.4 }}
              />
            </div>
            <div className="flex items-center gap-1.5 mt-4">
              {questions.map((_, index) => {
                const isPast = index < currentQuestion;
                const isCurrent = index === currentQuestion;
                return (
                  <div
                    key={index}
                    className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                      isCurrent
                        ? 'bg-gradient-to-r from-cyan-400 to-violet-500 shadow-[0_0_8px_rgba(59,130,246,0.45)]'
                        : isPast
                          ? 'bg-blue-400/70'
                          : 'bg-white/10'
                    }`}
                  />
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex-1 w-full mt-10 px-6 pb-24">
          <div className="max-w-5xl mx-auto grid gap-6 md:grid-cols-[1fr_minmax(220px,260px)]">
            <Card variant="elevated" className={`bg-white/10 border border-white/10 shadow-2xl relative overflow-hidden ${isPlaying ? 'auto-run-question-card-playing' : ''}`}>
              <div className="p-6 md:p-8 relative z-10">
                <h2 className={`text-xl font-semibold text-white mb-4 ${isQuestionNarrated ? 'auto-run-question-active' : ''}`}>
                  {question?.question}
                </h2>
                <div className="grid gap-4">
                  {(question?.options ?? []).slice(0, 4).map((option, index) => {
                    const letter = String.fromCharCode(65 + index);
                    const isCorrect = Number(question?.correctAnswer) === index;
                    const isActiveOption = activeSegment?.type === 'option' && activeSegment.index === index;
                    const isAnswerCallout = activeSegment?.type === 'answer' && activeSegment.index === index;
                    return (
                      <motion.div
                        key={option}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                      >
                        <div
                          className={`rounded-xl border py-4 px-5 flex items-center gap-3 transition-all duration-300 ${
                            isCorrect ? 'border-emerald-400/80 bg-emerald-400/5 text-emerald-200' : 'border-white/10 bg-white/5 text-blue-50'
                          } ${isActiveOption ? 'auto-run-option-active' : ''} ${isAnswerCallout ? 'auto-run-option-answer' : ''}`}
                        >
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-white/10 text-sm font-semibold">
                            {letter}
                          </span>
                          <span className="flex-1 text-sm md:text-base leading-relaxed">{option}</span>
                          {isCorrect && autoRunOptions.readCorrectAnswer && (
                            <span className="text-lg">✅</span>
                          )}
                        </div>
                      </motion.div>
                    );
                  })}
                </div>

                {autoRunOptions.readExplanation && question?.explanation && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 }}
                    className={`mt-6 bg-white/5 border border-white/10 rounded-xl p-5 text-blue-100 ${activeSegment?.type === 'explanation' ? 'auto-run-explanation-active' : ''}`}
                  >
                    <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-300 mb-2">Explanation</h3>
                    <p className="text-sm leading-relaxed">{question.explanation}</p>
                  </motion.div>
                )}
              </div>
              {isPlaying && <div className="auto-run-card-ambient" aria-hidden />}
            </Card>

            <div className="space-y-4">
              <Card variant="elevated" className="bg-white/10 border border-white/10 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-300">Playback controls</h3>
                <div className="auto-run-controls mt-4">
                  <Button
                    onClick={handlePlay}
                    disabled={isPlaying && !hasCompleted}
                    className="bg-blue-500/90 hover:bg-blue-500 text-white"
                  >
                    {isPreparing ? 'Narrating…' : isPlaying && !hasCompleted ? 'Narrating…' : 'Play narration'}
                  </Button>
                  <Button
                    onClick={handlePause}
                    disabled={!isPlaying}
                    variant="outline"
                    className="border-blue-400 text-blue-200 hover:bg-blue-400/10"
                  >
                    Pause narration
                  </Button>
                  <Button
                    onClick={handleRestart}
                    variant="secondary"
                    className="bg-purple-500/20 text-purple-200 border-purple-400/40 hover:bg-purple-500/30"
                  >
                    Restart from beginning
                  </Button>
                  <Button
                    onClick={() => {
                      stopSpeech(synthRef.current);
                      if (delayRef.current) {
                        clearTimeout(delayRef.current);
                        delayRef.current = null;
                      }
                      setCurrentQuestion((prev) => Math.min(prev + 1, totalQuestions - 1));
                      setActiveSegment(null);
                    }}
                    disabled={currentQuestion >= totalQuestions - 1}
                    variant="outline"
                    className="border-white/20 text-blue-100 hover:bg-white/10"
                  >
                    Skip to next question
                  </Button>
                </div>

                <div className="mt-5 space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-blue-300 mb-2">
                      <span>Voice</span>
                      <span>{voices.length ? `${voices.length} available` : 'Default'}</span>
                    </div>
                    <select
                      value={selectedVoice}
                      onChange={(event) => setSelectedVoice(event.target.value)}
                      className="w-full bg-white/10 border border-white/20 text-blue-50 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
                      disabled={!voices.length}
                    >
                      {voices.length === 0 && <option value="">System default</option>}
                      {voices.map((voice) => (
                        <option key={voice.name} value={voice.name}>
                          {voice.name} · {voice.lang}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-blue-300">
                      <span>Playback speed</span>
                      <span>{speechRate.toFixed(1)}x</span>
                    </div>
                    <input
                      type="range"
                      min="0.6"
                      max="1.6"
                      step="0.1"
                      value={speechRate}
                      onChange={(event) => setSpeechRate(Number(event.target.value))}
                      className="w-full accent-blue-400 mt-2"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-blue-300">
                      <span>Volume</span>
                      <span>{isMuted ? 'Muted' : `${Math.round(speechVolume * 100)}%`}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-2">
                      <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.05"
                        value={speechVolume}
                        onChange={(event) => {
                          const value = Number(event.target.value);
                          setSpeechVolume(value);
                          if (value > 0.05) {
                            volumeMemoryRef.current = value;
                          }
                          if (value > 0 && isMuted) {
                            setSpeechVolume(value);
                          }
                        }}
                        className="flex-1 accent-blue-400"
                      />
                      <Button
                        onClick={() => {
                          if (isMuted) {
                            const restored = volumeMemoryRef.current || 0.7;
                            setSpeechVolume(restored);
                          } else {
                            volumeMemoryRef.current = speechVolume || 0.7;
                            setSpeechVolume(0);
                          }
                        }}
                        variant="outline"
                        className="border-blue-400 text-blue-200 hover:bg-blue-400/10 px-3"
                      >
                        {isMuted ? 'Unmute' : 'Mute'}
                      </Button>
                    </div>
                    <div className="auto-run-volume-indicator mt-3">
                      {Array.from({ length: 6 }).map((_, dotIndex) => (
                        <span
                          // eslint-disable-next-line react/no-array-index-key
                          key={dotIndex}
                          className={`dot ${speechVolume >= (dotIndex + 1) / 6 ? 'active' : ''}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>

                <p className="mt-4 text-xs text-blue-200/70">
                  Voice playback uses your browser's built-in speech synthesis. Audio experience may vary by device.
                </p>

                <AnimatePresence>
                  {audioError && (
                    <motion.div
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      className="mt-4 text-xs text-amber-300 bg-amber-500/10 border border-amber-400/30 rounded-lg px-3 py-2"
                    >
                      {audioError}
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>

              <Card variant="elevated" className="bg-white/5 border border-white/10 p-5">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-blue-300">Session Summary</h3>
                <ul className="mt-3 space-y-2 text-sm text-blue-100/90">
                  <li>• {totalQuestions} MCQs narrated automatically.</li>
                  <li>• Pause anytime and switch to the manual attempt.</li>
                  <li>• Delay between questions: {delaySeconds} seconds.</li>
                  {autoRunOptions.readExplanation && <li>• Includes verbal explanations for every answer.</li>}
                  <li>• Voice: {resolvedVoice?.name ?? 'System default'}.</li>
                </ul>

                <AnimatePresence>
                  {hasCompleted && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="mt-5 rounded-xl bg-emerald-500/20 border border-emerald-400/40 px-4 py-3 text-emerald-100 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                    >
                      <p className="font-semibold">Narration complete!</p>
                      <p className="text-sm mt-1">Ready to test yourself? Jump into the interactive quiz to lock in your learning.</p>
                    </motion.div>
                  )}
                </AnimatePresence>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAutoRun;
