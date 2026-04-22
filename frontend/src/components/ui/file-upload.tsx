'use client'

import * as React from "react"
import { cn } from "@/lib/utils"
import { Upload, X, FileText, Image, Film } from "lucide-react"

/**
 * FileUpload component - Drag and drop file uploader
 * Provides accessible file upload with preview
 * 
 * @param accept - Accepted file types
 * @param multiple - Whether multiple files can be uploaded
 * @param maxSize - Maximum file size in bytes
 * @param onFilesChange - Callback when files change
 * @param className - Additional CSS classes
 * @returns JSX.Element - File upload component
 * 
 * @example
 * <FileUpload 
 *   accept="image/*" 
 *   multiple={true}
 *   maxSize={5 * 1024 * 1024} // 5MB
 *   onFilesChange={setFiles}
 * />
 */
interface FileUploadProps {
  accept?: string
  multiple?: boolean
  maxSize?: number
  onFilesChange?: (files: File[]) => void
  className?: string
}

const FileUpload = React.forwardRef<HTMLDivElement, FileUploadProps>(
  ({ 
    accept, 
    multiple = false, 
    maxSize = 10 * 1024 * 1024, // 10MB default
    onFilesChange, 
    className, 
    ...props 
  }, ref) => {
    const [files, setFiles] = React.useState<File[]>([])
    const [isDragging, setIsDragging] = React.useState(false)
    const [errors, setErrors] = React.useState<string[]>([])
    const fileInputRef = React.useRef<HTMLInputElement>(null)

    const validateFile = (file: File): string | null => {
      if (maxSize && file.size > maxSize) {
        return `File "${file.name}" exceeds maximum size of ${formatFileSize(maxSize)}`
      }
      
      if (accept) {
        const acceptedTypes = accept.split(',').map(type => type.trim())
        const isAccepted = acceptedTypes.some(type => {
          if (type.startsWith('.')) {
            return file.name.toLowerCase().endsWith(type.toLowerCase())
          }
          return file.type.match(type.replace('*', '.*'))
        })
        
        if (!isAccepted) {
          return `File "${file.name}" is not an accepted file type`
        }
      }
      
      return null
    }

    const handleFiles = (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles)
      const validFiles: File[] = []
      const newErrors: string[] = []

      fileArray.forEach(file => {
        const error = validateFile(file)
        if (error) {
          newErrors.push(error)
        } else {
          validFiles.push(file)
        }
      })

      setErrors(newErrors)
      
      if (validFiles.length > 0) {
        const updatedFiles = multiple ? [...files, ...validFiles] : validFiles
        setFiles(updatedFiles)
        onFilesChange?.(updatedFiles)
      }
    }

    const handleDragOver = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(true)
    }

    const handleDragLeave = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
    }

    const handleDrop = (e: React.DragEvent) => {
      e.preventDefault()
      setIsDragging(false)
      
      const droppedFiles = e.dataTransfer.files
      if (droppedFiles.length > 0) {
        handleFiles(droppedFiles)
      }
    }

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files
      if (selectedFiles && selectedFiles.length > 0) {
        handleFiles(selectedFiles)
      }
    }

    const removeFile = (index: number) => {
      const updatedFiles = files.filter((_, i) => i !== index)
      setFiles(updatedFiles)
      onFilesChange?.(updatedFiles)
    }

    const formatFileSize = (bytes: number): string => {
      if (bytes === 0) return '0 Bytes'
      const k = 1024
      const sizes = ['Bytes', 'KB', 'MB', 'GB']
      const i = Math.floor(Math.log(bytes) / Math.log(k))
      return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
    }

    const getFileIcon = (file: File) => {
      if (file.type.startsWith('image/')) {
        return <Image className="h-4 w-4" />
      } else if (file.type.startsWith('video/')) {
        return <Film className="h-4 w-4" />
      } else {
        return <FileText className="h-4 w-4" />
      }
    }

    return (
      <div ref={ref} className={cn("space-y-4", className)} {...props}>
        {/* Upload area */}
        <div
          className={cn(
            "border-2 border-dashed rounded-lg p-6 text-center transition-colors",
            isDragging 
              ? "border-primary bg-primary/5" 
              : "border-muted-foreground/25 hover:border-muted-foreground/50",
            "focus-within:border-primary focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2"
          )}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept={accept}
            multiple={multiple}
            onChange={handleFileSelect}
            className="sr-only"
            aria-label="File upload"
          />
          
          <div className="space-y-4">
            <div className="mx-auto h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Upload className="h-6 w-6 text-muted-foreground" />
            </div>
            
            <div className="space-y-2">
              <p className="text-sm font-medium">
                Drop files here or click to upload
              </p>
              <p className="text-xs text-muted-foreground">
                {accept && `Accepted: ${accept}`}
                {maxSize && ` Max size: ${formatFileSize(maxSize)}`}
                {multiple ? ' Multiple files allowed' : ' Single file only'}
              </p>
            </div>
            
            <button
              type="button"
              className="px-4 py-2 text-sm bg-primary text-primary-foreground rounded-md hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              onClick={() => fileInputRef.current?.click()}
            >
              Select Files
            </button>
          </div>
        </div>

        {/* Errors */}
        {errors.length > 0 && (
          <div className="space-y-2">
            {errors.map((error, index) => (
              <div key={index} className="text-sm text-destructive">
                {error}
              </div>
            ))}
          </div>
        )}

        {/* File list */}
        {files.length > 0 && (
          <div className="space-y-2">
            <h4 className="text-sm font-medium">Uploaded Files ({files.length})</h4>
            <div className="space-y-2">
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-muted rounded-md"
                >
                  <div className="flex items-center space-x-3">
                    <div className="text-muted-foreground">
                      {getFileIcon(file)}
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm font-medium truncate max-w-[200px]">
                        {file.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    className="p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
                    onClick={() => removeFile(index)}
                    aria-label={`Remove ${file.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    )
  }
)
FileUpload.displayName = "FileUpload"

/**
 * FilePreview component - Preview for uploaded files
 * 
 * @param file - File to preview
 * @param onRemove - Callback to remove file
 * @param className - Additional CSS classes
 * @returns JSX.Element - File preview
 * 
 * @example
 * <FilePreview file={file} onRemove={handleRemove} />
 */
interface FilePreviewProps {
  file: File
  onRemove?: () => void
  className?: string
}

export const FilePreview: React.FC<FilePreviewProps> = ({
  file,
  onRemove,
  className
}) => {
  const [preview, setPreview] = React.useState<string | null>(null)

  React.useEffect(() => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreview(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }, [file])

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  if (file.type.startsWith('image/') && preview) {
    return (
      <div className={cn("relative group", className)}>
        <img
          src={preview}
          alt={file.name}
          className="w-full h-32 object-cover rounded-md"
        />
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
          <button
            type="button"
            className="p-2 bg-white/20 backdrop-blur-sm rounded-full text-white hover:bg-white/30 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            onClick={onRemove}
            aria-label={`Remove ${file.name}`}
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="mt-2">
          <p className="text-sm font-medium truncate">{file.name}</p>
          <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={cn("flex items-center space-x-3 p-3 bg-muted rounded-md", className)}>
      <div className="text-muted-foreground">
        {file.type.startsWith('video/') ? (
          <Film className="h-8 w-8" />
        ) : (
          <FileText className="h-8 w-8" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{file.name}</p>
        <p className="text-xs text-muted-foreground">{formatFileSize(file.size)}</p>
      </div>
      {onRemove && (
        <button
          type="button"
          className="p-1 text-muted-foreground hover:text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 rounded"
          onClick={onRemove}
          aria-label={`Remove ${file.name}`}
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  )
}

export { FileUpload }
