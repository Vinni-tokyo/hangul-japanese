import { useState } from 'react'
import type { ReactNode } from 'react'
import type { LessonEntry } from '../types/learning'

export interface ExpressionForms {
  hangulJapanese: string | null
  kana: string | null
  japanese: string | null
  korean: string
}

function HighlightedWord({ word, highlight }: { word: string; highlight?: string | null }) {
  if (!highlight) return word

  const start = word.indexOf(highlight)
  if (start === -1) return word

  return (
    <>
      {word.slice(0, start)}
      <mark>{highlight}</mark>
      {word.slice(start + highlight.length)}
    </>
  )
}

export function ExpressionGrid({ forms, highlight, hideKana = false }: {
  forms: ExpressionForms
  highlight?: string | null
  hideKana?: boolean
}) {
  const columns: { label: string; lang: string; value: ReactNode }[] = [
    {
      label: 'ハングル表記の日本語 (한글 표기의 일본어)',
      lang: 'ko',
      value: forms.hangulJapanese && (
        <HighlightedWord word={forms.hangulJapanese} highlight={highlight} />
      ),
    },
    {
      label: 'かな表記 (가나 표기)',
      lang: 'ja',
      value: hideKana && forms.kana ? <span className="muted-answer">非表示</span> : forms.kana,
    },
    { label: '漢字かな交じり文 (한자·가나 혼용문)', lang: 'ja', value: forms.japanese },
    { label: '韓国語表現 (한국어 표현)', lang: 'ko', value: forms.korean },
  ]

  return (
    <dl className="expression-grid">
      {columns.map(({ label, lang, value }) => (
        <div className="expression-cell" key={label}>
          <dt>{label}</dt>
          <dd lang={value ? lang : 'ja'}>{value ?? <span aria-label="該当なし">—</span>}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Lesson({ id, number, title, entries, completed, onComplete }: {
  id: string
  number: string
  title: string
  entries: readonly LessonEntry[]
  completed: readonly string[]
  onComplete: (id: string) => void
}) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [hideKana, setHideKana] = useState(false)
  const entry = entries[activeIndex]
  const isComplete = completed.includes(entry.id)
  const completedCount = entries.filter(({ id }) => completed.includes(id)).length
  const consonant = entry.category === 'basic_consonant' ? entry.targetJamo : 'ㅇ'
  const vowel = entry.category === 'basic_vowel' ? entry.targetJamo : 'ㅏ'

  return (
    <section className="section" id={id} aria-labelledby={`${id}-heading`}>
      <div className="section-heading">
        <div>
          <p className="eyebrow">LESSON {number}</p>
          <h2 id={`${id}-heading`}>{title}</h2>
        </div>
        <p className="section-meta">{completedCount} / {entries.length}文字 学習済み</p>
      </div>
      <div className="letter-buttons" role="group" aria-label={`${title}を選ぶ`}>
        {entries.map(({ id, targetSyllable }, index) => (
          <button
            aria-label={completed.includes(id) ? `${targetSyllable}（学習済み）` : targetSyllable}
            aria-pressed={index === activeIndex}
            className="letter-button"
            key={id}
            onClick={() => setActiveIndex(index)}
            type="button"
          >
            <span lang="ko">{targetSyllable}</span>
            {completed.includes(id) && <span aria-hidden="true" className="letter-done" />}
          </button>
        ))}
      </div>
      <div className="lesson-card">
        <div className="lesson-card-heading">
          <div className="lesson-symbol" lang="ko">{entry.targetSyllable}</div>
          <div>
            <p className="lesson-equation" lang="ko">
              {consonant} + {vowel} = <strong>{entry.targetSyllable}</strong>
            </p>
            {entry.noteJa && <p className="lesson-note">{entry.noteJa}</p>}
          </div>
          {entry.kana && (
            <button
              aria-pressed={hideKana}
              className="button button-secondary kana-toggle"
              onClick={() => setHideKana((hide) => !hide)}
              type="button"
            >
              {hideKana ? 'かなを表示' : 'かなを隠す'}
            </button>
          )}
        </div>
        <ExpressionGrid forms={entry} highlight={entry.highlight} hideKana={hideKana} />
        <div className="lesson-actions">
          <button className="button button-secondary" disabled={activeIndex === 0}
            onClick={() => setActiveIndex((index) => index - 1)} type="button">
            <span aria-hidden="true">←</span> 前の文字
          </button>
          <button className="button button-primary" disabled={isComplete}
            onClick={() => onComplete(entry.id)} type="button">
            {isComplete ? '学習済み' : '学習済みにする'}
          </button>
          <button className="button button-secondary" disabled={activeIndex === entries.length - 1}
            onClick={() => setActiveIndex((index) => index + 1)} type="button">
            次の文字 <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  )
}
