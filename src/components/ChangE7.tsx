import { useState } from 'react'
import { CraftView, type CraftSelection } from './CraftModel'
import { TransferPath } from './TransferPath'
import bh from '../assets/flags/bh.svg?url'
import ch from '../assets/flags/ch.svg?url'
import cn from '../assets/flags/cn.svg?url'
import eg from '../assets/flags/eg.svg?url'
import it from '../assets/flags/it.svg?url'
import ru from '../assets/flags/ru.svg?url'
import th from '../assets/flags/th.svg?url'
import { copy } from '../content'

const FLAG_SRC = { bh, ch, cn, eg, it, ru, th } as const
type FlagCode = keyof typeof FLAG_SRC

type PartId = keyof typeof copy.change7.hosts
type Selection = CraftSelection
type Flag = { code: FlagCode | 'iloa'; name: string }
type Payload = {
  name: string
  host: PartId
  flags: readonly Flag[]
  match?: boolean
}

const text = copy.change7
const PARTS = text.parts
const MATCH_COPY = text.matchBody
const OVERVIEW_COPY = text.overviewBody
const CHINA = text.chinaPayloads
const INTERNATIONAL = text.internationalPayloads
const HOST = text.hosts

export function ChangE7() {
  const [selection, setSelection] = useState<Selection>('overview')
  const part = PARTS.find((item) => item.id === selection)
  const activeHost: PartId | null = selection === 'match' ? 'orbiter' : selection === 'overview' ? null : selection

  return (
    <div className="craft">
      <div className="craft-stage">
        <CraftView selection={selection} />
        <div className="craft-controls">
          <div className="craft-parts" role="group" aria-label={text.partsLabel}>
            <button type="button" aria-pressed={selection === 'overview'} onClick={() => setSelection('overview')}>
              {text.overview}
            </button>
            {PARTS.map((item) => (
              <button
                key={item.id}
                type="button"
                aria-pressed={selection === item.id}
                onClick={() => setSelection(item.id)}
              >
                {item.label}
              </button>
            ))}
            <button type="button" aria-pressed={selection === 'match'} onClick={() => setSelection('match')}>
              {text.match}
            </button>
          </div>
          <div className="craft-selection">
            <h3>{selection === 'match' ? text.match : selection === 'overview' ? text.overview : part?.label}</h3>
            <p>{selection === 'match' ? MATCH_COPY : selection === 'overview' ? OVERVIEW_COPY : part?.body}</p>
          </div>
        </div>
      </div>

      <div className="craft-detail">
        <section className="craft-manifest" aria-label={text.manifestLabel}>
          <h4>{text.manifestTitle}</h4>
          <div className="craft-lists">
            <PayloadList title={text.china} items={CHINA} activeHost={activeHost} focusMatch={selection === 'match'} />
            <PayloadList
              title={text.international}
              items={INTERNATIONAL}
              activeHost={activeHost}
              focusMatch={selection === 'match'}
              showCountry
            />
          </div>
        </section>
      </div>

      <aside className="craft-ilrs">
        <h3>{text.ilrsTitle}</h3>
        <p>{text.ilrsBody}</p>
      </aside>
      <TransferPath />
    </div>
  )
}

function FlagMark({ flag, labelled = true }: { flag: Flag; labelled?: boolean }) {
  if (flag.code === 'iloa') {
    return (
      <span className="craft-org" title={flag.name}>
        <span aria-hidden="true">{text.iloaShort}</span>
        {labelled ? <span className="sr-only">{flag.name}</span> : null}
      </span>
    )
  }

  return (
    <span className="craft-flag" title={flag.name}>
      <img src={FLAG_SRC[flag.code]} alt="" />
      {labelled ? <span className="sr-only">{flag.name}</span> : null}
    </span>
  )
}

function PayloadList({
  title,
  items,
  activeHost,
  focusMatch,
  showCountry = false,
}: {
  title: string
  items: readonly Payload[]
  activeHost: PartId | null
  focusMatch: boolean
  showCountry?: boolean
}) {
  const [open, setOpen] = useState(false)

  return (
    <div className="craft-country-list" data-open={open}>
      <h5>{title}</h5>
      <button
        type="button"
        className="craft-country-toggle"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
      >
        <span>{title}</span>
        <span className="craft-country-chevron" aria-hidden="true" />
      </button>
      <ul className={showCountry ? 'craft-rows-country' : undefined}>
        {items.map((item) => (
          <li
            key={item.name}
            data-host={activeHost === null || item.host === activeHost ? 'true' : 'false'}
            data-match={item.match ? 'true' : 'false'}
            data-focus={item.match && focusMatch ? 'true' : 'false'}
          >
            <span className="craft-flags">
              {item.flags.map((flag) =>
                showCountry && flag.code === 'iloa' ? null : (
                  <FlagMark key={flag.name} flag={flag} labelled={!showCountry} />
                ),
              )}
            </span>
            {showCountry ? (
              <span className="craft-country" title={item.flags.map((flag) => flag.name).join(', ')}>
                {item.flags.map((flag) => (flag.code === 'iloa' ? text.iloaShort : flag.name)).join(', ')}
              </span>
            ) : null}
            <span className="craft-name">{item.name}</span>
            <span className="craft-host">{HOST[item.host]}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}
