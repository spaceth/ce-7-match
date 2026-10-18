/**
 * English copy for the MATCH site.
 * Add a language by duplicating this file and switching the export in index.ts.
 * Keep the same keys. Views read `copy` and do not hard-code sentences.
 */
export const en = {
  meta: {
    lang: 'en',
    title: 'MATCH — Making the invisible measurable',
    description:
      'MATCH is Thailand’s particle detector on the Chang’e-7 lunar orbiter. See how one instrument measures energetic particles arriving from space and leaving the Moon.',
    siteName: 'MATCH',
    url: 'https://match.spaceth.co',
    noscript:
      'MATCH is a particle detector for the Chang’e-7 lunar orbiter. This explorer needs JavaScript and WebGL.',
  },
  ui: {
    brand: 'MATCH',
    logoAlt: 'SpaceTH',
    chapters: 'Chapters',
    chapter: 'Chapter',
    openChapters: 'Open chapters',
    closeChapters: 'Close chapters',
    fullScreen: 'Full screen',
    closeFullScreen: 'Close full screen',
    play: 'Play',
    pause: 'Pause',
    previous: 'Previous',
    next: 'Next',
    replay: 'Replay',
    resetView: 'Reset view',
    zoomIn: 'Zoom in',
    zoomOut: 'Zoom out',
    rotateGently: 'Rotate gently',
    stopRotation: 'Stop rotation',
    image: 'Image',
    percent: '{value} percent',
    earth: 'Earth',
    moon: 'Moon',
    match: 'CE-7 MATCH',
    matchShort: 'MATCH',
  },
  chapters: [
    {
      id: 'mission-overview',
      number: '01',
      voice: 'display',
      title: 'Mission Overview',
      description: 'A first look at this story: the mission, the particles, and the instrument built to measure them.',
    },
    {
      id: 'cosmic-rays',
      number: '02',
      voice: 'statement',
      title: 'Why Study Cosmic Rays',
      description:
        'Cosmic rays are energetic particles traveling through space. Most are protons and atomic nuclei, and electrons travel with them. They are not light. Each particle is a clue to whatever set it moving.',
    },
    {
      id: 'change-7',
      number: '03',
      voice: 'invert',
      title: 'About Chang’e-7 Mission',
      description: 'The lunar mission that carries MATCH, and the place this instrument holds in it.',
    },
    {
      id: 'orbit',
      number: '04',
      voice: 'aside',
      title: 'MATCH’s orbit around the Moon',
      description: 'Where MATCH flies, and the two directions it looks from that orbit.',
    },
    {
      id: 'how-match-works',
      number: '05',
      voice: 'direct',
      title: 'How MATCH works',
      description: 'How the detector turns arriving particles into measurements.',
    },
    {
      id: 'engineering',
      number: '06',
      voice: 'measured',
      title: 'Behind the Engineering',
      description: 'The design and construction that make the instrument possible.',
    },
    {
      id: 'people',
      number: '07',
      voice: 'human',
      title: 'People Behind this Project',
      description: 'The people who designed, built, and studied MATCH.',
    },
    {
      id: 'conclusion',
      number: '08',
      voice: 'close',
      title: 'Conclusion',
      description: 'What this view of MATCH leaves us with.',
    },
  ],
  mission: {
    plate: 'CE-7 MATCH',
    stageLabel: 'MATCH payload',
    placeholder: 'Placeholder summary',
    needsWebgl: 'The model needs WebGL.',
    unavailable: 'MATCH is unavailable without WebGL',
    steps: [
      {
        kicker: 'The payload',
        title: 'MATCH flies on Chang’e-7.',
        body: 'A particle detector built to investigate energetic particles around the Moon.',
      },
      {
        kicker: 'One axis',
        title: 'Two entrances, one instrument.',
        body: 'Space-facing and Moon-facing views open onto the same detector bore.',
      },
      {
        kicker: 'The measurement',
        title: 'Path and energy, together.',
        body: 'Silicon layers record where a particle crosses. Scintillators record how energy is deposited.',
      },
      {
        kicker: 'The orbit',
        title: 'About 200 kilometres up.',
        body: 'From a near-polar orbit, MATCH watches particles arriving from space and emerging from the lunar surface.',
      },
    ],
  },
  cosmic: {
    sourcesLabel: 'Sources of particles MATCH can study',
    heading: 'More than one source.',
    intro: [
      'The particles that reach the Moon do not all come from the same place. A burst from the Sun, a steady rain from the galaxy, electrons from Jupiter, and particles knocked back off the Moon each tell a different story.',
      'MATCH watches them with one detector. Looking toward space and toward the lunar surface lets it compare what arrives from far away with what leaves the Moon itself.',
    ],
    sources: [
      {
        id: 'solar',
        title: 'Solar Cosmic Rays',
        body: 'The Sun releases bursts of energetic particles, especially during flares and eruptions. They arrive suddenly, then fade.',
        diagram: 'Glowing Sun with particles leaving it',
      },
      {
        id: 'galactic',
        title: 'Galactic Cosmic Rays',
        body: 'A steadier rain comes from beyond the solar system. These are among the most energetic particles, likely sped up by the remnants of exploded stars.',
        diagram: 'Rotating pulsar',
      },
      {
        id: 'jovian',
        title: 'Jovian Electrons',
        body: 'Jupiter’s vast magnetic field accelerates electrons. Some of them cross the solar system and can be measured near the Moon.',
        diagram: 'Rotating Jupiter with a cyan magnetic glow, field lines, and a few particles leaving',
      },
      {
        id: 'albedo',
        title: 'Lunar Albedo',
        body: 'Particles that strike the lunar surface can knock new particles back out. Those emerging particles are lunar albedo — not reflected light.',
        diagram: 'Lunar surface with particles striking it and particles leaving upward',
      },
    ],
    tail: {
      kicker: 'Around Earth',
      title: 'In and out of the magnetotail.',
      body: 'The Moon circles Earth about once a month. The solar wind blows Earth’s magnetic field into a long tail on the night side. For several days each month the Moon crosses that tail, then returns to the solar wind. MATCH flies with the Moon, so one orbit carries the detector through more than one particle environment.',
      diagramTitle: 'The Moon crossing Earth’s magnetotail',
      solarWind: 'Solar wind',
      magnetotail: 'Magnetotail',
      inside: 'Inside the magnetotail',
      insideBody:
        'Earth’s magnetic tail stands between the Moon and the solar wind. The particles MATCH can record are not the same mix.',
      outside: 'In the solar wind',
      outsideBody:
        'Outside the tail, particles from the Sun, the galaxy, and Jupiter can reach the Moon more directly.',
      caption: 'Illustrative. The Moon’s orbit is not drawn to scale. Chang’e-7 / MATCH rides with the Moon.',
    },
    imagePlaceholder: 'Image placeholder for {title}',
    close: 'That is why Thailand goes to orbit around the Moon.',
    closeLead:
      'A detector on Earth sits under the atmosphere and inside the magnetic field. From lunar orbit, MATCH passes through the solar wind and Earth’s magnetotail, and it can watch particles leaving the lunar surface. One flight can meet solar cosmic rays, galactic cosmic rays, Jovian electrons, and lunar albedo.',
  },
  change7: {
    partsLabel: 'Parts of Chang’e-7',
    overview: 'Overview',
    overviewBody:
      'Chang’e-7 is a lunar mission of four parts: an orbiter, a lander, a rover, and a hopper. It is planned to study the south polar region. MATCH, Thailand’s particle detector, flies on the orbiter.',
    match: 'CE-7 MATCH',
    matchBody:
      'CE-7 MATCH is Thailand’s particle detector, hosted on the orbiter. From lunar orbit it measures energetic particles arriving from space and particles leaving the lunar surface.',
    parts: [
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
    ],
    hosts: {
      orbiter: 'Orbiter',
      lander: 'Lander',
      rover: 'Rover',
      hopper: 'Hopper',
    },
    manifestLabel: 'Payloads on Chang’e-7',
    manifestTitle: 'Payloads on Chang’e-7',
    china: 'China',
    international: 'International',
    iloaShort: 'ILOA',
    chinaPayloads: [
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
    ],
    internationalPayloads: [
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
    ],
    frames: {
      overview: 'Chang’e-7 with the orbiter, lander, rover, hopper, and CE-7 MATCH attached',
      orbiter: 'Orbiter separated from the Chang’e-7 stack',
      lander: 'Lander separated from the orbiter',
      rover: 'Rover separated from the lander',
      hopper: 'Hopper separated from the lander',
      match: 'CE-7 MATCH separated from the orbiter',
    },
    ilrsTitle: 'International Lunar Research Station',
    ilrsBody:
      'The International Lunar Research Station is a cooperative program to build a sustained scientific presence near the lunar south pole. The instruments that partner countries fly on Chang’e-7 are an early part of that work.',
  },
  transfer: {
    kicker: 'The route',
    title: 'From Wenchang to lunar orbit.',
    diagram: 'Schematic route of Chang’e-7 from Earth to the Moon',
    caption:
      'Schematic. Earth, the Moon, and the path are not to scale. The curve is the shape of a transfer orbit, not a reconstructed flight path.',
    steps: [
      {
        title: 'Launch',
        body: 'Chang’e-7 leaves Earth from the Wenchang Spacecraft Launch Site, on the island of Hainan. The orbiter, lander, rover, and hopper ride together as one spacecraft.',
      },
      {
        title: 'Earth parking orbit',
        body: 'The spacecraft first enters a closed orbit around Earth. It circles there while the departure toward the Moon is lined up.',
      },
      {
        title: 'Trans-lunar injection',
        body: 'A burn stretches the parking orbit. The path opens from a loop around Earth into a long curve pointed toward the Moon.',
      },
      {
        title: 'Lunar transfer',
        body: 'The spacecraft coasts on that curve. Earth stays near one end, and the Moon is near the other. The route bends with the orbit. It does not run straight across.',
      },
      {
        title: 'Lunar orbit insertion',
        body: 'Near the Moon, a burn lets the Moon capture the spacecraft. The first orbit around the Moon is highly elliptical: close at one end, far at the other.',
      },
      {
        title: 'About 200 kilometres',
        body: 'Further burns bring the path into a near-circular orbit about 200 kilometres above the Moon. MATCH flies on the orbiter in this orbit.',
      },
      {
        title: 'The lander separates',
        body: 'The lander leaves the orbiter and descends toward the lunar south pole, carrying the rover and the hopper. The orbiter stays in lunar orbit, and MATCH stays with it.',
      },
    ],
  },
  orbit: {
    label: 'Where MATCH observes',
    kicker: 'Around the Moon',
    title: 'One instrument. Two views.',
    body: 'From approximately 200 kilometres above the Moon, MATCH observes particles arriving from space and particles emerging from the lunar surface through two opposing viewing directions.',
    pathNote:
      'The path is a schematic near-polar circle, not the reconstructed mission trajectory. The cone angle is illustrative. It is not MATCH’s verified acceptance angle.',
    albedoNote:
      'Particles leaving the surface stand in for Lunar Albedo, which emerges after interactions with lunar material. A cone shows viewing geometry. It does not mean every particle inside it is detected, or that arrival direction by itself identifies the source.',
    credit: 'Lunar surface color from the CGI Moon Kit, NASA Scientific Visualization Studio.',
    legend: {
      match: 'CE-7 MATCH',
      moon: 'Moon-facing view',
      space: 'Space-facing view',
    },
    finish: 'Two viewing directions provide complementary measurements of the particle environment around the Moon.',
    still:
      'Illustrative diagram of MATCH in a near-polar orbit, looking toward the Moon and toward space',
    showCones: 'Show viewing cones',
    closeUp: 'Close-up',
  },
  explorer: {
    label: 'MATCH explorer',
    modeLabel: 'Explorer mode',
    modes: [
      { id: 'overview', label: 'Overview' },
      { id: 'inside', label: 'Inside MATCH' },
      { id: 'particle', label: 'Follow a particle' },
    ],
    badges: {
      overview: 'Hardware model',
      inside: 'Detector schematic',
      particle: 'Illustrative event',
    },
    overview: {
      kicker: 'The instrument',
      title: 'Two entrances, one axis.',
      body: 'MATCH is a single layered detector. Window extensions at opposite ends open onto the same bore — one toward space, one toward the Moon.',
      housing: 'The housing in this view is the supplied flight-model geometry.',
      inside: 'Inside the stack',
      follow: 'Follow a particle',
    },
    inside: {
      kicker: 'Detector schematic',
      note: 'Schematic, aligned with the hardware bore. Spacing is explanatory — these layers are not separate parts in the model.',
      axis: 'Space-facing side to Moon-facing side',
      layersLabel: 'Detector layers',
      spread: 'Spread the layers',
      gather: 'Gather the layers',
    },
    particle: {
      kicker: 'Illustrative event',
      title: 'Stopping ion',
      entranceLabel: 'Entrance direction',
      space: 'Space-facing',
      moon: 'Moon-facing',
      stepsLabel: 'Event steps',
      step: 'Step {n}: {title}',
      play: 'Play event',
      pause: 'Pause event',
      note: 'Comparing ΔE with E helps tell particle types apart when the particle stops. The entrance is a direction through MATCH, not proof of an astronomical source.',
    },
    stage: '3D view of MATCH',
    loading: 'Loading the instrument',
    modelFailed: 'The hardware model could not be loaded.',
    viewSchematic: 'View the schematic',
    legend: {
      silicon: 'Silicon tracker',
      delta: 'ΔE scintillator',
      energy: 'E scintillator',
    },
    sides: { space: 'space-facing', moon: 'Moon-facing' },
    ordinals: { first: 'first', second: 'second', third: 'third', fourth: 'fourth' },
    callouts: {
      window: 'Window extension',
      structure: 'Structure',
      electrical: 'Electrical part',
      plate: 'Bottom plate',
      mounting: 'Mounting structure',
    },
    layers: [
      {
        id: 'si1',
        pip: 'Si 1',
        name: 'First Silicon tracking layer',
        label: 'First Silicon',
        body: 'Records where a particle crosses on the space-facing side. Perpendicular strips measure X and Y — two of the eight Silicon planes.',
      },
      {
        id: 'si2',
        pip: 'Si 2',
        name: 'Second Silicon tracking layer',
        label: 'Second Silicon',
        body: 'A second crossing, separated along the detector axis. Together with the first hit, it defines a straight trajectory.',
      },
      {
        id: 'de1',
        pip: 'ΔE 1',
        name: 'First ΔE scintillator',
        label: 'First ΔE',
        body: 'Measures a portion of the energy deposited as a particle passes through, before the central stopper.',
      },
      {
        id: 'e',
        pip: 'E',
        name: 'Central E scintillator',
        label: 'Central E',
        body: 'The stopping stage for suitable events. It measures residual energy. Comparing ΔE with E helps distinguish particle types. Not every particle stops, and electron events require their own interpretation.',
      },
      {
        id: 'de2',
        pip: 'ΔE 2',
        name: 'Second ΔE scintillator',
        label: 'Second ΔE',
        body: 'The matching ΔE measurement on the Moon-facing side. A particle entering there meets this scintillator before the central stopper.',
      },
      {
        id: 'si3',
        pip: 'Si 3',
        name: 'Third Silicon tracking layer',
        label: 'Third Silicon',
        body: 'A tracking layer on the Moon-facing half. Particles from that entrance reach it before the scintillators.',
      },
      {
        id: 'si4',
        pip: 'Si 4',
        name: 'Fourth Silicon tracking layer',
        label: 'Fourth Silicon',
        body: 'The outer tracker on the Moon-facing side. Four tracking layers, each with crossed X and Y strips, give eight Silicon planes.',
      },
    ],
    steps: [
      {
        title: 'At the entrance',
        body: 'A stopping ion approaches the {side} side. This is an illustrative event, not a measured arrival.',
      },
      {
        title: 'First tracking hit',
        body: 'The {first} Silicon layer records the crossing. Crossed strips give an X position and a Y position.',
      },
      {
        title: 'Second tracking hit',
        body: 'The {second} Silicon layer records another crossing. Two separated positions define the trajectory.',
      },
      {
        title: 'Deposit in ΔE',
        body: 'The {delta} ΔE scintillator measures energy deposited as the particle passes through.',
      },
      {
        title: 'Stopping in E',
        body: 'The ion stops in the central E scintillator, which measures the residual energy. Comparing ΔE with E helps distinguish particle types. Not every particle stops, and electron events require their own interpretation.',
      },
      {
        title: 'Path from the hits',
        body: 'The line is drawn through the Silicon hits. It reconstructs direction inside MATCH. Arrival through one entrance does not, by itself, identify the astronomical source.',
      },
    ],
  },
  notes: {
    label: 'How MATCH measures particles',
    topics: [
      {
        title: 'Track its path.',
        body: 'Silicon detectors record positions along a particle’s trajectory.',
        label: 'First Silicon tracking layer, Si 1, drawn as crossed strips',
      },
      {
        title: 'Measure its energy deposits.',
        body: 'Scintillators reveal how energy is deposited inside the instrument.',
        label: 'First ΔE scintillator and central E scintillator',
      },
      {
        title: 'Understand the environment.',
        body: 'Many events together help researchers investigate Solar Energetic Particles, Galactic Cosmic Rays, Jovian Electrons, and Lunar Albedo.',
        label: 'Electrons, protons, and alpha particles with their energy ranges',
      },
    ],
    silicon: 'Si 1',
    delta: 'ΔE 1',
    energy: 'E',
    species: [
      { name: 'Electrons', range: '4.0 MeV ~ 120 MeV' },
      { name: 'Protons', range: '25 MeV ~ 150 MeV' },
      { name: 'Alpha particles', range: '60 MeV ~ 400 MeV' },
    ],
  },
  fallback: {
    label: 'Static detector schematic',
    kicker: 'Detector schematic',
    title: 'One stack, two entrances.',
    webgl:
      'Interactive 3D isn’t available in this browser. The sequence below is the same layer order used in the explorer.',
    failed: 'The interactive view could not start. The sequence below is the detector order.',
    footnote:
      'Space-facing to Moon-facing: Silicon, Silicon, ΔE, E, ΔE, Silicon, Silicon. A particle from the Moon-facing side meets that sequence in reverse. This drawing is explanatory, not the flight-model geometry.',
    diagram: 'Schematic of MATCH from the space-facing entrance to the Moon-facing entrance',
    space: 'Space-facing',
    moon: 'Moon-facing',
  },
  howFooter:
    'The hardware view is the supplied model, shown in white. Inside MATCH, the seven detector groups are a schematic placed on the model’s axis — they are not separate parts in the file. Which window faces space should be confirmed against the spacecraft mounting.',
  engineering: {
    material: {
      title: 'A lighter structure. A demanding material.',
      body: 'Magnesium alloy helped reduce the structural mass of MATCH, supporting the instrument’s tight mass allocation. For the same volume of material, aluminium is the reference at {referenceMass}, and the magnesium alloy is approximately {low}–{high}. NARIT describes the material as approximately {lighterLow}–{lighterHigh}% lighter than aluminium. The comparison applies to the structural material. The complete instrument also contains detectors, electronics, and other components.',
      first: 'This is the first time in Thailand that magnesium alloy material can be fabricated.',
    },
    precision: {
      title: 'Precision in every component.',
      components: 'Structural components',
      fabricated: 'Fabricated by Thai engineers',
      inspection: 'Precision machining and dimensional inspection',
    },
    power: {
      title: 'Sensitive measurements. Limited power.',
      body: 'Detector readout must capture small signals while sharing the spacecraft’s limited electrical resources.',
      quiet: 'Low-power readout',
      verified: '≤{watts} W average',
    },
    data: {
      title: 'From signals to scientific information.',
      body: 'Particle interactions produce detector signals. Readout electronics convert those signals into digital information, which is passed to the Chang’e-7 spacecraft for return to Earth.',
      rate: '{rate} bit/s instrument data',
    },
    close: {
      title: 'Engineering makes the measurement possible.',
      body: 'The structure, detectors, electronics, and spacecraft interfaces must work as one system. Each engineering decision helps turn a scientific question into a measurement.',
    },
  },
  people: {
    teams: [
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
    ],
  },
  conclusion: [
    'MATCH is Thailand’s particle detector on the Chang’e-7 orbiter. From about 200 kilometres above the Moon, one instrument looks two ways: toward space, and toward the lunar surface.',
    'Those views let MATCH study energetic particles from the Sun, the galaxy, and Jupiter, and particles that leave the Moon after striking its surface. As the Moon passes through Earth’s magnetotail, the particles that can reach the spacecraft change.',
    'The measurement depends on the whole system. A light structure, precise detectors, careful readout, and the people who built MATCH turn arriving particles into information the spacecraft can send back to Earth.',
  ],
  credits: {
    title: 'End Credit',
    story: 'Story by',
    roles: [
      { role: 'Website and Visualization', name: 'Nattanon Dungsunenarn' },
      { role: 'Scientific Information', name: 'Jirasin Aswakool' },
    ],
    thanks: 'Special Thanks to NARIT Communication team',
    thanksPeople: [
      'Piriyaporn Sabhasri',
      'Hathaichanok Therdthampaisal',
      'Jitraporn Janpeng',
      'Matipon Tangmatitham',
    ],
    memory: 'In Memory of',
    memoryName: 'Jullada Kaosa-ard (1967-2026)',
    copyright: '©2026 SPACETH.CO. ALL RIGHTS RESERVED.',
  },
} as const
