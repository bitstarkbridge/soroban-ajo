import {
  buildGamificationData,
  gamificationTestUtils,
  getLevelFromXP,
  getLevelProgress,
  getNextLevelXP,
} from '@/hooks/useGamification'

describe('useGamification helpers', () => {
  afterEach(() => {
    gamificationTestUtils.clearCache()
    window.localStorage.clear()
  })

  it('calculates XP thresholds into levels', () => {
    expect(getLevelFromXP(0)).toBe(1)
    expect(getLevelFromXP(250)).toBe(2)
    expect(getLevelFromXP(1100)).toBe(4)
  })

  it('returns next level XP target', () => {
    expect(getNextLevelXP(1)).toBe(250)
    expect(getNextLevelXP(3)).toBe(1100)
  })

  it('reports bounded level progress', () => {
    expect(getLevelProgress(125)).toBe(50)
    expect(getLevelProgress(10000)).toBe(100)
  })

  it('marks achievements as unlocked when generated metrics pass the target', () => {
    const data = buildGamificationData('achievement-heavy-user')

    expect(data.achievements.some((achievement) => achievement.unlocked)).toBe(true)
    expect(
      data.achievements.every(
        (achievement) => achievement.current <= achievement.target || achievement.unlocked
      )
    ).toBe(true)
  })

  it('hydrates reward redemption status from local storage', () => {
    window.localStorage.setItem(
      'gamification:rewards:reward-user',
      JSON.stringify(['fee-discount'])
    )

    const data = buildGamificationData('reward-user')
    const reward = data.rewards.find((item) => item.id === 'fee-discount')

    expect(reward?.status).toBe('redeemed')
  })

  it('keeps leaderboard entries sorted by XP descending', () => {
    const data = buildGamificationData('leaderboard-user')

    for (const board of Object.values(data.leaderboards)) {
      for (let index = 1; index < board.length; index += 1) {
        expect(board[index - 1].xp).toBeGreaterThanOrEqual(board[index].xp)
      }
    }
  })
})
