# This file should ensure the existence of records required to run the application in every environment (production,
# development, test). The code here should be idempotent so that it can be executed at any point in every environment.
# The data can then be loaded with the bin/rails db:seed command (or created alongside the database with db:setup).


american_countries = [
  "Argentina", "Bolivia", "Brasil", "Canadá", "Chile", 
  "Colombia", "Costa Rica", "Cuba", "Ecuador", "El Salvador", 
  "Estados Unidos", "Guatemala", "Haití", "Honduras", "Jamaica", 
  "México", "Nicaragua", "Panamá", "Paraguay", "Perú", 
  "República Dominicana", "Uruguay", "Venezuela"
]

american_countries.each do |name|
  country = Country.create!(name: name)
end


cities_argentina = ["Buenos Aires", "Córdoba", "Rosario", "Mendoza", "La Plata", "San Miguel de Tucumán", "Mar del Plata", "Salta", "Santa Fe", "San Juan"]

cities_bolivia = ["Sucre", "La Paz", "Santa Cruz de la Sierra", "Cochabamba", "Oruro", "Potosí", "Tarija", "Beni", "Pando", "Chuquisaca"]

cities_brasil = ["Brasilia", "São Paulo", "Rio de Janeiro", "Salvador", "Fortaleza", "Belo Horizonte", "Manaus", "Curitiba", "Recife", "Porto Alegre"]

cities_canada = ["Ottawa", "Toronto", "Montreal", "Vancouver", "Calgary", "Edmonton", "Quebec City", "Winnipeg", "Halifax", "Victoria"]

cities_chile = ["Santiago", "Valparaíso", "Concepción", "La Serena", "Antofagasta", "Temuco", "Rancagua", "Talca", "Arica", "Iquique"]

cities_colombia = ["Bogotá", "Medellín", "Cali", "Barranquilla", "Cartagena", "Cúcuta", "Pereira", "Santa Marta", "Manizales", "Bucaramanga"]

cities_costa_rica = ["San José", "Alajuela", "Cartago", "Heredia", "Guanacaste", "Puntarenas", "Limón", "Turrialba", "Liberia", "San Isidro de El General"]

cities_cuba = ["La Habana", "Santiago de Cuba", "Camagüey", "Holguín", "Matanzas", "Cienfuegos", "Santa Clara", "Pinar del Río", "Las Tunas", "Granma"]

cities_ecuador = ["Quito", "Guayaquil", "Cuenca", "Manta", "Machala", "Ambato", "Durán", "Esmeraldas", "Loja", "Ibarra"]

cities_el_salvador = ["San Salvador", "Santa Ana", "San Miguel", "Soyapango", "Mejicanos", "Apopa", "Santa Tecla", "La Libertad", "Ahuachapán", "Sonsonate"]

cities_estados_unidos = ["Washington D.C.", "Nueva York", "Los Ángeles", "Chicago", "Houston", "Filadelfia", "Phoenix", "San Antonio", "San Diego", "Dallas"]

cities_guatemala = ["Ciudad de Guatemala", "Quetzaltenango", "Escuintla", "Mixco", "Villa Nueva", "San Juan Sacatepéquez", "Chimaltenango", "Solalá", "Santa Rosa", "Totonicapán"]

cities_haiti = ["Puerto Príncipe", "Capaïssien", "Les Cayes", "Gonaïves", "Jacmel", "Port-de-Paix", "Saint-Marc", "Ouanaminthe", "Fort-Liberté", "Hinche"]

cities_honduras = ["Tegucigalpa", "San Pedro Sula", "Choloma", "La Ceiba", "El Progreso", "Comayagua", "Puerto Cortés", "Danlí", "Olanchito", "Juticalpa"]

cities_jamaica = ["Kingston", "Montego Bay", "Spanish Town", "Portmore", "Mandeville", "Ocho Rios", "Negril", "Savanna-la-Mar", "Falmouth", "Linstead"]

cities_mexico = ["Ciudad de México", "Guadalajara", "Monterrey", "Puebla", "Tijuana", "León", "Mérida", "Querétaro", "San Luis Potosí", "Toluca"]

cities_nicaragua = ["Managua", "León", "Granada", "Masaya", "Chinandega", "Estelí", "Matagalpa", "Rivas", "Bluefields", "Jinotega"]

cities_panama = ["Ciudad de Panamá", "Colón", "David", "Santiago de Veraguas", "Chitré", "La Chorrera", "Penonomé", "Las Tablas", "Bocas del Toro", "Changuinola"]

cities_paraguay = ["Asunción", "Ciudad del Este", "Encarnación", "Pedro Juan Caballero", "San Lorenzo", "Luque", "Capiatá", "Lambaré", "Fernando de la Mora", "Caaguazú"]

cities_peru = ["Lima", "Arequipa", "Trujillo", "Chiclayo", "Piura", "Cusco", "Iquitos", "Puno", "Huancayo", "Tacna"]

cities_republica_dominicana = ["Santo Domingo", "Santiago de los Caballeros", "San Cristóbal", "La Romana", "Puerto Plata", "San Pedro de Macorís", "Mao", "San Francisco de Macorís", "Higuey", "Barahona"]

cities_uruguay = ["Montevideo", "Salto", "Paysandú", "Maldonado", "Rivera", "Tacuarembó", "Durazno", "Cerro Largo", "Colonia del Sacramento", "San José de Mayo"]

cities_venezuela = ["Caracas", "Maracaibo", "Valencia", "Barquisimeto", "Ciudad Guayana", "Maturín", "San Cristóbal", "Puerto La Cruz", "La Guaira", "Cumaná"]

cities_argentina.each do |name|
  country = Country.find_by(name: "Argentina")
  city = City.create!(name: name, country_id: country.id)
end

cities_bolivia.each do |name|
  country = Country.find_by(name: "Bolivia")
  city = City.create!(name: name, country_id: country.id)
end

cities_brasil.each do |name|
  country = Country.find_by(name: "Brasil")
  city = City.create!(name: name, country_id: country.id)
end

cities_canada.each do |name|
  country = Country.find_by(name: "Canadá")
  city = City.create!(name: name, country_id: country.id)
end

cities_chile.each do |name|
  country = Country.find_by(name: "Chile")
  city = City.create!(name: name, country_id: country.id)
end

cities_colombia.each do |name|
  country = Country.find_by(name: "Colombia")
  city = City.create!(name: name, country_id: country.id)
end

cities_costa_rica.each do |name|
  country = Country.find_by(name: "Costa Rica")
  city = City.create!(name: name, country_id: country.id)
end

cities_cuba.each do |name|
  country = Country.find_by(name: "Cuba")
  city = City.create!(name: name, country_id: country.id)
end

cities_ecuador.each do |name|
  country = Country.find_by(name: "Ecuador")
  city = City.create!(name: name, country_id: country.id)
end

cities_el_salvador.each do |name|
  country = Country.find_by(name: "El Salvador")
  city = City.create!(name: name, country_id: country.id)
end

cities_estados_unidos.each do |name|
  country = Country.find_by(name: "Estados Unidos")
  city = City.create!(name: name, country_id: country.id)
end

cities_guatemala.each do |name|
  country = Country.find_by(name: "Guatemala")
  city = City.create!(name: name, country_id: country.id)
end

cities_haiti.each do |name| 
  country = Country.find_by(name: "Haití")
  city = City.create!(name: name, country_id: country.id)
end

cities_honduras.each do |name|
  country = Country.find_by(name: "Honduras")
  city = City.create!(name: name, country_id: country.id)
end

cities_jamaica.each do |name|
  country = Country.find_by(name: "Jamaica")
  city = City.create!(name: name, country_id: country.id)
end

cities_mexico.each do |name|
  country = Country.find_by(name: "México")
  city = City.create!(name: name, country_id: country.id)
end

cities_nicaragua.each do |name|
  country = Country.find_by(name: "Nicaragua")
  city = City.create!(name: name, country_id: country.id)
end

cities_panama.each do |name|
  country = Country.find_by(name: "Panamá")
  city = City.create!(name: name, country_id: country.id)
end 

cities_paraguay.each do |name|
  country = Country.find_by(name: "Paraguay")
  city = City.create!(name: name, country_id: country.id)
end

cities_peru.each do |name|
  country = Country.find_by(name: "Perú")
  city = City.create!(name: name, country_id: country.id)
end

cities_republica_dominicana.each do |name|
  country = Country.find_by(name: "República Dominicana")
  city = City.create!(name: name, country_id: country.id)
end

cities_uruguay.each do |name|
  country = Country.find_by(name: "Uruguay")
  city = City.create!(name: name, country_id: country.id)
end

cities_venezuela.each do |name|
  country = Country.find_by(name: "Venezuela")
  city = City.create!(name: name, country_id: country.id)
end
