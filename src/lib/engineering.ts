/**
 * Engineering figures shown in Chapter 6.
 * Unverified values stay in this file and are not rendered until `verified` is true.
 * Do not invent alloy grade, coating, tolerance, structural mass, peak power,
 * supply voltage, heater demand, or a data rate.
 */
export const engineeringSpec = {
  massKg: 4.85,
  dimensionsMm: [145, 146, 265] as const,
  material: {
    reference: 'Aluminium',
    referenceMass: 100,
    alloy: 'Magnesium alloy',
    /** Equal-volume mass relative to the aluminium reference of 100. */
    alloyMassRange: [60, 65] as const,
    lighterPercentRange: [35, 40] as const,
  },
  manufacturing: {
    structuralComponents: '70+',
    thaiFabrication: 'Over 60%',
  },
  power: {
    /** NARIT ILRS lists this average. Confirm against the final flight specification before showing it. */
    averageWatts: 6,
    verified: false,
  },
  data: {
    bitsPerSecond: null as number | null,
    verified: false,
  },
}
