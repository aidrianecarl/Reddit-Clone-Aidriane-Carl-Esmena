'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { X, Globe, Eye, Lock, Check } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { createSubredditSchema } from '@/lib/schemas'
import { createSubreddit } from '@/lib/subreddit'
import { useAuth } from '@/app/providers'

interface CreateSubredditModalProps {
  isOpen: boolean
  onClose: () => void
}

const TOPICS = [
  { icon: '🎨', label: 'Anime & Cosplay', value: 'anime-cosplay' },
  { icon: '🎭', label: 'Art', value: 'art' },
  { icon: '💼', label: 'Business & Finance', value: 'business-finance' },
  { icon: '🎲', label: 'Collectibles & Other Hobbies', value: 'collectibles' },
  { icon: '🎓', label: 'Education & Career', value: 'education-career' },
  { icon: '👗', label: 'Fashion & Beauty', value: 'fashion-beauty' },
  { icon: '🍔', label: 'Food & Drinks', value: 'food-drinks' },
  { icon: '🎮', label: 'Games', value: 'games' },
  { icon: '🏥', label: 'Health', value: 'health' },
  { icon: '🏠', label: 'Home & Garden', value: 'home-garden' },
  { icon: '⚖️', label: 'Humanities & Law', value: 'humanities-law' },
  { icon: '🤝', label: 'Identity & Relationships', value: 'identity' },
  { icon: '🌐', label: 'Internet Culture', value: 'internet-culture' },
  { icon: '🎬', label: 'Movies & TV', value: 'movies-tv' },
  { icon: '🎵', label: 'Music', value: 'music' },
  { icon: '🌿', label: 'Nature & Outdoors', value: 'nature-outdoors' },
  { icon: '📰', label: 'News & Politics', value: 'news-politics' },
  { icon: '✈️', label: 'Places & Travel', value: 'travel' },
  { icon: '⭐', label: 'Pop Culture', value: 'pop-culture' },
  { icon: '❓', label: 'Q&As & Stories', value: 'qa-stories' },
  { icon: '📚', label: 'Reading & Writing', value: 'reading-writing' },
  { icon: '🔬', label: 'Sciences', value: 'sciences' },
  { icon: '👻', label: 'Spooky', value: 'spooky' },
  { icon: '⚽', label: 'Sports', value: 'sports' },
  { icon: '💻', label: 'Technology', value: 'technology' },
  { icon: '🚗', label: 'Vehicles', value: 'vehicles' },
  { icon: '💪', label: 'Wellness', value: 'wellness' },
  { icon: '🔞', label: 'Adult Content', value: 'adult-content' },
  { icon: '⚠️', label: 'Mature Topics', value: 'mature-topics' },
]

type Step = 'topic' | 'privacy' | 'details' | 'success'

export function CreateSubredditModal({ isOpen, onClose }: CreateSubredditModalProps) {
  const router = useRouter()
  const { user } = useAuth()
  const [step, setStep] = useState<Step>('topic')
  const [selectedTopic, setSelectedTopic] = useState<string>('')
  const [privacyType, setPrivacyType] = useState<'public' | 'restricted' | 'private'>('public')
  const [isMature, setIsMature] = useState(false)
  const [createdSubreddit, setCreatedSubreddit] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(createSubredditSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  })

  const communityName = watch('name')
  const description = watch('description')

  const onSubmit = async (data: any) => {
    if (!user) return

    setIsSubmitting(true)
    setError('')

    try {
      const subreddit = await createSubreddit(
        data.name,
        data.description || '',
        user.$id,
        privacyType,
        selectedTopic
      )
      setCreatedSubreddit(subreddit)
      setStep('success')
    } catch (err: any) {
      setError(err.message || 'Failed to create subreddit')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleNext = () => {
    if (step === 'topic') {
      if (!selectedTopic) {
        setError('Please select a topic')
        return
      }
      setError('')
      setStep('privacy')
    } else if (step === 'privacy') {
      setError('')
      setStep('details')
    }
  }

  const handleBack = () => {
    if (step === 'privacy') setStep('topic')
    if (step === 'details') setStep('privacy')
    setError('')
  }

  const handleGoToCommunity = () => {
    if (createdSubreddit) {
      router.push(`/r/${createdSubreddit.name}`)
      onClose()
    }
  }

  const handleClose = () => {
    setStep('topic')
    setSelectedTopic('')
    setPrivacyType('public')
    setIsMature(false)
    setCreatedSubreddit(null)
    setError('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 sticky top-0 bg-white">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'topic' && 'What will your community be about?'}
            {step === 'privacy' && 'What kind of community is this?'}
            {step === 'details' && 'Tell us about your community'}
            {step === 'success' && 'You launched a new community!'}
          </h2>
          <button
            onClick={handleClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Step 1: Topic Selection */}
          {step === 'topic' && (
            <div>
              <p className="text-gray-600 mb-6">Choose a topic to help redditors discover your community</p>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {TOPICS.map((topic) => (
                  <button
                    key={topic.value}
                    onClick={() => setSelectedTopic(topic.value)}
                    className={`px-4 py-2 rounded-full border-2 transition-all font-medium text-sm flex items-center justify-center gap-2 ${
                      selectedTopic === topic.value
                        ? 'border-orange-600 bg-orange-50 text-orange-600'
                        : 'border-gray-200 bg-white text-gray-900 hover:border-gray-300'
                    }`}
                  >
                    <span>{topic.icon}</span>
                    <span>{topic.label}</span>
                  </button>
                ))}
              </div>
              {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
            </div>
          )}

          {/* Step 2: Privacy Settings */}
          {step === 'privacy' && (
            <div>
              <p className="text-gray-600 mb-6">
                Decide who can view and contribute in your community. Only public communities show up in search.{' '}
                <strong>Important:</strong> Once set, you will need to submit a request to change your community type.
              </p>

              <div className="space-y-4 mb-6">
                {/* Public */}
                <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" style={{borderColor: privacyType === 'public' ? '#ff5722' : '#e5e7eb'}}>
                  <input
                    type="radio"
                    name="privacy"
                    value="public"
                    checked={privacyType === 'public'}
                    onChange={(e) => setPrivacyType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                      <Globe size={20} />
                      <span>Public</span>
                    </div>
                    <p className="text-sm text-gray-600">Anyone can view, post, and comment to this community</p>
                  </div>
                </label>

                {/* Restricted */}
                <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" style={{borderColor: privacyType === 'restricted' ? '#ff5722' : '#e5e7eb'}}>
                  <input
                    type="radio"
                    name="privacy"
                    value="restricted"
                    checked={privacyType === 'restricted'}
                    onChange={(e) => setPrivacyType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                      <Eye size={20} />
                      <span>Restricted</span>
                    </div>
                    <p className="text-sm text-gray-600">Anyone can view, but only approved users can contribute</p>
                  </div>
                </label>

                {/* Private */}
                <label className="flex items-start gap-4 p-4 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50" style={{borderColor: privacyType === 'private' ? '#ff5722' : '#e5e7eb'}}>
                  <input
                    type="radio"
                    name="privacy"
                    value="private"
                    checked={privacyType === 'private'}
                    onChange={(e) => setPrivacyType(e.target.value as any)}
                    className="mt-1"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 font-semibold text-gray-900 mb-1">
                      <Lock size={20} />
                      <span>Private</span>
                    </div>
                    <p className="text-sm text-gray-600">Only approved users can view and contribute</p>
                  </div>
                </label>
              </div>

              {/* Mature Toggle */}
              <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg mb-6">
                <input
                  type="checkbox"
                  id="mature"
                  checked={isMature}
                  onChange={(e) => setIsMature(e.target.checked)}
                  className="w-5 h-5 cursor-pointer"
                />
                <label htmlFor="mature" className="flex-1 cursor-pointer">
                  <p className="font-semibold text-gray-900 text-sm">Mature (18+)</p>
                  <p className="text-xs text-gray-600">Users must be over 18 to view and contribute</p>
                </label>
              </div>

              <p className="text-xs text-gray-600 mb-6">
                By continuing, you agree to our <a href="#" className="text-blue-600 hover:underline">Mod Code of Conduct</a> and acknowledge that you understand the <a href="#" className="text-blue-600 hover:underline">Reddit Rules</a>.
              </p>
            </div>
          )}

          {/* Step 3: Community Details */}
          {step === 'details' && (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <p className="text-gray-600">A name and description help people understand what your community is all about.</p>

              <div className="grid grid-cols-2 gap-6">
                {/* Form */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Community name <span className="text-red-500">*</span>
                    </label>
                    <div className="flex items-center gap-2 bg-gray-100 rounded-lg overflow-hidden">
                      <span className="px-4 text-gray-600 font-semibold">r/</span>
                      <input
                        {...register('name')}
                        type="text"
                        placeholder="communityname"
                        className="flex-1 px-4 py-3 bg-gray-100 focus:outline-none"
                      />
                    </div>
                    {errors.name && (
                      <p className="text-red-500 text-sm mt-2">{String(errors.name.message)}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">{communityName.length}/21</p>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-900 mb-2">
                      Description<span className="text-red-500">*</span>
                    </label>
                    <textarea
                      {...register('description')}
                      placeholder="What's your community about?"
                      rows={6}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 resize-none"
                    />
                    {errors.description && (
                      <p className="text-red-500 text-sm mt-2">{String(errors.description.message)}</p>
                    )}
                    <p className="text-gray-500 text-xs mt-2">{description?.length || 0}/500</p>
                  </div>
                </div>

                {/* Preview */}
                <div className="flex flex-col gap-4">
                  <div className="bg-white rounded-lg border border-gray-200 p-4 sticky top-6">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold mb-3">
                      {communityName.charAt(0).toUpperCase() || ''}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      r/{communityName || 'communityname'}
                    </h3>
                    <p className="text-xs text-gray-600 mb-3">1 weekly visitor • 1 weekly contributor</p>
                    <p className="text-sm text-gray-700">{description || 'Your community description'}</p>
                  </div>
                </div>
              </div>

              {error && <p className="text-red-500 text-sm">{error}</p>}
            </form>
          )}

          {/* Step 4: Success */}
          {step === 'success' && (
            <div className="text-center py-8">
              <div className="mb-6">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white text-4xl font-bold mx-auto mb-4">
                  ✓
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">You launched a new community!</h3>
              </div>

              <div className="bg-gray-50 rounded-lg p-4 mb-8">
                <div className="flex gap-3 mb-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center text-white font-bold flex-shrink-0">
                    {createdSubreddit?.name?.charAt(0).toUpperCase()}
                  </div>
                  <div className="text-left flex-1">
                    <h4 className="font-bold text-gray-900">r/{createdSubreddit?.name}</h4>
                    <p className="text-xs text-gray-600">1 weekly visitor • 1 weekly contributor</p>
                    <p className="text-sm text-gray-700 mt-2">{createdSubreddit?.description}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Dot Progress */}
          {step !== 'success' && (
            <div className="flex justify-center gap-2 mt-6">
              <div className={`w-2 h-2 rounded-full ${step === 'topic' ? 'bg-gray-900' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'privacy' ? 'bg-gray-900' : 'bg-gray-300'}`} />
              <div className={`w-2 h-2 rounded-full ${step === 'details' ? 'bg-gray-900' : 'bg-gray-300'}`} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex gap-3 p-6 border-t border-gray-200 sticky bottom-0 bg-white">
          {step === 'success' ? (
            <>
              <button
                onClick={() => {
                  handleClose()
                }}
                className="flex-1 px-6 py-2 border border-gray-300 text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
              >
                View Next Steps
              </button>
              <button
                onClick={handleGoToCommunity}
                className="flex-1 px-6 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-full font-semibold transition-colors"
              >
                Go To Community Page
              </button>
            </>
          ) : (
            <>
              {step !== 'topic' && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-900 rounded-full font-semibold hover:bg-gray-100 transition-colors"
                >
                  Back
                </button>
              )}
              {step === 'topic' || step === 'privacy' ? (
                <button
                  onClick={handleNext}
                  className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold transition-colors"
                >
                  Next
                </button>
              ) : (
                <>
                  <button
                    onClick={handleClose}
                    className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-900 rounded-full font-semibold transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={isSubmitting}
                    className="flex-1 px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-semibold disabled:opacity-50 transition-colors"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Community'}
                  </button>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}
