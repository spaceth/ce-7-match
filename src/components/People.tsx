import { useState } from 'react'
import { copy } from '../content'

export function People() {
  const teams = copy.people.teams
  return (
    <div className="people">
      {teams.map((team) => (
        <TeamList key={team.name} team={team} />
      ))}
    </div>
  )
}

function TeamList({ team }: { team: (typeof copy.people.teams)[number] }) {
  const [open, setOpen] = useState(false)
  const id = team.name.replace(/\s+/g, '-').toLowerCase()

  return (
    <section className="people-team" data-open={open} aria-labelledby={id}>
      <h3 id={id}>
        <button type="button" className="people-toggle" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <span>{team.name}</span>
          <span className="people-chevron" aria-hidden="true" />
        </button>
      </h3>
      <dl>
        {team.roles.map((role) =>
          role.people.map((person, index) => (
            <div className="people-row" key={person.name}>
              <dt>{index === 0 ? role.title : <span className="sr-only">{role.title}</span>}</dt>
              <dd>{person.name}</dd>
              <dd className="people-org">{person.organization}</dd>
            </div>
          )),
        )}
      </dl>
    </section>
  )
}
