import { Annotation, Dataset } from '@/models/user/annotation'
import { BBoxExport } from '@/models/export'

export const serializeAnnotation = ({ item, label }: Annotation) => {
  const { x, y, width, height } = item.bounds
  return {
    label,
    bbox: [x, y, width, height]
  }
}

export const processExportAnnotation = (datasets: Dataset[]) => {
  const exportData: BBoxExport[] = datasets.map(dataset => {
    return {
      image: {
        width: dataset.raster?.width,
        height: dataset.raster?.height,
        path: dataset.path
      },
      annotations: dataset.annotations.map(serializeAnnotation),
      labeled: !!dataset.annotations.length
    }
  })

  return exportData
}
