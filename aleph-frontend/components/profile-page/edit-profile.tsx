"use client";

import { useState, useEffect, FormEvent } from "react";
import * as React from "react";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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

interface EditProfileProps {
  onBackClick: () => void;
}

export function EditProfile({ onBackClick }: EditProfileProps) {
  const [urlImg, setUrlImg] = useState("/cat.jpg");
  const [urlWallpaper, setUrlWallpaper] = useState("/wallpaper.jpg");
  const [nom_profile, setNom_profile] = useState("Catalina_Gmz");
  const [bio, setBio] = useState(
    "Soy una amante de la música y la cultura. Me encanta descubrir nuevos artistas y compartir mis descubrimientos con los demás. Siempre estoy buscando nuevas melodías que me inspiren y me hagan sentir viva."
  );
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [city, setCity] = useState("");
  const [openCityDropdown, setOpenCityDropdown] = useState(false);
  const [isLoadingCities, setIsLoadingCities] = useState(false);

  const cities = [
    "Bogotá, Colombia",
    "Medellín, Colombia",
    "Cali, Colombia",
    "Barranquilla, Colombia",
    "Cartagena, Colombia",
    "Cúcuta, Colombia",
    "Pereira, Colombia",
  ];

  const handleCityChange = (selectedCity: string) => {
    setCity(selectedCity);
    setOpenCityDropdown(false);
  };

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Aquí puedes manejar el envío del formulario
    console.log("Formulario enviado");
  };

  useEffect(() => {
    console.log("Fecha seleccionada:", date);
  }, [date]);

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
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Subir imagen
              </button>
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
                src={urlImg}
                alt="Perfil"
              />
            </div>
            <div className="col-span-4 row-start-5">
              <h3 className="text-base font-medium">Imagen de portada</h3>
            </div>
            <div className="col-span-4 row-start-6">
              <img
                className="w-full h-48 rounded-lg object-cover md:mb-0 md:mr-6 border-4 border-white/10 shadow-xl"
                src={urlWallpaper}
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
              <button
                type="button"
                className="text-white bg-blue-700 hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-5 py-2.5 text-center me-2 mb-2 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Subir imagen
              </button>
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
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 w-full"
                placeholder={nom_profile}
              ></input>
            </div>
          </div>

          <div className="col-span-4 mb-4">
            <h3 className="text-base font-medium">Biografía</h3>
            <div className="w-full space-y-3 mt-4">
              <textarea
                className="py-2.5 sm:py-3 px-4 block w-full border-gray-200 rounded-lg sm:text-sm focus:border-blue-500 focus:ring-blue-500 disabled:opacity-50 disabled:pointer-events-none dark:bg-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:placeholder-neutral-500 dark:focus:ring-neutral-600 h-[150px]"
                placeholder={bio}
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
                      "w-full bg-white text-gray-500 hover:bg-white justify-start text-left font-normal",
                      !date && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon />
                    {date ? (
                      format(date, "PPP")
                    ) : (
                      <span>Ingresa una fecha</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={date}
                    onSelect={setDate}
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
                  <SelectValue placeholder={cities[0]} />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Ciudades</SelectLabel>
                    {/* <SelectItem value="apple">Apple</SelectItem> */}
                    {cities.map((city) => {
                      return (
                        <SelectItem
                          key={city}
                          value={city}
                          onClick={() => handleCityChange(city)}
                        >
                          {city}
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
