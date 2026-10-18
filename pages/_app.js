import GameAudio from '../components/GameAudio'
import '../styles/globals.css'
import '../styles/pet-home.css'
export default function App({ Component, pageProps }) {
  return <><GameAudio/><Component {...pageProps} /></>
}
