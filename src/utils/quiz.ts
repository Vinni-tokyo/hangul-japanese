import type { Expression, LessonEntry } from '../types/learning'

export interface ReadingQuestion {
  id: string
  prompt: string
  options: string[]
  answer: string
}

interface ReadingItem {
  id: string
  prompt: string
  answer: string
}

const questionLimit = 5
const optionCount = 3

function shuffled<T>(items: readonly T[]): T[] {
  const result = [...items]
  for (let index = result.length - 1; index > 0; index -= 1) {
    const next = Math.floor(Math.random() * (index + 1))
    const item = result[index]
    result[index] = result[next]
    result[next] = item
  }
  return result
}

export function createReadingQuiz(entries: readonly (LessonEntry | Expression)[]): ReadingQuestion[] {
  const items = new Map<string, ReadingItem>()
  const ambiguousPrompts = new Set<string>()

  for (const entry of entries) {
    const prompt = entry.hangulJapanese
    const answer = entry.kana
    if (!prompt || !answer || ('phoneticMatch' in entry && entry.phoneticMatch === 'none')) {
      continue
    }

    const existing = items.get(prompt)
    if (!existing) {
      items.set(prompt, { id: entry.id, prompt, answer })
    } else if (existing.answer !== answer) {
      ambiguousPrompts.add(prompt)
    }
  }

  const candidates = [...items.values()].filter(({ prompt }) => !ambiguousPrompts.has(prompt))
  const answers = [...new Set(candidates.map(({ answer }) => answer))]
  if (answers.length < optionCount) {
    return []
  }

  return shuffled(candidates).slice(0, questionLimit).map((question) => {
    const alternatives = shuffled(answers.filter((answer) => answer !== question.answer))
    const options = shuffled([question.answer, ...alternatives.slice(0, optionCount - 1)])
    return { ...question, options }
  })
}
