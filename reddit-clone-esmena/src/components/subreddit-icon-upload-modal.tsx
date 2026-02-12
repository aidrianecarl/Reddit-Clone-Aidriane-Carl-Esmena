"use client"

import { useState, useRef } from "react"
import { Upload, X, Trash2, ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface SubredditIconUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (file: File) => Promise<void>
  currentIcon?: string
  subredditName?: string
}

export function SubredditIconUploadModal({
  isOpen,
  onClose,
  onSave,
  currentIcon,
  subredditName,
}: SubredditIconUploadModalProps) {
  const [previewImage, setPreviewImage] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("image/")) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        setPreviewImage(e.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleRemoveImage = () => {
    setPreviewImage(null)
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSave = async () => {
    if (!selectedFile) return
    setIsLoading(true)
    try {
      await onSave(selectedFile)
      handleRemoveImage()
      onClose()
    } catch (error) {
      console.error("Failed to upload icon:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDelete = async () => {
    if (confirm("Are you sure you want to delete the community icon?")) {
      try {
        await onSave(new File([], "delete", { type: "text/plain" }))
        onClose()
      } catch (error) {
        console.error("Failed to delete icon:", error)
      }
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader className="flex flex-row items-center gap-2">
          <button onClick={onClose} className="hover:opacity-70">
            <ArrowLeft size={20} />
          </button>
          <DialogTitle>Icon</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Icon Preview */}
          <div className="flex justify-center">
            <div className="relative w-32 h-32 rounded-full bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center text-white text-4xl flex-shrink-0 overflow-hidden border-4 border-gray-200 dark:border-gray-700">
              {previewImage ? (
                <img src={previewImage} alt="Icon preview" className="w-full h-full object-cover" />
              ) : currentIcon ? (
                <img src={currentIcon} alt="Current icon" className="w-full h-full object-cover" />
              ) : (
                subredditName?.[0]?.toUpperCase()
              )}
            </div>
            {currentIcon && (
              <button
                onClick={handleDelete}
                className="absolute -bottom-2 -right-2 bg-gray-500 hover:bg-gray-600 text-white rounded-full p-2 transition-colors"
                title="Delete current icon"
              >
                <Trash2 size={16} />
              </button>
            )}
          </div>

          {/* Upload Section */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">Upload image</h3>
            <div className="relative w-full flex flex-col items-center justify-center p-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-16 h-16 rounded object-cover mb-3"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    {selectedFile?.name?.substring(0, 20)}...
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="absolute top-2 right-2 bg-gray-400 text-white rounded-full p-1 hover:bg-gray-500"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={32} className="text-gray-500 dark:text-gray-400 mb-3" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300 text-center">
                    Choose image
                  </span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 text-center mt-1">
                    or drag and drop
                  </span>
                </>
              )}
            </div>
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleFileSelect}
            className="hidden"
          />

          {/* Dark Mode Toggle (decorative) */}
          <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-slate-800 rounded-lg">
            <div className="flex items-center gap-2">
              <span className="text-gray-700 dark:text-gray-300">Dark mode</span>
            </div>
            <div className="w-12 h-6 bg-gray-300 dark:bg-gray-600 rounded-full"></div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 dark:border-gray-700">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSave}
              disabled={!selectedFile || isLoading}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isLoading ? "Saving..." : "Save"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
