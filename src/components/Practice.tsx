import { useEffect, useRef, useState } from 'react'
import type { Expression, LessonEntry } from '../types/learning'
import { BASIC_CONSONANTS, BASIC_VOWELS, composeHangul, lookupKana } from '../utils/hangul'
import { createReadingQuiz } from '../utils/quiz'
import type { ReadingQuestion } from '../utils/quiz'
import { ExpressionGrid } from './Lesson'

export function Composition() {
  const [consonant, setConsonant] = useState('ㄱ')
  const [vowel, setVowel] = useState('ㅏ')
  const syllable = composeHangul(consonant, vowel)
  const kana = lookupKana(syllable)

  return (
    <section className="section" id="composition" aria-labelledby="composition-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">LESSON 03</p>
          <h2 id="composition-heading">文字を組み合わせよう</h2>
        </div>
        <p className="section-meta">{BASIC_CONSONANTS.length * BASIC_VOWELS.length}通り</p>
      </div>
      <div className="composition">
        <div className="composition-inputs">
          <fieldset>
            <legend>子音</legend>
            <div className="jamo-buttons">
              {BASIC_CONSONANTS.map((letter) => (
                <label className="jamo-option" key={letter}>
                  <input checked={letter === consonant} name="composition-consonant"
                    onChange={() => setConsonant(letter)} type="radio" value={letter} />
                  <span lang="ko">{letter}</span>
                </label>
              ))}
            </div>
          </fieldset>
          <fieldset>
            <legend>母音</legend>
            <div className="jamo-buttons">
              {BASIC_VOWELS.map((letter) => (
                <label className="jamo-option" key={letter}>
                  <input checked={letter === vowel} name="composition-vowel"
                    onChange={() => setVowel(letter)} type="radio" value={letter} />
                  <span lang="ko">{letter}</span>
                </label>
              ))}
            </div>
          </fieldset>
        </div>
        <output aria-label="組み合わせの結果" className="composition-result">
          <span className="composition-equation" lang="ko">
            {consonant} + {vowel} = <strong>{syllable}</strong>
          </span>
          <span className="composition-kana">
            {kana ? <>近い日本語の音 <b>{kana}</b></> : 'かな表記の対応例なし'}
          </span>
        </output>
      </div>
    </section>
  )
}

export function ReadingQuiz({ entries, best, onComplete }: {
  entries: readonly (LessonEntry | Expression)[]
  best: number
  onComplete: (score: number) => void
}) {
  const [questions, setQuestions] = useState<ReadingQuestion[]>([])
  const [index, setIndex] = useState(0)
  const [choice, setChoice] = useState<string>()
  const [score, setScore] = useState(0)
  const [finished, setFinished] = useState(false)
  const question = questions[index]
  const questionHeading = useRef<HTMLParagraphElement>(null)
  const result = useRef<HTMLParagraphElement>(null)

  useEffect(() => {
    if (finished) {
      result.current?.focus()
    } else if (question) {
      questionHeading.current?.focus()
    }
  }, [finished, question])

  function start() {
    setQuestions(createReadingQuiz(entries))
    setIndex(0)
    setChoice(undefined)
    setScore(0)
    setFinished(false)
  }

  function choose(option: string) {
    if (!question || choice !== undefined) return
    setChoice(option)
    if (option === question.answer) setScore((current) => current + 1)
  }

  function advance() {
    if (index === questions.length - 1) {
      onComplete(score)
      setFinished(true)
      return
    }

    setChoice(undefined)
    setIndex((current) => current + 1)
  }

  return (
    <section className="section" id="quiz" aria-labelledby="quiz-heading">
      <div className="section-heading">
        <h2 id="quiz-heading">ハングル読みクイズ</h2>
        {best > 0 && <p className="section-meta">最高記録 {best}問正解</p>}
      </div>
      <div className="quiz-card">
        {finished ? (
          <>
            <p className="quiz-score" ref={result} tabIndex={-1}>
              <strong>{score}</strong> / {questions.length}問正解
            </p>
            <button className="button button-primary" onClick={start} type="button">もう一度挑戦する</button>
          </>
        ) : question ? (
          <>
            <div className="quiz-question">
              <p className="quiz-count" ref={questionHeading} tabIndex={-1}>
                第 {index + 1} 問 / {questions.length} 問
              </p>
              <p>ハングルの読み方を選んでください。</p>
              <p className="quiz-word" lang="ko">{question.prompt}</p>
            </div>
            <div aria-label="読み方の選択肢" className="quiz-options" role="group">
              {question.options.map((option) => {
                const isCorrect = choice !== undefined && option === question.answer
                const isIncorrect = choice === option && option !== question.answer
                return (
                  <button className="button button-secondary quiz-option"
                    data-result={isCorrect ? 'correct' : isIncorrect ? 'incorrect' : undefined}
                    aria-disabled={choice !== undefined} key={option}
                    onClick={() => choose(option)} type="button">
                    {option}
                    {isCorrect && <span aria-hidden="true"> ○</span>}
                    {isIncorrect && <span aria-hidden="true"> ×</span>}
                  </button>
                )
              })}
            </div>
            <div className="quiz-feedback">
              <p role="status">
                {choice !== undefined && (
                  choice === question.answer ? '正解です。' : `正解は「${question.answer}」です。`
                )}
              </p>
              <button className="button button-primary" disabled={choice === undefined}
                onClick={advance} type="button">
                {index === questions.length - 1 ? '結果を見る' : '次の問題'}
              </button>
            </div>
          </>
        ) : (
          <>
            <p>ハングルで書かれた日本語を読んで、かな表記を選びましょう。</p>
            <button className="button button-primary" onClick={start} type="button">クイズを始める</button>
          </>
        )}
      </div>
    </section>
  )
}

export function DailyExpressions({ entries }: { entries: readonly Expression[] }) {
  const topics = [...new Set(entries.map(({ topicJa }) => topicJa))]
  const [topic, setTopic] = useState(topics[0] ?? '')
  const filtered = topic ? entries.filter(({ topicJa }) => topicJa === topic) : entries

  return (
    <section className="section" id="expressions" aria-labelledby="expressions-heading">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DAILY JAPANESE</p>
          <h2 id="expressions-heading">ハングルで日本語を読もう</h2>
        </div>
        <p className="section-meta">全{entries.length}表現</p>
      </div>
      <p className="expression-note">ハングルは日本語の音を近い音で表しています。</p>
      <div className="topic-buttons" role="group" aria-label="テーマで絞り込む">
        {['', ...topics].map((option) => (
          <button aria-pressed={option === topic} className="button button-secondary"
            key={option} onClick={() => setTopic(option)} type="button">
            {option || 'すべて'}
          </button>
        ))}
      </div>
      <ul aria-label="日常表現" className="expression-list">
        {filtered.map((entry) => (
          <li className="expression-item" key={entry.id}>
            <ExpressionGrid forms={entry} />
          </li>
        ))}
      </ul>
    </section>
  )
}
