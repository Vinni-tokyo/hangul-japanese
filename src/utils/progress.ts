export interface LearningProgress {
  consonants: string[]
  vowels: string[]
  quizBest: number
}

const storageKey = 'hangul-japanese:progress'

function stringIds(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return []
  }

  return [...new Set(value.filter((id): id is string => typeof id === 'string' && id.length > 0))]
}

export function loadProgress(): LearningProgress {
  const initial = { consonants: [], vowels: [], quizBest: 0 }

  try {
    const saved = localStorage.getItem(storageKey)
    if (!saved) {
      return initial
    }

    const progress: Partial<LearningProgress> | null = JSON.parse(saved)
    const quizBest = progress?.quizBest
    return {
      consonants: stringIds(progress?.consonants),
      vowels: stringIds(progress?.vowels),
      quizBest: typeof quizBest === 'number' && Number.isSafeInteger(quizBest) && quizBest >= 0 ? quizBest : 0,
    }
  } catch {
    return initial
  }
}

export function saveProgress(progress: LearningProgress): void {
  try {
    localStorage.setItem(storageKey, JSON.stringify(progress))
  } catch {
    // Keep the current session usable when browser storage is unavailable.
  }
}
