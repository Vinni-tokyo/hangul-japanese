export type LessonKey = 'consonants' | 'vowels'

export interface LessonEntry {
  id: string
  level: 1 | 2
  order: number
  category: 'basic_consonant' | 'basic_vowel'
  targetJamo: string
  targetSyllable: string
  hangulJapanese: string | null
  kana: string | null
  japanese: string | null
  korean: string
  highlight: string | null
  phoneticMatch: 'approximate' | 'none'
  noteJa: string
}

export interface Expression {
  id: string
  topicJa: string
  hangulJapanese: string
  kana: string
  japanese: string
  korean: string
}
