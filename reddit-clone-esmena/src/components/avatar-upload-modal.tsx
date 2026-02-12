"use client"

import { useState, useRef } from "react"
import { Upload, X, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface AvatarUploadModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (file: File) => Promise<void>
  currentAvatar?: string
}

export function AvatarUploadModal({ isOpen, onClose, onSave, currentAvatar }: AvatarUploadModalProps) {
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
      console.error("Failed to upload avatar:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Avatar image</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Current Avatar Preview */}
          <div className="flex justify-center">
            <div className="w-32 h-32 rounded-full bg-gradient-to-br from-blue-400 to-cyan-500 flex items-center justify-center overflow-hidden border-4 border-gray-200 dark:border-gray-700">
              {currentAvatar ? (
                <img src={currentAvatar} alt="Current avatar" className="w-full h-full object-cover" />
              ) : (
                <svg
                  className="w-16 h-16 text-white"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                </svg>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Current Avatar Selection Button */}
            <button className="flex flex-col items-center justify-center p-4 border-2 border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
              <span className="text-2xl mb-2">👤</span>
              <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">Select avatar</span>
            </button>

            {/* New Image Upload Section */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="relative flex flex-col items-center justify-center p-4 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {previewImage ? (
                <>
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-12 h-12 rounded object-cover"
                  />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 mt-2 text-center">
                    {selectedFile?.name?.substring(0, 15)}...
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation()
                      handleRemoveImage()
                    }}
                    className="absolute top-1 right-1 bg-gray-400 text-white rounded-full p-1 hover:bg-gray-500"
                  >
                    <X size={14} />
                  </button>
                </>
              ) : (
                <>
                  <Upload size={24} className="text-gray-500 dark:text-gray-400 mb-2" />
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300 text-center">
                    Select a new image
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
