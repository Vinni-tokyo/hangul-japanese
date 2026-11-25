import { expect, it } from 'vitest'
import { dailyLessons } from '../src/data/dailyLessons'
import expressions from '../src/data/expressions.json'

it('provides one complete bilingual lesson per day and covers each daily expression once', () => {
  expect(dailyLessons.map(({ day }) => day)).toEqual(Array.from({ length: 30 }, (_, index) => index + 1))
  expect(dailyLessons.map(({ expression }) => expression.id).sort()).toEqual(
    expressions.map(({ id }) => id).sort(),
  )

  for (const { expression, titleJa, titleKo, noteJa, noteKo } of dailyLessons) {
    expect(expression).toEqual(expressions.find(({ id }) => id === expression.id))
    expect(titleJa).toMatch(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u)
    expect(noteJa).toMatch(/[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}]/u)
    expect(titleKo).toMatch(/\p{Script=Hangul}/u)
    expect(noteKo).toMatch(/\p{Script=Hangul}/u)
  }
})
