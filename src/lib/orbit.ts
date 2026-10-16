/**
 * Illustrative Chang’e-7 orbit for the opening scene.
 * Distances are kilometres. The inclination and cone angle are schematic:
 * they are not a reconstructed trajectory or MATCH’s verified acceptance angle.
 */
export const orbitScene = {
  moonRadiusKm: 1737,
  altitudeKm: 200,
  inclinationDeg: 85,
  coneHalfAngleDeg: 22,
  spaceConeLengthKm: 560,
  degreesPerSecond: 7,
  moonFacing: '#8fe3cf',
  spaceFacing: '#7fd0ee',
}

export const orbitRadiusKm = orbitScene.moonRadiusKm + orbitScene.altitudeKm

export function slantToSurface(orbitR: number, moonR: number, halfAngleRad: number) {
  const cos = Math.cos(halfAngleRad)
  const under = orbitR * orbitR * (cos * cos - 1) + moonR * moonR
  if (under <= 0) return orbitR - moonR
  return orbitR * cos - Math.sqrt(under)
}
