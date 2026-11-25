import { useEffect, useState } from 'react'
import { Lesson } from './components/Lesson'
import { Composition, DailyExpressions, ReadingQuiz } from './components/Practice'
import consonantData from './data/consonants.json'
import expressionData from './data/expressions.json'
import vowelData from './data/vowels.json'
import type { Expression, LessonEntry, LessonKey } from './types/learning'
import { loadProgress, saveProgress } from './utils/progress'

const repository = 'https://github.com/Vinni-tokyo/hangul-japanese'
const consonants = (consonantData as LessonEntry[]).slice().sort((a, b) => a.order - b.order)
const vowels = (vowelData as LessonEntry[]).slice().sort((a, b) => a.order - b.order)
const expressions: Expression[] = expressionData
const quizEntries = [...consonants, ...vowels, ...expressions]

const levels = [
  { title: '基本子音', target: 'consonants' },
  { title: '基本母音', target: 'vowels' },
  { title: '文字の組み合わせ', target: 'composition' },
  { title: '濃音と複合母音' },
  { title: 'パッチム' },
  { title: '日本語とハングルの音の違い' },
  { title: '日本語の日常表現', target: 'expressions' },
]

function CourseOutline() {
  return (
    <section className="section" id="course" aria-labelledby="course-heading">
      <div className="section-heading">
        <h2 id="course-heading">学習コース</h2>
      </div>
      <ol className="course-list">
        {levels.map(({ title, target }, index) => {
          const label = (
            <>
              <span className="course-level">Level {index + 1}</span>
              <span>{title}</span>
              {target
                ? <span className="course-end" aria-hidden="true">↗</span>
                : <span className="course-end">準備中</span>}
            </>
          )

          return (
            <li key={title}>
              {target ? <a className="course-row" href={`#${target}`}>{label}</a>
                : <div className="course-row course-unavailable">{label}</div>}
            </li>
          )
        })}
      </ol>
    </section>
  )
}

export default function App() {
  const [progress, setProgress] = useState(loadProgress)

  useEffect(() => {
    saveProgress(progress)
  }, [progress])

  function completeLesson(key: LessonKey, id: string) {
    setProgress((current) => {
      if (current[key].includes(id)) return current
      return { ...current, [key]: [...current[key], id] }
    })
  }

  function recordQuiz(score: number) {
    setProgress((current) => score > current.quizBest ? { ...current, quizBest: score } : current)
  }

  return (
    <>
      <a className="skip-link" href="#main">本文へ移動</a>
      <header className="site-header">
        <div className="shell header-content">
          <a className="brand" href="#top">
            <span className="brand-mark" lang="ko">한글</span>
            <span>Hangul Japanese</span>
          </a>
          <a className="repo-link" href={repository}>
            GitHub <span aria-hidden="true">↗</span>
          </a>
        </div>
      </header>
      <main id="main" tabIndex={-1}>
        <section className="hero" id="top" aria-labelledby="hero-heading">
          <div className="shell hero-content">
            <div>
              <p className="hero-label">日本語で学ぶハングル</p>
              <h1 id="hero-heading">日本語に、<br />新しい文字の<br className="hero-wrap" />選択肢を。</h1>
              <p className="hero-intro">
                <strong>日本語でハングルを学ぼう！</strong><br />
                新しい言語ではなく、新しい文字を学ぼう。
              </p>
              <a className="button button-primary hero-action" href="#consonants">
                ハングルを学ぶ <span aria-hidden="true">↓</span>
              </a>
            </div>
            <div className="hero-letters" aria-hidden="true">
              <span>あ</span>
              <span>ア</span>
              <span lang="ko">아</span>
            </div>
          </div>
        </section>
        <div className="shell study">
          <Lesson id="consonants" number="01" title="基本子音" entries={consonants}
            completed={progress.consonants} onComplete={(id) => completeLesson('consonants', id)} />
          <Lesson id="vowels" number="02" title="基本母音" entries={vowels}
            completed={progress.vowels} onComplete={(id) => completeLesson('vowels', id)} />
          <Composition />
          <ReadingQuiz entries={quizEntries} best={progress.quizBest} onComplete={recordQuiz} />
          <CourseOutline />
          <DailyExpressions entries={expressions} />
        </div>
      </main>
      <footer className="site-footer">
        <div className="shell footer-content">
          <span>Hangul Japanese · Open Source Project</span>
          <a className="repo-link" href={repository}>GitHub <span aria-hidden="true">↗</span></a>
        </div>
      </footer>
    </>
  )
}
