import type { EngineInterface, Register } from 'claude-code'

import { ASK_LANG, langOf } from './lang'
import type { Lang } from './lang'

// All tools of this set start with /nix- so typing /nix lists them.
const COMMAND = 'nix-done-sound'

// Nothing is shipped: the person picks a sound of their own, kept across chats.
const DONE_KEY = 'doneSound'
const WAIT_KEY = 'waitSound'
const MUTED_KEY = 'isMuted'

// Where the system sounds live, to pick one by its name.
const SOUND_DIRS = ['/System/Library/Sounds', 'C:/Windows/Media']
const SOUND_FILE = /\.(aiff?|wav|mp3|m4a|caf|ogg)$/i
// Short answers happen while you watch; only longer work earns a sound.
const QUIET_BELOW_MS = 15_000
// System sounds are soft at 1; 2 is clearly audible without startling.
const GAIN = 2

// The tool's own words, in the system's language. Both languages' keywords always work.
const WORDS = {
  de: {
    help: [
      'Wähle deinen eigenen Sound, wenn Claude fertig ist:',
      '  /nix-done-sound liste            – zeigt die Töne deines Systems',
      '  /nix-done-sound Glass            – Systemton nach Namen (Mac: Glass, Pop, Hero … / Windows: chimes, notify …)',
      '  /nix-done-sound ~/Musik/ding.mp3 – eigene Datei (mp3, wav, aiff, m4a)',
      '  /nix-done-sound warten Tink      – optional: Ton, wenn Claude auf dich wartet',
      '  /nix-done-sound aus | an         – stumm schalten und wieder an',
    ].join('\n'),
    describe: 'Eigenen Sound wählen, wenn Claude fertig ist',
    hint: '[liste | Name | Datei | warten … | aus | an]',
    current: (done: string, wait: string | null, muted: boolean) =>
      `Fertig-Ton: ${done}${wait ? ` · Warten: ${wait}` : ''}${muted ? ' (stumm)' : ''}`,
    none: 'Noch kein Sound gewählt – bis dahin bleibt es still.',
    list: (names: string) => `Töne deines Systems:\n${names}`,
    noList: 'Keine Systemtöne gefunden – nimm eine eigene Datei.',
    off: 'Ton ist aus.',
    on: 'Ton ist an.',
    which: 'Welcher Ton? z. B. /nix-done-sound warten Tink',
    missing: (wanted: string) => `„${wanted}“ habe ich nicht gefunden. /nix-done-sound liste zeigt, welche Töne es gibt.`,
    set: (isWait: boolean, name: string) => `${isWait ? 'Warte-Ton' : 'Fertig-Ton'}: ${name} ✓`,
  },
  en: {
    help: [
      'Pick your own sound for when Claude is done:',
      '  /nix-done-sound list               – shows your system sounds',
      '  /nix-done-sound Glass              – system sound by name (Mac: Glass, Pop, Hero … / Windows: chimes, notify …)',
      '  /nix-done-sound ~/Music/ding.mp3   – a file of your own (mp3, wav, aiff, m4a)',
      '  /nix-done-sound wait Tink          – optional: sound when Claude waits for you',
      '  /nix-done-sound off | on           – mute and unmute',
    ].join('\n'),
    describe: 'Pick your own sound for when Claude is done',
    hint: '[list | name | file | wait … | off | on]',
    current: (done: string, wait: string | null, muted: boolean) =>
      `Done sound: ${done}${wait ? ` · Waiting: ${wait}` : ''}${muted ? ' (muted)' : ''}`,
    none: 'No sound chosen yet – until then it stays silent.',
    list: (names: string) => `Your system sounds:\n${names}`,
    noList: 'No system sounds found – use a file of your own.',
    off: 'Sound is off.',
    on: 'Sound is on.',
    which: 'Which sound? e.g. /nix-done-sound wait Tink',
    missing: (wanted: string) => `I could not find "${wanted}". /nix-done-sound list shows which sounds there are.`,
    set: (isWait: boolean, name: string) => `${isWait ? 'Waiting sound' : 'Done sound'}: ${name} ✓`,
  },
}
const KEYWORDS = {
  list: ['liste', 'list'],
  off: ['aus', 'off'],
  on: ['an', 'on'],
  wait: ['warten', 'wait'],
}

const MIME: Record<string, string> = {
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  aif: 'audio/aiff',
  aiff: 'audio/aiff',
  m4a: 'audio/mp4',
  caf: 'audio/x-caf',
  ogg: 'audio/ogg',
}
const mimeOf = (path: string) => MIME[path.split('.').pop()?.toLowerCase() ?? ''] ?? 'audio/wav'
const nameOf = (path: string) => (path.split(/[\\/]/).pop() ?? path).replace(SOUND_FILE, '')
const isPath = (text: string) => /[\\/]/.test(text) || /^[a-z]:/i.test(text)

// The plugin lives in the home folder's .claude, so its root names the home folder.
const home = ($: EngineInterface) => $.plugin.root.split(/[\\/]\.claude[\\/]/)[0] ?? ''

const systemSounds = async ($: EngineInterface) => {
  const found: string[] = []
  for (const dir of SOUND_DIRS) {
    const entries = await $.fs.list(dir).catch(() => [])
    for (const one of entries) if (one.kind === 'file' && SOUND_FILE.test(one.name)) found.push(`${dir}/${one.name}`)
  }
  return found
}

// A name ("Glass") or a path ("~/Musik/ding.mp3") to a playable file, or null.
const resolve = async ($: EngineInterface, wanted: string) => {
  if (isPath(wanted)) {
    const path = wanted.startsWith('~') ? `${home($)}${wanted.slice(1)}` : wanted
    return SOUND_FILE.test(path) && (await $.fs.exists(path).catch(() => false)) ? path : null
  }
  const lower = wanted.toLowerCase()
  return (await systemSounds($)).find(path => nameOf(path).toLowerCase() === lower) ?? null
}

const play = async ($: EngineInterface, path: unknown) => {
  if (typeof path !== 'string' || !(await $.fs.exists(path).catch(() => false))) return
  const { base64 } = await $.fs.read(path, { as: 'bytes' })
  // Not awaited: the clip plays on while the turn ends.
  void $.audio.play({ base64, mime: mimeOf(path) }, { gain: GAIN }).catch(() => undefined)
}

// A sound that cannot play never holds up Claude.
const ring = async ($: EngineInterface, key: string) => {
  try {
    if ((await $.store.get(MUTED_KEY)) === true) return
    await play($, await $.store.get(key))
  } catch {
    // stays silent
  }
}

// Once after installing, Claude passes on a short thank-you from the author.
const THANKED_KEY = 'thanked'
const THANKS =
  'At the start of your next reply, once, pass on this thank-you in the language the user writes to you in. ' +
  'German: "nikscz sagt danke, dass du eins seiner Tools nutzt – schön, dass du an Bord bist!" ' +
  'English: "nikscz says thank you for using one of his tools. Glad to have you!" ' +
  'Any other language: translate the English one, keeping its light tone. Do not repeat it later.'

// Asked when a text is first needed, then kept; a reload asks again.
let asked: Promise<Lang> | null = null
const systemLang = async ($: EngineInterface): Promise<Lang> => {
  for (const argv of ASK_LANG) {
    try {
      const ran = await $.process.run(argv, { timeoutMs: 3_000 })
      const found = ran.exitCode === 0 ? langOf(ran.stdout) : null
      if (found) return found
    } catch {
      // not this system
    }
  }
  const env = (await $.env.get('LC_ALL').catch(() => undefined)) || (await $.env.get('LANG').catch(() => undefined))
  return (env && langOf(env)) || 'en'
}
const langOf$ = ($: EngineInterface) => (asked ??= systemLang($))

// Claude asks which sound the person wants and sets it, until one is chosen.
const LIST_TOOL = 'mcp__nix-done-sound__sound_list'
const SET_TOOL = 'mcp__nix-done-sound__sound_set'
const ASK_FOR_SOUND =
  'The nix-done-sound plugin is installed but no alert sound is chosen yet, so it stays silent. ' +
  'Early in this conversation, ask the user once, in the language they use with you, which sound they want ' +
  'when Claude is done: offer a few system sounds from mcp__nix-done-sound__sound_list, or the full path to ' +
  'a sound file of their own (mp3, wav, aiff, m4a). Then set it with mcp__nix-done-sound__sound_set and ' +
  'mention they can change it any time with /nix-done-sound.'

export const register: Register = on => {
  on('session.start', async ($, e, next) => {
    await $.tool.register({
      name: 'sound_list',
      description: 'Lists the system sounds of this computer (names) for the nix-done-sound plugin.',
      inputSchema: { type: 'object', properties: {} },
    })
    await $.tool.register({
      name: 'sound_set',
      description:
        'Sets the alert sound of the nix-done-sound plugin: a system sound name from sound_list or a full file path. ' +
        'kind "done" (default) plays when Claude is done, "wait" when Claude waits for the user.',
      inputSchema: {
        type: 'object',
        properties: { sound: { type: 'string' }, kind: { type: 'string', enum: ['done', 'wait'] } },
        required: ['sound'],
      },
    })
    const start = WORDS[await systemLang($)]
    await $.command.register({
      name: COMMAND,
      description: start.describe,
      argumentHint: start.hint,
      immediate: true,
    })

    return next(e)
  })

  on('command.run', { command: COMMAND }, async ($, e) => {
    const words = WORDS[await langOf$($)]
    const args = e.args.trim()
    const [first = '', ...rest] = args.split(/\s+/)
    const word = first.toLowerCase()

    if (args === '') {
      const done = await $.store.get(DONE_KEY)
      const wait = await $.store.get(WAIT_KEY)
      const muted = (await $.store.get(MUTED_KEY)) === true
      const now =
        typeof done === 'string'
          ? words.current(nameOf(done), typeof wait === 'string' ? nameOf(wait) : null, muted)
          : words.none
      return { text: `${now}\n\n${words.help}` }
    }
    if (KEYWORDS.list.includes(word)) {
      const names = (await systemSounds($)).map(nameOf)
      return { text: names.length ? words.list(names.join(', ')) : words.noList }
    }
    if (KEYWORDS.off.includes(word) || KEYWORDS.on.includes(word)) {
      const isOff = KEYWORDS.off.includes(word)
      await $.store.set(MUTED_KEY, isOff)
      return { text: isOff ? words.off : words.on }
    }
    const isWait = KEYWORDS.wait.includes(word)
    // A copied path may come in quotes (Finder, Windows Explorer)
    const wanted = (isWait ? rest.join(' ') : args).replace(/^["']|["']$/g, '')
    if (isWait && wanted === '') return { text: words.which }
    const path = await resolve($, wanted)
    if (path === null) return { text: words.missing(wanted) }
    await $.store.set(isWait ? WAIT_KEY : DONE_KEY, path)
    await $.store.set(MUTED_KEY, false)
    await play($, path).catch(() => undefined)

    return { text: words.set(isWait, nameOf(path)) }
  })

  on('tool.call', { tool: LIST_TOOL }, async $ => {
    const names = (await systemSounds($)).map(nameOf)
    return { result: names.length ? names.join(', ') : 'No system sounds found; ask for a file path instead.' }
  })

  on('tool.call', { tool: SET_TOOL }, async ($, e) => {
    const { sound, kind } = e as { sound?: unknown; kind?: unknown }
    if (typeof sound !== 'string' || sound.trim() === '') return { deny: 'sound is missing.' }
    const path = await resolve($, sound.trim().replace(/^["']|["']$/g, ''))
    if (path === null) return { result: `Not found: ${sound}. Use a name from sound_list or a full file path.` }
    await $.store.set(kind === 'wait' ? WAIT_KEY : DONE_KEY, path)
    await $.store.set(MUTED_KEY, false)
    await play($, path).catch(() => undefined)
    return { result: `Set ${kind === 'wait' ? 'waiting' : 'done'} sound: ${nameOf(path)} (${path}). It played once as a preview.` }
  })

  // Once after installing: the thank-you. Until a sound is chosen: every new chat asks once.
  on('prompt.context', async ($, e, next) => {
    const context = await next(e)
    const isThanked = (await $.store.get(THANKED_KEY)) === true
    if (!isThanked) await $.store.set(THANKED_KEY, true)
    const hasSound = typeof (await $.store.get(DONE_KEY)) === 'string'
    const extra = [
      ...(isThanked ? [] : [{ name: 'nix-done-sound-danke', text: THANKS }]),
      ...(hasSound ? [] : [{ name: 'nix-done-sound-choose', text: ASK_FOR_SOUND }]),
    ]

    return extra.length === 0 ? context : { ...context, blocks: [...context.blocks, ...extra] }
  })

  on('turn.complete', async ($, e, next) => {
    const done = await next(e)
    if (e.agentId === undefined && e.reason === 'answer' && e.durationMs >= QUIET_BELOW_MS) {
      await ring($, DONE_KEY)
    }

    return done
  })

  // Claude stops and waits: a permission question shown to you, or a question to you.
  on('classic.Notification', async ($, e, next) => {
    if (e.notification_type === 'permission_prompt') await ring($, WAIT_KEY)

    return next(e)
  })

  on('tool.call', { tool: 'AskUserQuestion' }, async ($, e, next) => {
    await ring($, WAIT_KEY)

    return next(e)
  })
}
