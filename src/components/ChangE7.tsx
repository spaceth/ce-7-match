import { useState } from 'react'
import bh from '../assets/flags/bh.svg?url'
import ch from '../assets/flags/ch.svg?url'
import cn from '../assets/flags/cn.svg?url'
import eg from '../assets/flags/eg.svg?url'
import it from '../assets/flags/it.svg?url'
import ru from '../assets/flags/ru.svg?url'
import th from '../assets/flags/th.svg?url'

const FLAG_SRC = { bh, ch, cn, eg, it, ru, th } as const
type FlagCode = keyof typeof FLAG_SRC

type PartId = 'orbiter' | 'lander' | 'rover' | 'hopper'
type Selection = 'overview' | PartId | 'match'

const OVERVIEW_COPY =
  'Chang’e-7 is a lunar mission of four parts: an orbiter, a lander, a rover, and a hopper. It is planned to study the south polar region. MATCH, Thailand’s particle detector, flies on the orbiter.'

const PARTS: { id: PartId; label: string; body: string }[] = [
  {
    id: 'orbiter',
    label: 'Orbiter',
    body: 'The orbiter stays in lunar orbit and surveys the south polar region. MATCH flies on this part of Chang’e-7.',
  },
  {
    id: 'lander',
    label: 'Lander',
    body: 'The lander is planned to touch down on the illuminated rim of Shackleton crater, near the lunar south pole, and to set the rover and the hopper onto the surface.',
  },
  {
    id: 'rover',
    label: 'Rover',
    body: 'The rover drives around the landing area, studying the surface and the ground just beneath it.',
  },
  {
    id: 'hopper',
    label: 'Hopper',
    body: 'The hopper is a small flying probe. It can hop into a crater that stays in shadow and look for water there.',
  },
]

const MATCH_COPY =
  'CE-7 MATCH is Thailand’s particle detector, hosted on the orbiter. From lunar orbit it measures energetic particles arriving from space and particles leaving the lunar surface.'

type Flag = { code: FlagCode | 'iloa'; name: string }

type Payload = {
  name: string
  host: PartId
  flags: Flag[]
  match?: boolean
}

const CHINA: Payload[] = [
  { name: 'Miniature synthetic aperture radar', host: 'orbiter', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Infrared mineral imaging analyzer', host: 'orbiter', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar neutron gamma spectrometer', host: 'orbiter', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar orbit magnetometer', host: 'orbiter', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Landing camera', host: 'lander', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Topography camera', host: 'lander', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar seismograph', host: 'lander', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar surface environment detection system', host: 'lander', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Panoramic camera', host: 'rover', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Rover magnetometer', host: 'rover', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar penetrating radar', host: 'rover', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Lunar Raman spectrometer', host: 'rover', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Volatiles and isotopes measuring system', host: 'rover', flags: [{ code: 'cn', name: 'China' }] },
  { name: 'Water molecule and hydrogen isotope analyzer', host: 'hopper', flags: [{ code: 'cn', name: 'China' }] },
]

const INTERNATIONAL: Payload[] = [
  {
    name: 'Lunar surface hyperspectral imager',
    host: 'orbiter',
    flags: [
      { code: 'eg', name: 'Egypt' },
      { code: 'bh', name: 'Bahrain' },
    ],
  },
  {
    name: 'Earth radiation spectrometer',
    host: 'orbiter',
    flags: [{ code: 'ch', name: 'Switzerland' }],
  },
  {
    name: 'MATCH',
    host: 'orbiter',
    match: true,
    flags: [{ code: 'th', name: 'Thailand' }],
  },
  {
    name: 'Laser retroreflector array',
    host: 'lander',
    flags: [{ code: 'it', name: 'Italy' }],
  },
  {
    name: 'Lunar dust and electric field probe',
    host: 'lander',
    flags: [{ code: 'ru', name: 'Russia' }],
  },
  {
    name: 'Lunar astronomical telescope',
    host: 'lander',
    flags: [{ code: 'iloa', name: 'International Lunar Observatory Association' }],
  },
]

const HOST: Record<PartId, string> = {
  orbiter: 'Orbiter',
  lander: 'Lander',
  rover: 'Rover',
  hopper: 'Hopper',
}

export function ChangE7() {
  const [selection, setSelection] = useState<Selection>('overview')
  const part = PARTS.find((item) => item.id === selection)
  const activeHost: PartId | null = selection === 'match' ? 'orbiter' : selection === 'overview' ? null : selection

  return (
    <div className="craft">
      <div className="craft-stage">
        <div className="craft-frame" role="img" aria-label="Placeholder for the Chang’e-7 spacecraft model">
          <span>Spacecraft model</span>
          <strong>
            {selection === 'match' ? 'MATCH · on the orbiter' : selection === 'overview' ? 'Chang’e-7' : part?.label}
          </strong>
        </div>
        <div className="craft-controls">
          <div className="craft-parts" role="group" aria-label="Parts of Chang’e-7">
            <button type="button" aria-pressed={selection === 'overview'} onClick={() => setSelection('overview')}>
              Overview
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
              CE-7 MATCH
            </button>
          </div>
        </div>
      </div>

      <div className="craft-detail">
        <h3>{selection === 'match' ? 'CE-7 MATCH' : selection === 'overview' ? 'Overview' : part?.label}</h3>
        <p>{selection === 'match' ? MATCH_COPY : selection === 'overview' ? OVERVIEW_COPY : part?.body}</p>
        <section className="craft-manifest" aria-label="Payloads on Chang’e-7">
          <h4>Payloads on Chang’e-7</h4>
          <div className="craft-lists">
            <PayloadList title="China" items={CHINA} activeHost={activeHost} focusMatch={selection === 'match'} />
            <PayloadList
              title="International"
              items={INTERNATIONAL}
              activeHost={activeHost}
              focusMatch={selection === 'match'}
              showCountry
            />
          </div>
        </section>
      </div>

      <aside className="craft-ilrs">
        <h3>International Lunar Research Station</h3>
        <p>
          The International Lunar Research Station is a cooperative program to build a sustained scientific presence near
          the lunar south pole. The instruments that partner countries fly on Chang’e-7 are an early part of that work.
        </p>
      </aside>
    </div>
  )
}

function FlagMark({ flag, labelled = true }: { flag: Flag; labelled?: boolean }) {
  if (flag.code === 'iloa') {
    return (
      <span className="craft-org" title={flag.name}>
        <span aria-hidden="true">ILOA</span>
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
  items: Payload[]
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
                {item.flags.map((flag) => (flag.code === 'iloa' ? 'ILOA' : flag.name)).join(', ')}
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
