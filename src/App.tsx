import { useEffect, useState } from 'react'
import { useSEO } from './hooks/useSEO'
import { ChevronRight } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import 'leaflet/dist/leaflet.css'

const GEO_API_KEY = import.meta.env.VITE_GEO_API_KEY

const SearchGeolocationFormSchema = z.object({
  ipAddress: z.string().min(1, { message: 'IP Address is required.' }),
})

type TSearchGeolocationFormSchema = z.infer<typeof SearchGeolocationFormSchema>

type TLocation = {
  country: string
  city: string
  lat: number
  lng: number
  timezone: string
}

type TGeolocation = {
  ip: string
  location: TLocation
  isp: string
}

const App = () => {
  const [geolocation, setGeolocation] = useState<TGeolocation>({
    ip: '',
    location: {
      lng: 0,
      lat: 0,
      city: '',
      country: '',
      timezone: '',
    },
    isp: '',
  })
  const [ipAddress, setIpAddress] = useState<string>('')
  const [isLoadingIp, setIsLoadingIp] = useState<boolean>(true)
  const [isLoadingGeo, setIsLoadingGeo] = useState<boolean>(false)
  const {
    register,
    handleSubmit,
    formState: { isSubmitting, errors },
  } = useForm<TSearchGeolocationFormSchema>({
    resolver: zodResolver(SearchGeolocationFormSchema),
  })

  const onSubmit = () => {}

  useSEO({ title: 'IP Address Tracker' })

  useEffect(() => {
    const getIpAddress = async () => {
      try {
        const res = await fetch('https://api64.ipify.org?format=json')

        const data: { ip: string } = await res.json()

        setIpAddress(data.ip)
      } finally {
        setIsLoadingIp(false)
      }
    }

    getIpAddress()
  }, [])

  useEffect(() => {
    if (!isLoadingIp) {
      setIsLoadingGeo(true)

      const getGeolocation = async () => {
        try {
          const res = await fetch(
            `https://geo.ipify.org/api/v2/country,city?apiKey=${GEO_API_KEY}&ipAddress=${ipAddress}`,
          )

          const data: TGeolocation = await res.json()

          setGeolocation(data)
        } finally {
          setIsLoadingGeo(false)
        }
      }

      getGeolocation()
    }
  }, [ipAddress, isLoadingIp])

  console.log(geolocation)

  return (
    <>
      <main className='bg-[url("./assets/images/pattern-bg-mobile.png")] relative z-10 h-[20rem] bg-no-repeat bg-top bg-cover md:bg-[url("./assets/images/pattern-bg-desktop.png")]'>
        <section className='pt-16'>
          <div className='mx-6'>
            <h1 className='text-center text-white text-2xl font-bold'>
              IP Address Tracker
            </h1>
            <div className='mt-8'>
              <form onSubmit={handleSubmit(onSubmit)} className='w-full grid'>
                <div className='flex items-center'>
                  <input
                    {...register('ipAddress')}
                    type='text'
                    autoComplete='off'
                    placeholder='Search for any IP address or domain'
                    className='rounded-l-2xl w-full px-6 py-4 border-none outline-none font-normal'
                  />
                  <button
                    type='submit'
                    className='bg-very-dark-gray outline-none text-white rounded-r-2xl h-full w-16 flex items-center justify-center'
                  >
                    <ChevronRight className='w-6 h-6' />
                  </button>
                </div>
              </form>
            </div>
            <div className='mt-6'>
              <article className='bg-white rounded-2xl py-6 px-6 shadow-md flex flex-col gap-y-4'>
                <div className='text-center'>
                  <span className='text-dark-gray font-bold uppercase text-xs'>
                    Ip address
                  </span>
                  <p className='font-bold text-2xl'>
                    {isLoadingGeo ? '...' : geolocation.ip}
                  </p>
                </div>
                <div className='text-center'>
                  <span className='text-dark-gray font-bold uppercase text-xs'>
                    Location
                  </span>
                  <p className='font-bold text-2xl'>
                    {isLoadingGeo
                      ? '...'
                      : `${geolocation.location.city}, ${geolocation.location.country}`}
                  </p>
                </div>
                <div className='text-center'>
                  <span className='text-dark-gray font-bold uppercase text-xs'>
                    Timezone
                  </span>
                  <p className='font-bold text-2xl'>
                    {isLoadingGeo
                      ? '...'
                      : `UTC ${geolocation.location.timezone}`}
                  </p>
                </div>
                <div className='text-center'>
                  <span className='text-dark-gray font-bold uppercase text-xs'>
                    Isp
                  </span>
                  <p className='font-bold text-2xl'>
                    {isLoadingGeo ? '...' : geolocation.isp}
                  </p>
                </div>
              </article>
            </div>
          </div>
        </section>
      </main>
      {!isLoadingGeo ? (
        <MapContainer
          center={[geolocation.location.lat, geolocation.location.lng]}
          zoom={13}
          scrollWheelZoom={false}
          className='h-screen z-0'
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />
          <Marker
            position={[geolocation.location.lat, geolocation.location.lng]}
          >
            <Popup>This is the IP Address location.</Popup>
          </Marker>
        </MapContainer>
      ) : null}
    </>
  )
}

export default App
