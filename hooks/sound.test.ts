import { expect, mock, test } from 'claude-code/testing'
import type { On } from 'claude-code'

// Only the command's name and text matter to this mod.
const run = (args: string) => ({ command: 'nix-done-sound', args }) as never
const turn = (durationMs: number) => ({ answer: 'ok', durationMs, isAborted: false, turnId: 't', reason: 'answer' as const })
const FILES = ['/System/Library/Sounds/Glass.aiff', '/System/Library/Sounds/Tink.aiff', '/Users/anna/Musik/ding.mp3']

const world = (on: On, code = 'de-DE') => {
  const played: string[] = []
  mock.store(on)
  // A Mac in that language
  on('process.run', () => ({ value: { exitCode: 0, stdout: `(\n    "${code}"\n)`, stderr: '' } }) as never)
  // A Mac: system sounds in /System/Library/Sounds, no Windows folder
  on('fs.list', (_, e) =>
    ({ value: String((e as { path?: unknown }).path).startsWith('/System/') ? [{ name: 'Glass.aiff', kind: 'file' }, { name: 'Tink.aiff', kind: 'file' }] : [] }) as never)
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

test('until a sound is chosen, Claude is asked to ask for one and can set it itself', async ($, on) => {
  const played = world(on)
  on('prompt.context', () => ({ blocks: [] }))
  const names = async () => (await $.prompt.context({ blocks: [] } as never)).blocks.map(b => b.name)
  expect(await names()).toContain('nix-done-sound-choose')

  const set = await $.tool.call({ tool: 'mcp__nix-done-sound__sound_set', sound: 'Glass' } as never)
  expect(String(set.result)).toContain('Set done sound: Glass')
  expect(played).toEqual(['/System/Library/Sounds/Glass.aiff'])
  expect(await names()).not.toContain('nix-done-sound-choose')
  expect(String((await $.tool.call({ tool: 'mcp__nix-done-sound__sound_list' } as never)).result)).toBe('Glass, Tink')
})

test('on an English system it answers in English and takes English keywords', async ($, on) => {
  world(on, 'en-US')
  expect((await $.command.run(run(''))).text).toContain('No sound chosen yet')
  expect((await $.command.run(run('Glass'))).text).toBe('Done sound: Glass ✓')
  expect((await $.command.run(run('off'))).text).toBe('Sound is off.')
  expect((await $.command.run(run('list'))).text).toContain('Glass, Tink')
})
