import { useEffect, useState } from 'react'
import { CheckCircle } from 'lucide-react'
import Button from '../../components/ui/button/Button'
import AlertBox from '../../components/common/AlertBox'
import toast from 'react-hot-toast'
import heroSectionService from '../../services/heroSectionService'

type HeroData = {
  title: string
  subtitle: string
  imageDataUrl: string | null
}

const defaultData: HeroData = {
  title: 'Empowering Communities Across Nepal',
  subtitle: 'Promoting cultural heritage and sustainable development across Nepal',
  imageDataUrl: '/banner/image.png',
}

function HeroSectionPage() {
  const [data, setData] = useState<HeroData>(defaultData)

  const [imageFile, setImageFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [publishing, setPublishing] = useState(false)
  const [version, setVersion] = useState(0)

  useEffect(() => {
    const loadHeroSection = async () => {
      try {
        setError(null)
        const response = await heroSectionService.getHeroSection()
        const hero = Array.isArray(response) ? response[0] : response

        if (hero) {
          setData((current) => ({
            ...current,
            title: hero.title || current.title,
            subtitle: hero.subtitle || current.subtitle,
            imageDataUrl: hero.imageUrl || current.imageDataUrl,
          }))
          setVersion(hero.version || 0)
        }
      } catch {
        setError('Failed to load hero section from API.')
      }
    }

    void loadHeroSection()
  }, [])

  useEffect(() => {
    if (!imageFile) return

    const obj = URL.createObjectURL(imageFile)
    setData((d) => ({ ...d, imageDataUrl: obj }))

    return () => URL.revokeObjectURL(obj)
  }, [imageFile])

  const onImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null
    if (!f) return
    if (!f.type.startsWith('image/')) {
      setError('Please select an image file.')
      return
    }
    setError(null)
    setImageFile(f)
  }

  const onSave = async () => {
    setSaving(true)
    try {
      let imageUrl = data.imageDataUrl

      if (imageFile) {
        const uploadedImageUrl = await heroSectionService.uploadImage(imageFile)
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl
          setData((current) => ({ ...current, imageDataUrl: uploadedImageUrl }))
        }
      }

      await heroSectionService.saveDraft({
        title: data.title,
        subtitle: data.subtitle,
      })

      setImageFile(null)
      if (imageUrl) {
        setData((current) => ({ ...current, imageDataUrl: imageUrl }))
      }
      toast.success('Draft saved')
    } catch {
      setError('Failed to save hero draft.')
    } finally {
      setSaving(false)
    }
  }

  const onReset = () => {
    setData(defaultData)
    setImageFile(null)
  }

  const applyToLive = async () => {
    setPublishing(true)
    try {
      let imageUrl = data.imageDataUrl || defaultData.imageDataUrl || ''

      if (imageFile) {
        const uploadedImageUrl = await heroSectionService.uploadImage(imageFile)
        if (uploadedImageUrl) {
          imageUrl = uploadedImageUrl
          setData((current) => ({ ...current, imageDataUrl: uploadedImageUrl }))
        }
      }

      const response = await heroSectionService.publish({
        title: data.title,
        subtitle: data.subtitle,
        imageUrl,
        version,
      })

      setVersion(response.version)
      setData((current) => ({
        ...current,
        title: response.title,
        subtitle: response.subtitle || current.subtitle,
        imageDataUrl: response.imageUrl || current.imageDataUrl,
      }))
      setImageFile(null)
      toast.success('Hero section published')
    } catch {
      toast.error('Failed to publish hero section')
    } finally {
      setPublishing(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900">Hero Section</h1>
            <p className="text-sm text-slate-500">Update the homepage hero title and image.</p>
          </div>
        </div>
      </div> 

      <div className="grid gap-6 md:grid-cols-2">
        <section className="space-y-4">
          {error ? <AlertBox message={error} type="error" /> : null}

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Title</span>
            <textarea value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} className="w-full rounded-lg border border-slate-200 px-4 py-3" rows={2} />
          </label>

          <label className="space-y-2">
            <span className="text-sm font-medium text-slate-700">Subtitle</span>
            <textarea
              value={data.subtitle}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              className="w-full rounded-lg border border-slate-200 px-4 py-3"
              rows={3}
            />
          </label>

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-md bg-white">
                {data.imageDataUrl ? (
                  <img src={data.imageDataUrl} alt="thumbnail" className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full bg-slate-100" />
                )}
              </div>
              <div className="flex flex-col gap-3">
                <label className="inline-flex w-fit cursor-pointer items-center rounded-md border px-3 py-2 bg-white text-sm">
                  Change Image
                  <input type="file" accept="image/*" onChange={onImageChange} className="sr-only" />
                </label>
                <Button variant="outline" onClick={onReset} disabled={saving}>Reset</Button>
              </div>
            </div>

            <div className="mt-4">
              <Button onClick={onSave} className="px-6 py-4" disabled={saving}>
                {saving ? 'Saving...' : 'Preview/Save Changes'}
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-dashed border-slate-200 bg-white px-4 py-3 text-sm text-slate-500">
            The hero API only accepts language, title, and image upload for publish.
          </div>
        </section>

        <section>
          <div className="flex items-start justify-between">
            <h2 className="text-sm font-semibold text-slate-700">Preview</h2>
          </div>

          <div className="mt-4 rounded-2xl overflow-hidden text-white">
            <div
              className="relative w-full bg-slate-900 min-h-96"
              style={
                data.imageDataUrl
                  ? { backgroundImage: `url(${data.imageDataUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }
                  : {}
              }
            >
              <div className="absolute inset-0 bg-black/40" />
                <div className="relative mx-auto max-w-5xl px-6 py-20">
                <h3 className="text-4xl font-bold leading-tight">{data.title}</h3>
                  <p className="mt-4 max-w-3xl text-lg text-slate-200">{data.subtitle}</p>
              </div>
            </div>
          </div>

            <div className="mt-4 rounded-xl border border-slate-200 bg-white px-4 py-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center rounded-full bg-emerald-50 p-2">
                  <CheckCircle className="text-emerald-600" />
                </span>
                <div>
                  <div className="text-sm font-medium text-slate-700">Ready to publish</div>
                  <div className="text-xs text-slate-500">Draft save updates the API; publish sends the live payload.</div>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Button variant="outline" onClick={onSave} disabled={saving}>
                  {saving ? 'Saving...' : 'Save Draft'}
                </Button>
                <Button variant="primary" onClick={applyToLive} disabled={publishing}>
                  {publishing ? 'Publishing...' : 'Publish'}
                </Button>
              </div>
          </div>
        </section>
      </div>
    </div>
  )
}

export default HeroSectionPage
