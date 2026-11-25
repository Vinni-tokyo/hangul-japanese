import { afterEach, describe, expect, it, vi } from 'vitest'
import combinationKana from '../src/data/combinationKana.json'
import consonants from '../src/data/consonants.json'
import expressions from '../src/data/expressions.json'
import vowels from '../src/data/vowels.json'
import type { Expression, LessonEntry } from '../src/types/learning'
import { BASIC_CONSONANTS, BASIC_VOWELS, composeHangul, lookupKana } from '../src/utils/hangul'
import { loadProgress, saveProgress } from '../src/utils/progress'
import { createReadingQuiz } from '../src/utils/quiz'

const expectedConsonants = [...'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ']
const expectedVowels = [...'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ']

describe('Hangul composition', () => {
  it('lists the basic jamo in curriculum order', () => {
    expect(BASIC_CONSONANTS).toEqual(expectedConsonants)
    expect(BASIC_VOWELS).toEqual(expectedVowels)
  })

  it('produces each of the 140 basic syllables in NFC', () => {
    const syllables = new Set<string>()

    for (const consonant of expectedConsonants) {
      for (const vowel of expectedVowels) {
        const syllable = composeHangul(consonant, vowel)
        const decomposedJamo = `${consonant}${vowel}`.normalize('NFKD')
        expect(syllable).toBe(decomposedJamo.normalize('NFC'))
        expect(syllable).toHaveLength(1)
        syllables.add(syllable)
      }
    }
    expect(syllables.size).toBe(140)
  })

  it('handles unsupported jamo and syllables without a kana mapping', () => {
    expect(composeHangul('', 'ㅏ')).toBe('')
    expect(composeHangul('ㄲ', 'ㅏ')).toBe('')
    expect(composeHangul('ㄱ', 'ㅐ')).toBe('')
    expect(composeHangul('ㄱㄴ', 'ㅏ')).toBe('')
    expect(lookupKana('가')).toBe('が')
    expect(lookupKana('카')).toBe('か')
    expect(lookupKana('constructor')).toBeNull()

    for (const consonant of expectedConsonants) {
      for (const vowel of ['ㅓ', 'ㅕ', 'ㅡ']) {
        expect(lookupKana(composeHangul(consonant, vowel))).toBeNull()
      }
    }
  })
})

describe('MVP curriculum data', () => {
  it('keeps consonants and vowels ordered and linked to valid lesson cards', () => {
    expect(consonants.map(({ targetJamo }) => targetJamo)).toEqual(expectedConsonants)
    expect(vowels.map(({ targetJamo }) => targetJamo)).toEqual(expectedVowels)
    expect(consonants.map(({ targetSyllable }) => targetSyllable).join('')).toBe('가나다라마바사아자차카타파하')
    expect(vowels.map(({ targetSyllable }) => targetSyllable).join('')).toBe('아야어여오요우유으이')
    expect(consonants.map(({ order }) => order)).toEqual(expectedConsonants.map((_, index) => index + 1))
    expect(vowels.map(({ order }) => order)).toEqual(expectedVowels.map((_, index) => index + 1))
    expect(consonants.every(({ category, level }) => category === 'basic_consonant' && level === 1)).toBe(true)
    expect(vowels.every(({ category, level }) => category === 'basic_vowel' && level === 2)).toBe(true)
    expect(vowels.filter(({ phoneticMatch }) => phoneticMatch === 'none').map(({ targetJamo }) => targetJamo)).toEqual(['ㅓ', 'ㅕ', 'ㅡ'])

    for (const entry of [...consonants, ...vowels]) {
      expect(entry.korean.length).toBeGreaterThan(0)
      if (entry.phoneticMatch === 'none') {
        expect(entry.hangulJapanese).toBeNull()
        expect(entry.kana).toBeNull()
        expect(entry.japanese).toBeNull()
        expect(entry.highlight).toBeNull()
        expect(entry.noteJa.trim().length).toBeGreaterThan(0)
      } else {
        expect(entry.phoneticMatch).toBe('approximate')
        expect(entry.kana).toBeTruthy()
        expect(entry.japanese).toBeTruthy()
        expect(entry.highlight).toBeTruthy()
        expect(entry.hangulJapanese).toContain(entry.highlight)
      }
    }
  })

  it('includes 30 complete expressions and uses unique IDs across the curriculum', () => {
    expect(expressions).toHaveLength(30)
    for (const expression of expressions) {
      const { id, topicJa, hangulJapanese, kana, japanese, korean } = expression
      expect([id, topicJa, hangulJapanese, kana, japanese, korean].every(
        (field) => typeof field === 'string' && field.trim().length > 0,
      )).toBe(true)
    }

    const ids = [...consonants, ...vowels, ...expressions].map(({ id }) => id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('keeps kana mappings tied to basic Hangul combinations', () => {
    const basicSyllables = new Set(expectedConsonants.flatMap(
      (consonant) => expectedVowels.map((vowel) => composeHangul(consonant, vowel)),
    ))

    for (const [syllable, kana] of Object.entries(combinationKana)) {
      expect(basicSyllables.has(syllable)).toBe(true)
      expect(kana).toMatch(/^[\p{Script=Hiragana}\p{Script=Katakana}ー]+$/u)
    }
  })
})

describe('reading quiz', () => {
  function expression(id: string, hangulJapanese: string, kana: string): Expression {
    return { id, topicJa: 'あいさつ', hangulJapanese, kana, japanese: kana, korean: '인사' }
  }

  const noMatch: LessonEntry = {
    id: 'vowel-003',
    level: 2,
    order: 3,
    category: 'basic_vowel',
    targetJamo: 'ㅓ',
    targetSyllable: '어',
    hangulJapanese: null,
    kana: null,
    japanese: null,
    korean: '어디',
    highlight: null,
    phoneticMatch: 'none',
    noteJa: '対応する音なし',
  }

  it('creates up to five questions with three unique options and a single correct answer', () => {
    const questions = createReadingQuiz([noMatch, ...expressions])
    expect(questions).toHaveLength(5)
    expect(new Set(questions.map(({ prompt }) => prompt)).size).toBe(questions.length)

    for (const question of questions) {
      const source = expressions.find(({ id }) => id === question.id)
      expect(question.prompt).toBe(source?.hangulJapanese)
      expect(question.answer).toBe(source?.kana)
      expect(new Set(question.options).size).toBe(3)
      expect(question.options.filter((option) => option === question.answer)).toHaveLength(1)
    }
  })

  it('drops prompts with conflicting answers and does not invent missing choices', () => {
    const entries = [
      expression('first', '아리가토', 'ありがとう'),
      expression('second', '오하요', 'おはよう'),
      expression('third', '마타네', 'またね'),
      expression('fourth', '카이', 'かい'),
      expression('fifth', '카이', 'かいい'),
    ]

    expect(createReadingQuiz(entries).map(({ id }) => id).sort()).toEqual(['first', 'second', 'third'])
    expect(createReadingQuiz(entries.slice(0, 2))).toEqual([])
  })
})

describe('learning progress', () => {
  const storageKey = 'hangul-japanese:progress'
  const emptyProgress = { consonants: [], vowels: [], quizBest: 0 }

  afterEach(() => vi.unstubAllGlobals())

  it('saves a snapshot and restores it when loading again', () => {
    const storage = new Map<string, string>()
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => storage.get(key) ?? null,
      setItem: (key: string, value: string) => storage.set(key, value),
    })

    expect(loadProgress()).toEqual(emptyProgress)

    const progress = { consonants: ['consonant-001'], vowels: ['vowel-001'], quizBest: 4 }
    saveProgress(progress)
    expect(loadProgress()).toEqual(progress)
  })

  it('handles malformed or partially invalid saved progress', () => {
    const getItem = vi.fn().mockReturnValueOnce('{broken').mockReturnValueOnce(JSON.stringify({
      consonants: ['consonant-001', 5, '', 'consonant-001'],
      vowels: true,
      quizBest: -1,
    }))
    vi.stubGlobal('localStorage', { getItem })

    expect(loadProgress()).toEqual(emptyProgress)
    expect(loadProgress()).toEqual({ ...emptyProgress, consonants: ['consonant-001'] })
    expect(getItem).toHaveBeenCalledWith(storageKey)
  })

  it('allows a session to proceed when storage access is blocked', () => {
    const blocked = () => {
      throw new Error('Storage unavailable')
    }
    vi.stubGlobal('localStorage', { getItem: blocked, setItem: blocked })

    expect(loadProgress()).toEqual(emptyProgress)
    expect(() => saveProgress(emptyProgress)).not.toThrow()
  })
})
