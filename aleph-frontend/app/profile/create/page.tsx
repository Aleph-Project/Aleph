"use client"

import { useEffect, useState, useRef, type FormEvent, type ChangeEvent } from "react"
import { getAllCities, City } from "@/services/cityService"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { useUser } from "@auth0/nextjs-auth0";
import { extractAuthIdFromUser } from "@/app/utils/auth";
import { CreateProfile } from "@/services/profileService";

export default function CrearPerfil() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    auth_id: "",
    name: "",
    bio: "",
    birthday: "",
    city_id: "",
  })
  const [cities, setCities] = useState<City[]>([])
  const [citiesLoading, setCitiesLoading] = useState(true)
  const { user, isLoading } = useUser();    
  const auth_id = extractAuthIdFromUser(user?.sub);

  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [backgroundPreview, setBackgroundPreview] = useState<string | null>(null)

  const avatarFileRef = useRef<HTMLInputElement>(null)
  const backgroundFileRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    getAllCities()
      .then(setCities)
      .catch((err) => {
        console.error("Error cargando ciudades:", err);
        setCities([]);
      })
      .finally(() => setCitiesLoading(false));
  }, []);

  const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleBackgroundChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setBackgroundPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
        await CreateProfile({
            auth_id: auth_id || "",
            name: formData.name,
            bio: formData.bio,
            birthday: formData.birthday,
            city_id: formData.city_id,
            avatar_file: avatarFileRef.current?.files?.[0],
            background_file: backgroundFileRef.current?.files?.[0],
        });

        router.push("/profile")
    } catch (error) {
      console.error("Error:", error)
      alert("Hubo un error al crear tu perfil. Por favor, intenta de nuevo.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8 text-center">Crear perfil</h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Background preview */}
          <div className="relative h-48 rounded-lg overflow-hidden mb-8 bg-zinc-900">
            {backgroundPreview ? (
              <Image
                src={backgroundPreview || "/placeholder.svg"}
                alt="Fondo de perfil"
                fill
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center">
                <p className="text-zinc-500">Imagen de fondo</p>
              </div>
            )}
            <button
              type="button"
              onClick={() => backgroundFileRef.current?.click()}
              className="absolute bottom-4 right-4 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="lucide lucide-camera"
              >
                <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
                <circle cx="12" cy="13" r="3" />
              </svg>
            </button>
            <input
              type="file"
              ref={backgroundFileRef}
              onChange={handleBackgroundChange}
              accept="image/*"
              className="hidden"
            />
          </div>

          {/* Avatar and name section */}
          <div className="flex items-end gap-6 mb-8">
            <div className="relative">
              <div className="w-24 h-24 rounded-full overflow-hidden bg-zinc-800">
                {avatarPreview ? (
                  <Image
                    src={avatarPreview || "/placeholder.svg"}
                    alt="Avatar"
                    width={96}
                    height={96}
                    className="object-cover w-full h-full"
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="32"
                      height="32"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      className="lucide lucide-user text-zinc-500"
                    >
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                )}
              </div>
              <button
                type="button"
                onClick={() => avatarFileRef.current?.click()}
                className="absolute bottom-0 right-0 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-1"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="lucide lucide-pencil"
                >
                  <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                </svg>
              </button>
              <input
                type="file"
                ref={avatarFileRef}
                onChange={handleAvatarChange}
                accept="image/*"
                className="hidden"
              />
            </div>

            <div className="flex-1">
              <label htmlFor="name" className="block text-sm font-medium text-zinc-400 mb-1">
                Nombre
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
                placeholder="Tu nombre"
              />
            </div>
          </div>

          {/* Hidden auth_id field */}
          <input type="hidden" name="auth_id" value={formData.auth_id} onChange={handleInputChange} />

          {/* Bio */}
          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-zinc-400 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              placeholder="Cuéntanos sobre ti..."
            />
          </div>

          {/* Birthday */}
          <div>
            <label htmlFor="birthday" className="block text-sm font-medium text-zinc-400 mb-1">
              Fecha de nacimiento
            </label>
            <input
              type="date"
              id="birthday"
              name="birthday"
              value={formData.birthday}
              onChange={handleInputChange}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
            />
          </div>

          {/* City ID */}
          <div>
            <label htmlFor="city_id" className="block text-sm font-medium text-zinc-400 mb-1">
              Ciudad
            </label>
            <select
              id="city_id"
              name="city_id"
              value={formData.city_id}
              onChange={handleInputChange as any}
              className="w-full bg-zinc-800 border border-zinc-700 rounded-md px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-purple-600"
              required
            >
              <option value="">Selecciona tu ciudad</option>
              {citiesLoading ? (
                <option disabled>Cargando ciudades...</option>
            ) : (
                cities.map((city) => (
                <option key={city.id} value={city.id}>
                    {city.name} ({city.country?.name})
                </option>
                ))
            )}
            </select>
          </div>

          {/* Submit button */}
          <div className="flex justify-center mt-8">
            <button
              type="submit"
              disabled={loading}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-full px-8 py-3 transition-colors disabled:opacity-70"
            >
              {loading ? "Creando perfil..." : "Crear perfil"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
