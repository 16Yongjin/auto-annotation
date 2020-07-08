import { SegmentationDataset, Segmentation } from '@/models/db'
import { Annotation, Dataset } from '@/models/user/annotation'

export const serializeSegmentation = ({
  item,
  label
}: Annotation): Segmentation => {
  const segmentation = (item.children as paper.Path[]).map(path =>
    path.segments.flatMap(segment => [segment.point.x, segment.point.y])
  )

  return {
    label,
    segmentation
  }
}

export const serializeSegmentationDataset = ({
  annotations,
  path
}: Dataset): SegmentationDataset => {
  return {
    path,
    annotations: annotations.map(serializeSegmentation)
  }
}
