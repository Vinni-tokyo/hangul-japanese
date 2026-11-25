import { useEffect, useRef, useState } from 'react'
import { dailyLessons } from '../data/dailyLessons'
import './daily-learning.css'

const storageKey = 'hangul-japanese:daily-progress'
const lessonCount = dailyLessons.length

function readCompletedDays(): number[] {
  try {
    const saved: unknown = JSON.parse(localStorage.getItem(storageKey) ?? '[]')
    if (Array.isArray(saved)) {
      return [...new Set(saved.filter((day): day is number =>
        typeof day === 'number' && Number.isInteger(day) && day > 0 && day <= lessonCount
      ))]
    }
  } catch {
    // The lesson remains available when local storage is blocked or invalid.
  }
  return []
}

function nextUnfinishedIndex(completed: readonly number[]) {
  const index = dailyLessons.findIndex(({ day }) => !completed.includes(day))
  return index < 0 ? lessonCount - 1 : index
}

export function DailyLearning() {
  const [completed, setCompleted] = useState(readCompletedDays)
  const [index, setIndex] = useState(() => nextUnfinishedIndex(completed))
  const [isOpen, setIsOpen] = useState(false)
  const [showAnswer, setShowAnswer] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [speechMessage, setSpeechMessage] = useState('')
  const openButton = useRef<HTMLButtonElement>(null)
  const lessonHeading = useRef<HTMLHeadingElement>(null)
  const focusDestination = useRef<'open' | 'lesson' | null>(null)
  const activeUtterance = useRef<SpeechSynthesisUtterance | null>(null)
  const lesson = dailyLessons[index]
  const { day, expression, titleJa, titleKo, noteJa, noteKo } = lesson
  const isComplete = completed.includes(day)
  const allComplete = completed.length === lessonCount

  useEffect(() => {
    if (focusDestination.current === 'lesson') lessonHeading.current?.focus()
    if (focusDestination.current === 'open') openButton.current?.focus()
    focusDestination.current = null
  }, [index, isOpen])

  useEffect(() => () => {
    if (activeUtterance.current) {
      activeUtterance.current = null
      window.speechSynthesis.cancel()
    }
  }, [])

  function stopSpeech() {
    if (!activeUtterance.current) return
    activeUtterance.current = null
    window.speechSynthesis.cancel()
    setIsSpeaking(false)
  }

  function selectLesson(nextIndex: number, focusHeading = false) {
    if (nextIndex === index) return
    stopSpeech()
    setSpeechMessage('')
    setShowAnswer(false)
    if (focusHeading) focusDestination.current = 'lesson'
    setIndex(nextIndex)
  }

  function openLesson() {
    selectLesson(allComplete ? 0 : nextUnfinishedIndex(completed))
    focusDestination.current = 'lesson'
    setIsOpen(true)
  }

  function closeLesson() {
    stopSpeech()
    setSpeechMessage('')
    setShowAnswer(false)
    focusDestination.current = 'open'
    setIsOpen(false)
  }

  function speak() {
    if (activeUtterance.current) {
      stopSpeech()
      return
    }

    setSpeechMessage('')
    const synth = window.speechSynthesis
    if (!synth || typeof window.SpeechSynthesisUtterance !== 'function') {
      setSpeechMessage('このブラウザーでは音声を再生できません。 (이 브라우저에서는 음성을 재생할 수 없어요.)')
      return
    }
    const voices = synth.getVoices()
    const japaneseVoice = voices.find(({ lang }) => lang.toLowerCase().replace('_', '-') === 'ja-jp') ??
      voices.find(({ lang }) => /^ja(?:[-_]|$)/i.test(lang))
    if (voices.length > 0 && !japaneseVoice) {
      setSpeechMessage('日本語の音声を端末に追加してください。 (기기에 일본어 음성을 추가해 주세요.)')
      return
    }

    const utterance = new SpeechSynthesisUtterance(expression.japanese || expression.kana)
    utterance.lang = 'ja-JP'
    utterance.rate = 0.85
    if (japaneseVoice) utterance.voice = japaneseVoice
    const finish = (message = '') => {
      if (activeUtterance.current !== utterance) return
      activeUtterance.current = null
      setIsSpeaking(false)
      setSpeechMessage(message)
    }
    const playbackError = '音声を再生できませんでした。日本語の音声設定を確認してください。 (음성을 재생하지 못했어요. 일본어 음성 설정을 확인해 주세요.)'
    utterance.onend = () => finish()
    utterance.onerror = () => finish(playbackError)
    activeUtterance.current = utterance
    setIsSpeaking(true)
    try {
      synth.speak(utterance)
    } catch {
      finish(playbackError)
    }
  }

  function completeLesson() {
    if (isComplete) return
    const updated = [...new Set([...readCompletedDays(), ...completed, day])]
    setCompleted(updated)
    try {
      localStorage.setItem(storageKey, JSON.stringify(updated))
    } catch {
      // Retain progress for this visit even if it cannot be saved.
    }
  }

  return (
    <section className="section daily-learning" id="daily-learning" aria-labelledby="daily-learning-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DAILY JAPANESE</p>
          <h2 id="daily-learning-heading">30日間の日本語レッスン <span lang="ko">(30일 일본어 학습)</span></h2>
        </div>
        {isOpen && (
          <button className="button button-secondary" type="button" onClick={closeLesson}>
            閉じる <span lang="ko">(닫기)</span>
          </button>
        )}
      </div>

      <div className="daily-overview">
        <div>
          <p className="daily-overview-title">
            {allComplete ? <>全レッスン修了 <span lang="ko">(전 과정 완료)</span></> :
              <>毎日ひとつ、声に出して。 <span lang="ko">(하루 한 표현, 소리 내어 읽어요.)</span></>}
          </p>
          <div className="daily-progress">
            <progress aria-label="学習の進み具合 (학습 진행률)" value={completed.length} max={lessonCount} />
            <span role="status">{completed.length} / {lessonCount} 日分完了 <span lang="ko">(일차 완료)</span></span>
          </div>
        </div>
        {!isOpen && (
          <button ref={openButton} className="button button-primary" type="button" onClick={openLesson}>
            {allComplete ? <>復習する <span lang="ko">(복습하기)</span></> :
              completed.length ? <>学習を続ける <span lang="ko">(학습 이어가기)</span></> :
                <>開始する <span lang="ko">(학습 시작)</span></>}
            <span aria-hidden="true"> →</span>
          </button>
        )}
      </div>

      {isOpen && (
        <div className="daily-layout">
          <article className="daily-lesson" aria-labelledby="daily-lesson-heading">
            <header className="daily-lesson-header">
              <p className="eyebrow">DAY {day} / {lessonCount}</p>
              <h3 id="daily-lesson-heading" ref={lessonHeading} tabIndex={-1}>
                {titleJa} <span lang="ko">({titleKo})</span>
              </h3>
            </header>

            <div className="daily-phrase">
              <p className="daily-phrase-label">ハングル表記の日本語 <span lang="ko">(한글 표기의 일본어)</span></p>
              <p className="daily-phrase-text" lang="ko">{expression.hangulJapanese}</p>
              <div className="daily-actions">
                <button className="button button-primary" type="button" onClick={speak}>
                  <span aria-hidden="true">{isSpeaking ? '■' : '▶'}</span>
                  {isSpeaking ? <>停止 <span lang="ko">(정지)</span></> : <>発音を聞く <span lang="ko">(발음 듣기)</span></>}
                </button>
                <button className="button button-secondary" type="button" aria-expanded={showAnswer}
                  onClick={() => setShowAnswer((current) => !current)}>
                  {showAnswer ? <>答えを隠す <span lang="ko">(답 숨기기)</span></> : <>答えを見る <span lang="ko">(답 보기)</span></>}
                </button>
              </div>
              <p className="daily-speech-status" role="status">{speechMessage}</p>
            </div>

            {showAnswer && (
              <div className="daily-answer">
                <dl>
                  <div>
                    <dt>かな表記 <span lang="ko">(가나 표기)</span></dt>
                    <dd>{expression.kana}</dd>
                  </div>
                  <div>
                    <dt>漢字かな交じり文 <span lang="ko">(한자·가나 혼용문)</span></dt>
                    <dd>{expression.japanese}</dd>
                  </div>
                  <div>
                    <dt>韓国語表現 <span lang="ko">(한국어 표현)</span></dt>
                    <dd lang="ko">{expression.korean}</dd>
                  </div>
                </dl>
                <p>{noteJa}</p>
                <p lang="ko">{noteKo}</p>
              </div>
            )}

            <footer className="daily-lesson-footer">
              <button className="button button-secondary" type="button" disabled={index === 0}
                onClick={() => selectLesson(index - 1, true)}>
                <span aria-hidden="true">←</span> 前へ <span lang="ko">(이전)</span>
              </button>
              <button className={isComplete ? 'button daily-completed' : 'button button-primary'}
                type="button" aria-disabled={isComplete} onClick={completeLesson}>
                {isComplete ? <>✓ 学習済み <span lang="ko">(학습 완료)</span></> :
                  <>学習済みにする <span lang="ko">(학습 완료하기)</span></>}
              </button>
              <button className="button button-secondary" type="button" disabled={index === lessonCount - 1}
                onClick={() => selectLesson(index + 1, true)}>
                次へ <span lang="ko">(다음)</span> <span aria-hidden="true">→</span>
              </button>
            </footer>
          </article>

          <nav className="daily-calendar" aria-label="学習日を選ぶ (학습 일차 선택)">
            <h3>学習日を選ぶ <span lang="ko">(학습 일차 선택)</span></h3>
            <ol>
              {dailyLessons.map(({ day: lessonDay, titleJa: dayTitle }, lessonIndex) => {
                const done = completed.includes(lessonDay)
                return (
                  <li key={lessonDay}>
                    <button className="daily-day" type="button" aria-current={lessonIndex === index ? 'step' : undefined}
                      aria-label={`DAY ${lessonDay}: ${dayTitle}${done ? ' (学習済み / 학습 완료)' : ''}`}
                      data-complete={done || undefined} onClick={() => selectLesson(lessonIndex, true)}>
                      {lessonDay}{done && <span aria-hidden="true">✓</span>}
                    </button>
                  </li>
                )
              })}
            </ol>
          </nav>
        </div>
      )}
    </section>
  )
}
