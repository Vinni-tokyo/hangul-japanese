import combinationKana from '../data/combinationKana.json'

export const BASIC_CONSONANTS = Object.freeze([...'ㄱㄴㄷㄹㅁㅂㅅㅇㅈㅊㅋㅌㅍㅎ'])
export const BASIC_VOWELS = Object.freeze([...'ㅏㅑㅓㅕㅗㅛㅜㅠㅡㅣ'])

const initialJamo = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ'
const medialJamo = 'ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ'
const trailingCount = 28
const hangulSyllableBase = 0xac00

const kanaBySyllable = new Map(Object.entries(combinationKana))

export function composeHangul(consonant: string, vowel: string): string {
  if (!BASIC_CONSONANTS.includes(consonant) || !BASIC_VOWELS.includes(vowel)) {
    return ''
  }

  const initialIndex = initialJamo.indexOf(consonant)
  const medialIndex = medialJamo.indexOf(vowel)
  const syllableIndex = (initialIndex * medialJamo.length + medialIndex) * trailingCount
  return String.fromCodePoint(hangulSyllableBase + syllableIndex)
}

export function lookupKana(syllable: string): string | null {
  return kanaBySyllable.get(syllable) ?? null
}
