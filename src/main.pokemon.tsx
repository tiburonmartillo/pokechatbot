import { createRoot } from 'react-dom/client';
import { PokemonPage } from './app/PokemonPage';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(<PokemonPage />);
