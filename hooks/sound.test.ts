import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// Only the command's name and text matter to this mod.
const run = (args: string) => ({ command: 'nix-done-sound', args }) as never
const turn = (durationMs: number) => ({ answer: 'ok', durationMs, isAborted: false, turnId: 't', reason: 'answer' as const })
const FILES = ['/System/Library/Sounds/Glass.aiff', '/System/Library/Sounds/Tink.aiff', '/Users/anna/Musik/ding.mp3']

const world = (on: On) => {
  const played: string[] = []
  mock.store(on)
  on('fs.list', () => ({ value: [{ name: 'Glass.aiff', kind: 'file' }, { name: 'Tink.aiff', kind: 'file' }] }) as never)
  on('fs.exists', (_, e) => ({ value: FILES.includes(e.path) }))
  on('fs.read', (_, e) => ({ value: { base64: btoa(e.path) } }) as never)
  on('audio.play', (_, e) => {
    played.push(e.clip.base64 !== undefined ? atob(e.clip.base64) : '?')
    return { value: undefined }
  })
  on('turn.complete', () => ({ text: 'ok' }))
  return played
}

test('without a chosen sound it stays silent and explains how to pick one', async ($, on) => {
  const played = world(on)
  await $.turn.complete(turn(40_000))
  expect(played).toEqual([])
  expect((await $.command.run(run(''))).text).toContain('Noch kein Sound gewählt')
})

test('a system sound by name plays after long answers only', async ($, on) => {
  const played = world(on)
  expect((await $.command.run(run('glass'))).text).toBe('Fertig-Ton: Glass ✓')
  played.length = 0
  await $.turn.complete(turn(3_000))
  expect(played).toEqual([])
  await $.turn.complete(turn(40_000))
  expect(played).toEqual(['/System/Library/Sounds/Glass.aiff'])
})

test('an own file, a waiting sound, mute, and an unknown name', async ($, on) => {
  const played = world(on)
  expect((await $.command.run(run('/Users/anna/Musik/ding.mp3'))).text).toBe('Fertig-Ton: ding ✓')
  expect((await $.command.run(run('warten Tink'))).text).toBe('Warte-Ton: Tink ✓')
  expect((await $.command.run(run('aus'))).text).toBe('Ton ist aus.')
  played.length = 0
  await $.turn.complete(turn(40_000))
  expect(played).toEqual([])
  expect((await $.command.run(run('Kuhglocke'))).text).toContain('nicht gefunden')
  expect((await $.command.run(run('liste'))).text).toContain('Glass, Tink')
})
