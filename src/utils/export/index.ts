import { Annotation } from '@/models/user/annotation'

export const serializeAnnotation = ({ item, label }: Annotation) => {
  const { x, y, width, height } = item.bounds
  return {
    label,
    bbox: [x, y, width, height]
  }
}
