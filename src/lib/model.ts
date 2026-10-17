import { useGLTF } from '@react-three/drei'
import modelUrl from '../../model.glb?url'

// Meshopt-compressed flight model. The decoder flag has to match the file.
export function useMatchModel() {
  return useGLTF(modelUrl, false, true)
}

useGLTF.preload(modelUrl, false, true)
