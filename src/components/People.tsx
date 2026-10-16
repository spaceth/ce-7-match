import { useState } from 'react'

const TEAMS = [
  {
    name: 'Thai Development Team',
    roles: [
      { title: 'Senior Payload Scientist', people: [{ name: 'Prof. Dr. David Ruffolo', organization: 'Mahidol University' }] },
      { title: 'Project Manager', people: [{ name: 'Dr. Peerapong Torteeka', organization: 'NARIT' }] },
      { title: 'System Engineer', people: [{ name: 'Mr. Sharif Manutuch', organization: 'NARIT' }] },
      { title: 'GNC Engineer', people: [{ name: 'Mr. Tanayut Panyalert', organization: 'NARIT' }] },
      {
        title: 'Aerospace Engineer',
        people: [
          { name: 'Mr. Popfa Charernwicha', organization: 'NARIT' },
          { name: 'Mr. Thanawit Masri', organization: 'NARIT' },
        ],
      },
      { title: 'Mechatronics Engineer', people: [{ name: 'Mr. Pakorn Klornsri', organization: 'NARIT' }] },
      { title: 'Payload Electrical Engineer', people: [{ name: 'Ms. Sunritai Burum', organization: 'NARIT' }] },
      {
        title: 'Astrophysics Scientist',
        people: [
          { name: 'Asst. Prof. Dr. Warit Mitthamsiri', organization: 'Mahidol University' },
          { name: 'Dr. Petchara Patharakitvanich', organization: 'Mahidol University' },
        ],
      },
      { title: 'Payload Scientist', people: [{ name: 'Dr. Kulapha Chaiyawangkhod', organization: 'Mahidol University' }] },
      { title: 'Payload Engineer', people: [{ name: 'Dr. Kullanan Phooprassit', organization: 'Mahidol University' }] },
      { title: 'Payload Electrical Engineer', people: [{ name: 'Mr. Koch Amradit', organization: 'Mahidol University' }] },
      {
        title: 'Experimental Physicist',
        people: [
          { name: 'Ms. Jidapa Lakhornwat', organization: 'Mahidol University' },
          { name: 'Mr. Sorawit Jindaratjakul', organization: 'Mahidol University' },
        ],
      },
      { title: 'Physicist', people: [{ name: 'Dr. Chanoknan Bangliang', organization: 'RMUTT' }] },
      {
        title: 'Mechanical Engineers',
        people: [
          { name: 'Mr. Somratchai Thanun', organization: 'NARIT' },
          { name: 'Mr. Uaychai Layang', organization: 'NARIT' },
          { name: 'Mr. Teerawat Kuha', organization: 'NARIT' },
          { name: 'Mr. Worawat Somboonchai', organization: 'NARIT' },
          { name: 'Mr. Likhit Maihmun', organization: 'NARIT' },
          { name: 'Mr. Peeradon Oktan', organization: 'NARIT' },
        ],
      },
    ],
  },
  {
    name: 'Chinese Development Team',
    roles: [
      { title: 'Senior Payload Scientist', people: [{ name: 'Prof. Zhang Shenyi', organization: 'NSSC' }] },
      { title: 'Payload Mechanical Engineer', people: [{ name: 'Prof. Shen Guohong', organization: 'NSSC' }] },
      { title: 'Senior Payload Engineer and System Manager', people: [{ name: 'Prof. He Xu', organization: 'CIOMP' }] },
      { title: 'Embedded System Engineer', people: [{ name: 'Prof. Zhang Ning', organization: 'CIOMP' }] },
      { title: 'Structural Engineer', people: [{ name: 'Prof. Zhao Haojiang', organization: 'CIOMP' }] },
      { title: 'Thermal Control System Engineer', people: [{ name: 'Prof. Huang Yong', organization: 'CIOMP' }] },
      { title: 'Nuclear Engineer', people: [{ name: 'Prof. Yang Dong', organization: 'Jilin University' }] },
    ],
  },
] as const

export function People() {
  return (
    <div className="people">
      {TEAMS.map((team) => (
        <TeamList key={team.name} team={team} />
      ))}
    </div>
  )
}

function TeamList({ team }: { team: (typeof TEAMS)[number] }) {
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
