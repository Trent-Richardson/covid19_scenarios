import React, { useCallback, useReducer } from 'react'
import { useDropzone } from 'react-dropzone'
import { useTranslation } from 'react-i18next'
import path from 'path'
import './FileUploadZone.scss'

export enum FileType {
  CSV = 'CSV',
  TSV = 'TSV',
}

export interface FileUploadZoneProps {
  onFilesUploaded(files: Map<FileType, File>): void
  onFilesRejected?(): void
  accept?: string | string[]
  multiple?: boolean
  disabled?: boolean
}

/* Converts file extension to FileType enum */
function fileExtToType(ext: string) {
  const extMap = new Map<string, FileType>(
    Object.entries({
      '.csv': FileType.CSV,
      '.tsv': FileType.TSV,
    }),
  )
  return extMap.get(ext)
}

/* Adds relevant files to a Map to be dispatched */
function reduceDroppedFiles(files: Map<FileType, File>, file: File) {
  const ext = path.extname(file.name)
  const type = fileExtToType(ext)
  if (type) {
    files.set(type, file)
  }
  return files
}

function FileUploadZone({ onFilesUploaded, accept, multiple, disabled, onFilesRejected }: FileUploadZoneProps) {
  const [uploadedFiles, dispatchUploadedFile] = useReducer(reduceDroppedFiles, new Map())
  const onDrop = useCallback(
    (droppedFiles: File[]) => {
      droppedFiles.forEach(dispatchUploadedFile)
      onFilesUploaded(uploadedFiles)
    },
    [onFilesUploaded],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept,
    multiple,
    disabled,
    onDropAccepted: onDrop,
    onDropRejected: onFilesRejected,
  })
  const { t } = useTranslation()

  return (
    <div>
      <div {...getRootProps()} className="fileuploadzone-drop-area rounded p-3">
        <input type="file" {...getInputProps()} />
        <p className="h5 text-secondary text-center m-0">
          {isDragActive ? t('Drop the files here ...') : t("Drag n' drop some files here, or click to select files")}
        </p>
      </div>
      <ul>
        {uploadedFiles.size > 0 && [...uploadedFiles.values()].map(({ name }: File) => <li key={name}>{name}</li>)}
      </ul>
    </div>
  )
}

export default FileUploadZone
