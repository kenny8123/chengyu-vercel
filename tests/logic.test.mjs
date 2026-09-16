import { describe, it, expect } from 'vitest'
import {
  shuffle,
  drillBlanks,
  drillTiles,
  buildFreeQuizQueue,
  buildFullRandomQueue,
  summarisePractice,
  diagnoseQuiz,
} from '../lib/idiomLogic.js'

// 小型假資料，跟 pages/index.js 裡的真實成語資料格式一致，
// 但不依賴實際內容，避免測試跟著內容改動而碎裂。
const FAKE_UNITS = {
  'u1': {
    idioms: [
      { idiom: '一言九鼎', blanks: [3], mildDistract: ['鐘', '劍', '印'], hardDistract: ['鍋', '爐', '缸'] },
      { idiom: '人山人海', blanks: [1, 3], mildDistract: ['天', '地', '雲'], hardDistract: ['川', '河', '江'] },
    ],
  },
  'u2': {
    idioms: [
      { idiom: '千方百計', blanks: [0, 2], mildDistract: ['萬', '種', '法', '門'], hardDistract: ['干', '計', '汁', '十'] },
    ],
  },
}

describe('shuffle', () => {
  it('preserves length and multiset of elements', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8]
    const result = shuffle(input)
    expect(result).toHaveLength(input.length)
    expect([...result].sort()).toEqual([...input].sort())
  })

  it('does not mutate the original array', () => {
    const input = [1, 2, 3]
    shuffle(input)
    expect(input).toEqual([1, 2, 3])
  })
})

describe('drillBlanks', () => {
  it('round 1 returns only the first blank', () => {
    expect(drillBlanks({ blanks: [3] }, 1)).toEqual([3])
    expect(drillBlanks({ blanks: [1, 3] }, 1)).toEqual([1])
  })

  it('round 2 returns the first two blanks when there are already two', () => {
    expect(drillBlanks({ blanks: [1, 3] }, 2)).toEqual([1, 3])
    expect(drillBlanks({ blanks: [0, 2] }, 2)).toEqual([0, 2])
  })

  it('round 2 pads a single blank with an adjacent index, sorted ascending', () => {
    expect(drillBlanks({ blanks: [3] }, 2)).toEqual([2, 3])
    expect(drillBlanks({ blanks: [0] }, 2)).toEqual([0, 1])
  })

  it('rounds 3 and 4 always cover all four characters', () => {
    expect(drillBlanks({ blanks: [3] }, 3)).toEqual([0, 1, 2, 3])
    expect(drillBlanks({ blanks: [1, 3] }, 4)).toEqual([0, 1, 2, 3])
  })
})

describe('summarisePractice', () => {
  it('gives the top verdict for a perfect run', () => {
    const s = summarisePractice({ 1: 0, 2: 0, 3: 0, 4: 0 })
    expect(s.total).toBe(0)
    expect(s.weakest).toBeNull()
    expect(s.emoji).toBe('🏆')
  })

  it('identifies the weakest round, preferring the later round on ties', () => {
    const s = summarisePractice({ 1: 1, 2: 1, 3: 1, 4: 0 })
    expect(s.total).toBe(3)
    expect(s.weakest).toBe(3)
    expect(s.worst).toBe(1)
    expect(s.emoji).toBe('💪')
  })

  it('gives the lowest verdict once mistakes pile up', () => {
    const s = summarisePractice({ 1: 0, 2: 0, 3: 0, 4: 6 })
    expect(s.weakest).toBe(4)
    expect(s.emoji).toBe('📖')
  })
})

describe('drillTiles', () => {
  const q = FAKE_UNITS.u1.idioms[0] // 一言九鼎, blanks:[3]

  it('round 1 gives the answer plus two mild distractors', () => {
    const tiles = drillTiles(q, 1)
    expect(tiles).toHaveLength(3)
    expect(tiles.map(t => t.ch)).toContain('鼎')
  })

  it('round 3 gives exactly the idiom characters, no distractors', () => {
    const tiles = drillTiles(q, 3)
    expect(tiles).toHaveLength(4)
    expect([...tiles.map(t => t.ch)].sort()).toEqual([...q.idiom.split('')].sort())
  })

  it('round 4 blanks out all four characters, plus four distractors', () => {
    const tiles = drillTiles(q, 4)
    // round 4 uses drillBlanks' [0,1,2,3] (all four chars), so answers.length is 4, not 1
    expect(tiles).toHaveLength(8)
    expect(tiles.filter(t => q.idiom.includes(t.ch)).length).toBeGreaterThanOrEqual(4)
  })

  it('every tile has a unique id and starts unused', () => {
    const tiles = drillTiles(q, 4)
    const ids = tiles.map(t => t.tid)
    expect(new Set(ids).size).toBe(ids.length)
    expect(tiles.every(t => t.used === false)).toBe(true)
  })
})

describe('buildFreeQuizQueue', () => {
  it('covers every idiom in the unit exactly once, with a valid round', () => {
    const queue = buildFreeQuizQueue(FAKE_UNITS, 'u1')
    expect(queue).toHaveLength(2)
    expect([...queue.map(q => q.idiomIdx)].sort((a, b) => a - b)).toEqual([0, 1])
    expect(queue.every(q => q.unitKey === 'u1')).toBe(true)
    expect(queue.every(q => q.round >= 1 && q.round <= 4)).toBe(true)
  })
})

describe('buildFullRandomQueue', () => {
  it('draws from the full idiom pool across all units, capped at 40', () => {
    const queue = buildFullRandomQueue(FAKE_UNITS)
    expect(queue).toHaveLength(3) // only 3 idioms total in the fixture
    expect(queue.every(q => q.round >= 1 && q.round <= 4)).toBe(true)
    expect(queue.every(q => ['u1', 'u2'].includes(q.unitKey))).toBe(true)
  })
})

describe('diagnoseQuiz', () => {
  it('scores a perfect single-question run as 100', () => {
    const result = diagnoseQuiz(FAKE_UNITS, [{ unitKey: 'u1', idiomIdx: 0, round: 1, correct: true }])
    expect(result.totalScore).toBe(100)
    expect(result.totalCorrect).toBe(1)
    expect(result.topWrong).toEqual([])
    expect(result.weakestRound).toBeNull()
  })

  it('weights rounds, tracks wrong answers with idiom detail, and finds the weakest round', () => {
    const result = diagnoseQuiz(FAKE_UNITS, [
      { unitKey: 'u1', idiomIdx: 0, round: 1, correct: true },
      { unitKey: 'u1', idiomIdx: 0, round: 1, correct: false },
      { unitKey: 'u1', idiomIdx: 1, round: 2, correct: true },
    ])
    // maxScore = 5+5+8=18, rawScore = 5 (round1 correct) + 8 (round2 correct) = 13
    expect(result.totalScore).toBe(Math.round((13 / 18) * 100))
    expect(result.totalCorrect).toBe(2)
    expect(result.totalQuestions).toBe(3)
    expect(result.weakestRound).toBe(1)
    expect(result.topWrong).toHaveLength(1)
    expect(result.topWrong[0].idiom.idiom).toBe('一言九鼎')
    expect(result.topWrong[0].count).toBe(1)
  })
})
