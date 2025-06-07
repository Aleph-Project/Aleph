"use client";

import { useState, useEffect, useRef, type FormEvent, type ChangeEvent } from "react";
import { useRouter } from "next/navigation"
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { editProfile } from "@/services/profileService";
import { useSession } from "next-auth/react";


import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { getAllCities } from "@/services/cityService";

interface userData {
  name: string;
  bio: string;
  birthday: string;
  city_id: string;
  avatar_url: string | null;
  background_url: string | null;
}

interface EditProfileProps {
  onBackClick: (auth_id:string) => void;
  userData: userData;
}

interface Country {
  id: number;
  name: string;
  created_at: string;
  updated_at: string;
}

interface City {
  id: number;
  country_id: number;
  name: string;
  created_at: string;
  updated_at: string;
  country: Country;
}


export function EditProfile({ onBackClick, userData }: EditProfileProps) {
  // const [urlImg, setUrlImg] = useState("/cat.jpg");
  // const [urlWallpaper, setUrlWallpaper] = useState("/.jpg");
  // const [nom_profile, setNom_profile] = useState("Catalina_Gmz");
  // const [bio, setBio] = useState(
  //   "Soy una amante de la música y la cultura. Me encanta descubrir nuevos artistas y compartir mis descubrimientos con los demás. Siempre estoy buscando nuevas melodías que me inspiren y me hagan sentir viva."
  // );
  const router = useRouter()
  // const { user, isLoading } = useUser();    
  // const auth_id = extractAuthIdFromUser(user?.sub);
  const { data: session, status } = useSession();
  const user = session?.user;
  const auth_id = user?.id;
  const [date, setDate] = useState(userData.birthday || null);
  const [city, setCity] = useState("");
  const [cities, setCities] = useState<City[]>([]);
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);
  const [formData, setFormData] = useState({
    auth_id: auth_id,
    name: userData.name,
    bio: userData.bio,
    birthday: userData.birthday,
    city_id: userData.city_id,
    avatar_url: userData.avatar_url,
    background_url: userData.background_url,
  });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [wallpaperPreview, setWallpaperPreview] = useState<string | null>(null);
  const avatarFileRef = useRef<HTMLInputElement>(null)
  const wallpaperFileRef = useRef<HTMLInputElement>(null)
  const [loading, setLoading] = useState(false);


  const onBackClickHandler = (auth_id:string) => {
    onBackClick(auth_id);
  }
  // setAvatarPreview(userData.avatar_url);
  // setWallpaperPreview(userData.background_url);
  

  // const cities = [
  //   "Bogotá, Colombia",
  //   "Medellín, Colombia",
  //   "Cali, Colombia",
  //   "Barranquilla, Colombia",
  //   "Cartagena, Colombia",
  //   "Cúcuta, Colombia",
  //   "Pereira, Colombia",
  // ];

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    setOpenCityDropdown(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

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
        setWallpaperPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  useEffect(() => {
    console.log("Fecha seleccionada:", date);
  }, [date]);

  const getCities = async (): Promise<City[]> => {
    try {
      setIsLoadingCities(true);
      const res = await getAllCities();
      setCities(res);
      return res;
    } catch (error) {
      console.error("Error fetching cities:", error);
      return [];
    } finally {
      setIsLoadingCities(false);
    }
  }

  // const getCityUser = () => {
  //   const city: City[] = cities.filter((city: City) => city.id.toString() === userData.city_id);

  //   if (city.length > 0) {
  //     return `${city[0].name}, ${city[0].country.name}`;
  //   } else {
  //     return "Selecciona una ciudad";
  //   }
  // }

  useEffect(() => {
    getCities();
  }, []);

  useEffect(() => {
    console.log(formData);
  },[formData]);

  useEffect(() => {
    if (userData.avatar_url) {
      setAvatarPreview(userData.avatar_url);
    }
    if (userData.background_url) {
      setWallpaperPreview(userData.background_url);
    }
  }, [userData])

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    if(!auth_id){
      throw new Error("Se necesita el ID del usuario logueado")
    }
    try {
      const res = await editProfile({
        auth_id: auth_id,
        name: formData.name,
        bio: formData.bio,
        birthday: formData.birthday,
        city_id: formData.city_id,
        avatar_file: avatarFileRef.current?.files?.[0] || null,
        background_file: wallpaperFileRef.current?.files?.[0] || null,
      }, auth_id)
      
      const status = res.status;
      console.log("Respuesta del servidor ", res, status);
      alert("Perfil actualizado correctamente");
      onBackClickHandler(auth_id);
      // router.push("/profile");
    } catch (error) {
      console.error("Error al editar el perfil:", error);
    }
  };

  useEffect(() => {
    if (cities.length > 0) {
      const city: City[] = cities.filter((city: City) => city.id === parseInt(userData.city_id));

      if (city.length > 0) {
        setCity(`${city[0].name}, ${city[0].country.name}`);
      } else {
        setCity("Selecciona una ciudad");
      }
    }
  }, [cities]);

  return (
    <div className="flex flex-col h-screen text-white p-5 overflow-visible">
      <form onSubmit={handleSubmit}>
        {/* Secciones de imagenes */}
        <div>
          <div className="grid grid-cols-4 grid-rows-[auto_auto_min-content_auto_auto_auto_auto_auto_auto_auto] gap-4">
            <div className="col-span-4">
              <h3 className="text-base font-medium">Imagen de perfil</h3>
            </div>
            <div className="col-span-3 col-start-2 row-start-2">
              <div className="max-w-sm">
                <label htmlFor="file-input" className="sr-only">
                  Sube un archivo
                </label>
                <input
                  type="file"
                  ref={avatarFileRef}
                  onChange={handleAvatarChange}
                  name="profile-img-input"
                  id="profile-img-input"
                  className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400
    file:bg-gray-50 file:border-0
    file:me-4
    file:py-3 file:px-4
    dark:file:bg-neutral-700 dark:file:text-neutral-400"
                ></input>
              </div>
            </div>
            <div className="col-span-3 col-start-2 row-start-3">
              <p
                className="text-sm text-gray-200 dark:text-gray-300"
                id="file_input_help"
              >
                SVG, PNG, JPG or GIF (MAX. 800x400px).
              </p>
            </div>
            <div className="col-span-3 col-start-2 row-start-4 flex gap-4">
              {/* <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Subir imagen
              </button> */}
              <button
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              >
                Eliminar imagen
              </button>
            </div>
            <div className="row-span-3 col-start-1 row-start-2 flex items-center justify-center">
              <img
                className="w-28 h-28 rounded-full object-cover md:mb-0 md:mr-6 border-4 border-white/10 shadow-xl"
                src={avatarPreview || "/user.png"}
                alt="Perfil"
              />
            </div>
            <div className="col-span-4 row-start-5">
              <h3 className="text-base font-medium">Imagen de portada</h3>
            </div>
            <div className="col-span-4 row-start-6">
              <img
                className="w-full h-48 rounded-lg object-cover md:mb-0 md:mr-6 border-4 border-white/10 shadow-xl"
                src={wallpaperPreview || "/wallpaper.png"}
                alt="Portada"
              />
            </div>
            <div className="col-span-4 row-start-7">
              <div className="w-full">
                <label htmlFor="file-input" className="sr-only">
                  Choose file
                </label>
                <input
                  type="file"
                  ref={wallpaperFileRef}
                  onChange={handleBackgroundChange}
                  name="profile-wallpaper-input"
                  id="profile-wallpaper-input"
                  className="block w-full border border-gray-200 shadow-sm rounded-lg text-sm focus:z-10 focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400
    file:bg-gray-50 file:border-0
    file:me-4
    file:py-3 file:px-4
    dark:file:bg-neutral-700 dark:file:text-neutral-400"
                ></input>
              </div>
            </div>
            <div className="col-span-4 row-start-8">
              <p
                className="text-sm text-gray-200 dark:text-gray-300"
                id="file_input_help"
              >
                SVG, PNG, JPG or GIF (MAX. 800x400px).
              </p>
            </div>
            <div className="col-span-4 row-start-9 flex gap-4 justify-center">
              {/* <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Subir imagen
              </button> */}
              <button
                type="button"
                className="text-white bg-red-700 hover:bg-red-800 focus:outline-none focus:ring-4 focus:ring-red-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-red-600 dark:hover:bg-red-700 dark:focus:ring-red-900"
              >
                Eliminar imagen
              </button>
            </div>
          </div>
        </div>

        {/* Seccion de datos */}

        <div>
          <div className="col-span-4 mb-4">
            <h3 className="text-base font-medium">Nombre de usuario</h3>
            <div className="w-full space-y-3 mt-4">
              <input
                type="text"
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 w-full text-black"
                placeholder={formData.name || ""}
                name="name"
                onChange={handleInputChange}
              ></input>
            </div>
          </div>

          <div className="col-span-4 mb-4">
            <h3 className="text-base font-medium">Biografía</h3>
            <div className="w-full space-y-3 mt-4">
              <textarea
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 h-[150px]"
                placeholder={formData.bio|| ""}
                name="bio"
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
              ></textarea>
            </div>
          </div>

          <div className="col-span-4 mb-4">
            <h3 className="text-base font-medium">Fecha de nacimiento</h3>
            <div className="w-full space-y-3 mt-4">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    className={cn(
                      "w-full bg-white text-black hover:bg-white justify-start text-left font-normal",
                      !formData.birthday && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {formData.birthday ? (
                      format(formData.birthday, "PPP")
                    ) : (
                      <span>Ingresa una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setFormData.birthday}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          <div className="col-span-4 mb-4">
            <h3 className="text-base font-medium">Ciudad</h3>
            <div className="w-full space-y-3 mt-4">
              <Select>
                <SelectTrigger className="w-full text-gray-500">
                  <SelectValue placeholder={city} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Ciudades</SelectLabel>
                    {/* <SelectItem value="apple">Apple</SelectItem> */}
                    {cities.map((city:City) => {
                      return (
                        <SelectItem
                          key={city.id}
                          value={city.id}
                          onClick={() => handleCityChange(city.id.toString())}
                          
                        >
                          {city.name}, {city.country.name}
                        </SelectItem>
                      );
                    })}
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="col-span-4 mb-10 mt-4 items-center justify-center flex">
            <button
              type="submit"
              className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
            >
              Actualizar perfil
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
