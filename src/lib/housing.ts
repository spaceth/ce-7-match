import * as THREE from 'three'

export function createHousingMaterials() {
  return {
    body: new THREE.MeshStandardMaterial({
      color: '#fafafa',
      roughness: 0.56,
      metalness: 0.08,
      side: THREE.DoubleSide,
    }),
    fasteners: new THREE.MeshStandardMaterial({
      color: '#808080',
      roughness: 0.4,
      metalness: 0.45,
      side: THREE.DoubleSide,
    }),
    windows: new THREE.MeshStandardMaterial({
      color: '#333333',
      roughness: 0.62,
      metalness: 0.04,
      side: THREE.DoubleSide,
    }),
  }
}

export type HousingMaterials = ReturnType<typeof createHousingMaterials>

export function housingMaterial(
  name: string,
  body: THREE.Material,
  fasteners: THREE.Material,
  windows: THREE.Material,
) {
  if (/hexagon[_\s]+socket[_\s]+head[_\s]+cap[_\s]+screw/i.test(name)) return fasteners
  if (/sldasm-Part-28[12]$/i.test(name)) return windows
  const part = name.match(/sldasm-Part-(\d+)/i)
  if (part) {
    const number = Number(part[1])
    if (number >= 244 && number <= 278 && !/20240814/.test(name)) return fasteners
  }
  return body
}

export function paintHousing(root: THREE.Object3D, materials: HousingMaterials) {
  root.traverse((object) => {
    const mesh = object as THREE.Mesh
    if (!mesh.isMesh) return
    mesh.material = housingMaterial(mesh.name, materials.body, materials.fasteners, materials.windows)
    mesh.castShadow = false
    mesh.receiveShadow = false
  })
}

export function disposeHousing(materials: HousingMaterials) {
  materials.body.dispose()
  materials.fasteners.dispose()
  materials.windows.dispose()
}
